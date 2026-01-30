import { useEffect, useCallback, useState, useRef } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { TOTAL_BEDS } from '../constants';
import { supabase, isOnlineMode } from '../lib/supabase';
import { useBedTimer } from './useBedTimer';
import { useBedRealtime } from './useBedRealtime';

interface SelectPresetOptions {
  isInjection?: boolean;
  isTraction?: boolean;
  isESWT?: boolean;
  isManual?: boolean;
}

export const useBedManager = (presets: Preset[]) => {
  // --- Local Persistence Fallback ---
  // Bump version to v7 to ensure fresh structure with timestamp support
  const [localBeds, setLocalBeds] = useLocalStorage<BedState[]>('physio-beds-v7', 
    Array.from({ length: TOTAL_BEDS }, (_, i) => ({
      id: i + 1,
      status: BedStatus.IDLE,
      currentPresetId: null,
      currentStepIndex: 0,
      queue: [],
      remainingTime: 0,
      startTime: null,
      isPaused: false,
      isInjection: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    }))
  );

  // --- Main State ---
  const [beds, setBeds] = useState<BedState[]>(localBeds);

  // OPTIMIZATION: Keep ref to beds to access latest state in callbacks without dependency
  // This prevents recreating functions like 'nextStep' every time 'beds' changes (every second due to timer)
  const bedsRef = useRef(beds);
  useEffect(() => {
    bedsRef.current = beds;
  }, [beds]);

  // --- Composed Hooks (Timer & Realtime) ---
  useBedTimer(setBeds, presets);
  const { realtimeStatus } = useBedRealtime(setBeds, setLocalBeds);

  // Sync state to local storage when offline to persist across reloads
  // Also sync on initial mount if online is delayed
  useEffect(() => {
    if (!isOnlineMode()) {
      setBeds(localBeds);
    }
  }, [localBeds]);

  // --- DB / Local Update Helper ---
  // Memoized to be stable, although it calls external setters
  const updateBedState = useCallback(async (bedId: number, updates: Partial<BedState> & { originalDuration?: number }) => {
    const timestamp = Date.now();
    
    // 1. Optimistic Update (Immediate UI response)
    // Add lastUpdateTimestamp to allow Realtime hook to ignore stale echoes
    const updateWithTimestamp = { ...updates, lastUpdateTimestamp: timestamp };
    
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));
    
    // Always update LocalStorage for persistence/backup
    setLocalBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));

    if (isOnlineMode() && supabase) {
      // 2. DB Update
      const dbPayload: any = {
        status: updates.status,
        current_preset_id: updates.currentPresetId,
        current_step_index: updates.currentStepIndex,
        queue: updates.queue,
        start_time: updates.startTime,
        is_paused: updates.isPaused,
        is_injection: updates.isInjection,
        is_traction: updates.isTraction,
        is_eswt: updates.isESWT,
        is_manual: updates.isManual,
        memos: updates.memos,
        updated_at: new Date().toISOString()
      };
      
      if (updates.customPreset !== undefined) dbPayload.custom_preset_json = updates.customPreset;
      if (updates.originalDuration !== undefined) dbPayload.original_duration = updates.originalDuration;
      if (updates.status !== undefined) dbPayload.status = updates.status;

      // Filter out undefined keys
      const cleanPayload = Object.fromEntries(
        Object.entries(dbPayload).filter(([_, v]) => v !== undefined)
      );

      await supabase.from('beds').update(cleanPayload).eq('id', bedId);
    }
  }, [setLocalBeds]);

  // --- Actions ---

  const selectPreset = useCallback((bedId: number, presetId: string, options?: SelectPresetOptions) => {
    const { isInjection = false, isTraction = false, isESWT = false, isManual = false } = options || {};
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    const firstStep = preset.steps[0];
    
    const initialQueue = preset.steps.map((_, idx) => idx).slice(1);

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: presetId,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: initialQueue,
      startTime: Date.now(),
      isPaused: false,
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isInjection,
      isTraction,
      isESWT,
      isManual,
      memos: {} // Reset memos
    });
  }, [presets, updateBedState]);

  const startTraction = useCallback((bedId: number, durationMinutes: number, options?: SelectPresetOptions) => {
    const { isInjection = false, isTraction = false, isESWT = false, isManual = false } = options || {};
    const tractionPreset: Preset = {
      id: `traction-${Date.now()}`,
      name: '견인 치료',
      steps: [{
        id: 'step-traction',
        name: '견인 (Traction)',
        duration: durationMinutes * 60,
        enableTimer: true,
        color: 'bg-orange-500'
      }]
    };

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: tractionPreset.id,
      customPreset: tractionPreset,
      currentStepIndex: 0,
      queue: [],
      startTime: Date.now(),
      isPaused: false,
      remainingTime: durationMinutes * 60,
      originalDuration: durationMinutes * 60,
      isInjection,
      isTraction,
      isESWT,
      isManual,
      memos: {} // Reset memos
    });
  }, [updateBedState]);

  const nextStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;

    const currentQueue = bed.queue || [];

    if (currentQueue.length > 0) {
      const nextIndex = currentQueue[0];
      const newQueue = currentQueue.slice(1);
      
      const nextStepItem = preset.steps[nextIndex];
      if (nextStepItem) {
        updateBedState(bedId, {
          currentStepIndex: nextIndex,
          queue: newQueue,
          startTime: Date.now(),
          remainingTime: nextStepItem.duration,
          originalDuration: nextStepItem.duration
        });
      } else {
         updateBedState(bedId, { status: BedStatus.COMPLETED, remainingTime: 0 });
      }
    } else {
      updateBedState(bedId, { status: BedStatus.COMPLETED, remainingTime: 0 });
    }
  }, [presets, updateBedState]);

  const jumpToStep = useCallback((bedId: number, stepIndex: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    
    // Case 1: Active Step Double Click -> Rotate to End
    if (bed.currentStepIndex === stepIndex) {
        const currentQueue = bed.queue || [];
        if (currentQueue.length > 0) {
            const nextStepIndex = currentQueue[0];
            const remainingQueue = currentQueue.slice(1);
            const newQueue = [...remainingQueue, stepIndex];
            
            const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
            const nextStepItem = preset?.steps[nextStepIndex];
            
            if (nextStepItem) {
                updateBedState(bedId, {
                    currentStepIndex: nextStepIndex,
                    queue: newQueue,
                    startTime: Date.now(),
                    remainingTime: nextStepItem.duration,
                    originalDuration: nextStepItem.duration
                });
            }
        }
        return;
    }

    // Case 2: Queued/Future Step Double Click -> Move to End
    const currentQueue = bed.queue || [];
    const filteredQueue = currentQueue.filter(idx => idx !== stepIndex);
    const newQueue = [...filteredQueue, stepIndex];

    updateBedState(bedId, { queue: newQueue });
  }, [presets, updateBedState]);

  const toggleInjection = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    updateBedState(bedId, { isInjection: !bed.isInjection });
  }, [updateBedState]);

  const toggleTraction = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    updateBedState(bedId, { isTraction: !bed.isTraction });
  }, [updateBedState]);

  const toggleESWT = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    updateBedState(bedId, { isESWT: !bed.isESWT });
  }, [updateBedState]);

  const toggleManual = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    updateBedState(bedId, { isManual: !bed.isManual });
  }, [updateBedState]);

  const updateMemo = useCallback((bedId: number, stepIndex: number, memo: string | null) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;
    
    const newMemos = { ...bed.memos };
    if (memo === null || memo === '') {
      delete newMemos[stepIndex];
    } else {
      newMemos[stepIndex] = memo;
    }
    
    updateBedState(bedId, { memos: newMemos });
  }, [updateBedState]);

  const updateBedDuration = useCallback((bedId: number, durationSeconds: number) => {
    // Optimistic update doesn't strictly need read access, but we check existence
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    updateBedState(bedId, {
      startTime: Date.now(),
      status: BedStatus.ACTIVE,
      remainingTime: durationSeconds,
      originalDuration: durationSeconds
    });
  }, [updateBedState]);

  const updateBedSteps = useCallback((bedId: number, newSteps: TreatmentStep[]) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed) return;

    let basePreset = bed.customPreset;
    if (!basePreset) {
      const standardPreset = presets.find(p => p.id === bed.currentPresetId);
      if (standardPreset) {
         basePreset = {
           ...standardPreset,
           id: `custom-from-${standardPreset.id}-${Date.now()}`,
           name: `${standardPreset.name} (수정됨)`
         };
      } else {
        basePreset = { id: 'temp', name: '치료', steps: [] };
      }
    }

    const currentStepId = basePreset.steps[bed.currentStepIndex]?.id;
    const trackedIndex = newSteps.findIndex(s => s.id === currentStepId);
    
    let newStepIndex = bed.currentStepIndex;

    // Intelligent step tracking logic
    if (trackedIndex === 0) {
      newStepIndex = 0;
    } else if (bed.currentStepIndex === 0) {
      newStepIndex = 0;
    } else {
      newStepIndex = Math.min(bed.currentStepIndex, Math.max(0, newSteps.length - 1));
    }

    if (newSteps.length === 0) newStepIndex = 0;

    const updatedPreset = { ...basePreset, steps: newSteps };
    const newQueue = Array.from({ length: Math.max(0, newSteps.length - 1 - newStepIndex) }, (_, i) => newStepIndex + 1 + i);

    const updates: any = {
      customPreset: updatedPreset,
      currentStepIndex: newStepIndex,
      queue: newQueue
    };

    const newStep = newSteps[newStepIndex];
    const isSameStep = newStep && currentStepId && newStep.id === currentStepId;

    if (!isSameStep && newStep) {
       updates.startTime = Date.now();
       updates.remainingTime = newStep.duration;
       updates.originalDuration = newStep.duration;
       if (bed.status !== BedStatus.ACTIVE && bed.status !== BedStatus.IDLE) {
          updates.status = BedStatus.ACTIVE;
       }
    }

    updateBedState(bedId, updates);
  }, [presets, updateBedState]);

  const clearBed = useCallback((bedId: number) => {
    updateBedState(bedId, {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      isPaused: false,
      remainingTime: 0,
      isInjection: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    });
  }, [updateBedState]);

  const resetAll = useCallback(() => {
    const updates = {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      isPaused: false,
      remainingTime: 0,
      isInjection: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    };
    bedsRef.current.forEach(bed => updateBedState(bed.id, updates));
  }, [updateBedState]);

  return { 
    beds, 
    selectPreset, 
    startTraction, 
    nextStep, 
    jumpToStep, 
    toggleInjection, 
    toggleTraction, 
    toggleESWT, 
    toggleManual,
    updateMemo,
    updateBedDuration,
    updateBedSteps, 
    clearBed, 
    resetAll,
    realtimeStatus 
  };
};