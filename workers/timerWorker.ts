/// <reference lib="webworker" />
// Web Worker for handling precise timing off the main thread
/* eslint-disable no-restricted-globals */

interface TimerMessage {
  type: 'UPDATE_BEDS';
  beds: Array<{
    id: number;
    startTime: number | null;
    duration: number; // seconds
    isEnabled: boolean;
    presetId: string | null;
  }>;
}

interface WorkerState {
  beds: Map<number, { targetTime: number; alerted: boolean }>;
}

const state: WorkerState = {
  beds: new Map(),
};

self.onmessage = (e: MessageEvent<TimerMessage>) => {
  if (e.data.type === 'UPDATE_BEDS') {
    const currentIds = new Set<number>();

    e.data.beds.forEach((bed) => {
      if (bed.isEnabled && bed.startTime) {
        currentIds.add(bed.id);
        const targetTime = bed.startTime + (bed.duration * 1000);
        
        // Update logic
        if (!state.beds.has(bed.id) || state.beds.get(bed.id)?.targetTime !== targetTime) {
          state.beds.set(bed.id, { 
            targetTime, 
            alerted: false 
          });
        }
      }
    });

    // Cleanup
    for (const id of state.beds.keys()) {
      if (!currentIds.has(id)) {
        state.beds.delete(id);
      }
    }
  }
};

// Tick every second
setInterval(() => {
  const now = Date.now();
  
  state.beds.forEach((info, id) => {
    const remainingMs = info.targetTime - now;
    
    if (remainingMs <= 0 && !info.alerted) {
      info.alerted = true;
      self.postMessage({ type: 'ALARM', bedId: id });
    }
  });

  self.postMessage({ type: 'TICK' });

}, 1000);

export {};
