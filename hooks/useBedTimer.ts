// Import React to provide access to the React namespace for type definitions like React.Dispatch and React.SetStateAction
import React, { useEffect, useRef } from 'react';
import { BedState, Preset } from '../types';
import { calculateRemainingTime } from '../utils/bedUtils';

export const useBedTimer = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  presets: Preset[]
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

            // Trigger haptic feedback when timer hits zero or crosses into negative (overtime)
            // Ensure we only trigger once when it completes
            if ((prevRemaining > 0 && newRemaining <= 0) || (prevRemaining === undefined && newRemaining === 0)) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([500, 200, 500]);
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
  }, [presets, setBeds]);
};