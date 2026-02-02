import React, { useEffect, useRef } from 'react';
import { BedState, Preset } from '../types';
import { calculateRemainingTime } from '../utils/bedLogic';
import { playAlarmPattern } from '../utils/alarm';

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
               // Only play if enabled
               if (isSoundEnabled) {
                 // Pass bed ID to trigger specific notification
                 playAlarmPattern(bed.id);
               } else {
                 // Fallback: simple short vibration if sound disabled (haptic feedback only)
                 if (typeof navigator !== 'undefined' && navigator.vibrate) {
                   navigator.vibrate([200]);
                 }
               }
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