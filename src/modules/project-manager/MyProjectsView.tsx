/**
 * Nusantara App Builder - My Projects View
 */

import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  FolderPlus,
  Search,
  Calendar,
  ExternalLink,
  Trash2,
  FileCode2,
  Layers,
  Sparkles,
  Palette,
  Code2,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useProjectStore } from '../../store/projectStore';
import { useUiStore } from '../../store/uiStore';
import { ProjectMetadata, ProjectTemplateId } from '../../types/project';

export const MyProjectsView: React.FC = () => {
  const { t, lang } = useTranslation();
  const projects = useProjectStore((s) => s.projects);
  const openProject = useProjectStore((s) => s.openProject);
  const openWizard = useUiStore((s) => s.openWizard);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const setDeleteModalProject = useUiStore((s) => s.setDeleteModalProject);
  const showToast = useUiStore((s) => s.showToast);

  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState<'all' | ProjectTemplateId>('all');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.packageId.toLowerCase().includes(search.toLowerCase());
      const matchTemplate = templateFilter === 'all' || p.template === templateFilter;
      return matchSearch && matchTemplate;
    });
  }, [projects, search, templateFilter]);

  const handleOpen = async (p: ProjectMetadata) => {
    const success = await openProject(p.id);
    if (success) {
      setActiveView('project-detail');
      showToast(`Membuka proyek: ${p.name}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 p-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            <span>{t.sidebar.myProjects}</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Kelola dan periksa seluruh proyek Android yang tersimpan pada workstation lokal Anda.
          </p>
        </div>

        <button
          onClick={openWizard}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t.toolbar.newProject}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.dashboard.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Filter buttons (Interactive filter controls with buttons per anti-slop guidelines) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded border border-neutral-800 text-xs">
          <button
            onClick={() => setTemplateFilter('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              templateFilter === 'all'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setTemplateFilter('empty-android')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              templateFilter === 'empty-android'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Empty Android
          </button>
          <button
            onClick={() => setTemplateFilter('basic-activity')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              templateFilter === 'basic-activity'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Basic Activity
          </button>
          <button
            onClick={() => setTemplateFilter('webview-starter')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              templateFilter === 'webview-starter'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            WebView Starter
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-lg bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-400">
          Tidak ada proyek yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-blue-400">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-neutral-100 hover:text-blue-400 cursor-pointer" onClick={() => handleOpen(p)}>
                        {p.displayName || p.name}
                      </h3>
                      <div className="text-[11px] font-mono text-neutral-400 truncate max-w-[180px]">
                        {p.packageId} · <span className="text-neutral-400">{p.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 mt-2">
                  {p.description || 'Tidak ada deskripsi.'}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] space-y-1 font-mono text-neutral-400">
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="text-neutral-300">{p.template}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versi:</span>
                    <span className="text-blue-400">v{p.versionName || '1.0.0'} (code: {p.versionCode || 1})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Berkas Sumber:</span>
                    <span className="text-neutral-300">{p.filesCount} file</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diperbarui:</span>
                    <span className="text-neutral-300">
                      {new Date(p.updatedAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpen(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Proyek</span>
                  </button>

                  <button
                    onClick={async () => {
                      await openProject(p.id);
                      setActiveView('visual-designer');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer font-medium"
                    title={lang === 'id' ? 'Buka di Visual Designer' : 'Open in Visual Designer'}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Desain</span>
                  </button>

                  <button
                    onClick={async () => {
                      await openProject(p.id);
                      setActiveView('code-editor');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer font-medium"
                    title={lang === 'id' ? 'Buka di Editor Kode' : 'Open in Code Editor'}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Kode</span>
                  </button>
                </div>

                <button
                  onClick={() => setDeleteModalProject(p)}
                  className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Hapus Proyek"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
