import React, { useMemo, memo } from 'react';
import { BedState, Preset, TreatmentStep } from '../types';
import { PORTRAIT_PAIRS_CONFIG } from '../constants/layout';
import { BedBay } from './BedBay';

interface PortraitLayoutProps {
  beds: BedState[];
  presets: Preset[];
  onOpenSelector: (bedId: number) => void;
  onEdit: (bedId: number) => void;
  onNext: (bedId: number) => void;
  onJumpToStep: (bedId: number, stepIndex: number) => void;
  onClear: (bedId: number) => void;
  onToggleInjection: (bedId: number) => void;
  onToggleTraction: (bedId: number) => void;
  onToggleESWT: (bedId: number) => void;
  onToggleManual: (bedId: number) => void;
  onUpdateSteps: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateMemo: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration: (bedId: number, duration: number) => void;
}

export const PortraitLayout: React.FC<PortraitLayoutProps> = memo(({
  beds,
  presets,
  onOpenSelector,
  onEdit,
  onNext,
  onJumpToStep,
  onClear,
  onToggleInjection,
  onToggleTraction,
  onToggleESWT,
  onToggleManual,
  onUpdateSteps,
  onUpdateMemo,
  onUpdateDuration
}) => {
  
  const portraitRows = useMemo(() => {
    const bedMap = new Map(beds.map(b => [b.id, b]));
    const get = (id: number | null) => (id !== null ? bedMap.get(id) : undefined) || beds[0];

    return PORTRAIT_PAIRS_CONFIG.map(pair => ({
      left: [get(pair.left)],
      right: pair.right !== null ? [get(pair.right)] : []
    }));
  }, [beds]);

  return (
    <div className="flex flex-col gap-2 sm:gap-[25px] pb-10 landscape:hidden">
      {portraitRows.map((row, idx) => (
        <div key={idx} className="flex flex-row gap-1 sm:gap-6">
          <div className="flex-1 w-0">
            <BedBay 
              beds={row.left}
              presets={presets}
              onOpenSelector={onOpenSelector}
              onEdit={onEdit}
              onNext={onNext}
              onJumpToStep={onJumpToStep}
              onClear={onClear}
              side="left"
              onToggleInjection={onToggleInjection}
              onToggleTraction={onToggleTraction}
              onToggleESWT={onToggleESWT}
              onToggleManual={onToggleManual}
              onUpdateSteps={onUpdateSteps}
              onUpdateMemo={onUpdateMemo}
              onUpdateDuration={onUpdateDuration}
            />
          </div>
          <div className="flex-1 w-0">
            <BedBay 
              beds={row.right}
              presets={presets}
              onOpenSelector={onOpenSelector}
              onEdit={onEdit}
              onNext={onNext}
              onJumpToStep={onJumpToStep}
              onClear={onClear}
              side="right"
              isEmpty={row.right.length === 0}
              onToggleInjection={onToggleInjection}
              onToggleTraction={onToggleTraction}
              onToggleESWT={onToggleESWT}
              onToggleManual={onToggleManual}
              onUpdateSteps={onUpdateSteps}
              onUpdateMemo={onUpdateMemo}
              onUpdateDuration={onUpdateDuration}
            />
          </div>
        </div>
      ))}
    </div>
  );
});