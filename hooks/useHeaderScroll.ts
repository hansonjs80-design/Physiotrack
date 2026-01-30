import { useState, useEffect, useRef, RefObject } from 'react';

export const useHeaderScroll = (scrollContainerRef: RefObject<HTMLElement | null>) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const currentScrollY = scrollContainerRef.current.scrollTop;
      // Trigger on standard mobile widths (< 768px) OR specific mobile landscape constraints
      const isMobile = window.innerWidth < 768 || (window.innerHeight < 500 && window.innerWidth > window.innerHeight);

      // Only apply this logic in mobile modes
      if (!isMobile) {
        if (!isHeaderVisible) setIsHeaderVisible(true);
        return;
      }

      // 1. Always show at the very top
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } 
      // 2. Hide when scrolling down significantly
      else if (currentScrollY > lastScrollY.current && currentScrollY > 40) {
        setIsHeaderVisible(false);
      } 
      // 3. Show when scrolling up
      else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Check on resize/rotate
    window.addEventListener('resize', handleScroll);

    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHeaderVisible, scrollContainerRef]);

  return isHeaderVisible;
};