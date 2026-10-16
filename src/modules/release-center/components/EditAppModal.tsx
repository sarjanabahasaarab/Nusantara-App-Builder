/**
 * Nusantara App Builder - Edit App Settings Modal (Release Center)
 * Phase 8: Quick configuration of App Name, Package ID, Description, and Android SDK targets.
 */

import React, { useState } from 'react';
import { Settings, X, Check, AlertCircle, Smartphone } from 'lucide-react';
import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { useProjectStore } from '../../../store/projectStore';
import { useTranslation } from '../../localization/useTranslation';
import { validatePackageId } from '../../../validation/projectValidator';

export const EditAppModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useReleaseCenterStore((s) => s.isEditAppModalOpen);
  const setIsOpen = useReleaseCenterStore((s) => s.setIsEditAppModalOpen);
  const activeProject = useProjectStore((s) => s.activeProject);
  const updateProjectMetadata = useProjectStore((s) => s.updateProjectMetadata);
  const runValidation = useReleaseCenterStore((s) => s.runValidation);
  const projectFiles = useProjectStore((s) => s.files);

  const [name, setName] = useState(activeProject?.name || '');
  const [displayName, setDisplayName] = useState(activeProject?.displayName || activeProject?.name || '');
  const [packageId, setPackageId] = useState(activeProject?.packageId || '');
  const [description, setDescription] = useState(activeProject?.description || '');
  const [minSdk, setMinSdk] = useState(activeProject?.minSdk || 24);
  const [targetSdk, setTargetSdk] = useState(activeProject?.targetSdk || 34);
  const [compileSdk, setCompileSdk] = useState(activeProject?.compileSdk || 34);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !activeProject) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pkgErrors = validatePackageId(packageId.trim());
    if (pkgErrors.length > 0) {
      setError(lang === 'id' ? pkgErrors[0].messageId : pkgErrors[0].message);
      return;
    }

    updateProjectMetadata({
      name: name.trim(),
      displayName: displayName.trim(),
      packageId: packageId.trim(),
      description: description.trim(),
      minSdk,
      targetSdk,
      compileSdk,
    });

    // Re-run validation
    const updated = {
      ...activeProject,
      name: name.trim(),
      displayName: displayName.trim(),
      packageId: packageId.trim(),
      description: description.trim(),
      minSdk,
      targetSdk,
      compileSdk,
    };
    runValidation(updated, projectFiles);

    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Pengaturan Aplikasi (App Settings)' : 'Edit App Settings'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Perbarui metadata identitas aplikasi dan target Android SDK'
                  : 'Update application identity metadata and Android SDK targets'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              {lang === 'id' ? 'Nama Tampilan Aplikasi (App Name)' : 'App Display Name'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              {lang === 'id' ? 'ID Paket (Package ID / Application ID)' : 'Package ID (Application ID)'}
            </label>
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              placeholder="id.nusantara.myapp"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              {lang === 'id'
                ? 'Harus berformat reverse-domain unik (contoh: id.nusantara.appku). Hindari com.example untuk release.'
                : 'Must be unique reverse domain (e.g. id.nusantara.myapp). Avoid com.example for production.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              {lang === 'id' ? 'Deskripsi Aplikasi' : 'App Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Min SDK</label>
              <input
                type="number"
                min={21}
                max={35}
                value={minSdk}
                onChange={(e) => setMinSdk(parseInt(e.target.value) || 24)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Target SDK</label>
              <input
                type="number"
                min={30}
                max={35}
                value={targetSdk}
                onChange={(e) => setTargetSdk(parseInt(e.target.value) || 34)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Compile SDK</label>
              <input
                type="number"
                min={30}
                max={35}
                value={compileSdk}
                onChange={(e) => setCompileSdk(parseInt(e.target.value) || 34)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/20"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'id' ? 'Simpan Pengaturan' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
