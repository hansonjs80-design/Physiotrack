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
  onPrevStep?: (bedId: number) => void;
  onTogglePause: (bedId: number) => void;
  onSwapSteps?: (bedId: number, idx1: number, idx2: number) => void;
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
  onPrevStep,
  onTogglePause,
  onSwapSteps,
  onClear,
  onUpdateMemo,
  onUpdateDuration,
  isCompact
}) => {
  const currentPreset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
  const currentStep = currentPreset?.steps[bed.currentStepIndex];
  const steps = currentPreset?.steps || [];
  // Fix: Ensure strict boolean result for isOvertime to avoid TypeScript errors
  const isOvertime = bed.status === BedStatus.ACTIVE && !!currentStep?.enableTimer && bed.remainingTime <= 0;
  
  const [trashState, setTrashState] = useState<'idle' | 'confirm' | 'deleting'>('idle');
  const [swapSourceIndex, setSwapSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (bed.status === BedStatus.IDLE) {
      setTrashState('idle');
      setSwapSourceIndex(null);
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

  const handleSwapRequest = (bedId: number, idx: number) => {
    if (!onSwapSteps) return;

    if (swapSourceIndex === null) {
      // First click: Select source
      setSwapSourceIndex(idx);
    } else {
      // Second click: Execute swap or cancel if same
      if (swapSourceIndex !== idx) {
        onSwapSteps(bedId, swapSourceIndex, idx);
      }
      setSwapSourceIndex(null);
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

      {/* Main Content Area */}
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
                queue={[]} // Queue visual removed
                onSwapRequest={handleSwapRequest}
                swapSourceIndex={swapSourceIndex}
                onUpdateMemo={onUpdateMemo}
              />
            </div>
          )}
        </div>

        {/* Status badges overlay at bottom-right */}
        <BedStatusBadges bed={bed} />
      </div>

      {bed.status !== BedStatus.IDLE && (
        <BedFooter 
          bed={bed} 
          steps={steps} 
          onNext={onNextStep} 
          onPrev={onPrevStep}
          onClear={onClear} 
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.bed.remainingTime === nextProps.bed.remainingTime &&
    prevProps.bed.status === nextProps.bed.status &&
    prevProps.bed.currentStepIndex === nextProps.bed.currentStepIndex &&
    prevProps.bed.isPaused === nextProps.bed.isPaused &&
    prevProps.bed.isInjection === nextProps.bed.isInjection &&
    prevProps.bed.isManual === nextProps.bed.isManual &&
    prevProps.bed.isESWT === nextProps.bed.isESWT &&
    prevProps.bed.isTraction === nextProps.bed.isTraction &&
    prevProps.bed.customPreset === nextProps.bed.customPreset && 
    prevProps.isCompact === nextProps.isCompact
    // Note: swapSourceIndex is local state, so not checked here, but strict equality of bed might need attention if customPreset changes deeply.
    // Ideally we should include customPreset comparison or rely on bed reference change.
  );
});