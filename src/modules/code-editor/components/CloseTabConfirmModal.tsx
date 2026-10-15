/**
 * Nusantara App Builder - Close Tab Dirty Confirmation Modal
 * Phase 4: Protects user from accidental loss of unsaved changes.
 */

import React from 'react';
import { AlertCircle, Save, Trash2, X } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

export const CloseTabConfirmModal: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { closeDirtyTabCandidate, setCloseDirtyTabCandidate, saveActiveFile, closeTab } =
    useEditorStore();

  if (!closeDirtyTabCandidate) return null;

  const handleSaveAndClose = async () => {
    await saveActiveFile();
    closeTab(closeDirtyTabCandidate.id, true);
  };

  const handleDontSaveAndClose = () => {
    closeTab(closeDirtyTabCandidate.id, true);
  };

  const handleCancel = () => {
    setCloseDirtyTabCandidate(null);
  };

  return (
    <div
      onClick={handleCancel}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-5 text-xs text-neutral-200 animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-100">
              {isIndo
                ? 'Simpan perubahan sebelum menutup?'
                : 'Do you want to save changes before closing?'}
            </h3>
            <p className="mt-1 text-neutral-400 text-xs">
              {isIndo
                ? `Berkas "${closeDirtyTabCandidate.name}" memiliki perubahan yang belum disimpan. Perubahan Anda akan hilang jika Anda tidak menyimpannya.`
                : `File "${closeDirtyTabCandidate.name}" has unsaved changes. Your changes will be lost if you don't save them.`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {/* Cancel */}
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium cursor-pointer"
          >
            {isIndo ? 'Batal' : 'Cancel'}
          </button>

          {/* Don't Save */}
          <button
            onClick={handleDontSaveAndClose}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-red-950/60 text-red-300 hover:text-red-200 border border-neutral-700 hover:border-red-800 font-medium cursor-pointer"
          >
            {isIndo ? 'Jangan Simpan' : "Don't Save"}
          </button>

          {/* Save */}
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Simpan' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
