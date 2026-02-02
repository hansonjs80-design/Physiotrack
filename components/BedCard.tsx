
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
  onTogglePause: (bedId: number) => void;
  onJumpToStep?: (bedId: number, stepIndex: number) => void;
  onClear: (bedId: number) => void;
  onUpdateMemo?: (bedId: number, stepIndex: number, memo: string | null) => void;
  onUpdateDuration?: (bedId: number, duration: number) => void;
  isCompact: boolean;
}

// 성능 최적화: 타이머 업데이트 시 해당 BedCard만 갱신되도록 memo 적용
export const BedCard: React.FC<BedCardProps> = memo(({ 
  bed, 
  presets, 
  onOpenSelector, 
  onEdit, 
  onNextStep, 
  onTogglePause,
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
      requestAnimationFrame(() => {
        onClear(bed.id);
      });
    }
  };

  const containerClass = useMemo(() => getBedCardStyles(bed, isOvertime), [
    bed.status, bed.isInjection, bed.isESWT, bed.isTraction, bed.isManual, isOvertime
  ]);

  return (
    <div className={`${containerClass} transform transition-transform duration-200 active:scale-[0.99]`}>
      <BedHeader 
        bed={bed} 
        currentStep={currentStep} 
        onTrashClick={handleTrashClick} 
        trashState={trashState}
        onEditClick={onEdit}
        onTogglePause={onTogglePause}
        onUpdateDuration={onUpdateDuration}
      />

      <div className="flex-1 flex flex-col w-full min-h-0 relative bg-white/40 dark:bg-slate-800/20 backdrop-blur-xs">
        <div className="flex-1 flex flex-row w-full min-h-0">
          {bed.status === BedStatus.IDLE ? (
            <BedEmptyState onOpenSelector={() => onOpenSelector(bed.id)} />
          ) : (
            <div 
              className="w-full h-full min-h-0"
              onDoubleClick={(e) => onEdit(bed.id)}
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
}, (prevProps, nextProps) => {
  // 타이머나 침상 상태가 바뀔 때만 리렌더링
  return (
    prevProps.bed.remainingTime === nextProps.bed.remainingTime &&
    prevProps.bed.status === nextProps.bed.status &&
    prevProps.bed.currentStepIndex === nextProps.bed.currentStepIndex &&
    prevProps.bed.isPaused === nextProps.bed.isPaused &&
    prevProps.bed.isInjection === nextProps.bed.isInjection &&
    prevProps.bed.isManual === nextProps.bed.isManual &&
    prevProps.bed.isESWT === nextProps.bed.isESWT &&
    prevProps.bed.isTraction === nextProps.bed.isTraction &&
    prevProps.isCompact === nextProps.isCompact
  );
});
