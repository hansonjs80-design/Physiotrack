import React, { memo } from 'react';
import { Trash2, Loader2, CheckCircle, Settings } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';

interface BedHeaderProps {
  bed: BedState;
  currentStep: TreatmentStep | undefined;
  onTrashClick: (e: React.MouseEvent) => void;
  trashState: 'idle' | 'confirm' | 'deleting';
  onEditClick?: (id: number) => void;
  onUpdateDuration?: (id: number, duration: number) => void;
}

export const BedHeader = memo(({ bed, currentStep, onTrashClick, trashState, onEditClick, onUpdateDuration }: BedHeaderProps) => {
  const isOvertime = bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && bed.remainingTime <= 0;
  
  const handleTimerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bed.status !== BedStatus.ACTIVE || !currentStep?.enableTimer || !onUpdateDuration) return;

    const currentMinutes = Math.ceil(Math.max(0, bed.remainingTime) / 60);
    const newMinutesStr = prompt("타이머 시간 수정 (분):", currentMinutes.toString());
    
    if (newMinutesStr !== null) {
      const newMinutes = parseInt(newMinutesStr.trim());
      if (!isNaN(newMinutes) && newMinutes > 0) {
        onUpdateDuration(bed.id, newMinutes * 60);
      }
    }
  };

  return (
    <div className={`h-8 sm:h-12 landscape:h-7 sm:landscape:h-7 lg:landscape:h-11 w-full flex items-center px-2 border-b border-black/10 shrink-0 gap-2 relative transition-colors ${
      bed.status === BedStatus.COMPLETED 
        ? 'bg-gray-300/50 dark:bg-slate-800/50' 
        : 'bg-gray-50 dark:bg-slate-700'
    }`}>
      <div className="flex items-center justify-center min-w-[1.8rem] sm:min-w-[3rem] landscape:min-w-[1.5rem] sm:landscape:min-w-[1.5rem] lg:landscape:min-w-[2.8rem] -ml-1">
        <span className={`font-black leading-none tracking-tighter select-none ${
           bed.status === BedStatus.COMPLETED 
           ? 'text-gray-400 dark:text-gray-600' 
           : 'text-slate-900 dark:text-white'
        } text-xl sm:text-4xl landscape:text-base sm:landscape:text-base lg:landscape:text-3xl`}>
          {bed.id === 11 ? 'T' : bed.id}
        </span>
      </div>

      <div className="flex-1 flex items-center">
        {bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && (
           <div 
             onDoubleClick={handleTimerDoubleClick}
             className={`flex items-center gap-0.5 font-mono font-black text-xl sm:text-4xl landscape:text-base sm:landscape:text-base lg:landscape:text-3xl leading-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1.5 py-1 select-none transition-colors ${
               isOvertime ? 'animate-pulse text-red-600 dark:text-red-500' : 'text-slate-800 dark:text-slate-200'
             }`}
             title="더블클릭하여 시간 수정"
           >
             {isOvertime ? <span>+{formatTime(bed.remainingTime)}</span> : <span>{formatTime(bed.remainingTime)}</span>}
           </div>
        )}
         {bed.status === BedStatus.COMPLETED && (
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-base landscape:text-[10px] sm:landscape:text-[10px] lg:landscape:text-xs bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
             <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 landscape:w-3 landscape:h-3 sm:landscape:w-3 sm:landscape:h-3 lg:landscape:w-4 lg:landscape:h-4" />
             <span>완료</span>
          </div>
        )}
      </div>

      {bed.status !== BedStatus.IDLE && (
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
             onClick={(e) => { e.stopPropagation(); onEditClick?.(bed.id); }}
             className="p-1 sm:p-2 landscape:p-0.5 sm:landscape:p-0.5 lg:landscape:p-1 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600 active:scale-90"
          >
             <Settings className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px] landscape:w-[14px] landscape:h-[14px] sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px]" />
          </button>

          <button 
             onClick={onTrashClick}
             disabled={trashState === 'deleting'}
             className={`p-1 sm:p-2 landscape:p-0.5 sm:landscape:p-0.5 lg:landscape:p-1 rounded-lg transition-all duration-200 flex items-center gap-1 overflow-hidden ${
               trashState === 'idle' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30' :
               trashState === 'confirm' ? 'bg-red-600 text-white w-auto px-3 landscape:px-2' :
               'bg-gray-100 text-gray-500 w-auto px-3 landscape:px-2'
             } active:scale-90`}
          >
             {trashState === 'idle' && <Trash2 className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px] landscape:w-[14px] landscape:h-[14px] sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px]" />}
             {trashState === 'confirm' && <span className="text-xs sm:text-base landscape:text-xs font-bold whitespace-nowrap">삭제</span>}
             {trashState === 'deleting' && <Loader2 className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px] landscape:w-[14px] landscape:h-[14px] sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px] animate-spin" />}
          </button>
        </div>
      )}
    </div>
  );
});