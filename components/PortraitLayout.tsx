import React, { memo, useCallback, useMemo } from 'react';
import { BedLayoutProps, BedState } from '../types';
import { PORTRAIT_PAIRS_CONFIG } from '../constants/layout';
import { PortraitBedRow } from './PortraitBedRow';

export const PortraitLayout: React.FC<BedLayoutProps> = memo((props) => {
  const { beds } = props;
  
  const getBed = useCallback((id: number): BedState => {
    return beds.find(b => b.id === id) || beds[0];
  }, [beds]);

  // 2개 행씩 묶음 처리 (1-11/2-null 묶음, 3-10/4-9 묶음, 5-8/6-7 묶음)
  const groupedPairs = useMemo(() => {
    const groups = [];
    for (let i = 0; i < PORTRAIT_PAIRS_CONFIG.length; i += 2) {
      groups.push(PORTRAIT_PAIRS_CONFIG.slice(i, i + 2));
    }
    return groups;
  }, []);

  return (
    // px-0.5 removed for mobile to maximize width (px-0 implicit)
    <div className="flex flex-col gap-4 pb-32 max-w-4xl mx-auto px-0 sm:px-1.5">
      {groupedPairs.map((group, groupIdx) => (
        <div key={`group-${groupIdx}`} className="flex flex-col gap-1.5 sm:gap-2">
          {group.map((pair, idx) => {
            // Pre-resolve beds here to pass as stable objects to the memoized row
            const leftBed = getBed(pair.left);
            const rightBed = pair.right ? getBed(pair.right) : null;

            return (
              <PortraitBedRow 
                key={`${groupIdx}-${idx}`}
                leftBed={leftBed}
                rightBed={rightBed}
                {...props} // Pass all handler props
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});