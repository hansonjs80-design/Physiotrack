
import { useEffect, useCallback, useState, useRef } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { TOTAL_BEDS, STANDARD_TREATMENTS } from '../constants';
import { supabase, isOnlineMode } from '../lib/supabase';
import { useBedTimer } from './useBedTimer';
import { useBedRealtime } from './useBedRealtime';
import { mapBedToDbPayload, calculateRemainingTime } from '../utils/bedUtils';

interface SelectPresetOptions {
  isInjection?: boolean;
  isTraction?: boolean;
  isESWT?: boolean;
  isManual?: boolean;
}

export const useBedManager = (presets: Preset[]) => {
  const [localBeds, setLocalBeds] = useLocalStorage<BedState[]>('physio-beds-v8', 
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

  const [beds, setBeds] = useState<BedState[]>(localBeds);
  const bedsRef = useRef(beds);
  
  useEffect(() => {
    bedsRef.current = beds;
  }, [beds]);

  useBedTimer(setBeds, presets);
  const { realtimeStatus } = useBedRealtime(setBeds, setLocalBeds);

  useEffect(() => {
    if (!isOnlineMode()) setBeds(localBeds);
  }, [localBeds]);

  // 통합 상태 업데이트 함수 (DB 동기화 포함)
  const updateBedState = useCallback(async (bedId: number, updates: Partial<BedState>) => {
    const timestamp = Date.now();
    const updateWithTimestamp = { ...updates, lastUpdateTimestamp: timestamp };
    
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));
    setLocalBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updateWithTimestamp } : b));

    if (isOnlineMode() && supabase) {
      const currentBed = bedsRef.current.find(b => b.id === bedId);
      const fullUpdate = { ...currentBed, ...updates };
      const dbPayload = mapBedToDbPayload(fullUpdate);
      
      const { error } = await supabase.from('beds').update(dbPayload).eq('id', bedId);
      if (error) console.error(`[BedManager] DB Update Failed:`, error.message);
    }
  }, [setLocalBeds]);

  const selectPreset = useCallback((bedId: number, presetId: string, options?: SelectPresetOptions) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    const firstStep = preset.steps[0];
    
    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: presetId,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: preset.steps.map((_, idx) => idx).slice(1),
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });
  }, [presets, updateBedState]);

  // 커스텀 단계들로 치료 시작
  const startCustomPreset = useCallback((bedId: number, name: string, steps: TreatmentStep[], options?: SelectPresetOptions) => {
    if (steps.length === 0) return;
    const firstStep = steps[0];
    
    const customPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: name,
      steps: steps
    };

    updateBedState(bedId, {
      status: BedStatus.ACTIVE,
      currentPresetId: customPreset.id,
      customPreset: customPreset,
      currentStepIndex: 0,
      queue: steps.map((_, idx) => idx).slice(1),
      startTime: Date.now(),
      remainingTime: firstStep.duration,
      originalDuration: firstStep.duration,
      isPaused: false,
      isInjection: options?.isInjection || false,
      isTraction: options?.isTraction || false,
      isESWT: options?.isESWT || false,
      isManual: options?.isManual || false,
      memos: {}
    });
  }, [updateBedState]);

  // 단일 치료 즉시 시작 기능
  const startQuickTreatment = useCallback((bedId: number, template: typeof STANDARD_TREATMENTS[0], options?: SelectPresetOptions) => {
    const step: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };

    startCustomPreset(bedId, template.name, [step], options);
  }, [startCustomPreset]);

  const nextStep = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status === BedStatus.IDLE) return;
    const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
    if (!preset) return;
    
    const currentQueue = bed.queue || [];
    if (currentQueue.length > 0) {
      const nextIndex = currentQueue[0];
      const nextStepItem = preset.steps[nextIndex];
      updateBedState(bedId, {
        currentStepIndex: nextIndex,
        queue: currentQueue.slice(1),
        startTime: Date.now(),
        remainingTime: nextStepItem.duration,
        originalDuration: nextStepItem.duration,
        isPaused: false
      });
    } else {
      updateBedState(bedId, { status: BedStatus.COMPLETED, remainingTime: 0, isPaused: false });
    }
  }, [presets, updateBedState]);

  const togglePause = useCallback((bedId: number) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (!bed || bed.status !== BedStatus.ACTIVE) return;

    if (!bed.isPaused) {
      // 일시정지: 현재 남은 시간을 계산하여 상태에 고정
      const currentRemaining = calculateRemainingTime(bed, presets);
      updateBedState(bedId, { 
        isPaused: true, 
        remainingTime: currentRemaining 
      });
    } else {
      // 재개: 현재 시각을 새로운 시작 시각으로 설정하고 남은 시간을 기준 지속시간으로 설정
      updateBedState(bedId, { 
        isPaused: false, 
        startTime: Date.now(),
        originalDuration: bed.remainingTime 
      });
    }
  }, [presets, updateBedState]);

  const clearBed = useCallback((bedId: number) => {
    updateBedState(bedId, {
      status: BedStatus.IDLE,
      currentPresetId: null,
      customPreset: null as any,
      currentStepIndex: 0,
      queue: [],
      startTime: null,
      originalDuration: null,
      remainingTime: 0,
      isPaused: false,
      isInjection: false,
      isTraction: false,
      isESWT: false,
      isManual: false,
      memos: {}
    });
  }, [updateBedState]);

  const toggleFlag = useCallback((bedId: number, flag: keyof BedState) => {
    const bed = bedsRef.current.find(b => b.id === bedId);
    if (bed) updateBedState(bedId, { [flag]: !bed[flag] });
  }, [updateBedState]);

  return { 
    beds, 
    selectPreset, 
    startCustomPreset,
    startQuickTreatment,
    startTraction: (bedId: number, duration: number, options: any) => {
        const tractionPreset: Preset = {
            id: `traction-${Date.now()}`,
            name: '견인 치료',
            steps: [{ id: 'tr', name: '견인 (Traction)', duration: duration * 60, enableTimer: true, color: 'bg-orange-500' }]
        };
        updateBedState(bedId, {
            status: BedStatus.ACTIVE,
            currentPresetId: tractionPreset.id,
            customPreset: tractionPreset,
            currentStepIndex: 0,
            queue: [],
            startTime: Date.now(),
            remainingTime: duration * 60,
            originalDuration: duration * 60,
            isPaused: false,
            ...options,
            memos: {}
        });
    },
    nextStep, 
    togglePause,
    jumpToStep: (bedId: number, stepIndex: number) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      if (bed.currentStepIndex === stepIndex) return;
      const newQueue = [...(bed.queue || []).filter(idx => idx !== stepIndex), stepIndex];
      updateBedState(bedId, { queue: newQueue });
    },
    toggleInjection: (id: number) => toggleFlag(id, 'isInjection'),
    toggleTraction: (id: number) => toggleFlag(id, 'isTraction'),
    toggleESWT: (id: number) => toggleFlag(id, 'isESWT'),
    toggleManual: (id: number) => toggleFlag(id, 'isManual'),
    updateMemo: (bedId: number, idx: number, memo: string | null) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      const newMemos = { ...bed.memos };
      if (!memo) delete newMemos[idx]; else newMemos[idx] = memo;
      updateBedState(bedId, { memos: newMemos });
    },
    updateBedDuration: (bedId: number, dur: number) => updateBedState(bedId, { startTime: Date.now(), remainingTime: dur, originalDuration: dur, isPaused: false }),
    updateBedSteps: (bedId: number, steps: TreatmentStep[]) => {
      const bed = bedsRef.current.find(b => b.id === bedId);
      if (!bed) return;
      updateBedState(bedId, { customPreset: { id: 'custom', name: '치료', steps }, queue: steps.map((_, i) => i).slice(bed.currentStepIndex + 1) });
    },
    clearBed, 
    resetAll: () => bedsRef.current.forEach(bed => clearBed(bed.id)),
    realtimeStatus 
  };
};
