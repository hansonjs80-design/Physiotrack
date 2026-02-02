
import React from 'react';
import { Syringe, Hand, Zap, ArrowUpFromLine } from 'lucide-react';

interface OptionTogglesProps {
  options: { isInjection: boolean; isManual: boolean; isESWT: boolean; isTraction: boolean };
  setOptions: React.Dispatch<React.SetStateAction<{ isInjection: boolean; isManual: boolean; isESWT: boolean; isTraction: boolean }>>;
}

export const OptionToggles: React.FC<OptionTogglesProps> = ({ options, setOptions }) => {
  const toggle = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const buttons = [
    { key: 'isInjection' as const, label: '주사', icon: Syringe, color: 'red' },
    { key: 'isManual' as const, label: '도수', icon: Hand, color: 'violet' },
    { key: 'isESWT' as const, label: '충격파', icon: Zap, color: 'blue' },
    { key: 'isTraction' as const, label: '견인', icon: ArrowUpFromLine, color: 'orange' },
  ];

  return (
    <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-4 gap-2 shrink-0">
      {buttons.map(({ key, label, icon: Icon, color }) => {
        const isActive = options[key];
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              isActive 
                ? `bg-${color}-50 border-${color}-200 text-${color}-600 dark:bg-${color}-900/30 dark:border-${color}-800 dark:text-${color}-400` 
                : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
            }`}
          >
            <Icon className={`w-4 h-4 mb-1 ${isActive ? 'animate-bounce' : ''}`} />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
