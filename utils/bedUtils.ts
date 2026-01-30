import { BedState, BedStatus, TreatmentStep, Preset } from '../types';

// --- Formatters ---

export const formatTime = (seconds: number): string => {
  const absSeconds = Math.abs(seconds);
  const m = Math.floor(absSeconds / 60);
  const s = absSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getAbbreviation = (name: string): string => {
  const upper = name.toUpperCase();
  if (upper.includes('HOT PACK') || upper.includes('핫팩')) return 'HP';
  if (upper.includes('ICT')) return 'ICT';
  if (upper.includes('MAGNETIC') || upper.includes('자기장')) return 'Mg';
  if (upper.includes('TRACTION') || upper.includes('견인')) return '견인';
  if (upper.includes('IR') || upper.includes('적외선')) return 'IR';
  if (upper.includes('TENS')) return 'TENS';
  if (upper.includes('LASER') || upper.includes('레이저')) return 'La';
  if (upper.includes('SHOCKWAVE') || upper.includes('충격파')) return 'ESWT';
  if (upper.includes('EXERCISE') || upper.includes('운동')) return '운동';
  if (upper.includes('ION') || upper.includes('이온')) return 'ION';
  if (upper.includes('COLD') || upper.includes('콜드') || upper.includes('ICE')) return 'Ice';
  if (upper.includes('MICRO') || upper.includes('마이크로') || upper.includes('MW')) return 'MW';
  if (upper.includes('CRYO') || upper.includes('크라이오')) return 'Cryo';
  
  if (name.includes('(')) return name.split('(')[0].trim().substring(0, 3);
  return name.substring(0, 3);
};

// --- Visual Logic ---

export const getStepColor = (
  step: TreatmentStep, 
  isActive: boolean, 
  isPast: boolean, 
  isInQueue: boolean, 
  isCompleted: boolean
): string => {
  if (isCompleted) {
    return 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 border-gray-400 dark:border-slate-500';
  }

  if (isPast) return 'bg-gray-600 dark:bg-slate-700 text-white dark:text-gray-300 border-gray-700 dark:border-slate-600';
  
  if (isActive) {
    if (step.color.includes('red')) return 'bg-red-500 text-white border-red-600';
    if (step.color.includes('blue')) return 'bg-blue-500 text-white border-blue-600';
    if (step.color.includes('purple')) return 'bg-purple-500 text-white border-purple-600';
    if (step.color.includes('orange')) return 'bg-orange-500 text-white border-orange-600';
    if (step.color.includes('green')) return 'bg-emerald-500 text-white border-emerald-600';
    if (step.color.includes('pink')) return 'bg-pink-500 text-white border-pink-600';
    if (step.color.includes('cyan')) return 'bg-cyan-500 text-white border-cyan-600';
    if (step.color.includes('sky')) return 'bg-sky-500 text-white border-sky-600';
    if (step.color.includes('yellow')) return 'bg-yellow-500 text-white border-yellow-600';
    return 'bg-gray-800 text-white border-gray-900';
  }

  if (isInQueue) {
     return 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
  }

  return 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700';
};

export const getBedCardStyles = (bed: BedState, isOvertime: boolean): string => {
  let base = "relative flex flex-col h-full rounded-lg shadow-md border overflow-hidden select-none transition-all duration-300 ";
  
  // Height classes: 
  // - Mobile portrait: 160px -> 144px (10% reduced)
  // - Tablet/Desktop Portrait: 200px
  // - Mobile landscape: 110px
  // - Tablet/Desktop Landscape (lg): 240px
  const heightClasses = "min-h-[144px] sm:min-h-[200px] landscape:min-h-[110px] sm:landscape:min-h-[110px] lg:landscape:min-h-[240px] ";

  let statusClasses = "";
  if (bed.status === BedStatus.COMPLETED) {
     statusClasses = "bg-gray-300 dark:bg-slate-700 border-gray-400 dark:border-slate-600 grayscale-[0.2]";
  } else if (isOvertime) {
     // Overtime: Red border + Ring (Outside)
     statusClasses = "bg-white dark:bg-slate-800 border-red-500 dark:border-red-500 border ring-2 ring-red-500 dark:ring-red-500 animate-pulse ";
  } else {
     statusClasses = "bg-white dark:bg-slate-800 ";
     if (bed.isInjection) statusClasses += 'border-red-400 dark:border-red-500 ring-2 ring-red-100 dark:ring-red-900/20';
     else if (bed.isESWT) statusClasses += 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/20';
     else if (bed.isManual) statusClasses += 'border-violet-400 dark:border-violet-500 ring-2 ring-violet-100 dark:ring-violet-900/20';
     else if (bed.isTraction) statusClasses += 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/20';
     else statusClasses += 'border-slate-400 dark:border-slate-500';
  }

  return base + heightClasses + statusClasses;
};

// --- Data Mapping (DB to Client) ---

export const mapRowToBed = (row: any): BedState => {
  // Zombie Guard: 
  // If a bed is marked ACTIVE but the start time is older than 12 hours, 
  // it is likely a 'zombie' state that wasn't cleared properly. Force it to IDLE.
  const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours
  let status = row.status as BedStatus;
  let startTime = row.start_time;

  if (status === BedStatus.ACTIVE && startTime && (Date.now() - startTime > MAX_AGE_MS)) {
    console.warn(`[BedUtils] Detected zombie state for Bed ${row.id}. Force clearing.`);
    status = BedStatus.IDLE;
    startTime = null;
  }

  return {
    id: row.id,
    status: status,
    currentPresetId: row.current_preset_id,
    customPreset: row.custom_preset_json,
    currentStepIndex: row.current_step_index,
    queue: row.queue || [],
    remainingTime: 0, // Calculated by Timer Hook
    startTime: startTime,
    isPaused: row.is_paused,
    originalDuration: row.original_duration,
    isInjection: row.is_injection || false,
    isTraction: row.is_traction || false,
    isESWT: row.is_eswt || false,
    isManual: row.is_manual || false,
    memos: row.memos || {}
  };
};

// --- Logic Helpers ---

export const calculateRemainingTime = (bed: BedState, presets: Preset[]): number => {
  if (bed.status !== BedStatus.ACTIVE || !bed.startTime || bed.isPaused) {
    return bed.remainingTime; // Keep existing if not running
  }

  const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
  const step = preset?.steps[bed.currentStepIndex];

  if (step?.enableTimer) {
    const duration = bed.originalDuration || step.duration;
    const elapsed = Math.floor((Date.now() - bed.startTime) / 1000);
    // Return signed integer: positive = remaining, negative = overtime
    return duration - elapsed;
  }
  
  return 0;
};