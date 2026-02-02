import React, { Suspense } from 'react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { STANDARD_TREATMENTS } from '../constants';
import { TreatmentStep } from '../types';

// Lazy load heavy components
const SettingsPanel = React.lazy(() => import('./SettingsPanel').then(module => ({ default: module.SettingsPanel })));
const PresetSelectorModal = React.lazy(() => import('./PresetSelectorModal').then(module => ({ default: module.PresetSelectorModal })));
const BedEditOverlay = React.lazy(() => import('./BedEditOverlay').then(module => ({ default: module.BedEditOverlay })));

interface GlobalModalsProps {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  presets: any[]; // Passed from parent or context, but context is better. Using context inside.
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({ isMenuOpen, onCloseMenu }) => {
  const { 
    beds, 
    presets, 
    updatePresets,
    selectingBedId,
    setSelectingBedId,
    editingBedId,
    setEditingBedId,
    selectPreset,
    startCustomPreset,
    startQuickTreatment,
    startTraction,
    resetAll,
    toggleInjection,
    toggleFluid,
    toggleTraction,
    toggleESWT,
    toggleManual,
    updateBedSteps,
    updateBedDuration
  } = useTreatmentContext();

  // Handler wrappers to close modals after action
  const handleSelectPreset = (bedId: number, presetId: string, options: any) => {
    selectPreset(bedId, presetId, options);
    setSelectingBedId(null);
  };

  const handleCustomStart = (bedId: number, name: string, steps: TreatmentStep[], options: any) => {
    startCustomPreset(bedId, name, steps, options);
    setSelectingBedId(null);
  };

  const handleQuickStart = (bedId: number, template: typeof STANDARD_TREATMENTS[0], options: any) => {
    startQuickTreatment(bedId, template, options);
    setSelectingBedId(null);
  };
  
  const handleStartTraction = (bedId: number, duration: number, options: any) => {
    startTraction(bedId, duration, options);
    setSelectingBedId(null);
  };

  // Helper to get editing bed data
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];
  const editingBed = editingBedId ? getBed(editingBedId) : null;
  const editingBedSteps = editingBed ? (editingBed.customPreset?.steps || presets.find(p => p.id === editingBed.currentPresetId)?.steps || []) : [];

  return (
    <Suspense fallback={null}>
      {/* Preset Selector Modal */}
      <PresetSelectorModal 
        isOpen={selectingBedId !== null}
        onClose={() => setSelectingBedId(null)}
        presets={presets}
        onSelect={handleSelectPreset}
        onCustomStart={handleCustomStart}
        onQuickStart={handleQuickStart}
        onStartTraction={handleStartTraction}
        targetBedId={selectingBedId}
      />

      {/* Edit Overlay */}
      {editingBed && (
        <BedEditOverlay 
          bed={editingBed}
          steps={editingBedSteps}
          onClose={() => setEditingBedId(null)}
          onToggleInjection={toggleInjection}
          onToggleFluid={toggleFluid}
          onToggleTraction={toggleTraction}
          onToggleESWT={toggleESWT}
          onToggleManual={toggleManual}
          onUpdateSteps={updateBedSteps}
          onUpdateDuration={updateBedDuration}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={isMenuOpen} 
        onClose={onCloseMenu}
        presets={presets}
        onUpdatePresets={updatePresets}
        onResetAllBeds={resetAll}
      />

      {/* Backdrop for Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCloseMenu} />
      )}
    </Suspense>
  );
};