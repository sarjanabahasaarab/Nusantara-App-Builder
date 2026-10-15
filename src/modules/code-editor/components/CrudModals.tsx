/**
 * Nusantara App Builder - File Explorer CRUD Modals
 * Phase 4: Create File/Folder, Rename, and Safe Delete Confirmation Dialogs.
 */

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, FilePlus, FolderPlus, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

export const CrudModals: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const {
    newItemModal,
    setNewItemModal,
    confirmCreateItem,
    renameItemCandidate,
    setRenameItemCandidate,
    confirmRenameItem,
    deleteItemCandidate,
    setDeleteItemCandidate,
    confirmDeleteItem,
  } = useEditorStore();

  const [inputName, setInputName] = useState('');

  useEffect(() => {
    if (newItemModal) {
      setInputName('');
    }
  }, [newItemModal]);

  useEffect(() => {
    if (renameItemCandidate) {
      setInputName(renameItemCandidate.name);
    }
  }, [renameItemCandidate]);

  // 1. Create File/Folder Modal
  if (newItemModal) {
    const isDir = newItemModal.isDirectory;
    const parentPath = newItemModal.parentPath || 'root';

    return (
      <div
        onClick={() => setNewItemModal(null)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-5 text-xs text-neutral-200 animate-in fade-in"
        >
          <div className="flex items-center gap-2 mb-3">
            {isDir ? (
              <FolderPlus className="w-4 h-4 text-amber-400" />
            ) : (
              <FilePlus className="w-4 h-4 text-blue-400" />
            )}
            <h3 className="text-sm font-semibold text-neutral-100">
              {isDir
                ? isIndo
                  ? 'Buat Folder Baru'
                  : 'New Folder'
                : isIndo
                ? 'Buat Berkas Baru'
                : 'New File'}
            </h3>
          </div>

          <p className="text-[11px] text-neutral-400 mb-2 truncate">
            {isIndo ? 'Lokasi:' : 'Location:'} <span className="font-mono">{parentPath}</span>
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await confirmCreateItem(inputName);
            }}
          >
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder={isDir ? 'components' : 'activity_detail.xml'}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 font-mono"
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewItemModal(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-medium"
              >
                {isIndo ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!inputName.trim()}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer disabled:opacity-50"
              >
                {isIndo ? 'Buat' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Rename File/Folder Modal
  if (renameItemCandidate) {
    return (
      <div
        onClick={() => setRenameItemCandidate(null)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-5 text-xs text-neutral-200 animate-in fade-in"
        >
          <div className="flex items-center gap-2 mb-3">
            <Edit2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              {isIndo ? 'Ubah Nama Berkas / Folder' : 'Rename File or Folder'}
            </h3>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await confirmRenameItem(inputName);
            }}
          >
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameItemCandidate(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-medium"
              >
                {isIndo ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!inputName.trim() || inputName === renameItemCandidate.name}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer disabled:opacity-50"
              >
                {isIndo ? 'Simpan' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Delete Confirmation Modal
  if (deleteItemCandidate) {
    return (
      <div
        onClick={() => setDeleteItemCandidate(null)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-5 text-xs text-neutral-200 animate-in fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-100">
                {isIndo ? 'Konfirmasi Hapus Berkas' : 'Confirm Delete File'}
              </h3>
              <p className="mt-1 text-neutral-400 text-xs">
                {isIndo
                  ? `Apakah Anda yakin ingin menghapus "${deleteItemCandidate.path}"? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`
                  : `Are you sure you want to permanently delete "${deleteItemCandidate.path}"? This action cannot be undone.`}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setDeleteItemCandidate(null)}
              className="px-3.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-medium"
            >
              {isIndo ? 'Batal' : 'Cancel'}
            </button>
            <button
              onClick={async () => {
                await confirmDeleteItem();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Hapus Permanen' : 'Delete Permanently'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
