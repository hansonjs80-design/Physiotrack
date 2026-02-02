import React, { useState, useRef, useEffect } from 'react';
import { useHeaderScroll } from '../hooks/useHeaderScroll';
import { AppHeader } from './AppHeader';
import { BedLayoutContainer } from './BedLayoutContainer';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { GlobalModals } from './GlobalModals';

export const MainLayout: React.FC = () => {
  const { beds, presets } = useTreatmentContext();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  useHeaderScroll(mainRef, headerRef);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-100 dark:bg-slate-950 relative">
      {/* 
        Header Wrapper Layout Logic (Stable Version):
        - Mobile (< 768px): Absolute (Scroll-away to save space)
        - Tablet/Desktop (>= 768px): Relative (Sticky/Fixed flow to prevent overlap)
      */}
      <div 
        ref={headerRef}
        className="
          w-full z-40 will-change-transform
          h-[calc(3.5rem+env(safe-area-inset-top))]
          absolute top-0 left-0 right-0
          md:relative md:top-auto md:left-auto md:right-auto md:shrink-0
        "
      >
        <AppHeader 
          onOpenMenu={() => setMenuOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setDarkMode(!isDarkMode)}
        />
      </div>

      <main 
        ref={mainRef}
        className="
          flex-1 overflow-x-auto overflow-y-auto scroll-smooth touch-pan-x touch-pan-y overscroll-contain 
          bg-gray-200 dark:bg-slate-950
          px-0 sm:px-2 md:p-4
          pb-[calc(env(safe-area-inset-bottom)+1.5rem)]
          
          /* Mobile Padding: Compensate for absolute header + extra spacing */
          pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)] 
          
          /* Tablet/Desktop Padding: Reset top padding as header is relative */
          md:pt-2 
        "
      >
        <BedLayoutContainer beds={beds} presets={presets} />
      </main>

      <GlobalModals 
        isMenuOpen={isMenuOpen} 
        onCloseMenu={() => setMenuOpen(false)} 
        presets={presets}
      />
    </div>
  );
};