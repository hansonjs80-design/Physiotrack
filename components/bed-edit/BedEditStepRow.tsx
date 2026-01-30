import React from 'react';
import { ArrowUp, ArrowDown, X, Minus, Plus, Clock, RefreshCw } from 'lucide-react';
import { TreatmentStep } from '../../types';

interface BedEditStepRowProps {
  step: TreatmentStep;
  index: number;
  isActive: boolean;
  totalSteps: number;
  onMove: (idx: number, direction: 'up' | 'down') => void;
  onRemove: (idx: number) => void;
  onChange: (idx: number, updates: Partial<TreatmentStep>) => void;
  onDurationChange: (idx: number, changeMinutes: number) => void;
  onApplyDuration?: (duration: number) => void; // Only passed if active
}

export const BedEditStepRow: React.FC<BedEditStepRowProps> = ({
  step,
  index,
  isActive,
  totalSteps,
  onMove,
  onRemove,
  onChange,
  onDurationChange,
  onApplyDuration
}) => {
  const minutes = Math.floor(step.duration / 60);

  // Handle manual input for minutes
  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      const newDuration = val * 60;
      onChange(index, { duration: newDuration });
    }
  };

  return (
    <div className={`flex flex-col gap-2 p-2 rounded-lg shadow-sm border transition-colors ${isActive ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200 dark:bg-brand-900/20 dark:border-brand-700' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'}`}>
      {/* Row 1: Name & Order Controls */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${isActive ? 'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-300' : 'bg-gray-100 text-gray-500 dark:bg-slate-700'}`}>
           {index + 1}
        </div>
        
        <input 
          type="text" 
          value={step.name}
          onChange={(e) => onChange(index, { name: e.target.value })}
          className={`flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-500 outline-none text-sm font-bold truncate ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-200'}`}
        />

        <div className="flex items-center gap-1">
           <div className="flex flex-col">
            <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded text-gray-400 active:scale-90 transition-transform"><ArrowUp className="w-3 h-3" /></button>
            <button onClick={() => onMove(index, 'down')} disabled={index === totalSteps - 1} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded text-gray-400 active:scale-90 transition-transform"><ArrowDown className="w-3 h-3" /></button>
           </div>
           <button onClick={() => onRemove(index)} className="w-7 h-7 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full active:scale-90 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Row 2: Duration, Timer, Color */}
      <div className="flex items-center gap-2 pl-8">
         <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
           <button onClick={() => onDurationChange(index, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-gray-600 dark:text-gray-300"><Minus className="w-3 h-3" /></button>
           <input 
             type="number" 
             value={minutes} 
             onChange={handleMinuteInput}
             className="w-8 text-center bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 outline-none appearance-none"
           />
           <button onClick={() => onDurationChange(index, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-gray-600 dark:text-gray-300"><Plus className="w-3 h-3" /></button>
         </div>

         {/* APPLY BUTTON (Visible only if active and timer is enabled) */}
         {isActive && onApplyDuration && step.enableTimer && (
            <button 
              onClick={() => onApplyDuration(step.duration)}
              className="flex items-center gap-1 px-2 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
              title="현재 타이머에 시간 적용"
            >
              <RefreshCw className="w-3 h-3" />
              적용
            </button>
         )}

         <button
            onClick={() => onChange(index, { enableTimer: !step.enableTimer })}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${step.enableTimer ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}
         >
            <Clock className="w-3 h-3" />
            {step.enableTimer ? 'ON' : 'OFF'}
         </button>

         <select
            value={step.color}
            onChange={(e) => onChange(index, { color: e.target.value })}
            className="text-xs p-1 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none w-16"
         >
            <option value="bg-red-500">Red</option>
            <option value="bg-blue-500">Blue</option>
            <option value="bg-purple-500">Prp</option>
            <option value="bg-green-500">Grn</option>
            <option value="bg-orange-500">Org</option>
            <option value="bg-pink-500">Pnk</option>
            <option value="bg-cyan-500">Cyn</option>
            <option value="bg-yellow-500">Yel</option>
            <option value="bg-gray-500">Gry</option>
         </select>
      </div>
    </div>
  );
};