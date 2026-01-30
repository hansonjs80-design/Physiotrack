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
    <header className="flex items-center justify-between px-3 bg-white dark:bg-slate-900 shadow-sm z-10 shrink-0 h-10 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu} 
          className="p-1 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded transition-all active:scale-95"
          aria-label="Main Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tighter leading-none select-none flex items-center">
          <span className="bg-brand-600 text-white px-1.5 py-0.5 rounded mr-1 text-[10px] sm:text-xs">PRO</span>
          PHYSIO<span className="text-brand-600">TRACK</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={onToggleDarkMode} 
          className="p-1.5 rounded-full text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          title={isDarkMode ? '라이트 모드' : '다크 모드'}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
};