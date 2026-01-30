import React from 'react';
import { TreatmentStep, BedState, BedStatus } from '../types';
import { getAbbreviation, getStepColor } from '../utils/bedUtils';

interface BedContentProps {
  steps: TreatmentStep[];
  bed: BedState;
  queue: number[];
  onJumpToStep?: (id: number, idx: number) => void;
  onUpdateMemo?: (id: number, idx: number, val: string | null) => void;
}

export const BedContent: React.FC<BedContentProps> = ({ 
  steps, 
  bed, 
  queue, 
  onJumpToStep, 
  onUpdateMemo 
}) => {
  const isCompleted = bed.status === BedStatus.COMPLETED;

  const handleMemoClick = (e: React.MouseEvent, idx: number, stepName: string, currentMemo: string | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onUpdateMemo) return;
    
    const promptTitle = `${getAbbreviation(stepName)} 메모 입력:`;
    const newMemo = prompt(promptTitle, currentMemo || "");
    if (newMemo !== null) {
      onUpdateMemo(bed.id, idx, newMemo === "" ? null : newMemo);
    }
  };

  return (
    <div className="w-full h-full flex flex-row divide-x divide-gray-200 dark:divide-slate-700 overflow-hidden">
      {steps.map((step, idx) => {
        const isActive = idx === bed.currentStepIndex && bed.status === BedStatus.ACTIVE;
        const queueIndex = queue.indexOf(idx);
        const isInQueue = queueIndex !== -1;
        const isPast = !isActive && !isInQueue && !isCompleted && idx !== bed.currentStepIndex;
        const memo = bed.memos?.[idx];
        
        const colorClass = getStepColor(step, isActive, isPast, isInQueue, isCompleted);
        
        return (
          <div 
            key={step.id || idx}
            className="flex-1 flex flex-col h-full min-w-0 pb-7 landscape:pb-6 sm:landscape:pb-6 lg:landscape:pb-12 group/col"
            onDoubleClick={(e) => {
              // CRITICAL: Stop propagation so the BedCard's onEdit (Settings Overlay) doesn't trigger.
              // This prioritizes the "Jump to Step" / "Reorder" feature.
              e.stopPropagation();
              onJumpToStep && onJumpToStep(bed.id, idx);
            }}
          >
            {/* Top Half: Step Indicator */}
            <div 
              className={`flex-1 flex flex-col items-center justify-center p-1 relative overflow-hidden transition-all cursor-pointer ${colorClass} mt-1 sm:mt-0 landscape:mt-1 sm:landscape:mt-1 lg:landscape:mt-2 sm:landscape:mb-0 sm:landscape:rounded-t-sm`}
            >
                <span className={`font-black text-xs sm:text-2xl landscape:text-xs sm:landscape:text-xs lg:landscape:text-2xl text-center leading-tight break-all px-0.5 ${isActive ? 'scale-110' : 'opacity-80'}`}>
                  {getAbbreviation(step.name)}
                </span>
                
                {isActive && <div className="absolute bottom-0 w-full h-1 bg-white/50 animate-pulse" />}

                {isInQueue && !isCompleted && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-7 sm:h-7 landscape:w-3 landscape:h-3 sm:landscape:w-3 sm:landscape:h-3 lg:landscape:w-6 lg:landscape:h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-[9px] sm:text-base landscape:text-[8px] sm:landscape:text-[8px] lg:landscape:text-sm font-black shadow-md z-10 border border-white/20">
                    {queueIndex + 1}
                  </div>
                )}
            </div>

            {/* Bottom Half: Memo Field */}
            <div 
              className="h-8 sm:h-7 landscape:h-6 sm:landscape:h-6 lg:landscape:h-16 shrink-0 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center px-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group touch-manipulation select-none overflow-hidden sm:landscape:rounded-b-sm"
              onClick={(e) => handleMemoClick(e, idx, step.name, memo)}
              onDoubleClick={(e) => {
                // Prevent bubbling to column which triggers Jump, AND preventing bubbling to Card which triggers Edit.
                // Memo area should just be for Memo.
                e.stopPropagation();
              }}
              title="클릭하여 메모 수정"
            >
               {memo ? (
                 <span className="text-[8px] sm:text-xs landscape:text-[8px] sm:landscape:text-[8px] lg:landscape:text-sm leading-none text-center font-bold text-gray-800 dark:text-gray-200 break-words line-clamp-2 w-full pointer-events-none">
                   {memo}
                 </span>
               ) : (
                 <span className="text-[8px] sm:text-sm text-gray-400 dark:text-slate-500 font-bold opacity-60 group-hover:opacity-100 transition-opacity select-none pointer-events-none italic">
                   +
                 </span>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};