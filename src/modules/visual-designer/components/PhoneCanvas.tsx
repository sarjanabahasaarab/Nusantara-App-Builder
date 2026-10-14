/**
 * Nusantara App Builder - Phone Canvas (Phase 3)
 * Realistic Android phone frame with bezel, status bar, orientation, zoom, and live root component renderer.
 */

import React, { useRef, useState } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Smartphone,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useDesignerStore } from '../../../store/designerStore';
import { DEVICE_PRESETS, ComponentType } from '../../../types/visualDesigner';
import { CanvasRenderer } from './CanvasRenderer';
import { useTranslation } from '../../localization/useTranslation';

interface ContextMenuState {
  x: number;
  y: number;
  componentId: string;
}

export const PhoneCanvas: React.FC = () => {
  const { lang } = useTranslation();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const design = useDesignerStore((s) => s.design);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);
  const zoom = useDesignerStore((s) => s.zoom);
  const orientation = useDesignerStore((s) => s.orientation);
  const devicePresetId = useDesignerStore((s) => s.devicePreset);
  const isPreviewMode = useDesignerStore((s) => s.isPreviewMode);
  const selectComponent = useDesignerStore((s) => s.selectComponent);
  const addComponent = useDesignerStore((s) => s.addComponent);
  const duplicateComponent = useDesignerStore((s) => s.duplicateComponent);
  const deleteComponent = useDesignerStore((s) => s.deleteComponent);
  const reorderComponent = useDesignerStore((s) => s.reorderComponent);

  const isIndo = lang === 'id';

  const currentScreen = design?.screens.find((s) => s.id === activeScreenId);
  const preset = DEVICE_PRESETS.find((d) => d.id === devicePresetId) || DEVICE_PRESETS[0];

  // Calculate dimensions based on orientation
  const isLandscape = orientation === 'landscape';
  const frameWidth = isLandscape ? preset.height : preset.width;
  const frameHeight = isLandscape ? preset.width : preset.height;

  // Root drop handler
  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentScreen || isPreviewMode) return;

    const newComponentType = e.dataTransfer.getData('application/nusantara-component') as ComponentType;
    if (newComponentType) {
      addComponent(newComponentType, currentScreen.root.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPreviewMode) {
      selectComponent(null);
      setContextMenu(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    selectComponent(componentId);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      componentId,
    });
  };

  return (
    <div
      ref={canvasContainerRef}
      onClick={handleCanvasBackgroundClick}
      className="flex-1 h-full overflow-auto bg-neutral-950 flex items-center justify-center p-8 select-none relative"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Zoom scale transform wrapper */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className="flex items-center justify-center"
      >
        {/* Android Device Outer Bezel */}
        <div
          className="relative bg-neutral-900 border-[8px] border-neutral-800 rounded-[44px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            maxHeight: '92vh',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
          onDragOver={handleDragOver}
          onDrop={handleRootDrop}
        >
          {/* Top Speaker / Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
            <div className="w-12 h-1 bg-neutral-700/80 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700/60" />
          </div>

          {/* Android Status Bar */}
          <div className="h-7 w-full bg-neutral-950/80 backdrop-blur-xs text-neutral-300 flex items-center justify-between px-6 pt-1 text-[11px] font-medium z-30 shrink-0">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Simulated Action Bar / App Bar */}
          <div className="h-12 w-full bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between px-4 text-xs font-semibold text-white z-20 shrink-0 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{currentScreen ? currentScreen.name : 'Nusantara App'}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-normal">
              {currentScreen ? currentScreen.layoutFileName : 'activity_main.xml'}
            </span>
          </div>

          {/* Device Screen Viewport (Scrollable if overflowing) */}
          <div
            className="flex-1 w-full overflow-y-auto overflow-x-hidden relative"
            style={{
              backgroundColor: currentScreen?.backgroundColor || '#0F172A',
            }}
          >
            {currentScreen ? (
              <CanvasRenderer component={currentScreen.root} isRoot={true} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 text-xs">
                <Smartphone className="w-8 h-8 text-neutral-600 mb-2" />
                <p>{isIndo ? 'Tidak ada layar yang dipilih' : 'No screen selected'}</p>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Pill */}
          <div className="h-4 w-full bg-neutral-950 flex items-center justify-center shrink-0 z-30">
            <div className="w-24 h-1 bg-neutral-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs w-48 animate-fade-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              duplicateComponent(contextMenu.componentId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Gandakan' : 'Duplicate'}</span>
          </button>
          <button
            onClick={() => {
              reorderComponent(contextMenu.componentId, 'up');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-200 flex items-center gap-2 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Pindah ke Atas' : 'Move Up'}</span>
          </button>
          <button
            onClick={() => {
              reorderComponent(contextMenu.componentId, 'down');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-200 flex items-center gap-2 cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Pindah ke Bawah' : 'Move Down'}</span>
          </button>
          <div className="h-[1px] bg-neutral-800 my-1" />
          <button
            onClick={() => {
              deleteComponent(contextMenu.componentId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white text-rose-400 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Hapus' : 'Delete'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
