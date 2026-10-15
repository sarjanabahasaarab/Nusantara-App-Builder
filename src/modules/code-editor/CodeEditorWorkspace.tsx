/**
 * Nusantara App Builder - Code Editor Workspace
 * Phase 4: Professional Android IDE integrating Project Engine, Monaco Editor,
 * File Explorer, Bottom Panels, and Visual Designer Synchronization.
 */

import React, { useEffect, useRef } from 'react';
import { EditorMenuBar } from './components/EditorMenuBar';
import { EditorToolbar } from './components/EditorToolbar';
import { FileExplorer } from './components/FileExplorer';
import { EditorTabBar } from './components/EditorTabBar';
import { MonacoEditorView } from './components/MonacoEditorView';
import { PropertiesOutlinePanel } from './components/PropertiesOutlinePanel';
import { BottomPanels } from './components/BottomPanels';
import { EditorStatusBar } from './components/EditorStatusBar';
import { QuickOpenModal } from './components/QuickOpenModal';
import { GoToLineModal } from './components/GoToLineModal';
import { CloseTabConfirmModal } from './components/CloseTabConfirmModal';
import { VisualSyncModal } from './components/VisualSyncModal';
import { CrudModals } from './components/CrudModals';
import { useEditorStore } from './store/editorStore';
import { useProjectStore } from '../../store/projectStore';

export const CodeEditorWorkspace: React.FC = () => {
  const {
    activeProjectId,
    initProject,
    isExplorerOpen,
    explorerWidth,
    setExplorerWidth,
    isPropertiesOpen,
    propertiesWidth,
    setPropertiesWidth,
    saveActiveFile,
    saveAllFiles,
    closeTab,
    activeTabId,
    toggleSearch,
    toggleExplorer,
    setQuickOpenVisible,
    setGoToLineVisible,
    setActiveBottomPanel,
    activeBottomPanel,
  } = useEditorStore();

  const activeProject = useProjectStore((s) => s.activeProject);

  // Auto initialize project if switched
  useEffect(() => {
    if (activeProject && activeProject.id !== activeProjectId) {
      initProject(activeProject.id);
    }
  }, [activeProject, activeProjectId, initProject]);

  // Global IDE Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd combos
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          if (e.shiftKey) {
            saveAllFiles();
          } else {
            saveActiveFile();
          }
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setQuickOpenVisible(true);
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setGoToLineVisible(true);
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          toggleExplorer();
        } else if (e.key === '`') {
          e.preventDefault();
          setActiveBottomPanel(activeBottomPanel === 'terminal' ? null : 'terminal');
        } else if (e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          if (activeTabId) {
            closeTab(activeTabId);
          }
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleSearch(false);
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          toggleSearch(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    saveActiveFile,
    saveAllFiles,
    setQuickOpenVisible,
    setGoToLineVisible,
    toggleExplorer,
    setActiveBottomPanel,
    activeBottomPanel,
    activeTabId,
    closeTab,
    toggleSearch,
  ]);

  // Left Explorer Resizer
  const explorerResizingRef = useRef(false);
  const handleExplorerResizeStart = (e: React.MouseEvent) => {
    explorerResizingRef.current = true;
    const startX = e.clientX;
    const startWidth = explorerWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!explorerResizingRef.current) return;
      const deltaX = ev.clientX - startX;
      setExplorerWidth(startWidth + deltaX);
    };

    const handleMouseUp = () => {
      explorerResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Right Properties Resizer
  const propertiesResizingRef = useRef(false);
  const handlePropertiesResizeStart = (e: React.MouseEvent) => {
    propertiesResizingRef.current = true;
    const startX = e.clientX;
    const startWidth = propertiesWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      if (!propertiesResizingRef.current) return;
      const deltaX = startX - ev.clientX;
      setPropertiesWidth(startWidth + deltaX);
    };

    const handleMouseUp = () => {
      propertiesResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* 1. IDE Menu Bar */}
      <EditorMenuBar />

      {/* 2. IDE Action Toolbar */}
      <EditorToolbar />

      {/* 3. Center Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: File Explorer Sidebar */}
        {isExplorerOpen && (
          <div style={{ width: `${explorerWidth}px` }} className="h-full shrink-0 relative">
            <FileExplorer />
            {/* Split Drag Handle */}
            <div
              onMouseDown={handleExplorerResizeStart}
              className="absolute top-0 -right-0.5 w-1 h-full hover:bg-blue-500 cursor-col-resize z-30 transition-colors"
            />
          </div>
        )}

        {/* Center: Tabs & Monaco Editor */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <EditorTabBar />
          <div className="flex-1 overflow-hidden relative">
            <MonacoEditorView />
          </div>
        </div>

        {/* Right: Properties / Outline Panel */}
        {isPropertiesOpen && (
          <div style={{ width: `${propertiesWidth}px` }} className="h-full shrink-0 relative">
            {/* Split Drag Handle */}
            <div
              onMouseDown={handlePropertiesResizeStart}
              className="absolute top-0 -left-0.5 w-1 h-full hover:bg-blue-500 cursor-col-resize z-30 transition-colors"
            />
            <PropertiesOutlinePanel />
          </div>
        )}
      </div>

      {/* 4. Resizable Bottom Diagnostics / Terminal Panels */}
      <BottomPanels />

      {/* 5. Desktop Status Bar */}
      <EditorStatusBar />

      {/* Interactive Modals */}
      <QuickOpenModal />
      <GoToLineModal />
      <CloseTabConfirmModal />
      <VisualSyncModal />
      <CrudModals />
    </div>
  );
};
