import React, { useState } from 'react';
import { Database, Wifi, RefreshCw, Link, AlertTriangle, Check, Copy, RotateCcw, X } from 'lucide-react';
import { isOnlineMode, testSupabaseConnection, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';
import { SUPABASE_INIT_SQL } from '../constants';

const DEFAULT_SB_URL = 'https://ebiirfwjucfhdrpinykr.supabase.co';
const DEFAULT_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaWlyZndqdWNmaGRycGlueWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTg1ODQsImV4cCI6MjA4NTI5NDU4NH0.gEj7gIdfsNCo71WYj1qDGkfCizAcpLEfLS2dVyqcZf4';

interface SettingsDatabaseTabProps {
  onResetAllBeds: () => void;
  onClosePanel: () => void;
}

export const SettingsDatabaseTab: React.FC<SettingsDatabaseTabProps> = ({ onResetAllBeds, onClosePanel }) => {
  const [sbUrl, setSbUrl] = useState(window.localStorage.getItem('sb_url') || DEFAULT_SB_URL);
  const [sbKey, setSbKey] = useState(window.localStorage.getItem('sb_key') || DEFAULT_SB_KEY);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  // Confirmation States
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  
  const isConnected = isOnlineMode();

  const handleTestConnection = async () => {
    setTestStatus('testing');
    const success = await testSupabaseConnection(sbUrl, sbKey);
    setTestStatus(success ? 'success' : 'error');
  };

  const handleSaveConfig = () => {
    if (sbUrl && sbKey) {
      setShowSaveConfirm(true);
    } else {
      alert('URL과 Key를 모두 입력해주세요.');
    }
  };

  const executeSaveConfig = () => {
    saveSupabaseConfig(sbUrl, sbKey);
    setShowSaveConfirm(false);
  };

  const handleClearConfig = () => {
    setShowClearConfirm(true);
  };

  const executeClearConfig = () => {
    clearSupabaseConfig();
    setShowClearConfirm(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_INIT_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeResetAll = () => {
    onResetAllBeds();
    onClosePanel();
    setShowResetAllConfirm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200 pb-20 sm:pb-4">
      {/* Database Configuration */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2 dark:text-white">
            <Database className="w-4 h-4" />
            Supabase 연동
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {isConnected ? '온라인 (Online)' : '오프라인 (Local)'}
          </span>
        </div>

        {/* Config Inputs */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Supabase Project URL</label>
            <input 
              type="text" 
              value={sbUrl}
              onChange={e => setSbUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full p-2 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Supabase Anon Key</label>
            <input 
              type="password" 
              value={sbKey}
              onChange={e => setSbKey(e.target.value)}
              placeholder="your-anon-key"
              className="w-full p-2 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          
          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing' || !sbUrl || !sbKey}
                className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-xs py-2 rounded font-bold flex items-center justify-center gap-1 shadow-sm transition-colors border border-gray-200 dark:border-slate-600"
            >
                {testStatus === 'testing' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )}
                연결 테스트
            </button>
            {testStatus === 'success' && <span className="text-green-600 text-[10px] font-bold">성공!</span>}
            {testStatus === 'error' && <span className="text-red-600 text-[10px] font-bold">실패</span>}
          </div>

          <div className="flex flex-col gap-2 pt-1 border-t border-gray-200 dark:border-slate-700 mt-2">
             {/* Save Button & Confirmation */}
             {!showSaveConfirm ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveConfig}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Link className="w-3 h-3" /> 
                    {isConnected ? '설정 저장 (LocalStorage)' : '저장 및 연결'}
                  </button>
                  <button 
                    onClick={handleClearConfig}
                    className="px-3 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded font-bold shadow-sm"
                    title="저장된 설정을 지우고 기본값으로 복귀"
                  >
                    기본값 복원
                  </button>
                </div>
             ) : (
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                   <p className="text-[10px] text-center font-bold text-gray-600 dark:text-gray-300">설정을 저장하고 페이지를 새로고침 할까요?</p>
                   <div className="flex gap-2">
                      <button onClick={executeSaveConfig} className="flex-1 bg-brand-600 text-white text-xs py-1.5 rounded font-bold hover:bg-brand-700">예, 저장합니다</button>
                      <button onClick={() => setShowSaveConfirm(false)} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 rounded font-bold hover:bg-gray-400">취소</button>
                   </div>
                </div>
             )}

             {/* Clear Config Confirmation */}
             {showClearConfirm && (
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 border border-red-100 dark:border-red-900/50">
                   <p className="text-[10px] text-center font-bold text-red-600 dark:text-red-300">연동 설정을 모두 지우고 기본값으로 복구합니까?</p>
                   <div className="flex gap-2">
                      <button onClick={executeClearConfig} className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded font-bold hover:bg-red-700">초기화 진행</button>
                      <button onClick={() => setShowClearConfirm(false)} className="flex-1 bg-gray-300 text-gray-700 text-xs py-1.5 rounded font-bold hover:bg-gray-400">취소</button>
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* SQL Generator */}
        {!showSql ? (
          <button 
            onClick={() => setShowSql(true)}
            className="w-full text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded font-bold transition-colors border border-indigo-200"
          >
            + 데이터베이스 초기화 코드 보기 (SQL)
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-indigo-50 dark:bg-slate-800 rounded border border-indigo-100 dark:border-slate-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-indigo-800 dark:text-indigo-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Supabase SQL Editor에 실행
              </span>
              <button onClick={handleCopySql} className="text-xs flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-indigo-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm active:scale-95 transition-transform">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? '복사됨' : '코드 복사'}
              </button>
            </div>
            <pre className="bg-slate-800 text-slate-200 p-2.5 rounded text-[10px] overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto border border-slate-700">
              {SUPABASE_INIT_SQL}
            </pre>
            <button 
              onClick={() => setShowSql(false)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline w-full text-center"
            >
              닫기
            </button>
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">긴급 조치</h3>
        {!showResetAllConfirm ? (
          <button 
            onClick={() => setShowResetAllConfirm(true)}
            className="flex items-center justify-center w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            모든 배드 초기화
          </button>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-sm border border-red-100 dark:border-red-900 animate-in fade-in zoom-in-95 duration-200">
             <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 text-center">
                정말 모든 배드의 치료 기록을<br/>초기화하시겠습니까? (복구 불가)
             </p>
             <div className="flex gap-2">
                <button onClick={executeResetAll} className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 shadow-sm">네, 초기화합니다</button>
                <button onClick={() => setShowResetAllConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300">취소</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};