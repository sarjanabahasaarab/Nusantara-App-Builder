/**
 * Nusantara App Builder - Generate Layout Modal (Phase 3)
 * Displays generated Android XML Layouts, syntax formatting, relative paths, and copy-to-clipboard functionality.
 */

import React, { useState } from 'react';
import {
  X,
  FileCode,
  Copy,
  Check,
  FolderCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import { useUiStore } from '../../../store/uiStore';
import { useProjectStore } from '../../../store/projectStore';
import { generateAndroidXmlLayout } from '../xml-generator/androidXmlGenerator';

export const GenerateLayoutModal: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const activeProject = useProjectStore((s) => s.activeProject);

  const design = useDesignerStore((s) => s.design);
  const isGenerateModalOpen = useDesignerStore((s) => s.isGenerateModalOpen);
  const setGenerateModalOpen = useDesignerStore((s) => s.setGenerateModalOpen);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);

  const [selectedScreenId, setSelectedScreenId] = useState(activeScreenId);
  const [copied, setCopied] = useState(false);

  const isIndo = lang === 'id';

  if (!isGenerateModalOpen || !design) return null;

  const targetScreen =
    design.screens.find((s) => s.id === selectedScreenId) || design.screens[0];
  const layoutResult = targetScreen ? generateAndroidXmlLayout(targetScreen) : null;

  const handleCopy = () => {
    if (layoutResult) {
      navigator.clipboard.writeText(layoutResult.fullXml);
      setCopied(true);
      showToast(isIndo ? 'Kode XML disalin ke clipboard' : 'XML code copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none">
      <div className="w-[740px] max-w-[95vw] h-[640px] max-h-[92vh] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-scale-in text-xs text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isIndo ? 'Android XML Layout Berhasil Dihasilkan' : 'Android XML Layout Generated'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isIndo
                  ? 'File layout telah disimpan ke struktur proyek Phase 2.'
                  : 'Layout files synchronized directly into Phase 2 project structure.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGenerateModalOpen(false)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Screen Tabs Selector */}
        {design.screens.length > 1 && (
          <div className="flex items-center gap-1 px-4 pt-2 border-b border-neutral-800 bg-neutral-950/40 overflow-x-auto">
            {design.screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => setSelectedScreenId(screen.id)}
                className={`px-3 py-1.5 rounded-t font-medium text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  selectedScreenId === screen.id
                    ? 'border-blue-500 text-blue-400 bg-neutral-900'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{screen.name}</span>
                <span className="text-[10px] text-neutral-500 font-mono">({screen.layoutFileName})</span>
              </button>
            ))}
          </div>
        )}

        {/* Path & Target Notice */}
        {layoutResult && (
          <div className="px-4 py-2 bg-neutral-950/70 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300 truncate">
              <FolderCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-neutral-400">{activeProject?.location || 'C:/Projects'}/</span>
              <span className="text-emerald-400 font-semibold">{layoutResult.relativePath}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer text-xs shrink-0 font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? (isIndo ? 'Tersalin' : 'Copied') : (isIndo ? 'Salin XML' : 'Copy XML')}</span>
            </button>
          </div>
        )}

        {/* Code Viewport with Line Numbers */}
        <div className="flex-1 overflow-auto bg-neutral-950 p-4 font-mono text-[11px] leading-relaxed text-neutral-200 select-text">
          {layoutResult ? (
            <pre className="whitespace-pre">
              {layoutResult.fullXml.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-neutral-900/60">
                  <span className="w-10 text-right pr-4 text-neutral-600 select-none shrink-0">
                    {idx + 1}
                  </span>
                  <span
                    className={
                      line.includes('<?xml')
                        ? 'text-amber-300'
                        : line.includes('xmlns:')
                        ? 'text-purple-300'
                        : line.includes('<') && line.includes('>')
                        ? 'text-blue-300'
                        : line.includes('android:')
                        ? 'text-sky-300'
                        : 'text-neutral-200'
                    }
                  >
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          ) : (
            <div className="text-neutral-500 text-center py-12">Tidak ada data layout</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {isIndo
                ? 'Layout siap di-build dengan Gradle Wrapper atau diedit di Code Editor (Phase 4).'
                : 'Layout is ready for Gradle build or direct editing in Code Editor (Phase 4).'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGenerateModalOpen(false);
                setActiveView('project-detail');
              }}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium cursor-pointer"
            >
              {isIndo ? 'Lihat di Detail Proyek' : 'View in Project Detail'}
            </button>
            <button
              onClick={() => setGenerateModalOpen(false)}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shadow-xs"
            >
              {isIndo ? 'Selesai' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
