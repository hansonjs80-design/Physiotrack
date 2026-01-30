import React, { memo, useState, useEffect, useMemo } from 'react';
import { BedState, BedStatus, Preset, TreatmentStep } from '../types';
import { BedHeader } from './BedHeader';
import { BedContent } from './BedContent';
import { BedFooter } from './BedFooter';
import { BedEmptyState } from './BedEmptyState';
import { BedStatusBadges } from './BedStatusBadges';
import { getBedCardStyles } from '../utils/bedUtils';

interface BedCardProps {
  bed: BedState;
  presets: Preset[];
  onOpenSelector: (bedId: number) => void;
  onEdit: (bedId: number) => void;
  onNextStep: (bedId: number) => void;
  onJumpToStep?: (bedId: number, stepIndex: number) => void;
  onClear: (bedId: number) => void;
  onToggleInjection?: (bedId: number) => void;
  onToggleTraction?: (bedId: number) => void;
  onToggleESWT?: (bedId: number) => void;
  onToggleManual?: (bedId: number) => void;
  onUpdateSteps?: (bedId: number, steps: TreatmentStep[]) => void;
  onUpdateMemo?: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
  isCompact: boolean;
}

export const BedCard: React.FC<BedCardProps> = memo(({ 
  bed, 
  presets, 
  onOpenSelector, 
  onEdit, 
  onNextStep, 
  onJumpToStep, 
  onClear,
  onUpdateMemo,
  onUpdateDuration,
  isCompact
}) => {
  const currentPreset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
  const currentStep = currentPreset?.steps[bed.currentStepIndex];
  const steps = currentPreset?.steps || [];
  const queue = bed.queue || [];
  const isOvertime = bed.status === BedStatus.ACTIVE && currentStep?.enableTimer && bed.remainingTime <= 0;
  
  const [trashState, setTrashState] = useState<'idle' | 'confirm' | 'deleting'>('idle');

  useEffect(() => {
    if (bed.status === BedStatus.IDLE) {
      setTrashState('idle');
    }
  }, [bed.status]);

  const handleTrashClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trashState === 'idle') {
      setTrashState('confirm');
      setTimeout(() => setTrashState(prev => prev === 'confirm' ? 'idle' : prev), 3000);
    } else if (trashState === 'confirm') {
      setTrashState('deleting');
      setTimeout(() => onClear(bed.id), 500); 
    }
  };

  const containerClass = useMemo(() => getBedCardStyles(bed, isOvertime), [bed.status, bed.isInjection, bed.isESWT, bed.isTraction, bed.isManual, isOvertime]);

  return (
    <div className={containerClass}>
      <BedHeader 
        bed={bed} 
        currentStep={currentStep} 
        onTrashClick={handleTrashClick} 
        trashState={trashState}
        onEditClick={onEdit}
        onUpdateDuration={onUpdateDuration}
      />

      <div className="flex-1 flex flex-col w-full min-h-0 relative">
        <div className="flex-1 flex flex-row w-full min-h-0">
          {bed.status === BedStatus.IDLE ? (
            <BedEmptyState onOpenSelector={() => onOpenSelector(bed.id)} />
          ) : (
            <div 
              className="w-full h-full min-h-0"
              onDoubleClick={(e) => {
                // Trigger edit on double click for active beds
                onEdit(bed.id);
              }}
            >
              <BedContent 
                steps={steps}
                bed={bed}
                queue={queue}
                onJumpToStep={onJumpToStep}
                onUpdateMemo={onUpdateMemo}
              />
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <BedStatusBadges bed={bed} />
      </div>

      {bed.status !== BedStatus.IDLE && (
        <BedFooter 
          bed={bed} 
          steps={steps} 
          queue={queue} 
          onNext={onNextStep} 
          onClear={onClear} 
        />
      )}
    </div>
  );
});