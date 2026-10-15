/**
 * Nusantara App Builder - Code Editor Menu Bar
 * Phase 4: Professional IDE Menu Bar with bilingual support and keyboard shortcut mappings.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileCode,
  FolderPlus,
  Save,
  RotateCcw,
  RotateCw,
  Search,
  Replace,
  AlignLeft,
  Terminal,
  Play,
  FileQuestion,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { useUiStore } from '../../../store/uiStore';

export const EditorMenuBar: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const {
    saveActiveFile,
    saveAllFiles,
    closeTab,
    closeAllTabs,
    activeTabId,
    tabs,
    toggleSearch,
    setQuickOpenVisible,
    setGoToLineVisible,
    setNewItemModal,
    setActiveBottomPanel,
    toggleExplorer,
    toggleProperties,
    runTerminalCommand,
    clearTerminal,
    cancelRunningTerminal,
    activeTerminalTask,
    editorTheme,
    setEditorTheme,
    toggleWordWrap,
  } = useEditorStore();

  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (openMenu !== null) {
      setOpenMenu(menu);
    }
  };

  const executeAction = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isXmlLayout = activeTab?.path.startsWith('app/src/main/res/layout/') && activeTab?.path.endsWith('.xml');

  return (
    <div
      ref={menuBarRef}
      className="h-7 bg-neutral-900 border-b border-neutral-800 flex items-center px-2 text-xs select-none z-30"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          onMouseEnter={() => handleMenuHover('file')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'file' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Berkas' : 'File'}
        </button>

        {openMenu === 'file' && (
          <div className="absolute left-0 top-full mt-0.5 w-60 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setNewItemModal({ parentPath: '', isDirectory: false }))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Berkas Baru...' : 'New File...'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+N</span>
            </button>

            <button
              onClick={() => executeAction(() => setNewItemModal({ parentPath: '', isDirectory: true }))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Folder Baru...' : 'New Folder...'}</span>
              </span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() => executeAction(() => setQuickOpenVisible(true))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Buka Berkas...' : 'Open File...'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+P</span>
            </button>

            <button
              onClick={() => executeAction(() => saveActiveFile())}
              disabled={!activeTabId}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Simpan' : 'Save'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+S</span>
            </button>

            <button
              onClick={() => executeAction(() => saveAllFiles())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Simpan Semua' : 'Save All'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+Shift+S</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() => executeAction(() => activeTabId && closeTab(activeTabId))}
              disabled={!activeTabId}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer disabled:opacity-50"
            >
              <span>{isIndo ? 'Tutup Tab' : 'Close Tab'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+W</span>
            </button>

            <button
              onClick={() => executeAction(() => closeAllTabs())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Tutup Semua Tab' : 'Close All Tabs'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          onMouseEnter={() => handleMenuHover('edit')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'edit' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Ubah' : 'Edit'}
        </button>

        {openMenu === 'edit' && (
          <div className="absolute left-0 top-full mt-0.5 w-60 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => showToast('Gunakan shortcut editor Monaco (Ctrl+Z)'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Urungkan' : 'Undo'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+Z</span>
            </button>

            <button
              onClick={() => executeAction(() => showToast('Gunakan shortcut editor Monaco (Ctrl+Y)'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Ulangi' : 'Redo'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+Y</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() => executeAction(() => toggleSearch(false))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Cari' : 'Find'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+F</span>
            </button>

            <button
              onClick={() => executeAction(() => toggleSearch(true))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Replace className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Ganti' : 'Replace'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+H</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() =>
                executeAction(() => {
                  const evt = new CustomEvent('editor-format-document');
                  window.dispatchEvent(evt);
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Format Dokumen' : 'Format Document'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Shift+Alt+F</span>
            </button>
          </div>
        )}
      </div>

      {/* Selection Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('selection')}
          onMouseEnter={() => handleMenuHover('selection')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'selection' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Seleksi' : 'Selection'}
        </button>

        {openMenu === 'selection' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => showToast('Select All (Ctrl+A)'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Pilih Semua' : 'Select All'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+A</span>
            </button>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          onMouseEnter={() => handleMenuHover('view')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'view' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Tampilan' : 'View'}
        </button>

        {openMenu === 'view' && (
          <div className="absolute left-0 top-full mt-0.5 w-60 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => toggleExplorer())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Penjelajah File' : 'File Explorer'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+B</span>
            </button>

            <button
              onClick={() => executeAction(() => toggleProperties())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Outline / Properti' : 'Outline / Properties'}</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() => executeAction(() => setActiveBottomPanel('problems'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Panel Masalah (Problems)' : 'Problems Panel'}</span>
            </button>

            <button
              onClick={() => executeAction(() => setActiveBottomPanel('output'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Panel Keluaran (Output)' : 'Output Panel'}</span>
            </button>

            <button
              onClick={() => executeAction(() => setActiveBottomPanel('build'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Panel Build' : 'Build Panel'}</span>
            </button>

            <button
              onClick={() => executeAction(() => setActiveBottomPanel('terminal'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Terminal Terintegrasi' : 'Terminal'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+`</span>
            </button>

            <div className="my-1 border-t border-neutral-800" />

            <button
              onClick={() => executeAction(() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Ganti Tema (Gelap / Terang)' : 'Toggle Theme (Dark / Light)'}</span>
            </button>

            <button
              onClick={() => executeAction(() => toggleWordWrap())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Bungkus Teks (Word Wrap)' : 'Word Wrap'}</span>
              <span className="text-[10px] text-neutral-400">Alt+Z</span>
            </button>
          </div>
        )}
      </div>

      {/* Go Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('go')}
          onMouseEnter={() => handleMenuHover('go')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'go' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Navigasi' : 'Go'}
        </button>

        {openMenu === 'go' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setQuickOpenVisible(true))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Ke Berkas...' : 'Go to File...'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+P</span>
            </button>

            <button
              onClick={() => executeAction(() => setGoToLineVisible(true))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Ke Baris...' : 'Go to Line...'}</span>
              <span className="text-[10px] text-neutral-400">Ctrl+G</span>
            </button>
          </div>
        )}
      </div>

      {/* Run Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('run')}
          onMouseEnter={() => handleMenuHover('run')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'run' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          {isIndo ? 'Jalankan' : 'Run'}
        </button>

        {openMenu === 'run' && (
          <div className="absolute left-0 top-full mt-0.5 w-64 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() =>
                executeAction(() => {
                  setActiveBottomPanel('terminal');
                  runTerminalCommand('./gradlew assembleDebug');
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isIndo ? 'Build Debug (assembleDebug)' : 'Build Debug (assembleDebug)'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">F5</span>
            </button>

            <button
              onClick={() =>
                executeAction(() => {
                  setActiveBottomPanel('terminal');
                  runTerminalCommand('./gradlew clean');
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Bersihkan Proyek (clean)' : 'Clean Project (clean)'}</span>
            </button>

            <button
              onClick={() =>
                executeAction(() => {
                  setActiveBottomPanel('terminal');
                  runTerminalCommand('./gradlew check');
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Jalankan Pengujian (check)' : 'Run Tests (check)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Terminal Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('terminal')}
          onMouseEnter={() => handleMenuHover('terminal')}
          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
            openMenu === 'terminal' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-300 hover:bg-neutral-800/70'
          }`}
        >
          Terminal
        </button>

        {openMenu === 'terminal' && (
          <div className="absolute left-0 top-full mt-0.5 w-56 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setActiveBottomPanel('terminal'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Buka Terminal' : 'Open Terminal'}</span>
              </span>
              <span className="text-[10px] text-neutral-400">Ctrl+`</span>
            </button>

            <button
              onClick={() => executeAction(() => clearTerminal())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <span>{isIndo ? 'Bersihkan Terminal' : 'Clear Terminal'}</span>
            </button>

            {activeTerminalTask && activeTerminalTask.status === 'running' && (
              <button
                onClick={() => executeAction(() => cancelRunningTerminal())}
                className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center justify-between cursor-pointer text-red-400"
              >
                <span>{isIndo ? 'Batalkan Proses Berjalan' : 'Cancel Running Process'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Visual Designer Direct Switch Link */}
      {isXmlLayout && (
        <div className="ml-auto flex items-center">
          <button
            onClick={() => setActiveView('visual-designer')}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] transition-colors cursor-pointer"
            title={isIndo ? 'Buka layout XML ini langsung di Visual Designer' : 'Open this XML layout in Visual Designer'}
          >
            <Layers className="w-3 h-3" />
            <span>{isIndo ? 'Buka di Visual Designer' : 'Open in Visual Designer'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
