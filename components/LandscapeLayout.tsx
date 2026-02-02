import React, { memo } from 'react';
import { BedLayoutProps } from '../types';
import { LANDSCAPE_GRID_IDS } from '../constants/layout';
import { BedCard } from './BedCard';

export const LandscapeLayout: React.FC<BedLayoutProps> = memo(({ beds, presets }) => {
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];

  return (
    <div className="block w-full h-full overflow-x-auto overflow-y-auto no-scrollbar pb-2 sm:pb-0 px-0">
      <div className="
        grid gap-2 sm:gap-4 content-start
        grid-cols-4 
        min-w-[160vw] px-2
        sm:min-w-[130vw] sm:px-0
        lg:min-w-0 lg:w-full
      ">
        {LANDSCAPE_GRID_IDS.map((id, idx) => {
          if (id === null) {
            return (
              <div 
                key={`empty-${idx}`} 
                className="
                  rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-800 bg-gray-100/30 dark:bg-slate-900/30 
                  min-h-[110px] lg:min-h-[240px]
                  flex items-center justify-center
                  invisible md:visible
                "
              >
                 <span className="text-gray-300 dark:text-slate-700 font-black text-sm opacity-50 uppercase tracking-widest">Empty</span>
              </div>
            );
          }
          
          const bed = getBed(id);
          return (
            <div key={id} className="w-full h-full min-h-0">
              <BedCard 
                bed={bed}
                presets={presets}
                isCompact={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});