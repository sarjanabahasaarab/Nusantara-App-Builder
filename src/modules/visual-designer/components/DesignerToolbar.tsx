/**
 * Nusantara App Builder - Visual Designer Toolbar (Phase 3)
 * Action controls: Save, Undo, Redo, Device Preset, Orientation, Zoom, Preview Mode, Screen Selector, and XML Generation.
 */

import React from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Code2,
  CheckCircle2,
  Loader2,
  Monitor,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import { useUiStore } from '../../../store/uiStore';
import { DEVICE_PRESETS } from '../../../types/visualDesigner';

interface DesignerToolbarProps {
  onOpenScreenManager: () => void;
}

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({ onOpenScreenManager }) => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const design = useDesignerStore((s) => s.design);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);
  const setActiveScreen = useDesignerStore((s) => s.setActiveScreen);
  const saveDesign = useDesignerStore((s) => s.saveDesign);
  const isSaving = useDesignerStore((s) => s.isSaving);
  const isDirty = useDesignerStore((s) => s.isDirty);
  const lastSaved = useDesignerStore((s) => s.lastSaved);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const history = useDesignerStore((s) => s.history);
  const future = useDesignerStore((s) => s.future);

  const zoom = useDesignerStore((s) => s.zoom);
  const zoomIn = useDesignerStore((s) => s.zoomIn);
  const zoomOut = useDesignerStore((s) => s.zoomOut);
  const resetZoom = useDesignerStore((s) => s.resetZoom);

  const orientation = useDesignerStore((s) => s.orientation);
  const toggleOrientation = useDesignerStore((s) => s.toggleOrientation);
  const devicePreset = useDesignerStore((s) => s.devicePreset);
  const setDevicePreset = useDesignerStore((s) => s.setDevicePreset);

  const isPreviewMode = useDesignerStore((s) => s.isPreviewMode);
  const togglePreviewMode = useDesignerStore((s) => s.togglePreviewMode);

  const generateAndroidLayouts = useDesignerStore((s) => s.generateAndroidLayouts);

  const isIndo = lang === 'id';
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const handleSave = async () => {
    const success = await saveDesign();
    if (success) {
      showToast(isIndo ? 'Desain visual tersimpan' : 'Visual design saved');
    }
  };

  const handleGenerate = async () => {
    const res = await generateAndroidLayouts();
    if (res.success) {
      showToast(
        isIndo
          ? `Android XML Layout berhasil dibuat (${res.results.length} layar)`
          : `Android XML Layout generated successfully (${res.results.length} screens)`
      );
    }
  };

  const activeScreen = design?.screens.find((s) => s.id === activeScreenId);

  return (
    <div className="h-11 w-full bg-neutral-900 border-b border-neutral-800 text-neutral-300 flex items-center justify-between px-3 select-none text-xs shrink-0">
      {/* LEFT: Save, Undo, Redo, Screen Selector */}
      <div className="flex items-center gap-1.5">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-medium cursor-pointer shadow-xs ${
            isDirty
              ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
          }`}
          title={isIndo ? 'Simpan Desain (Ctrl+S)' : 'Save Design (Ctrl+S)'}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isIndo ? 'Simpan' : 'Save'}</span>
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 -mr-1" />}
        </button>

        {/* Last saved indicator */}
        {lastSaved && (
          <span className="hidden lg:inline text-[10px] text-neutral-400 pl-1">
            {isIndo ? 'Tersimpan' : 'Saved'} {lastSaved}
          </span>
        )}

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded transition-colors ${
            canUndo
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer'
              : 'text-neutral-400 cursor-not-allowed opacity-50'
          }`}
          title={isIndo ? 'Urungkan (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded transition-colors ${
            canRedo
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer'
              : 'text-neutral-400 cursor-not-allowed opacity-50'
          }`}
          title={isIndo ? 'Ulangi (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Screen Picker */}
        {design && design.screens.length > 0 && (
          <div className="flex items-center gap-1 bg-neutral-800/80 rounded px-2 py-1 border border-neutral-700/60">
            <span className="text-[11px] text-neutral-400">{isIndo ? 'Layar:' : 'Screen:'}</span>
            <select
              value={activeScreenId}
              onChange={(e) => setActiveScreen(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer"
            >
              {design.screens.map((screen) => (
                <option key={screen.id} value={screen.id} className="bg-neutral-900 text-neutral-100">
                  {screen.name} {screen.id === design.startScreenId ? '★' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenScreenManager}
              className="ml-1 p-1 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
              title={isIndo ? 'Kelola Layar (Tambah/Gandakan/Hapus)' : 'Manage Screens'}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* CENTER: Device Preset, Orientation, Zoom */}
      <div className="flex items-center gap-2">
        {/* Device selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-neutral-800/80 rounded px-2 py-1 border border-neutral-700/60">
          <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={devicePreset}
            onChange={(e) => setDevicePreset(e.target.value)}
            className="bg-transparent text-neutral-200 text-xs focus:outline-hidden cursor-pointer"
          >
            {DEVICE_PRESETS.map((d) => (
              <option key={d.id} value={d.id} className="bg-neutral-900 text-neutral-100">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Orientation toggle */}
        <button
          onClick={toggleOrientation}
          className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors cursor-pointer border ${
            orientation === 'landscape'
              ? 'bg-blue-900/60 border-blue-700 text-blue-200'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
          }`}
          title={
            orientation === 'portrait'
              ? isIndo
                ? 'Ubah ke Mode Lanskap'
                : 'Switch to Landscape'
              : isIndo
              ? 'Ubah ke Mode Potret'
              : 'Switch to Portrait'
          }
        >
          <RotateCcw className={`w-3.5 h-3.5 ${orientation === 'landscape' ? 'rotate-90' : ''}`} />
          <span className="hidden md:inline capitalize">{orientation}</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center bg-neutral-800/80 rounded border border-neutral-700/60 px-1 py-0.5">
          <button
            onClick={zoomOut}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white cursor-pointer"
            title={isIndo ? 'Perkecil' : 'Zoom Out'}
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span
            onClick={resetZoom}
            className="px-1.5 text-[11px] font-mono font-medium text-neutral-200 cursor-pointer hover:text-white"
            title={isIndo ? 'Klik untuk Reset Zoom (100%)' : 'Click to Reset Zoom'}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 hover:bg-neutral-700 rounded text-neutral-300 hover:text-white cursor-pointer"
            title={isIndo ? 'Perbesar' : 'Zoom In'}
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* RIGHT: Preview Mode & Generate Android XML */}
      <div className="flex items-center gap-2">
        {/* Preview interactive toggle */}
        <button
          onClick={togglePreviewMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
            isPreviewMode
              ? 'bg-emerald-900/70 border-emerald-700 text-emerald-200 shadow-xs'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
          }`}
          title={
            isPreviewMode
              ? isIndo
                ? 'Kembali ke Mode Desain Kanvas'
                : 'Return to Canvas Design Mode'
              : isIndo
              ? 'Uji Coba Interaktif Layar'
              : 'Interactive Screen Preview'
          }
        >
          {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">
            {isPreviewMode ? (isIndo ? 'Keluar Pratinjau' : 'Exit Preview') : (isIndo ? 'Uji Interaktif' : 'Interactive')}
          </span>
        </button>

        {/* Generate Android XML Layout */}
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer shadow-xs"
          title={isIndo ? 'Hasilkan Android XML Layout & Resources' : 'Generate Android XML Layout'}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="font-semibold">{isIndo ? 'Generate Android XML' : 'Generate XML'}</span>
        </button>
      </div>
    </div>
  );
};
