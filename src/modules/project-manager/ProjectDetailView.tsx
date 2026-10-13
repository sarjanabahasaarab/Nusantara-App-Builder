/**
 * Nusantara App Builder - Project Explorer & Detail View
 * Allows inspecting generated Android files (Kotlin, Gradle, Manifest, XML).
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
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { ProjectFile } from '../../types/project';

export const ProjectDetailView: React.FC = () => {
  const { t, lang } = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const activeFiles = useProjectStore((s) => s.activeFiles);
  const activeFile = useProjectStore((s) => s.activeFile);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const closeActiveProject = useProjectStore((s) => s.closeActiveProject);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const [copied, setCopied] = useState(false);

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
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 select-none overflow-hidden">
      {/* Top Project Header Bar */}
      <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveView('dashboard');
            }}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Kembali ke Dasbor"
            aria-label="Kembali ke Dasbor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-100">
                {activeProject.name}
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                [{activeProject.packageId}]
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono truncate max-w-xl">
              {activeProject.location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => closeActiveProject()}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
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
    </div>
  );
};
