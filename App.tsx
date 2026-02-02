
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { AppHeader } from './components/AppHeader';
import { BedLayoutContainer } from './components/BedLayoutContainer';
import { TreatmentProvider, useTreatmentContext } from './contexts/TreatmentContext';
import { STANDARD_TREATMENTS } from './constants';
import { TreatmentStep } from './types';

// Lazy load heavy components
const SettingsPanel = React.lazy(() => import('./components/SettingsPanel').then(module => ({ default: module.SettingsPanel })));
const PresetSelectorModal = React.lazy(() => import('./components/PresetSelectorModal').then(module => ({ default: module.PresetSelectorModal })));
const BedEditOverlay = React.lazy(() => import('./components/BedEditOverlay').then(module => ({ default: module.BedEditOverlay })));

// Inner component to consume Context
const AppContent: React.FC = () => {
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

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  useHeaderScroll(mainRef, headerRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Handler wrappers
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
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-100 dark:bg-slate-950 relative">
      <div 
        ref={headerRef}
        className="absolute top-0 left-0 right-0 z-40 w-full will-change-transform h-[calc(3.5rem+env(safe-area-inset-top))]"
      >
        <AppHeader 
          onOpenMenu={() => setMenuOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setDarkMode(!isDarkMode)}
        />
      </div>

      <main 
        ref={mainRef}
        className="
          flex-1 overflow-x-auto overflow-y-auto scroll-smooth touch-pan-x touch-pan-y overscroll-contain 
          bg-gray-200 dark:bg-slate-950
          px-0 sm:px-2 md:p-4
          pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
          pt-[calc(3.5rem+env(safe-area-inset-top)+0.5rem)]
        "
      >
        <BedLayoutContainer beds={beds} presets={presets} />
      </main>

      <Suspense fallback={null}>
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
            onToggleFluid={toggleFluid}
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
      </Suspense>
      
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TreatmentProvider>
      <AppContent />
    </TreatmentProvider>
  );
};

export default App;