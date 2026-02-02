import React from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { useTreatmentContext } from '../contexts/TreatmentContext';
import { playAlarmPattern } from '../utils/bedUtils';

export const SettingsPreferencesTab: React.FC = () => {
  const { isSoundEnabled, toggleSound } = useTreatmentContext();

  const handleTestSound = () => {
    playAlarmPattern();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">알림 설정</span>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">치료 종료 알림음</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              타이머 종료 시 "삐-삐-삐" 반복음과 진동이 울립니다.
            </span>
          </div>
          
          <button 
            onClick={toggleSound}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              isSoundEnabled ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
           <button 
             onClick={handleTestSound}
             className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:bg-brand-50 dark:hover:bg-brand-900/30 px-3 py-1.5 rounded-lg transition-colors"
           >
             <Play className="w-3 h-3 fill-current" />
             소리 테스트
           </button>
        </div>
      </div>
      
      <div className="px-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          * iOS/Android 모바일 기기에서는 무음 모드가 해제되어 있어야 소리가 들립니다.<br/>
          * 진동은 기기 설정 및 브라우저 권한에 따라 작동하지 않을 수 있습니다.
        </p>
      </div>
    </div>
  );
};