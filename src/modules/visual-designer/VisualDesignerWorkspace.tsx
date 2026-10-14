/**
 * Nusantara App Builder - Visual Designer Workspace (Phase 3)
 * Full visual designer screen assembling Menu Bar, Toolbar, Component Palette, Phone Canvas, and Properties Panel.
 */

import React, { useEffect, useState } from 'react';
import {
  Palette,
  FolderOpen,
  PlusCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useProjectStore } from '../../store/projectStore';
import { useDesignerStore } from '../../store/designerStore';
import { useUiStore } from '../../store/uiStore';
import { DesignerMenuBar } from './components/DesignerMenuBar';
import { DesignerToolbar } from './components/DesignerToolbar';
import { ComponentPalette } from './components/ComponentPalette';
import { PhoneCanvas } from './components/PhoneCanvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ScreenManagerModal } from './components/ScreenManagerModal';
import { GenerateLayoutModal } from './components/GenerateLayoutModal';

export const VisualDesignerWorkspace: React.FC = () => {
  const { lang } = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const openWizard = useUiStore((s) => s.openWizard);
  const setOpenProjectModalOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const showToast = useUiStore((s) => s.showToast);

  const design = useDesignerStore((s) => s.design);
  const loadDesignForProject = useDesignerStore((s) => s.loadDesignForProject);
  const saveDesign = useDesignerStore((s) => s.saveDesign);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const selectedComponentId = useDesignerStore((s) => s.selectedComponentId);
  const deleteComponent = useDesignerStore((s) => s.deleteComponent);
  const duplicateComponent = useDesignerStore((s) => s.duplicateComponent);
  const resetZoom = useDesignerStore((s) => s.resetZoom);
  const zoomIn = useDesignerStore((s) => s.zoomIn);
  const zoomOut = useDesignerStore((s) => s.zoomOut);
  const autoSaveEnabled = useDesignerStore((s) => s.autoSaveEnabled);
  const errorMessage = useDesignerStore((s) => s.errorMessage);
  const clearError = useDesignerStore((s) => s.clearError);

  const [isScreenManagerOpen, setIsScreenManagerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isIndo = lang === 'id';

  // Load design for current active project
  useEffect(() => {
    if (activeProject) {
      setIsLoading(true);
      loadDesignForProject(activeProject).finally(() => {
        setIsLoading(false);
      });
    }
  }, [activeProject?.id, loadDesignForProject]);

  // Keyboard Shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y, Delete, Ctrl+D, Ctrl+0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input/textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDesign().then((ok) => {
          if (ok) showToast(isIndo ? 'Desain visual tersimpan' : 'Visual design saved');
        });
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedComponentId) duplicateComponent(selectedComponentId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId) {
          e.preventDefault();
          deleteComponent(selectedComponentId);
        }
      } else if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (cmdOrCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
      } else if (cmdOrCtrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    saveDesign,
    undo,
    redo,
    selectedComponentId,
    deleteComponent,
    duplicateComponent,
    resetZoom,
    zoomIn,
    zoomOut,
    isIndo,
    showToast,
  ]);

  // Auto-save routine if enabled
  useEffect(() => {
    if (!autoSaveEnabled) return;
    const interval = setInterval(() => {
      saveDesign();
    }, 45000); // Auto-save every 45s
    return () => clearInterval(interval);
  }, [autoSaveEnabled, saveDesign]);

  // Case 1: No active project opened
  if (!activeProject) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-neutral-950 text-neutral-200 select-none">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-xl">
          <Palette className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {isIndo ? 'Buka Proyek untuk Memulai Visual Designer' : 'Open a Project to Launch Visual Designer'}
        </h2>
        <p className="max-w-md text-xs text-neutral-400 leading-relaxed mb-6">
          {isIndo
            ? 'Visual Designer terhubung langsung dengan Android Project Engine Phase 2. Silakan buka proyek yang ada atau buat proyek Android baru.'
            : 'Visual Designer connects directly to the Phase 2 Android Project Engine. Open an existing project or create a new Android project to begin.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{isIndo ? 'Buka Proyek Tersimpan' : 'Open Existing Project'}</span>
          </button>
          <button
            onClick={openWizard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isIndo ? 'Buat Proyek Android Baru' : 'Create Android Project'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Loading design data
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-300">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <span className="text-xs font-medium">
          {isIndo ? 'Memuat model desain visual Android...' : 'Loading Android visual design model...'}
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 overflow-hidden relative">
      {/* 1. Designer Menu Bar */}
      <DesignerMenuBar />

      {/* 2. Designer Toolbar */}
      <DesignerToolbar onOpenScreenManager={() => setIsScreenManagerOpen(true)} />

      {/* Error banner if any */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-1.5 text-xs text-rose-200 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={clearError}
            className="text-[11px] hover:underline text-rose-300 cursor-pointer"
          >
            {isIndo ? 'Tutup' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* 3. Main Design Area: Left Palette + Center Phone Canvas + Right Properties */}
      <div className="flex-1 flex overflow-hidden relative">
        <ComponentPalette />
        <PhoneCanvas />
        <PropertiesPanel />
      </div>

      {/* 4. Modals */}
      <ScreenManagerModal
        isOpen={isScreenManagerOpen}
        onClose={() => setIsScreenManagerOpen(false)}
      />
      <GenerateLayoutModal />
    </div>
  );
};
