import React, { memo } from 'react';
import { BedState, Preset, TreatmentStep } from '../types';
import { LANDSCAPE_GRID_IDS } from '../constants/layout';
import { BedCard } from './BedCard';

interface LandscapeLayoutProps {
  beds: BedState[];
  presets: Preset[];
  onOpenSelector: (bedId: number) => void;
  onEdit: (bedId: number) => void;
  onNext: (bedId: number) => void;
  onJumpToStep: (bedId: number, stepIndex: number) => void;
  onClear: (bedId: number) => void;
  onToggleInjection: (bedId: number) => void;
  onToggleTraction: (bedId: number) => void;
  onToggleESWT: (bedId: number) => void;
  onToggleManual: (bedId: number) => void;
  onUpdateSteps: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateMemo: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration: (bedId: number, duration: number) => void;
}

export const LandscapeLayout: React.FC<LandscapeLayoutProps> = memo(({
  beds,
  presets,
  onOpenSelector,
  onEdit,
  onNext,
  onJumpToStep,
  onClear,
  onToggleInjection,
  onToggleTraction,
  onToggleESWT,
  onToggleManual,
  onUpdateSteps,
  onUpdateMemo,
  onUpdateDuration
}) => {
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];

  return (
    <div className="hidden landscape:grid grid-cols-4 grid-rows-3 gap-x-1 gap-y-[5px] lg:landscape:gap-y-[25px] h-auto content-start min-w-[700px] lg:landscape:min-w-0">
      {LANDSCAPE_GRID_IDS.map((id, idx) => {
        if (id === null) {
          return (
            <div key={`empty-${idx}`} className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-800 bg-gray-100/50 dark:bg-slate-900/50 flex items-center justify-center">
              <span className="text-gray-300 dark:text-gray-700 font-black text-2xl opacity-20 landscape:text-lg">EMPTY</span>
            </div>
          );
        }
        const bed = getBed(id);
        return (
          <div key={id} className="min-h-0">
            <BedCard 
              bed={bed}
              presets={presets}
              onOpenSelector={onOpenSelector}
              onEdit={onEdit}
              onNextStep={onNext}
              onJumpToStep={onJumpToStep}
              onClear={onClear}
              onToggleInjection={onToggleInjection}
              onToggleTraction={onToggleTraction}
              onToggleESWT={onToggleESWT}
              onToggleManual={onToggleManual}
              onUpdateSteps={onUpdateSteps}
              onUpdateMemo={onUpdateMemo}
              onUpdateDuration={onUpdateDuration}
              isCompact={true}
            />
          </div>
        );
      })}
    </div>
  );
});