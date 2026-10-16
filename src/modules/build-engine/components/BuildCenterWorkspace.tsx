/**
 * Nusantara App Builder - Professional Android Build Center
 * Phase 7: Real Android Toolchain Execution, Live Build Terminal, Pre-Build Validation,
 * Signing Keystore Manager, Artifact Manager, ADB Devices, Logcat, and Build History.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  PlaySquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderOpen,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
  DownloadCloud,
  FileCode,
  KeyRound,
  Smartphone,
  Terminal,
  Activity,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCw,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useBuildEngineStore, BuildCenterTab } from '../store/buildEngineStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';
import { KeystoreCreatorModal } from './KeystoreCreatorModal';
import { SdkInstallerModal } from './SdkInstallerModal';
import { FirstRunSetupModal } from './FirstRunSetupModal';
import { BuildVariant, BuildTarget, ValidationLevel } from '../types';

export const BuildCenterWorkspace: React.FC = () => {
  const { lang } = useTranslation();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);
  const openProjectWizard = useUiStore((s) => s.openWizard);

  const activeTab = useBuildEngineStore((s) => s.activeTab);
  const setActiveTab = useBuildEngineStore((s) => s.setActiveTab);
  const buildStatus = useBuildEngineStore((s) => s.buildStatus);
  const currentTask = useBuildEngineStore((s) => s.currentTask);
  const config = useBuildEngineStore((s) => s.config);
  const setConfig = useBuildEngineStore((s) => s.setConfig);
  const logs = useBuildEngineStore((s) => s.logs);
  const lastError = useBuildEngineStore((s) => s.lastError);
  const validationResult = useBuildEngineStore((s) => s.validationResult);
  const artifacts = useBuildEngineStore((s) => s.artifacts);
  const history = useBuildEngineStore((s) => s.history);
  const signingConfig = useBuildEngineStore((s) => s.signingConfig);
  const connectedDevices = useBuildEngineStore((s) => s.connectedDevices);
  const selectedDeviceId = useBuildEngineStore((s) => s.selectedDeviceId);
  const setSelectedDeviceId = useBuildEngineStore((s) => s.setSelectedDeviceId);
  const isScanningDevices = useBuildEngineStore((s) => s.isScanningDevices);
  const logcatEntries = useBuildEngineStore((s) => s.logcatEntries);
  const isLogcatStreaming = useBuildEngineStore((s) => s.isLogcatStreaming);
  const logcatFilter = useBuildEngineStore((s) => s.logcatFilter);
  const setLogcatFilter = useBuildEngineStore((s) => s.setLogcatFilter);
  const toggleLogcatStreaming = useBuildEngineStore((s) => s.toggleLogcatStreaming);
  const clearLogcat = useBuildEngineStore((s) => s.clearLogcat);
  const toolchain = useBuildEngineStore((s) => s.toolchain);
  const isDiagnosing = useBuildEngineStore((s) => s.isDiagnosing);
  const diagnoseToolchain = useBuildEngineStore((s) => s.diagnoseToolchain);

  const setIsFirstRunModalOpen = useBuildEngineStore((s) => s.setIsFirstRunModalOpen);
  const setIsKeystoreModalOpen = useBuildEngineStore((s) => s.setIsKeystoreModalOpen);
  const setIsSdkInstallerModalOpen = useBuildEngineStore((s) => s.setIsSdkInstallerModalOpen);

  const loadProjectData = useBuildEngineStore((s) => s.loadProjectData);
  const validateProject = useBuildEngineStore((s) => s.validateProject);
  const startBuild = useBuildEngineStore((s) => s.startBuild);
  const cancelBuild = useBuildEngineStore((s) => s.cancelBuild);
  const cleanProject = useBuildEngineStore((s) => s.cleanProject);
  const rebuildProject = useBuildEngineStore((s) => s.rebuildProject);
  const scanDevices = useBuildEngineStore((s) => s.scanDevices);
  const installApk = useBuildEngineStore((s) => s.installApk);
  const launchApp = useBuildEngineStore((s) => s.launchApp);
  const clearLogs = useBuildEngineStore((s) => s.clearLogs);
  const clearHistory = useBuildEngineStore((s) => s.clearHistory);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Load project specifics when active project changes
  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject);
    } else if (projects.length > 0) {
      selectProject(projects[0]);
    }
  }, [activeProject?.id, selectProject]);

  // Auto-scroll terminal log
  useEffect(() => {
    if (activeTab === 'console' && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, activeTab]);

  const handleStartBuild = async (overrideVariant?: BuildVariant, overrideTarget?: BuildTarget) => {
    if (!activeProject) {
      showToast(lang === 'id' ? 'Silakan pilih proyek Android terlebih dahulu.' : 'Please select an Android project first.');
      return;
    }

    if (overrideVariant) setConfig({ variant: overrideVariant });
    if (overrideTarget) setConfig({ target: overrideTarget });

    setActiveTab('console');
    const success = await startBuild(activeProject, projectFiles);
    if (success) {
      showToast(lang === 'id' ? 'Build Android selesai dengan sukses!' : 'Android build completed successfully!');
    } else {
      showToast(lang === 'id' ? 'Build gagal. Tinjau pesan error pada konsol.' : 'Build failed. Review error output in console.');
    }
  };

  const handleRunValidation = (level: ValidationLevel) => {
    if (!activeProject) return;
    const res = validateProject(activeProject, projectFiles, level);
    if (res.isValid) {
      showToast(lang === 'id' ? 'Validasi proyek berhasil: Tidak ditemukan galat kritis.' : 'Validation passed: No critical errors found.');
    } else {
      showToast(lang === 'id' ? `Validasi gagal: Ditemukan ${res.summary.errorsCount} galat.` : `Validation failed: Found ${res.summary.errorsCount} errors.`);
    }
  };

  const handleOpenInCodeEditor = (file?: string, line?: number) => {
    if (!file) return;
    setActiveView('code-editor');
    showToast(`Membuka ${file} di Editor Kode pada baris ${line || 1}.`);
  };

  const isBuilding = buildStatus === 'running' || buildStatus === 'validating';

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden text-xs select-none">
      {/* Top Header: Build Center Identity & Status Summary */}
      <div className="px-5 py-3.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-neutral-100">
                {lang === 'id' ? 'Pusat Build Android (Build Center)' : 'Android Build Center'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-800/60">
                Phase 7 Real Engine
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
              <span>
                {lang === 'id' ? 'Proyek:' : 'Project:'}{' '}
                <strong className="text-neutral-200">{activeProject?.name || 'No Project'}</strong>
              </span>
              <span>•</span>
              <span>
                {lang === 'id' ? 'Varian:' : 'Variant:'}{' '}
                <strong className={config.variant === 'release' ? 'text-amber-400' : 'text-blue-400'}>
                  {config.variant === 'release' ? 'Release' : 'Debug'} ({config.target.toUpperCase()})
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Live Toolchain Quick Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Android SDK:</span>
              {toolchain?.androidSdk.installed ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : (
                <span className="text-red-400 font-bold">✗</span>
              )}
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">JDK 17+:</span>
              {toolchain?.java.installed ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : (
                <span className="text-red-400 font-bold">✗</span>
              )}
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Gradle Wrapper:</span>
              {toolchain?.gradle.wrapperAvailable ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : (
                <span className="text-amber-400 font-bold">!</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsFirstRunModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1.5 cursor-pointer"
            title="First Run Environment Setup Wizard"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">{lang === 'id' ? 'Wisaya Setup' : 'Setup Wizard'}</span>
          </button>
        </div>
      </div>

      {/* Main Action Bar: Primary Execution Controls */}
      <div className="px-5 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Quick Validate Button */}
          <button
            onClick={() => handleRunValidation('quick')}
            disabled={isBuilding || !activeProject}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200 hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'id' ? 'Validasi Proyek' : 'Validate'}</span>
          </button>

          {/* Build Debug APK Button */}
          <button
            onClick={() => handleStartBuild('debug', 'apk')}
            disabled={isBuilding || !activeProject}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{lang === 'id' ? 'Build Debug APK' : 'Build Debug APK'}</span>
          </button>

          {/* Build Release APK Button */}
          <button
            onClick={() => handleStartBuild('release', 'apk')}
            disabled={isBuilding || !activeProject}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Build Release APK' : 'Build Release APK'}</span>
          </button>

          {/* Build Release AAB Button */}
          <button
            onClick={() => handleStartBuild('release', 'aab')}
            disabled={isBuilding || !activeProject}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Build Release AAB' : 'Build Release AAB'}</span>
          </button>

          {/* Clean Button */}
          <button
            onClick={() => activeProject && cleanProject(activeProject)}
            disabled={isBuilding || !activeProject}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-900 text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="gradlew clean"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>{lang === 'id' ? 'Bersihkan' : 'Clean'}</span>
          </button>

          {/* Rebuild Button */}
          <button
            onClick={() => activeProject && rebuildProject(activeProject, projectFiles)}
            disabled={isBuilding || !activeProject}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-900 text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Clean & Rebuild"
          >
            <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
            <span>{lang === 'id' ? 'Rebuild' : 'Rebuild'}</span>
          </button>

          {/* Cancel Build Button (Active only when running) */}
          {isBuilding && (
            <button
              onClick={() => activeProject && cancelBuild(activeProject.id)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
            >
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Batalkan Build' : 'Cancel Build'}</span>
            </button>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {buildStatus === 'running' && (
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{lang === 'id' ? 'Menjalankan Gradle...' : 'Running Gradle...'}</span>
            </span>
          )}
          {buildStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>BUILD SUCCESSFUL</span>
            </span>
          )}
          {buildStatus === 'failed' && (
            <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono">
              <XCircle className="w-4 h-4" />
              <span>BUILD FAILED</span>
            </span>
          )}
          {buildStatus === 'cancelled' && (
            <span className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>BUILD CANCELLED</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 bg-neutral-900 border-b border-neutral-800 flex items-center gap-1 shrink-0 overflow-x-auto">
        {[
          { id: 'console', label: lang === 'id' ? 'Terminal Output' : 'Build Output', icon: Terminal },
          { id: 'artifacts', label: lang === 'id' ? 'Artefak APK & AAB' : 'Build Artifacts', count: artifacts.length, icon: Layers },
          { id: 'devices', label: lang === 'id' ? 'Perangkat ADB & Logcat' : 'Devices & Logcat', count: connectedDevices.length, icon: Smartphone },
          { id: 'signing', label: lang === 'id' ? 'Signing & Keystore' : 'Signing & Keystore', icon: KeyRound },
          { id: 'settings', label: lang === 'id' ? 'Konfigurasi Build' : 'Build Settings', icon: Settings },
          { id: 'history', label: lang === 'id' ? 'Riwayat Build' : 'Build History', count: history.length, icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BuildCenterTab)}
              className={`px-3 py-2.5 font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-neutral-950/40'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* TAB 1: Console & Live Output */}
        {activeTab === 'console' && (
          <div className="h-full flex flex-col p-4 bg-neutral-950">
            {/* Action Bar inside Console */}
            <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-neutral-500">$</span>
                <span className="text-neutral-300">
                  gradlew.bat {currentTask} --stacktrace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const txt = logs.map((l) => `${l.timestamp} ${l.message}`).join('\n');
                    navigator.clipboard.writeText(txt);
                    showToast(lang === 'id' ? 'Log berhasil disalin ke clipboard.' : 'Logs copied to clipboard.');
                  }}
                  className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{lang === 'id' ? 'Salin Log' : 'Copy'}</span>
                </button>
                <button
                  onClick={clearLogs}
                  className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{lang === 'id' ? 'Bersihkan' : 'Clear'}</span>
                </button>
              </div>
            </div>

            {/* Structured Error Banner (if build failed) */}
            {lastError && (
              <div className="mb-3 p-3.5 rounded-lg bg-red-950/40 border border-red-800/80 text-xs text-red-200 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lastError.task || 'Build Error'}</span>
                  </div>
                  {lastError.file && (
                    <button
                      onClick={() => handleOpenInCodeEditor(lastError.file, lastError.line)}
                      className="px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-100 border border-red-500/40 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileCode className="w-3 h-3" />
                      <span>
                        {lastError.file.split(/[\\/]/).pop()}
                        {lastError.line ? `:${lastError.line}` : ''}
                      </span>
                    </button>
                  )}
                </div>
                <div className="font-mono text-[11px] text-red-300 break-words">
                  {lastError.message}
                </div>
                {(lastError.suggestedFix || lastError.suggestedFixId) && (
                  <div className="pt-1 border-t border-red-900/60 text-[11px] text-red-200/90 flex items-start gap-1.5">
                    <strong className="text-amber-400 shrink-0">
                      {lang === 'id' ? 'Solusi yang Disarankan:' : 'Suggested Fix:'}
                    </strong>
                    <span>{lang === 'id' ? lastError.suggestedFixId || lastError.suggestedFix : lastError.suggestedFix}</span>
                  </div>
                )}
              </div>
            )}

            {/* Terminal Window */}
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded-lg p-3 font-mono text-[11px] overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p>
                    {lang === 'id'
                      ? 'Belum ada log aktif. Tekan [Build APK] atau [Build AAB] untuk memulai proses.'
                      : 'No active logs. Click [Build APK] or [Build AAB] to start building.'}
                  </p>
                </div>
              ) : (
                logs.map((entry) => {
                  let colorClass = 'text-neutral-300';
                  if (entry.level === 'task') colorClass = 'text-blue-400 font-semibold';
                  if (entry.level === 'success') colorClass = 'text-emerald-400 font-bold';
                  if (entry.level === 'warn') colorClass = 'text-amber-400';
                  if (entry.level === 'error') colorClass = 'text-red-400 font-semibold';

                  return (
                    <div key={entry.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-neutral-600 shrink-0">{entry.timestamp}</span>
                      <span className={`break-all ${colorClass}`}>{entry.message}</span>
                      {entry.file && (
                        <button
                          onClick={() => handleOpenInCodeEditor(entry.file, entry.line)}
                          className="text-blue-400 underline hover:text-blue-300 shrink-0 cursor-pointer"
                        >
                          [{entry.file}:{entry.line || 1}]
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2: Build Artifacts Manager */}
        {activeTab === 'artifacts' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'id' ? 'Manajer Artefak Build (APK & AAB)' : 'Build Artifacts Manager'}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {lang === 'id'
                    ? 'Berkas biner Android yang dihasilkan secara nyata dari proses Gradle.'
                    : 'Actual Android binaries produced from the Gradle compilation engine.'}
                </p>
              </div>
            </div>

            {artifacts.length === 0 ? (
              <div className="p-8 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
                <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="font-semibold text-neutral-200">
                  {lang === 'id' ? 'Belum Ada Artefak Tersedia' : 'No Build Artifacts Available'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  {lang === 'id'
                    ? 'Jalankan Build Debug APK atau Release AAB untuk menghasilkan berkas installer Android.'
                    : 'Run Build Debug APK or Release AAB to produce actual Android installer binaries.'}
                </p>
                <button
                  onClick={() => handleStartBuild('debug', 'apk')}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{lang === 'id' ? 'Build Debug APK Sekarang' : 'Build Debug APK Now'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                              art.type === 'apk'
                                ? (art.variant === 'debug' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-amber-950 text-amber-400 border border-amber-800')
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {art.variant} {art.type}
                          </span>
                          <span className="font-semibold text-neutral-100 text-xs truncate max-w-[180px]">
                            {art.name}
                          </span>
                        </div>
                        <span className="font-mono text-neutral-300 font-bold text-xs">
                          {art.formattedSize}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] space-y-1 text-neutral-400 font-mono">
                        <div className="truncate">Path: {art.location}</div>
                        <div>Target SDK: API {art.targetSdk} | Min SDK: API {art.minSdk}</div>
                        <div>Versi: v{art.versionName} (Build {art.versionCode})</div>
                        <div className="text-[10px] text-neutral-500">{new Date(art.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(art.location);
                          showToast(lang === 'id' ? 'Path berkas disalin ke clipboard.' : 'Path copied to clipboard.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'id' ? 'Salin Path' : 'Copy Path'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {art.type === 'apk' && (
                          <button
                            onClick={async () => {
                              if (!selectedDeviceId) {
                                showToast(lang === 'id' ? 'Pilih perangkat Android terlebih dahulu.' : 'Select a device first.');
                                return;
                              }
                              showToast(lang === 'id' ? `Menginstal ke perangkat...` : `Installing to device...`);
                              const ok = await installApk(art.location, selectedDeviceId);
                              if (ok) {
                                showToast(lang === 'id' ? 'APK berhasil diinstal ke perangkat.' : 'APK installed successfully.');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{lang === 'id' ? 'Pasang ke HP' : 'Install'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => showToast(lang === 'id' ? `Membuka folder di Windows Explorer: ${art.location}` : `Opening folder in Explorer: ${art.location}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{lang === 'id' ? 'Buka Folder' : 'Open Folder'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Device Manager & ADB Logcat */}
        {activeTab === 'devices' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>{lang === 'id' ? 'Manajer Perangkat Android (ADB Devices)' : 'Android Device Manager (ADB)'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {lang === 'id'
                      ? 'Deteksi perangkat nyata / emulator USB untuk instalasi langsung dan debugging Logcat.'
                      : 'Real USB devices and emulators detection for deployment and Logcat debugging.'}
                  </p>
                </div>
                <button
                  onClick={scanDevices}
                  disabled={isScanningDevices}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanningDevices ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{lang === 'id' ? 'Pindai Ulang Perangkat' : 'Rescan Devices'}</span>
                </button>
              </div>

              {/* Connected Devices List */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectedDevices.length === 0 ? (
                  <div className="col-span-2 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
                    {lang === 'id'
                      ? 'Tidak ada perangkat Android yang terdeteksi via USB atau Emulator.'
                      : 'No Android devices detected via USB or Emulator.'}
                  </div>
                ) : (
                  connectedDevices.map((dev) => (
                    <div
                      key={dev.id}
                      onClick={() => setSelectedDeviceId(dev.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedDeviceId === dev.id
                          ? 'bg-blue-950/40 border-blue-600 text-blue-100'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-neutral-100">{dev.model}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {dev.androidVersion} (API {dev.apiLevel}) · {dev.serial}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                          {dev.status}
                        </span>
                        {activeProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              launchApp(activeProject.packageId, dev.id);
                              showToast(`Meluncurkan ${activeProject.packageId} pada ${dev.model}.`);
                            }}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>{lang === 'id' ? 'Jalankan' : 'Launch'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Logcat Terminal Panel */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-xs text-neutral-200">
                    {lang === 'id' ? 'Live Logcat Viewer (adb logcat)' : 'Live Logcat Viewer (adb logcat)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <input
                    type="text"
                    value={logcatFilter}
                    onChange={(e) => setLogcatFilter(e.target.value)}
                    placeholder={lang === 'id' ? 'Filter tag / teks...' : 'Filter tag / text...'}
                    className="px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={toggleLogcatStreaming}
                    className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 cursor-pointer ${
                      isLogcatStreaming
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <span>{isLogcatStreaming ? (lang === 'id' ? 'Jeda Stream' : 'Pause') : (lang === 'id' ? 'Mulai Stream' : 'Stream')}</span>
                  </button>
                  <button
                    onClick={clearLogcat}
                    className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 cursor-pointer"
                  >
                    {lang === 'id' ? 'Bersihkan' : 'Clear'}
                  </button>
                </div>
              </div>

              <div className="h-56 bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 font-mono text-[11px] overflow-y-auto space-y-1">
                {logcatEntries
                  .filter((entry) => !logcatFilter || entry.tag.toLowerCase().includes(logcatFilter.toLowerCase()) || entry.message.toLowerCase().includes(logcatFilter.toLowerCase()))
                  .map((e) => (
                    <div key={e.id} className="flex items-start gap-2">
                      <span className="text-neutral-500 shrink-0">{e.timestamp}</span>
                      <span
                        className={`font-bold px-1 rounded shrink-0 ${
                          e.level === 'E' || e.level === 'F'
                            ? 'bg-red-950 text-red-400'
                            : e.level === 'W'
                            ? 'bg-amber-950 text-amber-400'
                            : e.level === 'D'
                            ? 'text-cyan-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {e.level}
                      </span>
                      <span className="text-neutral-400 font-semibold shrink-0">[{e.tag}]</span>
                      <span className="text-neutral-200 break-all">{e.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Signing & Keystore */}
        {activeTab === 'signing' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'id' ? 'Konfigurasi Signing & Keystore Rilis' : 'Release Signing & Keystore Configuration'}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {lang === 'id'
                    ? 'Wajib untuk rilis produksi (Release APK & AAB). Kredensial tidak disimpan dalam plain text.'
                    : 'Required for production releases (Release APK & AAB). Credentials are never saved in plain text.'}
                </p>
              </div>

              <button
                onClick={() => setIsKeystoreModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Buat Keystore Baru' : 'Create New Keystore'}</span>
              </button>
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              signingConfig.isConfigured
                ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-100'
                : 'bg-amber-950/20 border-amber-800/60 text-amber-100'
            }`}>
              {signingConfig.isConfigured ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-semibold text-xs">
                  {signingConfig.isConfigured
                    ? (lang === 'id' ? 'Signing Siap untuk Build Rilis' : 'Signing Ready for Release Builds')
                    : (lang === 'id' ? 'Signing Rilis Belum Dikonfigurasi' : 'Release Signing Not Configured')}
                </div>
                <p className="text-[11px] text-neutral-300">
                  {signingConfig.isConfigured
                    ? (lang === 'id' ? `Keystore: ${signingConfig.keystorePath} (Alias: ${signingConfig.keyAlias})` : `Keystore: ${signingConfig.keystorePath} (Alias: ${signingConfig.keyAlias})`)
                    : (lang === 'id' ? 'Untuk membangun APK atau AAB rilis, Anda harus memilih atau membuat berkas .jks/.keystore resmi.' : 'To build release APK or AAB, configure or create an official .jks/.keystore file.')}
                </p>
              </div>
            </div>

            {/* Keystore Details Panel */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h3 className="font-semibold text-neutral-200 text-xs">
                {lang === 'id' ? 'Informasi Berkas Kriptografi' : 'Cryptographic File Details'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-1">Keystore Path:</span>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-700 font-mono text-[11px] truncate">
                    {signingConfig.keystorePath || (lang === 'id' ? 'Belum ditentukan' : 'Not set')}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1">Key Alias:</span>
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-700 font-mono text-[11px]">
                    {signingConfig.keyAlias || '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={signingConfig.v1SigningEnabled}
                    onChange={(e) => {
                      const updated = { ...signingConfig, v1SigningEnabled: e.target.checked };
                      if (activeProject) SigningService.saveSigningConfig(activeProject.id, updated);
                    }}
                    className="rounded border-neutral-700 text-blue-600"
                  />
                  <span>V1 Signing (Jar Signature - Android &lt; 7.0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={signingConfig.v2SigningEnabled}
                    onChange={(e) => {
                      const updated = { ...signingConfig, v2SigningEnabled: e.target.checked };
                      if (activeProject) SigningService.saveSigningConfig(activeProject.id, updated);
                    }}
                    className="rounded border-neutral-700 text-blue-600"
                  />
                  <span>V2 Signing (Full APK Signature - Android 7.0+)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Build Configuration & Settings */}
        {activeTab === 'settings' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-5">
            <div>
              <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>{lang === 'id' ? 'Pengaturan Engine & Alokasi Memori' : 'Build Engine Settings & Memory'}</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'id' ? 'Konfigurasi performa Gradle Wrapper, cache, dan opsi compiler.' : 'Configure Gradle Wrapper performance, cache, and compiler flags.'}
              </p>
            </div>

            {/* RAM Warning Banner */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3 text-amber-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">
                  {lang === 'id' ? 'Pemberitahuan Kebutuhan Memori (RAM):' : 'RAM Memory Warning:'}
                </span>{' '}
                {lang === 'id'
                  ? 'Kompilasi Kotlin dan Android DEX dapat memerlukan alokasi RAM yang cukup besar. Untuk proyek besar, tutup aplikasi yang tidak digunakan sebelum menjalankan build.'
                  : 'Android Kotlin compilation and DEXing can require significant RAM. Close unused background applications for optimal build speed.'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Build Performance Config */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="font-semibold text-neutral-200">
                  {lang === 'id' ? 'Performa Gradle' : 'Gradle Performance'}
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-neutral-200">Gradle Build Cache</div>
                      <div className="text-[11px] text-neutral-400">
                        {lang === 'id' ? 'Mempercepat build berulang dengan cache task' : 'Speed up subsequent builds using task cache'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.buildCache}
                      onChange={(e) => setConfig({ buildCache: e.target.checked })}
                      className="rounded border-neutral-700 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                    <div>
                      <div className="font-medium text-neutral-200">Offline Mode</div>
                      <div className="text-[11px] text-neutral-400">
                        {lang === 'id' ? 'Hanya gunakan dependensi yang tersimpan lokal' : 'Only use locally cached dependencies'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.offlineMode}
                      onChange={(e) => setConfig({ offlineMode: e.target.checked })}
                      className="rounded border-neutral-700 text-blue-600"
                    />
                  </div>

                  <div className="border-t border-neutral-800 pt-3">
                    <label className="block text-neutral-300 font-medium mb-1">
                      Parallel Build:
                    </label>
                    <select
                      value={config.parallelBuild}
                      onChange={(e) => setConfig({ parallelBuild: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs"
                    >
                      <option value="auto">Auto (Berdasarkan Core CPU)</option>
                      <option value="enabled">Enabled (--parallel)</option>
                      <option value="disabled">Disabled (--no-parallel)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Version & Package Identifiers */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="font-semibold text-neutral-200">
                  {lang === 'id' ? 'Versi & Identitas Android' : 'Version & Android Identity'}
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Application ID:</span>
                    <span className="font-mono text-neutral-100">{activeProject?.packageId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-neutral-400 block mb-0.5">Version Name:</span>
                      <span className="font-mono text-neutral-100">{activeProject?.versionName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-0.5">Version Code:</span>
                      <span className="font-mono text-neutral-100">{activeProject?.versionCode}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (activeProject) {
                          const newCode = (activeProject.versionCode || 1) + 1;
                          showToast(`Version Code diperbarui ke ${newCode}`);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] cursor-pointer"
                    >
                      +1 Version Code
                    </button>
                    <button
                      onClick={() => setIsSdkInstallerModalOpen(true)}
                      className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[11px] cursor-pointer"
                    >
                      {lang === 'id' ? 'Instal Komponen SDK' : 'Install SDK Components'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Build History */}
        {activeTab === 'history' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'id' ? 'Riwayat Build Proyek' : 'Project Build History'}</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {lang === 'id' ? 'Catatan eksekusi build dan durasi kompilasi (retensi 25 build terakhir).' : 'Execution records and durations (retained up to 25 builds).'}
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{lang === 'id' ? 'Bersihkan Riwayat' : 'Clear History'}</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-8 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
                {lang === 'id' ? 'Belum ada riwayat build untuk proyek ini.' : 'No build history records yet.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((record, idx) => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-500 text-xs">#{history.length - idx}</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          record.status === 'success'
                            ? 'bg-emerald-500'
                            : record.status === 'cancelled'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-neutral-200 text-xs">
                          {record.variant.toUpperCase()} {record.target.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {new Date(record.startTime).toLocaleString()} · {(record.durationMs / 1000).toFixed(1)}s
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                          record.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : record.status === 'cancelled'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <KeystoreCreatorModal />
      <SdkInstallerModal />
      <FirstRunSetupModal />
    </div>
  );
};
