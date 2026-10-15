/**
 * Nusantara App Builder - Code Editor Action Toolbar
 * Phase 4: Quick access to save, format, search, visual designer switch, and layout toggles.
 */

import React from 'react';
import {
  Save,
  Files,
  RotateCcw,
  RotateCw,
  AlignLeft,
  Search,
  Replace,
  Layers,
  Terminal,
  AlertCircle,
  Sidebar,
  SlidersHorizontal,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Play,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { useUiStore } from '../../../store/uiStore';
import { AutoSaveMode } from '../types';

export const EditorToolbar: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const {
    activeTabId,
    tabs,
    saveStatus,
    saveActiveFile,
    saveAllFiles,
    autoSaveMode,
    setAutoSaveMode,
    toggleSearch,
    isSearchOpen,
    isReplaceMode,
    toggleExplorer,
    isExplorerOpen,
    toggleProperties,
    isPropertiesOpen,
    activeBottomPanel,
    setActiveBottomPanel,
    editorTheme,
    setEditorTheme,
    fontSize,
    setFontSize,
    problems,
    runTerminalCommand,
  } = useEditorStore();

  const setActiveView = useUiStore((s) => s.setActiveView);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isXmlLayout =
    activeTab?.path.startsWith('app/src/main/res/layout/') && activeTab?.path.endsWith('.xml');

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  return (
    <div className="h-9 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between px-3 text-xs select-none">
      {/* Left Group: File & Edit actions */}
      <div className="flex items-center gap-1">
        {/* Save button */}
        <button
          onClick={() => saveActiveFile()}
          disabled={!activeTabId || saveStatus === 'saving'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer text-xs font-medium ${
            activeTab?.isDirty
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
              : 'text-neutral-300 hover:bg-neutral-800 disabled:opacity-40'
          }`}
          title={isIndo ? 'Simpan Berkas Aktif (Ctrl+S)' : 'Save Active File (Ctrl+S)'}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isIndo ? 'Simpan' : 'Save'}</span>
          {activeTab?.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        {/* Save All */}
        <button
          onClick={() => saveAllFiles()}
          className="p-1.5 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          title={isIndo ? 'Simpan Semua Berkas (Ctrl+Shift+S)' : 'Save All Files (Ctrl+Shift+S)'}
        >
          <Files className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* Format Document */}
        <button
          onClick={() => {
            const evt = new CustomEvent('editor-format-document');
            window.dispatchEvent(evt);
          }}
          disabled={!activeTabId}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          title={isIndo ? 'Format Dokumen (Shift+Alt+F)' : 'Format Document (Shift+Alt+F)'}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isIndo ? 'Format' : 'Format'}</span>
        </button>

        {/* Find */}
        <button
          onClick={() => toggleSearch(false)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isSearchOpen && !isReplaceMode
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
          title={isIndo ? 'Cari Teks (Ctrl+F)' : 'Find Text (Ctrl+F)'}
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Replace */}
        <button
          onClick={() => toggleSearch(true)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isSearchOpen && isReplaceMode
              ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
          title={isIndo ? 'Ganti Teks (Ctrl+H)' : 'Replace Text (Ctrl+H)'}
        >
          <Replace className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* Auto-save selector */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <span className="hidden lg:inline">{isIndo ? 'Simpan Otomatis:' : 'Auto Save:'}</span>
          <select
            value={autoSaveMode}
            onChange={(e) => setAutoSaveMode(e.target.value as AutoSaveMode)}
            className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded px-1.5 py-0.5 text-[11px] focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="off">{isIndo ? 'Mati (Off)' : 'Off'}</option>
            <option value="afterDelay">{isIndo ? 'Dengan Jeda' : 'After Delay'}</option>
            <option value="onFocusChange">{isIndo ? 'Saat Pindah Fokus' : 'On Focus'}</option>
          </select>
        </div>

        {/* Direct Open in Visual Designer button */}
        {isXmlLayout && (
          <>
            <div className="h-4 w-px bg-neutral-800 mx-1" />
            <button
              onClick={() => setActiveView('visual-designer')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
              title={isIndo ? 'Buka XML ini dalam kanvas Visual Designer' : 'Open this XML in Visual Designer canvas'}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Buka di Visual Designer' : 'Open in Visual Designer'}</span>
            </button>
          </>
        )}
      </div>

      {/* Right Group: Layout & Panel Toggles */}
      <div className="flex items-center gap-1">
        {/* Quick Build debug button */}
        <button
          onClick={() => {
            setActiveBottomPanel('terminal');
            runTerminalCommand('./gradlew assembleDebug');
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors cursor-pointer"
          title={isIndo ? 'Jalankan Gradle assembleDebug' : 'Run Gradle assembleDebug'}
        >
          <Play className="w-3 h-3 text-emerald-400" />
          <span className="hidden xl:inline">assembleDebug</span>
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* Problems Badge Toggle */}
        <button
          onClick={() =>
            setActiveBottomPanel(activeBottomPanel === 'problems' ? null : 'problems')
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer text-xs ${
            activeBottomPanel === 'problems'
              ? 'bg-neutral-800 text-blue-400'
              : 'text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200'
          }`}
          title={isIndo ? 'Tampilkan Masalah (Problems)' : 'Show Problems'}
        >
          <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
          <span className="flex items-center gap-1 text-[11px]">
            {errorCount > 0 && <span className="text-red-400 font-bold">{errorCount}</span>}
            {warningCount > 0 && <span className="text-amber-400">{warningCount}</span>}
            {errorCount === 0 && warningCount === 0 && <span className="text-neutral-400">0</span>}
          </span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={() =>
            setActiveBottomPanel(activeBottomPanel === 'terminal' ? null : 'terminal')
          }
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeBottomPanel === 'terminal'
              ? 'bg-neutral-800 text-blue-400'
              : 'text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200'
          }`}
          title={isIndo ? 'Terminal (Ctrl+`)' : 'Terminal (Ctrl+`)'}
        >
          <Terminal className="w-3.5 h-3.5" />
        </button>

        {/* Outline / Properties Toggle */}
        <button
          onClick={() => toggleProperties()}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isPropertiesOpen
              ? 'bg-neutral-800 text-blue-400'
              : 'text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200'
          }`}
          title={isIndo ? 'Toggle Panel Outline' : 'Toggle Outline Panel'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* File Explorer Toggle */}
        <button
          onClick={() => toggleExplorer()}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isExplorerOpen
              ? 'bg-neutral-800 text-blue-400'
              : 'text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200'
          }`}
          title={isIndo ? 'Toggle Penjelajah File (Ctrl+B)' : 'Toggle Explorer (Ctrl+B)'}
        >
          <Sidebar className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* Font size zoom */}
        <div className="flex items-center gap-0.5 text-neutral-400">
          <button
            onClick={() => setFontSize(fontSize - 1)}
            className="p-1 hover:text-white cursor-pointer"
            title={isIndo ? 'Perkecil Font' : 'Decrease Font'}
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] w-4 text-center font-mono">{fontSize}</span>
          <button
            onClick={() => setFontSize(fontSize + 1)}
            className="p-1 hover:text-white cursor-pointer"
            title={isIndo ? 'Perbesar Font' : 'Increase Font'}
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="p-1.5 rounded text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
          title={
            editorTheme === 'vs-dark'
              ? isIndo
                ? 'Ganti ke Tema Terang'
                : 'Switch to Light Theme'
              : isIndo
              ? 'Ganti ke Tema Gelap'
              : 'Switch to Dark Theme'
          }
        >
          {editorTheme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
