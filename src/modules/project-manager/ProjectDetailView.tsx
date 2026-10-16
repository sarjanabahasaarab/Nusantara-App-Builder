/**
 * Nusantara App Builder - Project Explorer & Detail View
 * Phase 2: Integrated Project Integrity Validator and Native Gradle Debug Build Runner.
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  FileCode,
  FileText,
  File,
  Copy,
  Check,
  ArrowLeft,
  FolderOpen,
  ShieldCheck,
  PlaySquare,
  AlertTriangle,
  CheckCircle2,
  X,
  Terminal,
  RefreshCw,
  Info,
  Palette,
  Code2,
  Zap,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useProjectStore } from '../../store/projectStore';
import { useEnvStore } from '../../store/envStore';
import { useUiStore } from '../../store/uiStore';
import { ProjectFile } from '../../types/project';

export const ProjectDetailView: React.FC = () => {
  const { t, lang } = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const activeFiles = useProjectStore((s) => s.activeFiles);
  const activeFile = useProjectStore((s) => s.activeFile);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const closeActiveProject = useProjectStore((s) => s.closeActiveProject);
  const validateCurrentProject = useProjectStore((s) => s.validateCurrentProject);
  const runDebugBuild = useProjectStore((s) => s.runDebugBuild);
  const validationReport = useProjectStore((s) => s.validationReport);
  const buildOutput = useProjectStore((s) => s.buildOutput);
  const isValidating = useProjectStore((s) => s.isValidating);
  const isBuilding = useProjectStore((s) => s.isBuilding);
  const clearValidationReport = useProjectStore((s) => s.clearValidationReport);
  const clearBuildOutput = useProjectStore((s) => s.clearBuildOutput);

  const envStatus = useEnvStore((s) => s.status);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const [copied, setCopied] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showBuildConsole, setShowBuildConsole] = useState(false);

  if (!activeProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-neutral-950 text-neutral-400">
        <FolderGit2 className="w-12 h-12 mb-3 text-neutral-400" />
        <h3 className="text-base font-semibold text-neutral-200">
          Tidak Ada Proyek Aktif
        </h3>
        <p className="text-xs text-neutral-400 mt-1 mb-4">
          Buka atau buat proyek baru dari Dasbor untuk memeriksa struktur berkas.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium cursor-pointer"
        >
          Kembali ke Dasbor
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    showToast(t.projectDetail.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidate = async () => {
    setShowValidationModal(true);
    await validateCurrentProject();
  };

  const handleBuildDebug = async () => {
    setShowBuildConsole(true);
    await runDebugBuild();
  };

  const handleOpenFolder = () => {
    showToast(`Lokasi folder proyek: ${activeProject.location}\\${activeProject.name}`);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.kt') || fileName.endsWith('.java')) {
      return <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (fileName.endsWith('.xml')) {
      return <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (fileName.endsWith('.gradle.kts') || fileName.endsWith('.toml')) {
      return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <File className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 select-none overflow-hidden relative">
      {/* Top Project Header Bar */}
      <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Kembali ke Dasbor"
            aria-label="Kembali ke Dasbor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-100">
                {activeProject.displayName || activeProject.name}
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                [{activeProject.packageId}]
              </span>
              <span className="text-[10px] font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                v{activeProject.versionName} ({activeProject.versionCode})
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono truncate max-w-xl">
              {activeProject.location}\{activeProject.name}
            </div>
          </div>
        </div>

        {/* Phase 2 Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Validate Project Button */}
          {/* Visual Designer Button */}
          <button
            onClick={() => setActiveView('visual-designer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title={lang === 'id' ? 'Buka di Visual Designer' : 'Open in Visual Designer'}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Visual Designer</span>
          </button>

          {/* Logic Designer Button */}
          <button
            onClick={() => setActiveView('logic-designer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title={lang === 'id' ? 'Buka di Logic Designer' : 'Open in Logic Designer'}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logic Designer</span>
          </button>

          {/* Code Editor Button */}
          <button
            onClick={() => setActiveView('code-editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title={lang === 'id' ? 'Buka di Editor Kode' : 'Open in Code Editor'}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'id' ? 'Editor Kode' : 'Code Editor'}</span>
          </button>

          {/* Validate Project Button */}
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
            title={t.projectDetail.btnValidate}
          >
            <ShieldCheck className={`w-3.5 h-3.5 text-blue-400 ${isValidating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t.projectDetail.btnValidate}</span>
          </button>

          {/* Build Debug Button */}
          <button
            onClick={handleBuildDebug}
            disabled={isBuilding}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              envStatus.overallReady
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
            title={t.projectDetail.btnBuildDebug}
          >
            <PlaySquare className={`w-3.5 h-3.5 ${isBuilding ? 'animate-pulse text-amber-300' : 'text-white'}`} />
            <span className="hidden sm:inline">{isBuilding ? 'Building...' : t.projectDetail.btnBuildDebug}</span>
          </button>

          {/* Open Folder Button */}
          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title={t.projectDetail.btnOpenFolder}
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => closeActiveProject()}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {t.menu.closeProject}
          </button>
        </div>
      </div>

      {/* Main Content: Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: File Tree Explorer */}
        <div className="w-64 border-r border-neutral-800 bg-neutral-900/60 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>{t.projectDetail.filesListTitle}</span>
            <span className="font-mono tabular-nums text-neutral-400">
              {activeFiles.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
            {activeFiles.map((file) => {
              const isSelected = activeFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors cursor-pointer truncate ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                  title={file.path}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate text-[11px]">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
          {activeFile ? (
            <>
              {/* File header bar */}
              <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0 text-xs">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  {getFileIcon(activeFile.name)}
                  <span className="text-neutral-200 font-medium">{activeFile.path}</span>
                  <span className="text-neutral-400">({activeFile.size} bytes)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveView('code-editor');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Edit di Editor Kode' : 'Edit in Code Editor'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.projectDetail.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.projectDetail.copyContent}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code viewer content */}
              <div className="flex-1 overflow-auto p-4 bg-neutral-950 text-neutral-300 font-mono text-xs leading-relaxed">
                <pre className="select-text whitespace-pre overflow-x-auto">
                  <code>{activeFile.content}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
              Pilih file dari panel sebelah kiri untuk melihat konten kode.
            </div>
          )}
        </div>
      </div>

      {/* Validation Report Modal */}
      {showValidationModal && validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden text-neutral-200 text-xs">
            <div className="px-5 py-3.5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="font-semibold text-sm text-neutral-100">
                  {t.projectDetail.validationTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded border text-xs bg-neutral-950 border-neutral-800">
                {validationReport.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-neutral-200">
                    {validationReport.isValid
                      ? t.projectDetail.validationSuccess
                      : t.projectDetail.validationErrorsFound}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                    {validationReport.checkedFilesCount} berkas diperiksa pada {new Date(validationReport.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {validationReport.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded border text-[11px] space-y-0.5 ${
                      iss.severity === 'error'
                        ? 'bg-red-950/30 border-red-900/60 text-red-300'
                        : iss.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>[{iss.severity.toUpperCase()}]</span>
                      {iss.file && <span className="font-mono text-neutral-200">{iss.file}</span>}
                    </div>
                    <div>{lang === 'id' ? iss.messageId : iss.message}</div>
                  </div>
                ))}
              </div>

              {/* Gradle Config Summary */}
              <div className="p-3 bg-neutral-950 rounded border border-neutral-800 font-mono text-[11px] space-y-1 text-neutral-400">
                <div>Namespace: <span className="text-neutral-200">{validationReport.gradleConfigSummary.namespace}</span></div>
                <div>Compile SDK: <span className="text-neutral-200">{validationReport.gradleConfigSummary.compileSdk}</span></div>
                <div>Target / Min SDK: <span className="text-neutral-200">{validationReport.gradleConfigSummary.targetSdk} / {validationReport.gradleConfigSummary.minSdk}</span></div>
                <div>Wrapper Scripts: <span className="text-emerald-400">{validationReport.gradleConfigSummary.hasGradleWrapper ? 'Hadir (gradlew & gradlew.bat)' : 'Tidak Ditemukan'}</span></div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gradle Build Console Drawer */}
      {showBuildConsole && (
        <div className="h-64 border-t border-neutral-800 bg-neutral-900 flex flex-col shrink-0 text-xs">
          <div className="px-4 py-2 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-neutral-200">{t.projectDetail.buildConsoleTitle}</span>
              {buildOutput && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                    buildOutput.status === 'success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : buildOutput.status === 'running'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {buildOutput.status.toUpperCase()} (Exit: {buildOutput.exitCode ?? 0})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBuildDebug}
                disabled={isBuilding}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3 h-3 ${isBuilding ? 'animate-spin' : ''}`} />
                <span>Re-build</span>
              </button>
              <button
                onClick={() => setShowBuildConsole(false)}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 font-mono text-[11px] bg-neutral-950 text-neutral-300 space-y-0.5 leading-relaxed">
            {isBuilding ? (
              <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.projectDetail.buildingNotice}</span>
              </div>
            ) : buildOutput ? (
              buildOutput.logs.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.includes('BUILD SUCCESSFUL')
                      ? 'text-emerald-400 font-bold'
                      : line.includes('ERROR') || line.includes('FAILED')
                      ? 'text-red-400 font-bold'
                      : line.startsWith('> Task')
                      ? 'text-neutral-400'
                      : 'text-neutral-300'
                  }
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="text-neutral-400">Siap untuk menjalankan build debug...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
