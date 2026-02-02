import React, { createContext, useContext, ReactNode, useState } from 'react';
import { BedState, Preset, TreatmentStep } from '../types';
import { usePresetManager } from '../hooks/usePresetManager';
import { useBedManager } from '../hooks/useBedManager';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STANDARD_TREATMENTS } from '../constants';
import { useNotificationBridge } from '../hooks/useNotificationBridge';

interface TreatmentContextType {
  beds: BedState[];
  presets: Preset[];
  updatePresets: (presets: Preset[]) => void;
  
  // Settings
  isSoundEnabled: boolean;
  toggleSound: () => void;

  // UI State for Modals
  selectingBedId: number | null;
  setSelectingBedId: (id: number | null) => void;
  editingBedId: number | null;
  setEditingBedId: (id: number | null) => void;
  
  // Actions
  selectPreset: (bedId: number, presetId: string, options: any) => void;
  startCustomPreset: (bedId: number, name: string, steps: TreatmentStep[], options: any) => void;
  startQuickTreatment: (bedId: number, template: typeof STANDARD_TREATMENTS[0], options: any) => void;
  startTraction: (bedId: number, duration: number, options: any) => void;
  nextStep: (bedId: number) => void;
  prevStep: (bedId: number) => void;
  swapSteps: (bedId: number, idx1: number, idx2: number) => void;
  togglePause: (bedId: number) => void;
  jumpToStep: (bedId: number, stepIndex: number) => void;
  toggleInjection: (bedId: number) => void;
  toggleFluid: (bedId: number) => void;
  toggleTraction: (bedId: number) => void;
  toggleESWT: (bedId: number) => void;
  toggleManual: (bedId: number) => void;
  updateBedSteps: (bedId: number, steps: TreatmentStep[]) => void;
  updateMemo: (bedId: number, stepIndex: number, memo: string | null) => void;
  updateBedDuration: (bedId: number, duration: number) => void;
  clearBed: (bedId: number) => void;
  resetAll: () => void;
}

const TreatmentContext = createContext<TreatmentContextType | undefined>(undefined);

export const TreatmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { presets, updatePresets } = usePresetManager();
  
  // Sound setting persisted in localStorage (default: false)
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage<boolean>('physio-sound-enabled', false);
  
  // Pass the sound setting to the manager (and timer)
  const bedManager = useBedManager(presets, isSoundEnabled);
  
  const [selectingBedId, setSelectingBedId] = useState<number | null>(null);
  const [editingBedId, setEditingBedId] = useState<number | null>(null);

  const toggleSound = () => setIsSoundEnabled(prev => !prev);

  // Hook up Service Worker notifications to the manager's nextStep function
  useNotificationBridge(bedManager.nextStep);

  const value = {
    presets,
    updatePresets,
    isSoundEnabled,
    toggleSound,
    ...bedManager,
    selectingBedId,
    setSelectingBedId,
    editingBedId,
    setEditingBedId
  };

  return (
    <TreatmentContext.Provider value={value}>
      {children}
    </TreatmentContext.Provider>
  );
};

export const useTreatmentContext = () => {
  const context = useContext(TreatmentContext);
  if (context === undefined) {
    throw new Error('useTreatmentContext must be used within a TreatmentProvider');
  }
  return context;
};