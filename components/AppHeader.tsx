
import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

interface AppHeaderProps {
  onOpenMenu: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMenu,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm z-30 shrink-0 h-14 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu} 
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          aria-label="Main Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 select-none">
          <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter leading-none flex items-center">
            PHYSIO<span className="text-brand-600">TRACK</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleDarkMode} 
          className="p-2.5 rounded-xl text-slate-600 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          title={isDarkMode ? '라이트 모드' : '다크 모드'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
