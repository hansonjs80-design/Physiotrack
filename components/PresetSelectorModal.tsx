import React, { useState } from 'react';
import { X, Play, Syringe, Zap, ArrowUpFromLine, Hand } from 'lucide-react';
import { Preset } from '../types';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onSelect: (bedId: number, presetId: string, options: { isInjection: boolean, isTraction: boolean, isESWT: boolean, isManual: boolean }) => void;
  onStartTraction: (bedId: number, duration: number, options: { isInjection: boolean, isTraction: boolean, isESWT: boolean, isManual: boolean }) => void;
  targetBedId: number | null;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelect,
  onStartTraction,
  targetBedId
}) => {
  const [tractionDuration, setTractionDuration] = useState(15);
  
  // Selection States
  const [isInjection, setIsInjection] = useState(false);
  const [isTraction, setIsTraction] = useState(false);
  const [isESWT, setIsESWT] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setIsInjection(false);
      setIsTraction(false);
      setIsESWT(false);
      setIsManual(false);
    }
  }, [isOpen]);

  if (!isOpen || targetBedId === null) return null;

  const isTractionBed = targetBedId === 11;

  const getOptions = () => ({ isInjection, isTraction, isESWT, isManual });

  const handleTractionStart = () => {
    onStartTraction(targetBedId, tractionDuration, getOptions());
    onClose();
  };

  const handlePresetSelect = (presetId: string) => {
    onSelect(targetBedId, presetId, getOptions());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-96 max-h-[85vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
              {isTractionBed ? '견인 치료 설정' : '설정 중'}
            </span>
            <h3 className="font-black text-xl text-gray-800 dark:text-white">
              {targetBedId === 11 ? '견인기' : `BED ${targetBedId}`}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Toggle Buttons Grid - Now 2x2 for better layout with 4 items */}
        <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 grid grid-cols-4 gap-2">
           {/* Injection Toggle */}
           <button
              onClick={() => setIsInjection(!isInjection)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                isInjection 
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
              }`}
           >
              <Syringe className={`w-4 h-4 mb-1 ${isInjection ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-bold">주사</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isInjection ? 'bg-red-500' : 'bg-gray-300'}`} />
           </button>

           {/* Manual Therapy Toggle */}
           <button
              onClick={() => setIsManual(!isManual)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                isManual 
                  ? 'bg-violet-50 border-violet-200 text-violet-600 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
              }`}
           >
              <Hand className={`w-4 h-4 mb-1 ${isManual ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-bold">도수</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isManual ? 'bg-violet-500' : 'bg-gray-300'}`} />
           </button>

           {/* ESWT Toggle */}
           <button
              onClick={() => setIsESWT(!isESWT)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                isESWT
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
              }`}
           >
              <Zap className={`w-4 h-4 mb-1 ${isESWT ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-bold">충격파</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isESWT ? 'bg-blue-500' : 'bg-gray-300'}`} />
           </button>

           {/* Traction Toggle */}
           <button
              onClick={() => setIsTraction(!isTraction)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                isTraction
                  ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-500'
              }`}
           >
              <ArrowUpFromLine className={`w-4 h-4 mb-1 ${isTraction ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-bold">견인</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isTraction ? 'bg-orange-500' : 'bg-gray-300'}`} />
           </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {isTractionBed ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  시간 설정 (분)
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setTractionDuration(Math.max(1, tractionDuration - 1))}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <div className="w-24 text-center">
                    <span className="text-5xl font-black text-brand-600 dark:text-brand-400">
                      {tractionDuration}
                    </span>
                  </div>
                  <button 
                    onClick={() => setTractionDuration(tractionDuration + 1)}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 15, 20, 25, 30].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setTractionDuration(mins)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        tractionDuration === mins 
                        ? 'bg-brand-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {mins}분
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleTractionStart}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-brand-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                <Play className="w-6 h-6 fill-current" />
                치료 시작
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">처방을 선택하세요:</p>
              <div className="space-y-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-brand-50 hover:border-brand-200 dark:hover:bg-slate-600 dark:hover:border-slate-500 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-gray-800 dark:text-gray-100 text-lg group-hover:text-brand-700 dark:group-hover:text-brand-300">
                        {preset.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {preset.steps.map(s => s.name).join(' + ')}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900">
                      <span className="text-xl font-bold text-gray-400 group-hover:text-brand-600">+</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {!isTractionBed && (
          <div className="p-4 bg-gray-50 dark:bg-slate-900/50 text-center border-t border-gray-100 dark:border-slate-700">
             <button 
               onClick={onClose}
               className="text-sm text-gray-500 underline"
             >
               취소
             </button>
          </div>
        )}
      </div>
    </div>
  );
};