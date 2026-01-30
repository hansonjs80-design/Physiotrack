import React, { memo } from 'react';
import { SkipForward, CheckCircle } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';

interface BedFooterProps {
  bed: BedState;
  steps: TreatmentStep[];
  queue: number[];
  onNext: (bedId: number) => void;
  onClear: (bedId: number) => void;
}

export const BedFooter = memo(({ bed, steps, queue, onNext, onClear }: BedFooterProps) => (
  <div className="border-t border-black/10 shrink-0">
     {bed.status === BedStatus.COMPLETED ? (
       <button 
         onClick={() => onClear(bed.id)}
         className="w-full py-1.5 sm:py-3 landscape:py-0.5 sm:landscape:py-0.5 lg:landscape:py-2 bg-slate-600 dark:bg-slate-600 text-white font-black text-[10px] sm:text-sm landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs hover:bg-slate-700 transition-colors uppercase tracking-widest"
       >
         침상 비우기 (Clear Bed)
       </button>
     ) : (
      <button 
        onClick={() => onNext(bed.id)}
        className="w-full py-1.5 sm:py-3 landscape:py-0.5 sm:landscape:py-0.5 lg:landscape:py-2 font-black text-[10px] sm:text-sm landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs flex items-center justify-center gap-1.5 transition-colors bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800"
      >
        {bed.currentStepIndex === (steps.length || 0) - 1 && queue.length === 0 ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 landscape:w-3 landscape:h-3 sm:landscape:w-3 sm:landscape:h-3 lg:landscape:w-4 lg:landscape:h-4" /> <span>치료 완료</span>
          </>
        ) : (
          <>
            <SkipForward className="w-3.5 h-3.5 sm:w-5 sm:h-5 landscape:w-3 landscape:h-3 sm:landscape:w-3 sm:landscape:h-3 lg:landscape:w-4 lg:landscape:h-4" /> <span>다음 단계</span>
          </>
        )}
      </button>
     )}
  </div>
));