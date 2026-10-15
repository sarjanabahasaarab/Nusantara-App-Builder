/**
 * Nusantara App Builder - Dashboard View
 * Phase 2: Android Project Hub with direct validation, debug build triggers, and toolchain readiness.
 */

import React, { useMemo } from 'react';
import {
  FolderPlus,
  FolderOpen,
  Search,
  Cpu,
  Layers,
  ArrowRight,
  Trash2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Calendar,
  FileCode2,
  ShieldCheck,
  PlaySquare,
  Palette,
  Code2,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useEnvStore } from '../../store/envStore';
import { ProjectMetadata } from '../../types/project';

export const DashboardView: React.FC = () => {
  const { t, lang } = useTranslation();
  const openWizard = useUiStore((s) => s.openWizard);
  const setOpenProjectModalOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const setDeleteModalProject = useUiStore((s) => s.setDeleteModalProject);
  const showToast = useUiStore((s) => s.showToast);

  const projects = useProjectStore((s) => s.projects);
  const searchQuery = useProjectStore((s) => s.searchQuery);
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery);
  const openProject = useProjectStore((s) => s.openProject);

  const envStatus = useEnvStore((s) => s.status);
  const checkEnvironment = useEnvStore((s) => s.checkEnvironment);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.displayName && p.displayName.toLowerCase().includes(q)) ||
        p.packageId.toLowerCase().includes(q) ||
        p.template.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // Project statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const native = projects.filter((p) => p.template !== 'webview-starter').length;
    const webview = projects.filter((p) => p.template === 'webview-starter').length;
    return { total, native, webview };
  }, [projects]);

  const handleOpenProject = async (p: ProjectMetadata) => {
    const success = await openProject(p.id);
    if (success) {
      setActiveView('project-detail');
      showToast(`Proyek "${p.displayName || p.name}" dibuka`);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 p-6 select-none">
      {/* Top Welcome Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100">
            {t.dashboard.welcome}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            {t.dashboard.subtitle}
          </p>
        </div>

        <button
          onClick={openWizard}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto shadow-xs"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t.dashboard.createProjectCardTitle}</span>
        </button>
      </div>

      {/* Quick Action Cards & Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Create New Android Project */}
        <button
          onClick={openWizard}
          className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-blue-500/60 hover:bg-neutral-900/90 text-left transition-all group cursor-pointer shadow-xs"
        >
          <div className="w-9 h-9 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div className="font-semibold text-sm text-neutral-100 group-hover:text-blue-400 flex items-center justify-between">
            <span>{t.dashboard.createProjectCardTitle}</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {t.dashboard.createProjectCardDesc}
          </p>
        </button>

        {/* Card 2: Open Existing Project */}
        <button
          onClick={() => setOpenProjectModalOpen(true)}
          className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all group cursor-pointer shadow-xs"
        >
          <div className="w-9 h-9 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="font-semibold text-sm text-neutral-100 group-hover:text-neutral-300 flex items-center justify-between">
            <span>{t.dashboard.openProjectCardTitle}</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {t.dashboard.openProjectCardDesc}
          </p>
        </button>

        {/* Card 3: Toolchain Environment Status */}
        <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>{t.dashboard.toolchainCardTitle}</span>
              </div>
              {envStatus.overallReady ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OK
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Perlu Cek
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>SDK Root:</span>
                <span className={envStatus.components.androidSdk.status === 'installed' ? 'text-emerald-400' : 'text-neutral-400'}>
                  {envStatus.components.androidSdk.status === 'installed' ? 'API 34 Ready' : 'Belum Terhubung'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>JDK (Java 17):</span>
                <span className={envStatus.components.jdk.status === 'installed' ? 'text-emerald-400' : 'text-neutral-400'}>
                  {envStatus.components.jdk.status === 'installed' ? 'Tersedia' : 'Belum Terhubung'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gradle Wrapper:</span>
                <span className="text-emerald-400">8.7 Active</span>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => checkEnvironment()}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
            >
              {t.dashboard.checkToolchainButton}
            </button>
            <button
              onClick={() => setActiveView('android-sdk')}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Detail Toolchain →
            </button>
          </div>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="px-4 py-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-400">{t.dashboard.totalProjects}</div>
            <div className="text-lg font-bold text-neutral-100 font-mono tabular-nums">
              {stats.total}
            </div>
          </div>
          <FolderGit2 className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="px-4 py-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-400">{t.dashboard.androidTemplates}</div>
            <div className="text-lg font-bold text-neutral-100 font-mono tabular-nums">
              {stats.native}
            </div>
          </div>
          <FileCode2 className="w-5 h-5 text-blue-400" />
        </div>
        <div className="px-4 py-3 bg-neutral-900/60 rounded-lg border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-400">{t.dashboard.webviewTemplates}</div>
            <div className="text-lg font-bold text-neutral-100 font-mono tabular-nums">
              {stats.webview}
            </div>
          </div>
          <Layers className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-100">
              {t.dashboard.recentProjects}
            </h2>
            <span className="text-xs text-neutral-400 font-mono tabular-nums">
              ({filteredProjects.length})
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Projects List or Empty State */}
        {projects.length === 0 ? (
          <div className="p-8 rounded-lg bg-neutral-900/40 border border-neutral-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800/80 text-neutral-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-200">
                {t.dashboard.emptyProjectsTitle}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                {t.dashboard.emptyProjectsDesc}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={openWizard}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{t.dashboard.createFirstProject}</span>
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-6 rounded-lg bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-400">
            {t.dashboard.noProjectsFound}
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/50">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <div className="col-span-4">Aplikasi & ID Paket</div>
              <div className="col-span-3">Template & Versi</div>
              <div className="col-span-2">Terakhir Diubah</div>
              <div className="col-span-3 text-right">Tindakan Cepat</div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* Name & Package */}
                  <div className="col-span-4">
                    <button
                      onClick={() => handleOpenProject(p)}
                      className="font-medium text-neutral-200 hover:text-blue-400 transition-colors text-left truncate block max-w-full cursor-pointer"
                    >
                      {p.displayName || p.name}
                    </button>
                    <div className="text-[11px] font-mono text-neutral-400 truncate">
                      {p.packageId} · <span className="text-neutral-400">{p.name}</span>
                    </div>
                  </div>

                  {/* Template & Version */}
                  <div className="col-span-3">
                    <span className="text-neutral-300 font-mono text-[11px]">
                      {p.template === 'empty-android'
                        ? 'Empty Android'
                        : p.template === 'basic-activity'
                        ? 'Basic Activity'
                        : 'WebView Starter'}
                    </span>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      v{p.versionName || '1.0.0'} (code: {p.versionCode || 1}) · {p.filesCount} file
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-neutral-400 text-[11px] flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {new Date(p.updatedAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  {/* Actions: Open, Visual Designer, Code Editor, Delete */}
                  <div className="col-span-3 flex items-center justify-end gap-1.5">
                    <button
                      onClick={async () => {
                        await openProject(p.id);
                        setActiveView('visual-designer');
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                      title={lang === 'id' ? 'Buka di Visual Designer' : 'Open in Visual Designer'}
                    >
                      <Palette className="w-3 h-3" />
                      <span className="hidden xl:inline">{lang === 'id' ? 'Desain' : 'Design'}</span>
                    </button>
                    <button
                      onClick={async () => {
                        await openProject(p.id);
                        setActiveView('code-editor');
                      }}
                      className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                      title={lang === 'id' ? 'Buka di Editor Kode' : 'Open in Code Editor'}
                    >
                      <Code2 className="w-3 h-3" />
                      <span className="hidden xl:inline">{lang === 'id' ? 'Kode' : 'Code'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenProject(p)}
                      className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
                      title="Buka & Periksa Proyek"
                    >
                      Buka
                    </button>
                    <button
                      onClick={() => setDeleteModalProject(p)}
                      className="p-1.5 rounded hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Catatan / Folder"
                      aria-label="Hapus Catatan / Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      <div className="p-5 rounded-lg bg-neutral-900 border border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-neutral-100">
            {t.dashboard.gettingStartedTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80">
            <div className="font-semibold text-neutral-200 mb-1">
              {t.dashboard.step1Title}
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {t.dashboard.step1Desc}
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80">
            <div className="font-semibold text-neutral-200 mb-1">
              {t.dashboard.step2Title}
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {t.dashboard.step2Desc}
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80">
            <div className="font-semibold text-neutral-200 mb-1">
              {t.dashboard.step3Title}
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {t.dashboard.step3Desc}
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80">
            <div className="font-semibold text-neutral-200 mb-1">
              {t.dashboard.step4Title}
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              {t.dashboard.step4Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
