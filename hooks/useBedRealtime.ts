import React, { useState, useEffect } from 'react';
import { BedState, BedStatus } from '../types';
import { supabase, isOnlineMode } from '../lib/supabase';
import { TOTAL_BEDS } from '../constants';
import { mapRowToBed } from '../utils/bedUtils';

export const useBedRealtime = (
  setBeds: React.Dispatch<React.SetStateAction<BedState[]>>,
  setLocalBeds: (value: BedState[] | ((val: BedState[]) => BedState[])) => void
) => {
  const [realtimeStatus, setRealtimeStatus] = useState<'OFFLINE' | 'CONNECTING' | 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'CLOSED'>('OFFLINE');

  useEffect(() => {
    if (!isOnlineMode() || !supabase) {
      setRealtimeStatus('OFFLINE');
      return;
    }

    setRealtimeStatus('CONNECTING');

    const fetchBeds = async () => {
      const { data, error } = await supabase
        .from('beds')
        .select('*')
        .order('id');

      if (!error && data) {
        const mappedBeds: BedState[] = data.map(mapRowToBed);

        // Initialize if empty
        if (mappedBeds.length === 0) {
          const initialBeds = Array.from({ length: TOTAL_BEDS }, (_, i) => ({
            id: i + 1,
            status: BedStatus.IDLE,
            current_step_index: 0,
            queue: [],
            is_paused: false,
            is_injection: false,
            is_traction: false,
            is_eswt: false
          }));
          await supabase.from('beds').insert(initialBeds);
        } else {
          setBeds((currentBeds) => {
             // Merge strategy: If local bed has a recent pending update (timestamp), prefer local.
             // Otherwise, take server.
             return mappedBeds.map(serverBed => {
                const localBed = currentBeds.find(b => b.id === serverBed.id);
                // If local bed was updated < 5 seconds ago, assume it's newer/pending than the fetch result
                if (localBed?.lastUpdateTimestamp && Date.now() - localBed.lastUpdateTimestamp < 5000) {
                   return localBed;
                }
                return serverBed;
             });
          });
          // Note: We don't blindly call setLocalBeds(mappedBeds) here to avoid reverting local storage 
          // if we just made a change. We let the setBeds flow update it via useBedManager's effect.
        }
      }
    };

    fetchBeds();

    // Subscribe to Realtime Changes
    const channel = supabase
      .channel('public:beds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, (payload) => {
        const newRow = payload.new as any;
        
        setBeds((prev) => {
          const updatedBeds = prev.map((bed) => {
            if (bed.id === newRow.id) {
              // --- STALE UPDATE PREVENTION ---
              // If we updated this bed locally within the last 5 seconds (e.g. Cleared it),
              // ignore this incoming event as it is likely an "echo" of the old state 
              // or the server acknowledging a previous state before processing the clear.
              // Increased from 2000ms to 5000ms to handle slower network/database roundtrips.
              if (bed.lastUpdateTimestamp && Date.now() - bed.lastUpdateTimestamp < 5000) {
                 // console.log(`Ignoring stale update for Bed ${bed.id}`);
                 return bed;
              }

              // Merge realtime data with current state, preserving remainingTime handled by interval
              const updated = mapRowToBed(newRow);
              return {
                ...updated,
                remainingTime: bed.remainingTime, // Keep local countdown continuity
              };
            }
            return bed;
          });
          
          // Sync to local storage as well so we don't lose server updates on reload
          setLocalBeds(updatedBeds);
          return updatedBeds;
        });
      })
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status === 'SUBSCRIBED') {
          // Do NOT fetchBeds() here again blindly if we already have state.
          // Or if we do, we risk overwriting recent optimistic updates.
          // But we need to fetch initial state.
          // The fetchBeds above is async and independent. 
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setBeds, setLocalBeds]);

  return { realtimeStatus };
};