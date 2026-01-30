import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Preset } from '../../types';

interface PresetListProps {
  presets: Preset[];
  onEdit: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export const PresetList: React.FC<PresetListProps> = ({ presets, onEdit, onDelete, onCreate }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const calculateTotalMinutes = (preset: Preset) => {
    const totalSeconds = preset.steps.reduce((sum, step) => sum + step.duration, 0);
    return Math.floor(totalSeconds / 60);
  };

  const handleDeleteClick = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(prev => prev === id ? null : prev), 3000);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg font-bold dark:text-white">처방 목록 관리</h3>
        <button 
          onClick={onCreate}
          className="flex items-center text-sm px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-sm font-bold"
        >
          <Plus className="w-4 h-4 mr-1" />
          추가
        </button>
      </div>

      <ul className="space-y-2 pb-20 sm:pb-4">
        {presets.map(preset => (
          <li key={preset.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-500 transition-colors group">
            <div>
              <span className="font-bold text-gray-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">{preset.name}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {preset.steps.length}단계 • 총 {calculateTotalMinutes(preset)}분
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(preset)} 
                disabled={deleteConfirmId === preset.id}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${deleteConfirmId === preset.id ? 'opacity-20 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'}`}
              >
                수정
              </button>
              
              {deleteConfirmId === preset.id ? (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button 
                    onClick={() => handleDeleteClick(preset.id)} 
                    className="px-2 py-1.5 bg-red-600 text-white rounded text-xs font-bold shadow-sm hover:bg-red-700 flex items-center"
                  >
                    <Check className="w-3 h-3 mr-1" /> 확인
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(null)} 
                    className="px-2 py-1.5 bg-gray-200 text-gray-600 rounded text-xs font-bold hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleDeleteClick(preset.id)} 
                  className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded"
                >
                  삭제
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};