/**
 * Nusantara App Builder - Code Editor Status Bar
 * Phase 4: IDE status bar displaying cursor coordinates, indentation, UTF-8 encoding, LF,
 * language mode, and atomic save status.
 */

import React from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

export const EditorStatusBar: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { activeTabId, tabs, saveStatus, autoSaveMode } = useEditorStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const cursorLine = activeTab?.cursorLine ?? 1;
  const cursorCol = activeTab?.cursorColumn ?? 1;
  const language = activeTab?.language ?? 'plaintext';

  return (
    <div className="h-6 bg-neutral-900 border-t border-neutral-800 px-3 flex items-center justify-between text-[11px] text-neutral-400 select-none shrink-0 font-sans">
      {/* Left items: Git branch, save status, active file */}
      <div className="flex items-center gap-3">
        {/* Git branch */}
        <div className="flex items-center gap-1 hover:text-neutral-200 cursor-pointer">
          <GitBranch className="w-3 h-3 text-blue-400" />
          <span>main</span>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-1 font-medium">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isIndo ? 'Tersimpan' : 'Saved'}</span>
            </span>
          )}

          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-blue-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isIndo ? 'Menyimpan...' : 'Saving...'}</span>
            </span>
          )}

          {saveStatus === 'unsaved' && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isIndo ? 'Belum Tersimpan' : 'Unsaved'}</span>
            </span>
          )}

          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              <span>{isIndo ? 'Gagal Menyimpan' : 'Save Failed'}</span>
            </span>
          )}
        </div>

        {/* Auto save indicator */}
        {autoSaveMode !== 'off' && (
          <span className="text-[10px] text-neutral-500 hidden sm:inline">
            Auto-Save: {autoSaveMode === 'afterDelay' ? '1.2s' : 'Focus'}
          </span>
        )}
      </div>

      {/* Right items: Cursor position, indentation, encoding, language */}
      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            {/* Ln / Col */}
            <div className="hover:text-neutral-200 cursor-default font-mono">
              Ln {cursorLine}, Col {cursorCol}
            </div>

            {/* Spaces */}
            <div className="hover:text-neutral-200 cursor-pointer hidden md:inline">
              Spaces: 4
            </div>

            {/* Encoding */}
            <div className="hover:text-neutral-200 cursor-pointer hidden sm:inline font-mono">
              UTF-8
            </div>

            {/* CRLF/LF */}
            <div className="hover:text-neutral-200 cursor-pointer hidden sm:inline font-mono">
              LF
            </div>

            {/* Language Mode */}
            <div className="hover:text-neutral-200 cursor-pointer font-medium uppercase text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
              {language}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
