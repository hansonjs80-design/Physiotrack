import React, { memo } from 'react';
import { BedState, Preset, TreatmentStep } from '../types';
import { BedCard } from './BedCard';

interface BedBayProps {
  beds: BedState[]; 
  presets: Preset[]; 
  onOpenSelector: (bedId: number) => void; 
  onEdit: (bedId: number) => void;
  onNext: (bedId: number) => void; 
  onJumpToStep?: (bedId: number, stepIndex: number) => void;
  onClear: (bedId: number) => void; 
  side: 'left' | 'right';
  isEmpty?: boolean;
  accentColor?: string;
  onToggleInjection?: (bedId: number) => void;
  onToggleTraction?: (bedId: number) => void;
  onToggleESWT?: (bedId: number) => void;
  onToggleManual?: (bedId: number) => void;
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateMemo?: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
}

export const BedBay: React.FC<BedBayProps> = memo(({ 
  beds, 
  presets, 
  onOpenSelector, 
  onEdit,
  onNext,
  onJumpToStep,
  onClear, 
  isEmpty, 
  onToggleInjection,
  onToggleTraction,
  onToggleESWT,
  onToggleManual,
  onUpdateSteps,
  onUpdateMemo,
  onUpdateDuration
}) => {
  if (isEmpty) {
    return (
      <div className="h-full flex flex-col gap-2 p-1 rounded-xl border-2 border-dashed border-gray-400/30 dark:border-slate-800 bg-gray-100/30 dark:bg-slate-900/20 min-h-[120px]">
        <div className="flex-1 flex items-center justify-center text-gray-300 dark:text-slate-800 text-sm font-black uppercase tracking-widest">
          
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col gap-1.5 sm:gap-3 p-0 sm:p-1 rounded-xl bg-transparent`}>
      {beds.map(bed => (
        <div key={bed.id} className="w-full h-full">
          <BedCard 
            bed={bed}
            presets={presets}
            onOpenSelector={onOpenSelector}
            onEdit={onEdit}
            onNextStep={onNext}
            onJumpToStep={onJumpToStep}
            onClear={onClear}
            isCompact={true}
            onToggleInjection={onToggleInjection}
            onToggleTraction={onToggleTraction}
            onToggleESWT={onToggleESWT}
            onToggleManual={onToggleManual}
            onUpdateSteps={onUpdateSteps}
            onUpdateMemo={onUpdateMemo}
            onUpdateDuration={onUpdateDuration}
          />
        </div>
      ))}
    </div>
  );
});