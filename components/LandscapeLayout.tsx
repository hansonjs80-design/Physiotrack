import React, { memo } from 'react';
import { BedLayoutProps } from '../types';
import { LANDSCAPE_GRID_IDS } from '../constants/layout';
import { BedCard } from './BedCard';

export const LandscapeLayout: React.FC<BedLayoutProps> = memo(({ beds, presets }) => {
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];

  const renderCell = (id: number | null, idx: number) => {
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
  };

  // Construct grid items with spacers for desktop layout
  const gridItems = [];
  for (let i = 0; i < LANDSCAPE_GRID_IDS.length; i += 4) {
    // Left Pair
    gridItems.push(renderCell(LANDSCAPE_GRID_IDS[i], i));
    gridItems.push(renderCell(LANDSCAPE_GRID_IDS[i+1], i+1));
    
    // Desktop Spacer (Aisle)
    gridItems.push(<div key={`spacer-${i}`} className="hidden lg:block w-full" />);
    
    // Right Pair
    gridItems.push(renderCell(LANDSCAPE_GRID_IDS[i+2], i+2));
    gridItems.push(renderCell(LANDSCAPE_GRID_IDS[i+3], i+3));
  }

  return (
    <div className="block w-full h-full overflow-x-auto overflow-y-auto no-scrollbar pb-2 sm:pb-0 px-0">
      <div className="
        grid content-start
        gap-2 sm:gap-4 
        lg:gap-y-9 lg:gap-x-2 
        grid-cols-4 lg:grid-cols-[1fr_1fr_0px_1fr_1fr]
        min-w-[160vw] px-2
        sm:min-w-[130vw] sm:px-0
        lg:min-w-0 lg:w-full
      ">
        {gridItems}
      </div>
    </div>
  );
});