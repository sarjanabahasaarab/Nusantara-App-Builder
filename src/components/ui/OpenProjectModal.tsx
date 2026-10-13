/**
 * Nusantara App Builder - Open Existing Project Modal
 */

import React, { useState } from 'react';
import { FolderOpen, X, ArrowRight, FolderGit2 } from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';

export const OpenProjectModal: React.FC = () => {
  const { t } = useTranslation();
  const isOpen = useUiStore((s) => s.openProjectModalOpen);
  const setIsOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const projects = useProjectStore((s) => s.projects);
  const openProject = useProjectStore((s) => s.openProject);

  const [customPath, setCustomPath] = useState('');

  if (!isOpen) return null;

  const handleOpenFromList = async (id: string) => {
    const success = await openProject(id);
    if (success) {
      setIsOpen(false);
      setActiveView('project-detail');
      showToast('Proyek berhasil dibuka');
    }
  };

  const handleOpenFromPath = async () => {
    const match = projects.find(
      (p) => p.location.toLowerCase() === customPath.trim().toLowerCase()
    );
    if (match) {
      await handleOpenFromList(match.id);
    } else {
      showToast('Jalur direktori tidak ditemukan dalam indeks lokal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden text-neutral-200">
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2 text-blue-400">
            <FolderOpen className="w-4 h-4" />
            <h3 className="font-semibold text-sm text-neutral-100">
              {t.menu.openProject}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Pilih dari Proyek Tersimpan
            </label>
            {projects.length === 0 ? (
              <div className="p-4 bg-neutral-950 rounded border border-neutral-800 text-center text-neutral-400">
                Belum ada proyek tersimpan. Silakan buat proyek baru.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 bg-neutral-950 p-2 rounded border border-neutral-800">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleOpenFromList(p.id)}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-medium text-neutral-200 group-hover:text-blue-400">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate max-w-xs">
                          {p.location}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-800">
            <label className="block text-neutral-300 font-medium mb-1.5">
              Atau masukkan jalur folder proyek manual
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="C:\Users\Developer\NusantaraProjects\MyApp"
                className="flex-1 px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
              />
              <button
                onClick={handleOpenFromPath}
                disabled={!customPath.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded font-medium transition-colors cursor-pointer"
              >
                Buka
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end text-xs">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {t.wizard.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
