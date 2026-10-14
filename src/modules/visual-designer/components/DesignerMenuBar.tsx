/**
 * Nusantara App Builder - Visual Designer Menu Bar
 * Menus: File, Edit, View, Insert, Screen, Project, Help
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Eye,
  PlusCircle,
  FileCode,
  HelpCircle,
  FolderOpen,
  Layers,
  Plus,
  Star,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { ComponentType } from '../../../types/visualDesigner';

interface DesignerMenuBarProps {
  onOpenScreenManager?: () => void;
}

export const DesignerMenuBar: React.FC<DesignerMenuBarProps> = ({ onOpenScreenManager }) => {
  const { lang } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const saveDesign = useDesignerStore((s) => s.saveDesign);
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const history = useDesignerStore((s) => s.history);
  const future = useDesignerStore((s) => s.future);
  const selectedComponentId = useDesignerStore((s) => s.selectedComponentId);
  const deleteComponent = useDesignerStore((s) => s.deleteComponent);
  const duplicateComponent = useDesignerStore((s) => s.duplicateComponent);
  const zoomIn = useDesignerStore((s) => s.zoomIn);
  const zoomOut = useDesignerStore((s) => s.zoomOut);
  const resetZoom = useDesignerStore((s) => s.resetZoom);
  const toggleOrientation = useDesignerStore((s) => s.toggleOrientation);
  const togglePreviewMode = useDesignerStore((s) => s.togglePreviewMode);
  const isPreviewMode = useDesignerStore((s) => s.isPreviewMode);
  const generateAndroidLayouts = useDesignerStore((s) => s.generateAndroidLayouts);
  const addComponent = useDesignerStore((s) => s.addComponent);
  const design = useDesignerStore((s) => s.design);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);
  const addScreen = useDesignerStore((s) => s.addScreen);
  const duplicateScreen = useDesignerStore((s) => s.duplicateScreen);
  const deleteScreen = useDesignerStore((s) => s.deleteScreen);
  const setStartScreen = useDesignerStore((s) => s.setStartScreen);

  const activeProject = useProjectStore((s) => s.activeProject);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const executeAction = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const isIndo = lang === 'id';

  return (
    <div
      ref={menuRef}
      className="h-7 w-full bg-neutral-900 border-b border-neutral-800 text-neutral-300 flex items-center px-3 select-none text-xs gap-1 relative z-30"
    >
      {/* FILE */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'file' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Berkas' : 'File'}
        </button>
        {openMenu === 'file' && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <button
              onClick={() =>
                executeAction(async () => {
                  const success = await saveDesign();
                  if (success) showToast(isIndo ? 'Desain visual tersimpan' : 'Visual design saved');
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Simpan Desain' : 'Save Design'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Ctrl+S</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('project-detail'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Detail Proyek' : 'Project Details'}</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('dashboard'))}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 cursor-pointer border-t border-neutral-800"
            >
              {isIndo ? 'Kembali ke Dasbor' : 'Return to Dashboard'}
            </button>
          </div>
        )}
      </div>

      {/* EDIT */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'edit' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Ubah' : 'Edit'}
        </button>
        {openMenu === 'edit' && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <button
              onClick={() => executeAction(undo)}
              disabled={!canUndo}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                canUndo ? 'hover:bg-blue-600 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Undo2 className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Urungkan' : 'Undo'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Ctrl+Z</span>
            </button>
            <button
              onClick={() => executeAction(redo)}
              disabled={!canRedo}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                canRedo ? 'hover:bg-blue-600 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Redo2 className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Ulangi' : 'Redo'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Ctrl+Y</span>
            </button>
            <div className="h-[1px] bg-neutral-800 my-1" />
            <button
              onClick={() => {
                if (selectedComponentId) executeAction(() => duplicateComponent(selectedComponentId));
              }}
              disabled={!selectedComponentId}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                selectedComponentId ? 'hover:bg-blue-600 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Gandakan Komponen' : 'Duplicate'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Ctrl+D</span>
            </button>
            <button
              onClick={() => {
                if (selectedComponentId) executeAction(() => deleteComponent(selectedComponentId));
              }}
              disabled={!selectedComponentId}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-rose-400 ${
                selectedComponentId ? 'hover:bg-rose-600 hover:text-white cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Hapus Komponen' : 'Delete'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Del</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'view' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Tampilan' : 'View'}
        </button>
        {openMenu === 'view' && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <button
              onClick={() => executeAction(zoomIn)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Perbesar' : 'Zoom In'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">+</span>
            </button>
            <button
              onClick={() => executeAction(zoomOut)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Perkecil' : 'Zoom Out'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">-</span>
            </button>
            <button
              onClick={() => executeAction(resetZoom)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Reset Zoom (100%)' : 'Reset Zoom'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Ctrl+0</span>
            </button>
            <div className="h-[1px] bg-neutral-800 my-1" />
            <button
              onClick={() => executeAction(toggleOrientation)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Ubah Orientasi Layar' : 'Toggle Orientation'}</span>
            </button>
            <button
              onClick={() => executeAction(togglePreviewMode)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                <span>{isPreviewMode ? (isIndo ? 'Mode Desain' : 'Design Mode') : (isIndo ? 'Mode Pratinjau Interaktif' : 'Interactive Preview')}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* INSERT */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('insert')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'insert' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Sisipkan' : 'Insert'}
        </button>
        {openMenu === 'insert' && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <button
              onClick={() => executeAction(() => addComponent('heading'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Judul Utama (H1)' : 'Heading (H1)'}</span>
            </button>
            <button
              onClick={() => executeAction(() => addComponent('text'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Teks Paragraf' : 'Text View'}</span>
            </button>
            <button
              onClick={() => executeAction(() => addComponent('button'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Tombol (MaterialButton)' : 'Material Button'}</span>
            </button>
            <button
              onClick={() => executeAction(() => addComponent('textField'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Kolom Teks (Input)' : 'Text Field'}</span>
            </button>
            <button
              onClick={() => executeAction(() => addComponent('card'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Kartu (CardView)' : 'Card View'}</span>
            </button>
            <button
              onClick={() => executeAction(() => addComponent('image'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>+ {isIndo ? 'Gambar (ImageView)' : 'Image View'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SCREEN */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('screen')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'screen' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Layar' : 'Screen'}
        </button>
        {openMenu === 'screen' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            {onOpenScreenManager && (
              <button
                onClick={() => executeAction(onOpenScreenManager)}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between cursor-pointer font-medium text-blue-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isIndo ? 'Kelola Layar...' : 'Manage Screens...'}</span>
                </div>
              </button>
            )}
            <button
              onClick={() =>
                executeAction(() => {
                  if (onOpenScreenManager) {
                    onOpenScreenManager();
                  } else {
                    const count = (design?.screens.length || 0) + 1;
                    addScreen(`Layar Baru ${count}`);
                    showToast(isIndo ? 'Layar baru ditambahkan' : 'New screen added');
                  }
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Tambah Layar Baru' : 'Add New Screen'}</span>
            </button>
            <button
              onClick={() =>
                executeAction(() => {
                  if (activeScreenId) {
                    duplicateScreen(activeScreenId);
                    showToast(isIndo ? 'Layar berhasil digandakan' : 'Screen duplicated');
                  }
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Duplikasi Layar Aktif' : 'Duplicate Current Screen'}</span>
            </button>
            <button
              onClick={() =>
                executeAction(() => {
                  if (activeScreenId) {
                    setStartScreen(activeScreenId);
                    showToast(isIndo ? 'Ditetapkan sebagai layar utama (Launcher)' : 'Set as main starter screen');
                  }
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{isIndo ? 'Jadikan Layar Utama (Launcher)' : 'Set as Main Launcher'}</span>
            </button>
            <div className="h-[1px] bg-neutral-800 my-1" />
            <button
              onClick={() =>
                executeAction(() => {
                  if (activeScreenId) {
                    const ok = deleteScreen(activeScreenId);
                    if (ok) {
                      showToast(isIndo ? 'Layar berhasil dihapus' : 'Screen deleted');
                    } else {
                      showToast(
                        isIndo
                          ? 'Tidak dapat menghapus layar satu-satunya dalam proyek'
                          : 'Cannot delete the only screen in project'
                      );
                    }
                  }
                })
              }
              className="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white text-rose-400 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Hapus Layar Aktif' : 'Delete Current Screen'}</span>
            </button>
          </div>
        )}
      </div>

      {/* PROJECT */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('project')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'project' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Proyek' : 'Project'}
        </button>
        {openMenu === 'project' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <button
              onClick={() => executeAction(generateAndroidLayouts)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center gap-2 cursor-pointer text-blue-300 hover:text-white font-medium"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>{isIndo ? 'Hasilkan Android XML Layout' : 'Generate Android XML'}</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('project-detail'))}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-800 text-neutral-300 flex items-center gap-2 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Buka Pengaturan Proyek' : 'Open Project Settings'}</span>
            </button>
          </div>
        )}
      </div>

      {/* HELP */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'help' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {isIndo ? 'Bantuan' : 'Help'}
        </button>
        {openMenu === 'help' && (
          <div className="absolute left-0 top-full mt-1 w-60 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl py-1 z-50 text-xs">
            <div className="px-3 py-2 text-[11px] text-neutral-400 border-b border-neutral-800">
              <span className="font-semibold text-neutral-200">Nusantara Visual Designer (Phase 3)</span>
              <p className="mt-0.5">Drag-and-drop visual Android layout engine.</p>
            </div>
            <div className="px-3 py-1.5 text-[11px] text-neutral-300 space-y-1">
              <div className="flex justify-between"><span>{isIndo ? 'Simpan' : 'Save'}:</span> <span className="font-mono text-neutral-400">Ctrl+S</span></div>
              <div className="flex justify-between"><span>Undo / Redo:</span> <span className="font-mono text-neutral-400">Ctrl+Z / Ctrl+Y</span></div>
              <div className="flex justify-between"><span>{isIndo ? 'Gandakan' : 'Duplicate'}:</span> <span className="font-mono text-neutral-400">Ctrl+D</span></div>
              <div className="flex justify-between"><span>{isIndo ? 'Hapus' : 'Delete'}:</span> <span className="font-mono text-neutral-400">Delete</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Active Project Badge */}
      {activeProject && (
        <div className="ml-auto flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-neutral-300">{activeProject.name}</span>
          <span className="text-neutral-500">({activeProject.packageId})</span>
        </div>
      )}
    </div>
  );
};
