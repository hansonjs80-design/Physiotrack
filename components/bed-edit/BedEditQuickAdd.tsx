import React from 'react';
import { TreatmentStep } from '../../types';
import { STANDARD_TREATMENTS } from '../../constants';
import { Plus } from 'lucide-react';

interface BedEditQuickAddProps {
  bedId: number;
  steps: TreatmentStep[];
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
}

export const BedEditQuickAdd: React.FC<BedEditQuickAddProps> = ({ bedId, steps, onUpdateSteps }) => {
  const handleAddStandardStep = (template: typeof STANDARD_TREATMENTS[0]) => {
    if (!onUpdateSteps) return;
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };
    onUpdateSteps(bedId, [...steps, newStep]);
  };

  const handleAddCustomStep = () => {
    if (!onUpdateSteps) return;
    const newStep: TreatmentStep = {
        id: crypto.randomUUID(),
        name: '직접 입력',
        duration: 10 * 60, // 10 min default
        enableTimer: true,
        color: 'bg-gray-500'
    };
    onUpdateSteps(bedId, [...steps, newStep]);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-700 shrink-0">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">치료 추가 (Quick Add)</span>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {STANDARD_TREATMENTS.map((item) => (
          <button
            key={item.name}
            onClick={() => handleAddStandardStep(item)}
            className="flex flex-col items-center justify-center py-2 px-1 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{item.label}</span>
            <span className="text-[10px] font-bold text-gray-800 dark:text-white mt-0.5">{item.duration}분</span>
          </button>
        ))}
        {/* 직접 추가 버튼 */}
        <button
            onClick={handleAddCustomStep}
            className="flex flex-col items-center justify-center py-2 px-1 border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
        >
            <Plus className="w-3 h-3 mb-0.5" />
            <span className="text-[10px] font-bold">직접 추가</span>
        </button>
      </div>
    </div>
  );
};