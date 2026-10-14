/**
 * Nusantara App Builder - Screen Manager Modal (Phase 3)
 * Create, rename, duplicate, set launcher, and safely delete Android screens.
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Copy,
  Trash2,
  Star,
  Edit2,
  Check,
  FileCode,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import { useUiStore } from '../../../store/uiStore';

interface ScreenManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenManagerModal: React.FC<ScreenManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const design = useDesignerStore((s) => s.design);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);
  const setActiveScreen = useDesignerStore((s) => s.setActiveScreen);
  const setStartScreen = useDesignerStore((s) => s.setStartScreen);
  const addScreen = useDesignerStore((s) => s.addScreen);
  const renameScreen = useDesignerStore((s) => s.renameScreen);
  const duplicateScreen = useDesignerStore((s) => s.duplicateScreen);
  const deleteScreen = useDesignerStore((s) => s.deleteScreen);

  const [newScreenName, setNewScreenName] = useState('');
  const [newLayoutFileName, setNewLayoutFileName] = useState('');
  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [screenToDelete, setScreenToDelete] = useState<string | null>(null);

  const isIndo = lang === 'id';

  if (!isOpen || !design) return null;

  const handleAddScreen = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newScreenName.trim();
    if (!trimmed) {
      showToast(isIndo ? 'Nama layar tidak boleh kosong' : 'Screen name cannot be empty');
      return;
    }

    const createdId = addScreen(trimmed, newLayoutFileName.trim() || undefined);
    showToast(isIndo ? `Layar '${trimmed}' berhasil dibuat` : `Screen '${trimmed}' created`);
    setNewScreenName('');
    setNewLayoutFileName('');
    setActiveScreen(createdId);
  };

  const handleStartRename = (screenId: string, currentName: string) => {
    setEditingScreenId(screenId);
    setEditNameValue(currentName);
  };

  const handleSaveRename = (screenId: string) => {
    if (editNameValue.trim()) {
      renameScreen(screenId, editNameValue.trim());
      showToast(isIndo ? 'Nama layar diperbarui' : 'Screen renamed');
    }
    setEditingScreenId(null);
  };

  const handleDeleteConfirm = () => {
    if (screenToDelete) {
      const ok = deleteScreen(screenToDelete);
      if (ok) {
        showToast(isIndo ? 'Layar berhasil dihapus' : 'Screen deleted');
      } else {
        showToast(
          isIndo
            ? 'Tidak dapat menghapus layar satu-satunya dalam proyek'
            : 'Cannot delete the only remaining screen'
        );
      }
      setScreenToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none">
      <div className="w-[540px] max-w-[95vw] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-scale-in text-xs text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              {isIndo ? 'Kelola Layar Aplikasi Android' : 'Manage Android Screens'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Screens List */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-2">
          {design.screens.map((screen) => {
            const isActive = screen.id === activeScreenId;
            const isStart = screen.id === design.startScreenId;
            const isEditing = screen.id === editingScreenId;

            return (
              <div
                key={screen.id}
                className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-neutral-800/90 border-blue-500/80'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setStartScreen(screen.id)}
                    className={`p-1 rounded cursor-pointer ${
                      isStart
                        ? 'text-amber-400'
                        : 'text-neutral-500 hover:text-amber-300'
                    }`}
                    title={
                      isStart
                        ? isIndo
                          ? 'Layar Utama (Launcher)'
                          : 'Launcher Screen'
                        : isIndo
                        ? 'Jadikan Layar Utama'
                        : 'Set as Launcher'
                    }
                  >
                    <Star className={`w-4 h-4 ${isStart ? 'fill-current' : ''}`} />
                  </button>

                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="bg-neutral-900 border border-blue-500 rounded px-2 py-0.5 text-xs text-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(screen.id);
                            if (e.key === 'Escape') setEditingScreenId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(screen.id)}
                          className="p-1 rounded bg-blue-600 text-white cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-100 truncate">
                          {screen.name}
                        </span>
                        {isStart && (
                          <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-800/60">
                            LAUNCHER
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                      <FileCode className="w-3 h-3 text-neutral-400" />
                      <span>{screen.layoutFileName}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => {
                        setActiveScreen(screen.id);
                        onClose();
                      }}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer font-medium"
                    >
                      {isIndo ? 'Buka' : 'Open'}
                    </button>
                  )}
                  <button
                    onClick={() => handleStartRename(screen.id, screen.name)}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
                    title={isIndo ? 'Ganti Nama' : 'Rename'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateScreen(screen.id)}
                    className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white cursor-pointer"
                    title={isIndo ? 'Gandakan Layar' : 'Duplicate'}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {design.screens.length > 1 && (
                    <button
                      onClick={() => setScreenToDelete(screen.id)}
                      className="p-1.5 rounded hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 cursor-pointer"
                      title={isIndo ? 'Hapus Layar' : 'Delete Screen'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Screen Form */}
        <form onSubmit={handleAddScreen} className="p-4 border-t border-neutral-800 bg-neutral-950/50 space-y-3">
          <span className="font-semibold text-neutral-300 block">
            {isIndo ? 'Tambah Layar Baru' : 'Add New Screen'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                {isIndo ? 'Nama Layar' : 'Screen Name'}
              </label>
              <input
                type="text"
                value={newScreenName}
                onChange={(e) => {
                  setNewScreenName(e.target.value);
                  if (!newLayoutFileName) {
                    setNewLayoutFileName(
                      `activity_${e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.xml`
                    );
                  }
                }}
                placeholder={isIndo ? 'misal: Profil Pengguna' : 'e.g. User Profile'}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                {isIndo ? 'Nama Berkas Layout XML' : 'Layout XML Filename'}
              </label>
              <input
                type="text"
                value={newLayoutFileName}
                onChange={(e) => setNewLayoutFileName(e.target.value)}
                placeholder="activity_profile.xml"
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Tambah Layar' : 'Create Screen'}</span>
            </button>
          </div>
        </form>

        {/* Delete Confirmation Alert */}
        {screenToDelete && (
          <div className="p-4 bg-rose-950/80 border-t border-rose-800 text-rose-100 flex items-center justify-between">
            <div>
              <div className="font-semibold">{isIndo ? 'Hapus Layar Ini?' : 'Delete This Screen?'}</div>
              <div className="text-[11px] text-rose-300">
                {isIndo
                  ? 'Tindakan ini akan menghapus komponen pada layar ini.'
                  : 'This action will permanently delete components on this screen.'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScreenToDelete(null)}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
              >
                {isIndo ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
              >
                {isIndo ? 'Hapus' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
