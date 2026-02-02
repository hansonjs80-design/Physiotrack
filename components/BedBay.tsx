import React, { memo } from 'react';
import { BedState, Preset, TreatmentStep } from '../types';
import { BedCard } from './BedCard';

interface BedBayProps {
  beds: BedState[]; 
  presets: Preset[]; 
  onOpenSelector: (bedId: number) => void; 
  onEdit: (bedId: number) => void;
  onNext: (bedId: number) => void; 
  onPrev?: (bedId: number) => void;
  onTogglePause: (bedId: number) => void;
  onJumpToStep?: (bedId: number, stepIndex: number) => void;
  onSwapSteps?: (bedId: number, idx1: number, idx2: number) => void;
  onClear: (bedId: number) => void; 
  side: 'left' | 'right';
  isEmpty?: boolean;
  accentColor?: string;
  onUpdateMemo?: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
}

export const BedBay: React.FC<BedBayProps> = memo(({ 
  beds, 
  presets, 
  onOpenSelector, 
  onEdit,
  onNext,
  onPrev,
  onTogglePause,
  onJumpToStep,
  onSwapSteps,
  onClear, 
  isEmpty, 
  onUpdateMemo,
  onUpdateDuration
}) => {
  if (isEmpty) {
    return (
      <div className="h-full flex flex-col gap-2 p-1 rounded-xl border-2 border-dashed border-gray-400/30 dark:border-slate-800 bg-gray-100/30 dark:bg-slate-900/20 min-h-[120px]">
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
            onPrevStep={onPrev}
            onTogglePause={onTogglePause}
            onJumpToStep={onJumpToStep}
            onSwapSteps={onSwapSteps}
            onClear={onClear}
            isCompact={true}
            onUpdateMemo={onUpdateMemo}
            onUpdateDuration={onUpdateDuration}
          />
        </div>
      ))}
    </div>
  );
});