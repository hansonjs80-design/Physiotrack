import React, { useEffect, useRef } from 'react';
import { BedState, Preset } from '../types';
import { calculateRemainingTime } from '../utils/bedLogic';
import { playAlarmPattern } from '../utils/alarm';
import { getAbbreviation } from '../utils/bedUtils';

export const useBedTimer = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  presets: Preset[],
  isSoundEnabled: boolean
) => {
  const prevRemainingTimes = useRef<{ [key: number]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setBeds((currentBeds) => {
        let hasChanges = false;

        const newBeds = currentBeds.map((bed) => {
          const newRemaining = calculateRemainingTime(bed, presets);
          
          if (newRemaining !== bed.remainingTime) {
            hasChanges = true;

            const prevRemaining = prevRemainingTimes.current[bed.id];

            // Trigger alarm when timer hits zero exactly or crosses into negative
            // Ensure we only trigger ONCE per transition
            if ((prevRemaining > 0 && newRemaining <= 0) || (prevRemaining === undefined && newRemaining === 0)) {
               // Prepare notification data
               const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
               const currentStep = preset?.steps[bed.currentStepIndex];
               const stepName = currentStep ? getAbbreviation(currentStep.name) : '';

               // Pass bed ID and Step Name. 
               // The 3rd argument is 'isSilent'. 
               // If isSoundEnabled is true, isSilent is false (Play Sound).
               // If isSoundEnabled is false, isSilent is true (Silent Notification).
               playAlarmPattern(bed.id, stepName, !isSoundEnabled);
            }
            
            prevRemainingTimes.current[bed.id] = newRemaining;
            return { ...bed, remainingTime: newRemaining };
          }
          
          return bed;
        });

        return hasChanges ? newBeds : currentBeds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [presets, setBeds, isSoundEnabled]);
};