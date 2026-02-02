
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
  // 기본 테두리를 검정색(border-black)으로 설정하고 두께를 border-[1.5px]로 조정 (기존 border-2에서 감소)
  let base = "relative flex flex-col h-full rounded-lg shadow-md border-[1.5px] border-black dark:border-slate-200 overflow-hidden select-none transition-all duration-300 ";
  
  // landscape:min-h-[132px] -> 118px (reduced by ~10%)
  const heightClasses = "min-h-[144px] sm:min-h-[200px] landscape:min-h-[118px] sm:landscape:min-h-[118px] lg:landscape:min-h-[216px] ";

  // Bed T (ID: 11) 만의 고유 테마 설정
  const isBedT = bed.id === 11;

  let statusClasses = "";
  if (bed.status === BedStatus.COMPLETED) {
     statusClasses = "bg-gray-300 dark:bg-slate-700 grayscale-[0.2]";
  } else if (isOvertime) {
     // 초과 상태일 때만 테두리를 빨간색으로 변경하여 시각적 경고 제공
     statusClasses = "bg-white dark:bg-slate-800 border-red-500 dark:border-red-500 ring-2 ring-red-500 dark:ring-red-500 animate-pulse ";
  } else {
     // Bed T: 기존 Amber에서 Blue 계열로 변경 (연한 파랑 배경)
     if (isBedT) {
        statusClasses = "bg-blue-50/60 dark:bg-blue-900/10 ring-1 ring-blue-200/50 dark:ring-blue-900/30 ";
     } else {
        statusClasses = "bg-white dark:bg-slate-800 ";
     }
     
     // 상태 뱃지/플래그에 따른 추가 강조 (테두리 색상은 검정 유지하며 링 효과로 구분)
     if (bed.isInjection) statusClasses += 'ring-2 ring-red-100 dark:ring-red-900/20';
     else if (bed.isESWT) statusClasses += 'ring-2 ring-blue-100 dark:ring-blue-900/20';
     else if (bed.isManual) statusClasses += 'ring-2 ring-violet-100 dark:ring-violet-900/20';
     else if (bed.isTraction && !isBedT) statusClasses += 'ring-2 ring-orange-100 dark:ring-orange-900/20';
  }

  return base + heightClasses + statusClasses;
};

// --- Data Mapping & Logic ---

// DB Row -> Partial BedState
export const mapRowToBed = (row: any): Partial<BedState> => {
  const MAX_AGE_MS = 12 * 60 * 60 * 1000;
  let status = row.status as BedStatus | undefined;
  let startTime = row.start_time;

  if (status === BedStatus.ACTIVE && startTime && (Date.now() - startTime > MAX_AGE_MS)) {
    status = BedStatus.IDLE;
    startTime = null;
  }

  const result: any = { id: row.id };
  if (status !== undefined) result.status = status;
  if (row.current_preset_id !== undefined) result.currentPresetId = row.current_preset_id;
  if (row.custom_preset_json !== undefined) result.customPreset = row.custom_preset_json;
  if (row.current_step_index !== undefined) result.currentStepIndex = row.current_step_index;
  if (row.queue !== undefined) result.queue = row.queue || [];
  if (startTime !== undefined) result.startTime = startTime;
  if (row.is_paused !== undefined) result.isPaused = row.is_paused;
  if (row.original_duration !== undefined) result.originalDuration = row.original_duration;
  if (row.is_injection !== undefined) result.isInjection = !!row.is_injection;
  if (row.is_traction !== undefined) result.isTraction = !!row.is_traction;
  if (row.is_eswt !== undefined) result.isESWT = !!row.is_eswt;
  if (row.is_manual !== undefined) result.isManual = !!row.is_manual;
  if (row.memos !== undefined) result.memos = row.memos || {};
  if (row.updated_at !== undefined) result.updatedAt = row.updated_at;

  return result;
};

// Partial BedState -> Partial DB Row
export const mapBedToDbPayload = (updates: Partial<BedState>): any => {
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.currentPresetId !== undefined) payload.current_preset_id = updates.currentPresetId;
  if (updates.currentStepIndex !== undefined) payload.current_step_index = updates.currentStepIndex;
  if (updates.queue !== undefined) payload.queue = updates.queue;
  if (updates.startTime !== undefined) payload.start_time = updates.startTime;
  if (updates.isPaused !== undefined) payload.is_paused = updates.isPaused;
  if (updates.isInjection !== undefined) payload.is_injection = updates.isInjection;
  if (updates.isTraction !== undefined) payload.is_traction = updates.isTraction;
  if (updates.isESWT !== undefined) payload.is_eswt = updates.isESWT;
  if (updates.isManual !== undefined) payload.is_manual = updates.isManual;
  if (updates.memos !== undefined) payload.memos = updates.memos;
  if (updates.customPreset !== undefined) payload.custom_preset_json = updates.customPreset;
  if (updates.originalDuration !== undefined) payload.original_duration = updates.originalDuration;

  payload.updated_at = new Date().toISOString();
  return payload;
};

export const shouldIgnoreServerUpdate = (localBed: BedState, serverBed: Partial<BedState>): boolean => {
  if (!localBed.lastUpdateTimestamp) return false;
  const serverUpdateTime = serverBed.updatedAt ? new Date(serverBed.updatedAt).getTime() : 0;
  return localBed.lastUpdateTimestamp > serverUpdateTime;
};

export const calculateRemainingTime = (bed: BedState, presets: Preset[]): number => {
  if (bed.status !== BedStatus.ACTIVE || !bed.startTime || bed.isPaused) return bed.remainingTime;
  const preset = bed.customPreset || presets.find(p => p.id === bed.currentPresetId);
  const step = preset?.steps[bed.currentStepIndex];
  if (step?.enableTimer) {
    const duration = bed.originalDuration || step.duration;
    const elapsed = Math.floor((Date.now() - bed.startTime) / 1000);
    return duration - elapsed;
  }
  return 0;
};
