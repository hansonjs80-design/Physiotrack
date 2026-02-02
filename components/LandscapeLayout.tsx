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
    <div className="hidden landscape:block w-full h-full overflow-x-auto overflow-y-auto no-scrollbar pb-2 sm:pb-0 px-2 sm:px-4">
      {/* 
        Grid Container:
        - Mobile Landscape (< lg): 4 Columns. 
          min-w-[170vw] ensures the grid is wider than the screen, forcing horizontal scroll.
        - Tablet/Desktop Landscape (>= lg OR md with enough space): 4 Columns.
          Removed 'lg' constraint for min-w-0 to allow tablets (md) to also try and fit 4 columns without forcing scroll
          if the screen is wide enough, adhering to the request "Desktop/Tablet... make it 1 row...".
      */}
      <div className="
        grid gap-3 sm:gap-4 content-start
        landscape:grid-cols-4 
        landscape:min-w-[170vw] sm:landscape:min-w-[130vw]
        md:landscape:min-w-0 md:landscape:w-full
        lg:landscape:min-w-0 lg:landscape:w-full
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