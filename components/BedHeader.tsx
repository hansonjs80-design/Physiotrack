
import React, { memo } from 'react';
import { CheckCircle, Settings, Pause, Play } from 'lucide-react';
import { BedState, BedStatus, TreatmentStep } from '../types';
import { formatTime } from '../utils/bedUtils';
import { BedTrashButton } from './BedTrashButton';

interface BedHeaderProps {
  bed: BedState;
  currentStep: TreatmentStep | undefined;
  onTrashClick: (e: React.MouseEvent) => void;
  trashState: 'idle' | 'confirm' | 'deleting';
  onEditClick?: (id: number) => void;
  onTogglePause?: (id: number) => void;
  onUpdateDuration?: (id: number, duration: number) => void;
}

export const BedHeader = memo(({ bed, currentStep, onTrashClick, trashState, onEditClick, onTogglePause, onUpdateDuration }: BedHeaderProps) => {
  const isOvertime = bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && bed.remainingTime <= 0;
  const isBedT = bed.id === 11;
  
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

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePause?.(bed.id);
  };

  // 헤더 배경색 결정 로직
  const getHeaderBgClass = () => {
    if (bed.status === BedStatus.COMPLETED) {
      return 'bg-gray-300/50 dark:bg-slate-800/50';
    }
    if (isBedT) {
      // 견인치료기(Bed T) 전용 연파랑 테마
      return 'bg-blue-100/80 dark:bg-blue-900/40 border-b-blue-200 dark:border-b-blue-800/50';
    }
    return 'bg-gray-50 dark:bg-slate-700';
  };

  return (
    <div className={`h-8 sm:h-12 landscape:h-7 sm:landscape:h-7 lg:landscape:h-11 w-full flex items-center px-2 border-b border-black/10 shrink-0 gap-2 relative transition-colors ${getHeaderBgClass()}`}>
      <div className="flex items-center justify-center min-w-[1.8rem] sm:min-w-[3rem] landscape:min-w-[1.5rem] sm:landscape:min-w-[1.5rem] lg:landscape:min-w-[2.8rem] -ml-1">
        <span className={`font-black leading-none tracking-tighter select-none ${
           bed.status === BedStatus.COMPLETED 
           ? 'text-gray-400 dark:text-gray-600' 
           : isBedT 
             ? 'text-blue-700 dark:text-blue-300' 
             : 'text-slate-900 dark:text-white'
        } text-xl sm:text-4xl landscape:text-base sm:landscape:text-base lg:landscape:text-3xl`}>
          {isBedT ? 'T' : bed.id}
        </span>
      </div>

      <div className="flex-1 flex items-center gap-1 sm:gap-2">
        {bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && (
          <>
             <div 
               onDoubleClick={handleTimerDoubleClick}
               className={`flex items-center gap-0.5 font-mono font-black text-xl sm:text-4xl landscape:text-base sm:landscape:text-base lg:landscape:text-3xl leading-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded px-1.5 py-1 select-none transition-colors ${
                 isOvertime ? 'animate-pulse text-red-600 dark:text-red-500' : isBedT ? 'text-blue-800 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'
               } ${bed.isPaused ? 'opacity-40 grayscale-[0.5]' : ''}`}
               title="더블클릭하여 시간 수정"
             >
               {isOvertime ? <span>+{formatTime(bed.remainingTime)}</span> : <span>{formatTime(bed.remainingTime)}</span>}
             </div>

             <button 
               onClick={handleTogglePause}
               className={`p-1 sm:p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center ${
                 bed.isPaused 
                   ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                   : isBedT 
                     ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50/50' 
                     : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'
               }`}
             >
               {bed.isPaused ? (
                 <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
               ) : (
                 <Pause className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
               )}
             </button>
          </>
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
             className={`p-1 sm:p-2 landscape:p-0.5 sm:landscape:p-0.5 lg:landscape:p-1 rounded-lg transition-all duration-200 active:scale-90 ${
               isBedT 
                 ? 'text-blue-400 hover:text-blue-600 hover:bg-blue-50' 
                 : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600'
             }`}
          >
             <Settings className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px] landscape:w-[14px] landscape:h-[14px] sm:landscape:w-[14px] sm:landscape:h-[14px] lg:landscape:w-[22px] lg:landscape:h-[22px]" />
          </button>

          <BedTrashButton trashState={trashState} onClick={onTrashClick} />
        </div>
      )}
    </div>
  );
});
