
import React, { useState, useEffect } from 'react';
import { X, Play, ChevronLeft } from 'lucide-react';
import { Preset, TreatmentStep } from '../types';
import { STANDARD_TREATMENTS } from '../constants';
import { OptionToggles } from './preset-selector/OptionToggles';
import { PresetListView } from './preset-selector/PresetListView';
import { QuickStartGrid } from './preset-selector/QuickStartGrid';
import { TreatmentPreview } from './preset-selector/TreatmentPreview';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: Preset[];
  onSelect: (bedId: number, presetId: string, options: any) => void;
  onCustomStart: (bedId: number, name: string, steps: TreatmentStep[], options: any) => void;
  onQuickStart: (bedId: number, template: typeof STANDARD_TREATMENTS[0], options: any) => void;
  onStartTraction: (bedId: number, duration: number, options: any) => void;
  targetBedId: number | null;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelect,
  onCustomStart,
  onQuickStart,
  onStartTraction,
  targetBedId
}) => {
  const [tractionDuration, setTractionDuration] = useState(15);
  const [previewPreset, setPreviewPreset] = useState<Preset | null>(null);
  const [options, setOptions] = useState({
    isInjection: false,
    isManual: false,
    isESWT: false,
    isTraction: false,
    isFluid: false
  });

  useEffect(() => {
    if (isOpen) {
      setOptions({ isInjection: false, isManual: false, isESWT: false, isTraction: false, isFluid: false });
      setPreviewPreset(null);
    }
  }, [isOpen]);

  if (!isOpen || targetBedId === null) return null;

  const isTractionBed = targetBedId === 11;

  const handleTractionStart = () => {
    onStartTraction(targetBedId, tractionDuration, options);
    onClose();
  };

  const handleConfirmStart = () => {
    if (previewPreset) {
      onCustomStart(targetBedId, previewPreset.name, previewPreset.steps, options);
      onClose();
    }
  };

  // 단일 항목 클릭 시 미리보기 모드로 진입 (조합 가능하게 변경)
  const handleQuickItemClick = (template: typeof STANDARD_TREATMENTS[0]) => {
    const initialStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };

    setPreviewPreset({
      id: `temp-${Date.now()}`,
      name: template.name, // 첫 번째 선택한 항목의 이름을 기본으로 사용
      steps: [initialStep]
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:w-96 max-h-[90vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            {previewPreset && (
              <button 
                onClick={() => setPreviewPreset(null)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors mr-1"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">
                {previewPreset ? '치료 구성 확인' : (isTractionBed ? '견인 치료 설정' : '설정 및 시작')}
              </span>
              <h3 className="font-black text-xl text-gray-800 dark:text-white leading-none">
                {targetBedId === 11 ? '견인기' : `BED ${targetBedId}`}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <OptionToggles options={options} setOptions={setOptions} />

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {previewPreset ? (
             <TreatmentPreview 
               preset={previewPreset} 
               setPreset={setPreviewPreset} 
               onConfirm={handleConfirmStart} 
             />
          ) : isTractionBed ? (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col items-center gap-2">
                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">시간 설정 (분)</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setTractionDuration(Math.max(1, tractionDuration - 1))} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold">-</button>
                  <div className="w-24 text-center"><span className="text-5xl font-black text-brand-600 dark:text-brand-400">{tractionDuration}</span></div>
                  <button onClick={() => setTractionDuration(tractionDuration + 1)} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl font-bold">+</button>
                </div>
              </div>
              <button onClick={handleTractionStart} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><Play className="w-6 h-6 fill-current" /> 치료 시작</button>
            </div>
          ) : (
            <>
              <PresetListView 
                presets={presets} 
                onSelect={(p) => setPreviewPreset(JSON.parse(JSON.stringify(p)))} 
              />
              <QuickStartGrid 
                onQuickStart={handleQuickItemClick} 
              />
            </>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 text-center border-t border-gray-100 dark:border-slate-700 shrink-0 pb-6 sm:pb-4">
           <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">취소 (Cancel)</button>
        </div>
      </div>
    </div>
  );
};