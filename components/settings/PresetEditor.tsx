import React, { useState } from 'react';
import { Save, Plus, Trash2, Clock, ArrowUp, ArrowDown, Minus, X } from 'lucide-react';
import { Preset, TreatmentStep } from '../../types';
import { STANDARD_TREATMENTS } from '../../constants';

interface PresetEditorProps {
  initialPreset: Preset;
  onSave: (preset: Preset) => void;
  onCancel: () => void;
}

export const PresetEditor: React.FC<PresetEditorProps> = ({ initialPreset, onSave, onCancel }) => {
  const [editingPreset, setEditingPreset] = useState<Preset>(initialPreset);

  const handleAddCustomStep = () => {
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: '새 치료',
      duration: 600,
      enableTimer: false,
      color: 'bg-gray-500'
    };
    setEditingPreset({
      ...editingPreset,
      steps: [...editingPreset.steps, newStep]
    });
  };

  const handleAddStandardStep = (template: typeof STANDARD_TREATMENTS[0]) => {
    const newStep: TreatmentStep = {
      id: crypto.randomUUID(),
      name: template.name,
      duration: template.duration * 60,
      enableTimer: template.enableTimer,
      color: template.color
    };
    setEditingPreset({
      ...editingPreset,
      steps: [...editingPreset.steps, newStep]
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<TreatmentStep>) => {
    setEditingPreset({
      ...editingPreset,
      steps: editingPreset.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    });
  };

  const handleRemoveStep = (stepId: string) => {
    setEditingPreset({
      ...editingPreset,
      steps: editingPreset.steps.filter(s => s.id !== stepId)
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-right-2">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {initialPreset.id ? '처방 수정' : '새 처방 추가'}
      </h3>
      
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">처방 이름</label>
        <input 
          type="text" 
          value={editingPreset.name}
          onChange={(e) => setEditingPreset({...editingPreset, name: e.target.value})}
          className="w-full p-2.5 border rounded-lg bg-white text-gray-900 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 font-bold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="처방 이름 (예: 기본)"
        />
      </div>
      
      <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto pr-1">
        {editingPreset.steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">단계 {idx + 1}</span>
              <button 
                onClick={() => handleRemoveStep(step.id)} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <input 
                className="w-full p-2 border rounded text-sm font-medium bg-white text-gray-900 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" 
                value={step.name} 
                onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                placeholder="치료명 입력"
              />
              
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">시간(분)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded text-sm bg-white text-gray-900 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    value={step.duration / 60}
                    onChange={(e) => handleUpdateStep(step.id, { duration: parseInt(e.target.value || '0') * 60 })}
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">색상 태그</label>
                   <select 
                      value={step.color}
                      onChange={(e) => handleUpdateStep(step.id, { color: e.target.value })}
                      className="w-full p-2 text-sm border rounded bg-white text-gray-900 border-gray-300 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all appearance-none"
                  >
                    <option value="bg-red-500">빨강 (Hot Pack/IR)</option>
                    <option value="bg-blue-500">파랑 (ICT)</option>
                    <option value="bg-purple-500">보라 (Magnetic)</option>
                    <option value="bg-green-500">초록 (Exercise)</option>
                    <option value="bg-orange-500">주황 (Traction)</option>
                    <option value="bg-gray-500">회색 (Other)</option>
                    <option value="bg-pink-500">분홍 (Laser)</option>
                    <option value="bg-cyan-500">청록 (Ice)</option>
                    <option value="bg-yellow-500">노랑 (MW)</option>
                    <option value="bg-sky-500">하늘 (Cryo)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center pt-1">
                  <label className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg border w-full transition-all ${step.enableTimer ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'bg-white border-gray-200 dark:bg-slate-700 dark:border-slate-600'}`}>
                    <input 
                      type="checkbox" 
                      checked={step.enableTimer}
                      onChange={(e) => handleUpdateStep(step.id, { enableTimer: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600"
                    />
                    <span className={`text-xs font-bold ${step.enableTimer ? 'text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-300'}`}>타이머 사용</span>
                    {step.enableTimer && <Clock className="w-3 h-3 text-brand-500 ml-auto" />}
                  </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">치료 추가 (빠른 선택)</span>
        <div className="grid grid-cols-3 gap-2">
          {STANDARD_TREATMENTS.map(item => (
              <button
                key={item.name}
                onClick={() => handleAddStandardStep(item)}
                className="px-2 py-2.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-brand-300 dark:hover:border-brand-500 transition-all truncate shadow-sm active:scale-95"
              >
                + {item.label}
              </button>
          ))}
          <button 
            onClick={handleAddCustomStep} 
            className="px-2 py-2.5 border border-dashed border-gray-300 dark:border-slate-500 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-gray-200 transition-all active:scale-95"
          >
            + 직접 입력
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
        <button onClick={() => onSave(editingPreset)} className="flex-1 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex justify-center items-center shadow-lg shadow-brand-200 dark:shadow-none font-bold text-sm transition-transform active:scale-98">
          <Save className="w-4 h-4 mr-2" /> 저장하기
        </button>
        <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 shadow-sm font-bold text-sm transition-transform active:scale-98 border border-gray-200 dark:border-slate-600">
          취소
        </button>
      </div>
    </div>
  );
};