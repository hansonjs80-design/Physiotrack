
import React, { memo } from 'react';
import { BedLayoutProps } from '../types';
import { LANDSCAPE_GRID_IDS, GRID_RESPONSIVE_CLASSES, GRID_COLS_CLASSES } from '../constants/layout';
import { BedCard } from './BedCard';

export const LandscapeLayout: React.FC<BedLayoutProps> = memo((props) => {
  const { beds } = props;
  const getBed = (id: number) => beds.find(b => b.id === id) || beds[0];

  return (
    <div className={`hidden landscape:${GRID_RESPONSIVE_CLASSES} ${GRID_COLS_CLASSES} pb-10 sm:pb-0`}>
      {LANDSCAPE_GRID_IDS.map((id, idx) => {
        if (id === null) {
          return (
            <div key={`empty-${idx}`} className="hidden xl:flex rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800 bg-gray-100/30 dark:bg-slate-900/30 items-center justify-center min-h-[120px] lg:min-h-[240px]">
              <span className="text-gray-300 dark:text-slate-800 font-black text-lg opacity-40 uppercase tracking-widest">Empty Space</span>
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
              onTogglePause={props.onTogglePause}
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
  );
});
