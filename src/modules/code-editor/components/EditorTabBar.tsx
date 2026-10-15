/**
 * Nusantara App Builder - Code Editor Tab Bar
 * Phase 4: Multi-tab navigation with dirty indicators, context menu, and keyboard/mouse shortcuts.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, FileCode, FileText, FileSpreadsheet, Copy } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { EditorTab } from '../types';
import { useUiStore } from '../../../store/uiStore';

function getTabIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.kt') || lower.endsWith('.kts')) {
    return <FileCode className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  }
  if (lower.endsWith('.xml')) {
    if (lower === 'androidmanifest.xml') {
      return <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  }
  if (lower.endsWith('.gradle') || lower.includes('gradle')) {
    return <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  }
  return <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
}

export const EditorTabBar: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { tabs, activeTabId, setActiveTab, closeTab, closeAllTabs, closeOtherTabs } =
    useEditorStore();
  const showToast = useUiStore((s) => s.showToast);

  const [tabContextMenu, setTabContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tab: EditorTab | null;
  }>({ visible: false, x: 0, y: 0, tab: null });

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTabContextMenu({ visible: false, x: 0, y: 0, tab: null });
      }
    };
    window.addEventListener('mousedown', handleClose);
    return () => window.removeEventListener('mousedown', handleClose);
  }, []);

  const handleTabContextMenu = (e: React.MouseEvent, tab: EditorTab) => {
    e.preventDefault();
    e.stopPropagation();
    setTabContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tab,
    });
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    showToast(isIndo ? 'Jalur berkas disalin ke clipboard' : 'Path copied');
    setTabContextMenu({ visible: false, x: 0, y: 0, tab: null });
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="h-9 bg-neutral-950 border-b border-neutral-800 flex items-center overflow-x-auto select-none shrink-0 no-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                // Middle click closes tab
                e.preventDefault();
                closeTab(tab.id);
              }
            }}
            onContextMenu={(e) => handleTabContextMenu(e, tab)}
            className={`h-full flex items-center gap-2 px-3 border-r border-neutral-800 text-xs cursor-pointer transition-colors group relative ${
              isActive
                ? 'bg-neutral-900 text-neutral-100 font-medium border-t-2 border-t-blue-500'
                : 'text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200'
            }`}
            title={tab.path}
          >
            {getTabIcon(tab.name)}
            <span className="truncate max-w-[140px]">{tab.name}</span>

            {/* Unsaved indicator or Close button */}
            <div className="flex items-center ml-1">
              {tab.isDirty ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center rounded-sm hover:bg-neutral-700/60"
                  title={isIndo ? 'Ada perubahan belum disimpan' : 'Unsaved changes'}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:hidden" />
                  <X className="w-3 h-3 hidden group-hover:block text-neutral-300" />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="w-4 h-4 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neutral-700/60 hover:text-white transition-opacity cursor-pointer"
                  title={isIndo ? 'Tutup (Ctrl+W)' : 'Close'}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Tab Context Menu */}
      {tabContextMenu.visible && tabContextMenu.tab && (
        <div
          ref={menuRef}
          style={{ top: `${tabContextMenu.y}px`, left: `${tabContextMenu.x}px` }}
          className="fixed z-50 w-48 bg-neutral-900 border border-neutral-700 shadow-2xl rounded py-1 text-xs text-neutral-200 select-none animate-in fade-in"
        >
          <button
            onClick={() => {
              if (tabContextMenu.tab) closeTab(tabContextMenu.tab.id);
              setTabContextMenu({ visible: false, x: 0, y: 0, tab: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>{isIndo ? 'Tutup Tab' : 'Close Tab'}</span>
            <span className="text-[10px] text-neutral-400">Ctrl+W</span>
          </button>

          <button
            onClick={() => {
              if (tabContextMenu.tab) closeOtherTabs(tabContextMenu.tab.id);
              setTabContextMenu({ visible: false, x: 0, y: 0, tab: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>{isIndo ? 'Tutup Tab Lainnya' : 'Close Other Tabs'}</span>
          </button>

          <button
            onClick={() => {
              closeAllTabs();
              setTabContextMenu({ visible: false, x: 0, y: 0, tab: null });
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>{isIndo ? 'Tutup Semua Tab' : 'Close All Tabs'}</span>
          </button>

          <div className="my-1 border-t border-neutral-800" />

          <button
            onClick={() => tabContextMenu.tab && handleCopyPath(tabContextMenu.tab.path)}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Salin Jalur Berkas' : 'Copy File Path'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
