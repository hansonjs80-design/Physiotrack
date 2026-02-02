import { useState, useEffect, useRef, RefObject } from 'react';

export const useHeaderScroll = (scrollContainerRef: RefObject<HTMLElement | null>) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = scrollContainer.scrollTop;
          // 태블릿(iPad Portrait 등)까지 포함하기 위해 1024px로 기준 상향
          const isMobile = window.innerWidth < 1024;

          // 데스크탑이나 가로 모드(넓은 화면)에서는 항상 헤더 표시
          if (!isMobile) {
            setIsHeaderVisible(true);
            ticking.current = false;
            return;
          }

          // iOS 바운스 효과(Rubber-banding)로 인한 음수 스크롤 무시
          if (currentScrollY < 0) {
             ticking.current = false;
             return;
          }

          const delta = currentScrollY - lastScrollY.current;
          const absDelta = Math.abs(delta);

          // 최상단 근처(60px 이내)에서는 항상 헤더 표시 (접근성 보장)
          if (currentScrollY < 60) {
            setIsHeaderVisible(true);
          } 
          // 스크롤 변화량이 일정 수준 이상일 때만 반응
          // 기존 10px에서 4px로 낮춰서 부드러운 스크롤에도 자연스럽게 반응하도록 개선
          else if (absDelta > 4) {
            if (delta > 0) {
              // 아래로 스크롤 중 (Delta 양수) -> 헤더 숨김
              // 이미 숨겨진 상태라면 불필요한 상태 업데이트 방지
              setIsHeaderVisible((prev) => (prev ? false : prev));
            } else {
              // 위로 스크롤 중 (Delta 음수) -> 헤더 표시
              setIsHeaderVisible((prev) => (!prev ? true : prev));
            }
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // 화면 회전/리사이즈 시 상태 재설정
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            setIsHeaderVisible(true);
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isHeaderVisible;
};