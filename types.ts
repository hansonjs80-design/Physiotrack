export enum BedStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface TreatmentStep {
  id: string;
  name: string; // e.g., "Hot Pack", "ICT", "Magnetic"
  duration: number; // in seconds
  enableTimer: boolean; // Only true for Hot Pack based on requirements
  color: string; // visual cue for the step
}

export interface Preset {
  id: string;
  name: string; // e.g., "Basic"
  steps: TreatmentStep[];
}

export interface BedState {
  id: number;
  status: BedStatus;
  currentPresetId: string | null;
  customPreset?: Preset; // For one-off treatments like Traction with variable timer
  currentStepIndex: number;
  queue: number[]; // Array of step indices representing the execution order
  remainingTime: number; // in seconds
  startTime: number | null; // Timestamp
  originalDuration?: number; // Total duration of the current step (for sync)
  isPaused: boolean;
  isInjection: boolean; // Tracks if the patient is an injection patient
  isTraction: boolean; // Tracks if the patient needs traction
  isESWT: boolean; // Tracks if the patient needs Shockwave (ESWT)
  isManual: boolean; // Tracks if the patient needs Manual Therapy (Do-su)
  memos: Record<number, string>; // Map of step index to memo string
  lastUpdateTimestamp?: number; // Local-only: timestamp of last user action to debounce server echoes
}

export interface AppState {
  beds: BedState[];
  presets: Preset[];
  isMenuOpen: boolean;
  isDarkMode: boolean;
}