import React from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine } from 'lucide-react';
import { BedState, BedStatus } from '../types';

interface BedStatusBadgesProps {
  bed: BedState;
}

export const BedStatusBadges: React.FC<BedStatusBadgesProps> = ({ bed }) => {
  if (bed.status === BedStatus.IDLE) return null;
  if (!bed.isInjection && !bed.isManual && !bed.isESWT && !bed.isTraction) return null;

  return (
    <div className="absolute bottom-1 right-1 flex flex-row items-end gap-1 z-20 pointer-events-none">
      {bed.isInjection && (
        <div className="flex items-center gap-1 bg-red-100/90 dark:bg-red-900/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 landscape:px-1 landscape:py-0.5 sm:landscape:px-1 sm:landscape:py-0.5 lg:landscape:px-2.5 lg:landscape:py-1 rounded shadow-sm border border-red-200 dark:border-red-800 animate-in slide-in-from-right-2">
          <span className="text-[10px] sm:text-xs landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs font-black text-red-700 dark:text-red-200">주사</span>
          <Syringe className="w-3 h-3 sm:w-3.5 sm:h-3.5 landscape:w-2.5 landscape:h-2.5 sm:landscape:w-2.5 sm:landscape:h-2.5 lg:landscape:w-3.5 lg:landscape:h-3.5 text-red-600 dark:text-red-400" />
        </div>
      )}
      {bed.isManual && (
        <div className="flex items-center gap-1 bg-violet-100/90 dark:bg-violet-900/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 landscape:px-1 landscape:py-0.5 sm:landscape:px-1 sm:landscape:py-0.5 lg:landscape:px-2.5 lg:landscape:py-1 rounded shadow-sm border border-violet-200 dark:border-violet-800 animate-in slide-in-from-right-2">
          <span className="text-[10px] sm:text-xs landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs font-black text-violet-700 dark:text-violet-200">도수</span>
          <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5 landscape:w-2.5 landscape:h-2.5 sm:landscape:w-2.5 sm:landscape:h-2.5 lg:landscape:w-3.5 lg:landscape:h-3.5 text-violet-600 dark:text-violet-400" />
        </div>
      )}
      {bed.isESWT && (
        <div className="flex items-center gap-1 bg-blue-100/90 dark:bg-blue-900/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 landscape:px-1 landscape:py-0.5 sm:landscape:px-1 sm:landscape:py-0.5 lg:landscape:px-2.5 lg:landscape:py-1 rounded shadow-sm border border-blue-200 dark:border-blue-800 animate-in slide-in-from-right-2">
          <span className="text-[10px] sm:text-xs landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs font-black text-blue-700 dark:text-blue-200">충격파</span>
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 landscape:w-2.5 landscape:h-2.5 sm:landscape:w-2.5 sm:landscape:h-2.5 lg:landscape:w-3.5 lg:landscape:h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      {bed.isTraction && (
        <div className="flex items-center gap-1 bg-orange-100/90 dark:bg-orange-900/90 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 landscape:px-1 landscape:py-0.5 sm:landscape:px-1 sm:landscape:py-0.5 lg:landscape:px-2.5 lg:landscape:py-1 rounded shadow-sm border border-orange-200 dark:border-orange-800 animate-in slide-in-from-right-2">
          <span className="text-[10px] sm:text-xs landscape:text-[9px] sm:landscape:text-[9px] lg:landscape:text-xs font-black text-orange-700 dark:text-orange-200">견인</span>
          <ArrowUpFromLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 landscape:w-2.5 landscape:h-2.5 sm:landscape:w-2.5 sm:landscape:h-2.5 lg:landscape:w-3.5 lg:landscape:h-3.5 text-orange-600 dark:text-orange-400" />
        </div>
      )}
    </div>
  );
};