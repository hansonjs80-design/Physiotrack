import React, { memo, useCallback, useMemo } from 'react';
import { BedLayoutProps, BedState } from '../types';
import { PORTRAIT_PAIRS_CONFIG } from '../constants/layout';
import { BedBay } from './BedBay';

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
    <div className="flex flex-col gap-4 pb-32 max-w-4xl mx-auto px-0.5 sm:px-1.5">
      {groupedPairs.map((group, groupIdx) => (
        <div key={`group-${groupIdx}`} className="flex flex-col gap-1.5 sm:gap-2">
          {group.map((pair, idx) => (
            <div key={`${groupIdx}-${idx}`} className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6">
              <div className="flex flex-col">
                <BedBay 
                  {...props}
                  side="left"
                  beds={[getBed(pair.left)]}
                />
              </div>

              <div className="flex flex-col">
                {pair.right !== null ? (
                  <BedBay 
                    {...props}
                    side="right"
                    beds={[getBed(pair.right)]}
                  />
                ) : (
                  <div className="h-full flex flex-col gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200/50 dark:border-slate-800/50 bg-transparent opacity-20 select-none items-center justify-center">
                    <span className="text-gray-400 dark:text-slate-700 text-[10px] font-black uppercase tracking-widest">
                      RESERVED
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});