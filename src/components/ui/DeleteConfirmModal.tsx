/**
 * Nusantara App Builder - Safe Project Deletion Modal
 * Strictly differentiates between "Remove from Recent History" and "Delete Physical Folder".
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ArchiveX, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';

export const DeleteConfirmModal: React.FC = () => {
  const { t } = useTranslation();
  const project = useUiStore((s) => s.deleteModalProject);
  const setDeleteModalProject = useUiStore((s) => s.setDeleteModalProject);
  const showToast = useUiStore((s) => s.showToast);

  const removeProjectFromRecent = useProjectStore((s) => s.removeProjectFromRecent);
  const deleteProjectPermanently = useProjectStore((s) => s.deleteProjectPermanently);

  const [deleteMode, setDeleteMode] = useState<'recent-only' | 'physical'>('recent-only');
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!project) return null;

  const handleClose = () => {
    setDeleteModalProject(null);
    setConfirmNameInput('');
    setDeleteMode('recent-only');
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      if (deleteMode === 'recent-only') {
        await removeProjectFromRecent(project.id);
        showToast(`Catatan proyek "${project.name}" telah dihapus dari riwayat.`);
      } else {
        if (confirmNameInput.trim().toLowerCase() !== project.name.trim().toLowerCase()) {
          setIsProcessing(false);
          return;
        }
        await deleteProjectPermanently(project.id);
        showToast(`Proyek "${project.name}" dan berkas fisiknya berhasil dihapus.`);
      }
      handleClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus proyek');
    } finally {
      setIsProcessing(false);
    }
  };

  const isConfirmDisabled =
    isProcessing ||
    (deleteMode === 'physical' &&
      confirmNameInput.trim().toLowerCase() !== project.name.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-semibold text-sm text-neutral-100">
              {t.deleteModal.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <p className="text-neutral-300">
              {t.deleteModal.desc}
            </p>
            <div className="mt-2 p-2.5 bg-neutral-800/80 rounded border border-neutral-700/60 font-mono text-[11px]">
              <div className="font-semibold text-neutral-100">{project.name}</div>
              <div className="text-neutral-400 text-[10px] truncate mt-0.5">{project.location}</div>
            </div>
          </div>

          {/* Options Selection */}
          <div className="space-y-2.5">
            {/* Option 1: Recent Only (Safe) */}
            <label
              className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                deleteMode === 'recent-only'
                  ? 'bg-blue-950/40 border-blue-600 text-neutral-100'
                  : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === 'recent-only'}
                onChange={() => setDeleteMode('recent-only')}
                className="mt-0.5 text-blue-600 focus:ring-0"
              />
              <div className="space-y-1">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <ArchiveX className="w-4 h-4 text-blue-400" />
                  <span>{t.deleteModal.optionRecentOnly}</span>
                  <span className="text-[10px] text-blue-400 font-mono">(Aman)</span>
                </div>
                <div className="text-neutral-400 text-[11px] leading-relaxed">
                  {t.deleteModal.optionRecentOnlyDesc}
                </div>
              </div>
            </label>

            {/* Option 2: Physical Disk Deletion (Dangerous) */}
            <label
              className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                deleteMode === 'physical'
                  ? 'bg-red-950/40 border-red-600 text-neutral-100'
                  : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <input
                type="radio"
                name="deleteMode"
                checked={deleteMode === 'physical'}
                onChange={() => setDeleteMode('physical')}
                className="mt-0.5 text-red-600 focus:ring-0"
              />
              <div className="space-y-1">
                <div className="font-semibold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>{t.deleteModal.optionPhysical}</span>
                  <span className="text-[10px] text-red-400 font-mono">(Permanen)</span>
                </div>
                <div className="text-neutral-400 text-[11px] leading-relaxed">
                  {t.deleteModal.optionPhysicalDesc}
                </div>
              </div>
            </label>
          </div>

          {/* If physical deletion selected: require typing name */}
          {deleteMode === 'physical' && (
            <div className="p-3 bg-red-950/30 border border-red-900/60 rounded space-y-2">
              <label className="block text-neutral-300 font-medium text-[11px]">
                {t.deleteModal.typeToConfirm}
              </label>
              <input
                type="text"
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                placeholder={project.name}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-red-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-2 text-xs">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {t.deleteModal.cancelButton}
          </button>
          <button
            onClick={handleExecute}
            disabled={isConfirmDisabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
              deleteMode === 'physical'
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.deleteModal.confirmButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
