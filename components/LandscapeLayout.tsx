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
    // Changed px-1 to pl-0 pr-1 for mobile landscape to reduce left space
    <div className="block w-full h-full overflow-x-auto overflow-y-auto no-scrollbar pb-2 sm:pb-0 pl-0 pr-1 sm:px-2">
      {/* 
        Grid Container:
        - Mobile Landscape (< sm): min-w-[160vw]
        - Added -ml-1.5 (approx -6px) combined with pl-0 removal of 4px padding = ~10px total left shift (considering parent container has px-2)
        - Tablet/Large Phone Landscape (sm < lg): min-w-[130vw]
        - Desktop Landscape (>= lg): Fit screen width (w-full).
      */}
      <div className="
        grid gap-2 sm:gap-4 content-start
        grid-cols-4 
        min-w-[160vw] -ml-1.5
        sm:min-w-[130vw] sm:ml-0
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