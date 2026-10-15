/**
 * Nusantara App Builder - Bottom Diagnostics & Terminal Panels
 * Phase 4: Problems, Output, Build, and Interactive Sandboxed Terminal.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  X,
  FileCode,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { BottomPanelTab, EditorProblem } from '../types';

export const BottomPanels: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const {
    activeBottomPanel,
    setActiveBottomPanel,
    bottomPanelHeight,
    setBottomPanelHeight,
    problems,
    problemFilter,
    setProblemFilter,
    outputLogs,
    clearOutputLogs,
    activeTerminalTask,
    terminalTasks,
    runTerminalCommand,
    cancelRunningTerminal,
    clearTerminal,
    openFile,
  } = useEditorStore();

  const [terminalInput, setTerminalInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalLogsEndRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Auto-scroll terminal output
  useEffect(() => {
    if (activeBottomPanel === 'terminal') {
      terminalLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputLogs, activeTerminalTask, activeBottomPanel]);

  if (!activeBottomPanel) return null;

  const handleMouseDownResize = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = bottomPanelHeight;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - ev.clientY;
      setBottomPanelHeight(startHeightRef.current + deltaY);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    runTerminalCommand(terminalInput.trim());
    setTerminalInput('');
    setHistoryIndex(-1);
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = useEditorStore.getState().terminalHistory;
    if (history.length === 0) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setTerminalInput(history[history.length - 1 - nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setTerminalInput(history[history.length - 1 - nextIdx]);
      } else {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  const handleProblemClick = (problem: EditorProblem) => {
    openFile(problem.filePath);
  };

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;
  const infoCount = problems.filter((p) => p.severity === 'info').length;

  const filteredProblems = problems.filter((p) => {
    if (problemFilter === 'error') return p.severity === 'error';
    if (problemFilter === 'warning') return p.severity === 'warning';
    return true;
  });

  return (
    <div
      style={{ height: `${bottomPanelHeight}px` }}
      className="border-t border-neutral-800 bg-neutral-950 flex flex-col shrink-0 select-none relative z-20"
    >
      {/* Resizing Handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="h-1 w-full bg-neutral-800/80 hover:bg-blue-500 cursor-row-resize absolute -top-0.5 left-0 z-30 transition-colors"
      />

      {/* Panel Tab Header */}
      <div className="h-8 bg-neutral-900 border-b border-neutral-800 px-3 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-1">
          {/* Problems Tab */}
          <button
            onClick={() => setActiveBottomPanel('problems')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
              activeBottomPanel === 'problems'
                ? 'bg-neutral-800 text-blue-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{isIndo ? 'Masalah' : 'Problems'}</span>
            <span className="flex items-center gap-1 text-[10px]">
              {errorCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-900/60 text-red-400 rounded-full font-bold">
                  {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-900/60 text-amber-400 rounded-full">
                  {warningCount}
                </span>
              )}
            </span>
          </button>

          {/* Output Tab */}
          <button
            onClick={() => setActiveBottomPanel('output')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeBottomPanel === 'output'
                ? 'bg-neutral-800 text-blue-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isIndo ? 'Keluaran (Output)' : 'Output'}
          </button>

          {/* Build Tab */}
          <button
            onClick={() => setActiveBottomPanel('build')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeBottomPanel === 'build'
                ? 'bg-neutral-800 text-blue-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Build
          </button>

          {/* Terminal Tab */}
          <button
            onClick={() => setActiveBottomPanel('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
              activeBottomPanel === 'terminal'
                ? 'bg-neutral-800 text-blue-400 font-medium'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
            {activeTerminalTask && activeTerminalTask.status === 'running' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Right actions & close */}
        <div className="flex items-center gap-2">
          {activeBottomPanel === 'problems' && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <button
                onClick={() => setProblemFilter('all')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  problemFilter === 'all' ? 'bg-neutral-800 text-neutral-100 font-medium' : 'hover:text-neutral-200'
                }`}
              >
                {isIndo ? 'Semua' : 'All'} ({problems.length})
              </button>
              <button
                onClick={() => setProblemFilter('error')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  problemFilter === 'error' ? 'bg-neutral-800 text-red-400 font-medium' : 'hover:text-neutral-200'
                }`}
              >
                {isIndo ? 'Kesalahan' : 'Errors'} ({errorCount})
              </button>
              <button
                onClick={() => setProblemFilter('warning')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  problemFilter === 'warning' ? 'bg-neutral-800 text-amber-400 font-medium' : 'hover:text-neutral-200'
                }`}
              >
                {isIndo ? 'Peringatan' : 'Warnings'} ({warningCount})
              </button>
            </div>
          )}

          {activeBottomPanel === 'output' && (
            <button
              onClick={() => clearOutputLogs()}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isIndo ? 'Bersihkan Log' : 'Clear Output'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {activeBottomPanel === 'terminal' && (
            <div className="flex items-center gap-1">
              {activeTerminalTask && activeTerminalTask.status === 'running' ? (
                <button
                  onClick={() => cancelRunningTerminal()}
                  className="flex items-center gap-1 px-2 py-0.5 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white rounded text-[11px] cursor-pointer"
                  title={isIndo ? 'Hentikan Proses (SIGINT)' : 'Cancel Process'}
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{isIndo ? 'Berhenti' : 'Cancel'}</span>
                </button>
              ) : null}

              <button
                onClick={() => clearTerminal()}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title={isIndo ? 'Bersihkan Terminal' : 'Clear Terminal'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setActiveBottomPanel(null)}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
            title={isIndo ? 'Tutup Panel' : 'Close Panel'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab 1: Problems Panel */}
      {activeBottomPanel === 'problems' && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {filteredProblems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 py-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1.5" />
              <p>{isIndo ? 'Tidak ada masalah terdeteksi pada berkas saat ini.' : 'No problems detected in the current file.'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => handleProblemClick(prob)}
                  className="flex items-start gap-2 py-1 px-2 rounded hover:bg-neutral-900 cursor-pointer text-[11px] group transition-colors"
                >
                  {prob.severity === 'error' && (
                    <span className="px-1.5 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 rounded text-[9px] font-bold shrink-0">
                      ERROR
                    </span>
                  )}
                  {prob.severity === 'warning' && (
                    <span className="px-1.5 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded text-[9px] font-bold shrink-0">
                      WARNING
                    </span>
                  )}
                  {prob.severity === 'info' && (
                    <span className="px-1.5 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded text-[9px] font-bold shrink-0">
                      INFO
                    </span>
                  )}

                  <span className="text-neutral-400 group-hover:text-blue-400 underline decoration-neutral-700 shrink-0">
                    {prob.fileName}:{prob.line}:{prob.column}
                  </span>

                  <span className="text-neutral-200 flex-1">
                    {isIndo ? prob.messageId : prob.message}
                  </span>

                  <span className="text-[10px] text-neutral-500 font-sans shrink-0">
                    [{prob.source}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Output Panel */}
      {activeBottomPanel === 'output' && (
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
          {outputLogs.length === 0 ? (
            <div className="text-neutral-500 text-center py-4">
              {isIndo ? 'Belum ada keluaran log.' : 'No output logs yet.'}
            </div>
          ) : (
            outputLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 text-[11px] ${
                  log.type === 'error' || log.type === 'stderr'
                    ? 'text-red-400'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : log.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-neutral-300'
                }`}
              >
                <span className="text-neutral-600 select-none shrink-0">[{log.timestamp}]</span>
                {log.source && (
                  <span className="text-neutral-500 shrink-0">[{log.source}]</span>
                )}
                <span className="whitespace-pre-wrap break-all flex-1">{log.text}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Build Panel */}
      {activeBottomPanel === 'build' && (
        <div className="flex-1 overflow-y-auto p-3 text-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
            <div>
              <h4 className="font-semibold text-neutral-200">
                {isIndo ? 'Android Gradle Build Engine' : 'Android Gradle Build Engine'}
              </h4>
              <p className="text-[11px] text-neutral-400">
                {isIndo
                  ? 'Kompilasi APK Debug / Release menggunakan proses terisolasi native.'
                  : 'Compile Debug / Release APK using native isolated process.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveBottomPanel('terminal');
                  runTerminalCommand('./gradlew assembleDebug');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>assembleDebug</span>
              </button>

              <button
                onClick={() => {
                  setActiveBottomPanel('terminal');
                  runTerminalCommand('./gradlew clean');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded cursor-pointer"
              >
                <span>clean</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-medium text-neutral-400">
              {isIndo ? 'Riwayat Tugas Terakhir' : 'Recent Build Tasks'}
            </div>

            {terminalTasks.length === 0 ? (
              <p className="text-[11px] text-neutral-500 italic">
                {isIndo ? 'Belum ada tugas build yang dijalankan pada sesi ini.' : 'No build tasks executed in this session.'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {terminalTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      {t.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {t.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                      {t.status === 'cancelled' && <Square className="w-3.5 h-3.5 text-amber-400" />}
                      {t.status === 'running' && <Play className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                      <span className="font-mono text-neutral-200 font-medium">{t.command}</span>
                    </div>

                    <div className="flex items-center gap-3 text-neutral-400 text-[10px]">
                      <span>Exit: {t.exitCode ?? 'N/A'}</span>
                      <span className="capitalize">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Terminal Panel */}
      {activeBottomPanel === 'terminal' && (
        <div className="flex-1 flex flex-col bg-neutral-950 font-mono text-xs overflow-hidden">
          {/* Quick presets chip bar */}
          <div className="px-3 py-1 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0">
              {isIndo ? 'Perintah Cepat:' : 'Quick:'}
            </span>
            <button
              onClick={() => runTerminalCommand('./gradlew assembleDebug')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
            >
              ./gradlew assembleDebug
            </button>
            <button
              onClick={() => runTerminalCommand('./gradlew clean')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
            >
              ./gradlew clean
            </button>
            <button
              onClick={() => runTerminalCommand('adb devices')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
            >
              adb devices
            </button>
            <button
              onClick={() => runTerminalCommand('./gradlew --version')}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
            >
              ./gradlew --version
            </button>
          </div>

          {/* Terminal log output */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {outputLogs.map((log) => (
              <div
                key={log.id}
                className={`text-[11px] leading-relaxed ${
                  log.type === 'error' || log.type === 'stderr'
                    ? 'text-red-400 font-semibold'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : log.type === 'success'
                    ? 'text-emerald-400'
                    : 'text-neutral-300'
                }`}
              >
                {log.text}
              </div>
            ))}
            <div ref={terminalLogsEndRef} />
          </div>

          {/* Terminal input prompt */}
          <form
            onSubmit={handleTerminalSubmit}
            className="h-8 border-t border-neutral-800/80 px-2 flex items-center gap-2 bg-neutral-900/90 shrink-0"
          >
            <span className="text-emerald-400 font-bold select-none">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleTerminalKeyDown}
              placeholder={isIndo ? 'Ketik perintah toolchain (misal: ./gradlew assembleDebug, adb devices)...' : 'Type command (e.g. ./gradlew assembleDebug, adb devices)...'}
              className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-600 focus:outline-hidden text-xs font-mono"
            />
          </form>
        </div>
      )}
    </div>
  );
};
