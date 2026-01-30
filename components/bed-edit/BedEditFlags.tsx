import React from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine } from 'lucide-react';
import { BedState } from '../../types';

interface BedEditFlagsProps {
  bed: BedState;
  onToggleInjection?: (bedId: number) => void;
  onToggleManual?: (bedId: number) => void;
  onToggleESWT?: (bedId: number) => void;
  onToggleTraction?: (bedId: number) => void;
}

export const BedEditFlags: React.FC<BedEditFlagsProps> = ({ 
  bed, 
  onToggleInjection, 
  onToggleManual, 
  onToggleESWT, 
  onToggleTraction 
}) => {
  return (
    <div className="flex flex-col gap-2 shrink-0">
       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">상태 표시 (Status Flags)</span>
       <div className="grid grid-cols-2 gap-2">
           {/* Injection Toggle */}
           <div 
             onClick={() => onToggleInjection && onToggleInjection(bed.id)}
             className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer shadow-sm transition-all gap-1 ${bed.isInjection ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'}`}
           >
              <div className={`p-2 rounded-full ${bed.isInjection ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                  <Syringe className="w-5 h-5" />
              </div>
              <span className={`text-sm font-bold ${bed.isInjection ? 'text-red-900 dark:text-red-100' : 'text-gray-700 dark:text-gray-300'}`}>주사 (Inj)</span>
              <div className={`w-2 h-2 rounded-full mt-1 ${bed.isInjection ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
           </div>

           {/* Manual Therapy (Do-su) Toggle */}
           <div 
             onClick={() => onToggleManual && onToggleManual(bed.id)}
             className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer shadow-sm transition-all gap-1 ${bed.isManual ? 'bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:border-violet-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'}`}
           >
              <div className={`p-2 rounded-full ${bed.isManual ? 'bg-violet-100 dark:bg-violet-900 text-violet-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                  <Hand className="w-5 h-5" />
              </div>
              <span className={`text-sm font-bold ${bed.isManual ? 'text-violet-900 dark:text-violet-100' : 'text-gray-700 dark:text-gray-300'}`}>도수 (Man)</span>
              <div className={`w-2 h-2 rounded-full mt-1 ${bed.isManual ? 'bg-violet-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
           </div>

           {/* ESWT Toggle */}
           <div 
             onClick={() => onToggleESWT && onToggleESWT(bed.id)}
             className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer shadow-sm transition-all gap-1 ${bed.isESWT ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'}`}
           >
              <div className={`p-2 rounded-full ${bed.isESWT ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                  <Zap className="w-5 h-5" />
              </div>
              <span className={`text-sm font-bold ${bed.isESWT ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>충격파</span>
              <div className={`w-2 h-2 rounded-full mt-1 ${bed.isESWT ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
           </div>

           {/* Traction Toggle */}
           <div 
             onClick={() => onToggleTraction && onToggleTraction(bed.id)}
             className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer shadow-sm transition-all gap-1 ${bed.isTraction ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800' : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'}`}
           >
              <div className={`p-2 rounded-full ${bed.isTraction ? 'bg-orange-100 dark:bg-orange-900 text-orange-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}>
                  <ArrowUpFromLine className="w-5 h-5" />
              </div>
              <span className={`text-sm font-bold ${bed.isTraction ? 'text-orange-900 dark:text-orange-100' : 'text-gray-700 dark:text-gray-300'}`}>견인</span>
              <div className={`w-2 h-2 rounded-full mt-1 ${bed.isTraction ? 'bg-orange-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
           </div>
       </div>
    </div>
  );
};