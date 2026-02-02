import React, { useEffect, useState, useRef } from 'react';
import { usePresetManager } from './hooks/usePresetManager';
import { SettingsPanel } from './components/SettingsPanel';
import { useBedManager } from './hooks/useBedManager';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { BedEditOverlay } from './components/BedEditOverlay';
import { AppHeader } from './components/AppHeader';
import { BedLayoutContainer } from './components/BedLayoutContainer';
import { STANDARD_TREATMENTS } from './constants';
import { TreatmentStep } from './types';

const App: React.FC = () => {
  const { presets, updatePresets } = usePresetManager();
  
  const { 
    beds, 
    selectPreset, 
    startCustomPreset,
    startQuickTreatment,
    startTraction, 
    nextStep, 
    togglePause,
    jumpToStep, 
    toggleInjection,
    toggleTraction,
    toggleESWT,
    toggleManual,
    updateBedSteps,
    updateMemo,
    updateBedDuration,
    clearBed, 
    resetAll 
  } = useBedManager(presets);
  
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [selectingBedId, setSelectingBedId] = useState<number | null>(null);
  const [editingBedId, setEditingBedId] = useState<number | null>(null);
  
  const mainRef = useRef<HTMLElement>(null);
  const isHeaderVisible = useHeaderScroll(mainRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Handler wrappers to keep JSX clean
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

  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];
  const editingBed = editingBedId ? getBed(editingBedId) : null;
  const editingBedSteps = editingBed ? (editingBed.customPreset?.steps || presets.find(p => p.id === editingBed.currentPresetId)?.steps || []) : [];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-100 dark:bg-slate-950">
      {/* Dynamic Header Wrapper */}
      <div 
        className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isHeaderVisible 
            ? 'h-14 opacity-100 translate-y-0' 
            : 'h-0 opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <AppHeader 
          onOpenMenu={() => setMenuOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setDarkMode(!isDarkMode)}
        />
      </div>

      <main 
        ref={mainRef}
        className="flex-1 overflow-x-auto overflow-y-auto px-1 py-1 sm:px-2 sm:py-2 md:p-4 scroll-smooth touch-pan-x touch-pan-y bg-gray-200 dark:bg-slate-950"
      >
        <BedLayoutContainer 
          beds={beds}
          presets={presets}
          onOpenSelector={setSelectingBedId}
          onEdit={setEditingBedId}
          onNext={nextStep}
          onTogglePause={togglePause}
          onJumpToStep={jumpToStep}
          onClear={clearBed}
          onToggleInjection={toggleInjection}
          onToggleTraction={toggleTraction}
          onToggleESWT={toggleESWT}
          onToggleManual={toggleManual}
          onUpdateSteps={updateBedSteps}
          onUpdateMemo={updateMemo}
          onUpdateDuration={updateBedDuration}
        />
      </main>

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

      {editingBed && (
        <BedEditOverlay 
          bed={editingBed}
          steps={editingBedSteps}
          onClose={() => setEditingBedId(null)}
          onToggleInjection={toggleInjection}
          onToggleTraction={toggleTraction}
          onToggleESWT={toggleESWT}
          onToggleManual={toggleManual}
          onUpdateSteps={updateBedSteps}
          onUpdateDuration={updateBedDuration}
        />
      )}

      <SettingsPanel 
        isOpen={isMenuOpen} 
        onClose={() => setMenuOpen(false)}
        presets={presets}
        onUpdatePresets={updatePresets}
        onResetAllBeds={resetAll}
      />
      
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
};

export default App;