import React from 'react';
import { TreatmentStep, BedState, BedStatus } from '../types';
import { getAbbreviation, getStepColor } from '../utils/bedUtils';

interface BedContentProps {
  steps: TreatmentStep[];
  bed: BedState;
  queue: number[];
  onSwapRequest?: (id: number, idx: number) => void;
  swapSourceIndex?: number | null;
  onUpdateMemo?: (id: number, idx: number, val: string | null) => void;
}

export const BedContent: React.FC<BedContentProps> = ({ 
  steps, 
  bed, 
  onSwapRequest,
  swapSourceIndex,
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
        // 수정: 현재 진행 중인 단계보다 인덱스가 작은 경우(왼쪽)만 '지나간 치료(isPast)'로 간주
        const isPast = !isCompleted && idx < bed.currentStepIndex;
        const memo = bed.memos?.[idx];
        const isSelectedForSwap = swapSourceIndex === idx;
        
        const colorClass = getStepColor(step, isActive, isPast, false, isCompleted);
        
        return (
          <div 
            key={step.id || idx}
            className={`flex-1 flex flex-col h-full min-w-0 group/col relative transition-all ${isSelectedForSwap ? 'ring-2 ring-inset ring-brand-500 bg-brand-50/50 dark:bg-brand-900/20 z-10' : ''}`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onSwapRequest && onSwapRequest(bed.id, idx);
            }}
          >
            {/* 
              Top Half: Step Indicator 
              Mobile Portrait: Fixed height ~30px.
              Mobile Landscape: Reduced from 28px to 25px (approx 10% reduction).
              Tablet/Desktop (sm+): flex-1 to fill space.
            */}
            <div 
              className={`
                flex-none h-[30px] sm:flex-1
                landscape:flex-none landscape:h-[25px] 
                lg:landscape:flex-none lg:landscape:h-[60%] 
                flex flex-col items-center justify-center p-0.5 relative overflow-hidden transition-all cursor-pointer ${colorClass}
                ${isSelectedForSwap ? 'opacity-90' : ''}
              `}
            >
                <span className={`font-black text-[10px] xs:text-xs sm:text-2xl landscape:text-[9px] sm:landscape:text-[11px] lg:landscape:text-xl text-center leading-tight break-all px-0.5 ${isActive ? 'scale-110' : 'opacity-80'}`}>
                  {getAbbreviation(step.name)}
                </span>
                
                {isActive && <div className="absolute bottom-0 w-full h-1 bg-white/50 animate-pulse" />}
                
                {/* Swap Selection Indicator */}
                {isSelectedForSwap && (
                  <div className="absolute inset-0 border-2 border-brand-400 border-dashed animate-pulse pointer-events-none" />
                )}
            </div>

            {/* Bottom Half: Memo Field - Positioned directly below step */}
            <div 
              className="w-full h-6 sm:h-8 landscape:h-[16px] sm:landscape:h-[20px] lg:landscape:h-10 shrink-0 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center px-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group touch-manipulation select-none overflow-hidden"
              onClick={(e) => handleMemoClick(e, idx, step.name, memo)}
              onDoubleClick={(e) => e.stopPropagation()}
            >
               {memo ? (
                 <span className="text-[9px] sm:text-xs landscape:text-[8px] sm:landscape:text-[9px] lg:landscape:text-sm leading-none text-center font-bold text-gray-800 dark:text-gray-200 break-words line-clamp-2 w-full pointer-events-none px-0.5">
                   {memo}
                 </span>
               ) : (
                 <span className="text-[10px] sm:text-sm text-gray-300 dark:text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                   +
                 </span>
               )}
            </div>
            
            {/* The rest of the column is empty space, where absolute positioned badges in parent will be visible */}
          </div>
        );
      })}
    </div>
  );
};
