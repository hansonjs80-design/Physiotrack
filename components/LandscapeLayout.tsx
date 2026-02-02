import React, { memo } from 'react';
import { BedLayoutProps } from '../types';
import { LANDSCAPE_GRID_IDS } from '../constants/layout';
import { BedCard } from './BedCard';

export const LandscapeLayout: React.FC<BedLayoutProps> = memo((props) => {
  const { beds } = props;
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];

  return (
    // Outer Wrapper: Handles scrolling
    // Mobile Landscape: Horizontal & Vertical scroll allowed
    // Tablet/Desktop: Scroll allowed if content overflows, but generally grid fits.
    <div className="block w-full h-full overflow-x-auto overflow-y-auto no-scrollbar pb-2 sm:pb-0 px-1 sm:px-2">
      {/* 
        Grid Container:
        - Mobile Landscape (< lg): 4 Columns. 
          Force min-width (e.g., 140vw/120vw) to ensure grid is wider than screen, enabling horizontal scroll.
        - Tablet/Desktop Landscape (>= lg): 4 Columns. Fit to screen width (w-full).
      */}
      <div className="
        grid gap-2 sm:gap-4 content-start
        grid-cols-4 
        min-w-[140vw] sm:min-w-[120vw]
        lg:min-w-0 lg:w-full
      ">
        {LANDSCAPE_GRID_IDS.map((id, idx) => {
          // Empty Slot Handling
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
                presets={props.presets}
                onOpenSelector={props.onOpenSelector}
                onEdit={props.onEdit}
                onNextStep={props.onNext}
                onPrevStep={props.onPrev}
                onTogglePause={props.onTogglePause}
                onSwapSteps={props.onSwapSteps}
                onJumpToStep={props.onJumpToStep}
                onClear={props.onClear}
                onUpdateMemo={props.onUpdateMemo}
                onUpdateDuration={props.onUpdateDuration}
                isCompact={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});