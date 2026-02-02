
import React from 'react';
import { Play } from 'lucide-react';
import { Preset } from '../../types';

interface PresetListViewProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

export const PresetListView: React.FC<PresetListViewProps> = ({ presets, onSelect }) => (
  <div className="space-y-2">
    <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">처방 프리셋 (Presets)</p>
    <div className="space-y-2">
      {presets.map(preset => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset)}
          className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-brand-50 hover:border-brand-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-all group active:scale-[0.98]"
        >
          <div className="flex flex-col items-start text-left">
            <span className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-brand-700 dark:group-hover:text-brand-300">
              {preset.name}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">
              {preset.steps.map(s => s.name).join(' + ')}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900">
            <Play className="w-4 h-4 text-gray-400 group-hover:text-brand-600 fill-current" />
          </div>
        </button>
      ))}
    </div>
  </div>
);
