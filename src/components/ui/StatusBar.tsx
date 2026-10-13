/**
 * Nusantara App Builder - Desktop Status Bar
 * Displays toolchain status, active project details, language, and runtime mode.
 */

import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  FolderGit2,
  Cpu,
  Monitor,
  Terminal,
} from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useProjectStore } from '../../store/projectStore';
import { useEnvStore } from '../../store/envStore';
import { useUiStore } from '../../store/uiStore';
import { isTauriEnvironment } from '../../modules/filesystem/nativeBridge';

export const StatusBar: React.FC = () => {
  const { t, lang } = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const activeFiles = useProjectStore((s) => s.activeFiles);
  const isCreating = useProjectStore((s) => s.isCreating);
  const envStatus = useEnvStore((s) => s.status);
  const setActiveView = useUiStore((s) => s.setActiveView);

  const isDesktop = isTauriEnvironment();

  return (
    <div className="h-6 w-full bg-neutral-900 border-t border-neutral-800 text-neutral-400 flex items-center justify-between px-3 select-none text-[11px] shrink-0 font-mono dark:bg-neutral-950 dark:border-neutral-800">
      {/* Left zone: System and project status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Terminal className="w-3 h-3 text-blue-400" />
          <span>{isCreating ? t.app.statusBusy : t.app.statusReady}</span>
        </div>

        {activeProject ? (
          <button
            onClick={() => setActiveView('project-detail')}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Klik untuk membuka Project Detail"
          >
            <FolderGit2 className="w-3 h-3 text-emerald-400" />
            <span className="font-sans font-medium text-neutral-200">
              {activeProject.name}
            </span>
            <span className="text-[10px] text-neutral-400">
              ({activeFiles.length} files)
            </span>
          </button>
        ) : (
          <span className="text-neutral-400 font-sans hidden sm:inline">
            Tidak ada proyek aktif
          </span>
        )}
      </div>

      {/* Right zone: Toolchain, Language, Platform */}
      <div className="flex items-center gap-3">
        {/* Toolchain SDK Status */}
        <button
          onClick={() => setActiveView('android-sdk')}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Klik untuk melihat detail Android SDK & JDK"
        >
          <Cpu className="w-3 h-3 text-neutral-400" />
          <span>Android SDK 34:</span>
          {envStatus.overallReady ? (
            <span className="text-emerald-400 flex items-center gap-0.5">
              <CheckCircle className="w-2.5 h-2.5" /> OK
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-0.5">
              <AlertCircle className="w-2.5 h-2.5" /> Perlu Cek
            </span>
          )}
        </button>

        <span className="text-neutral-700">|</span>

        {/* Runtime Mode */}
        <div className="flex items-center gap-1 text-neutral-400 hidden sm:flex">
          <Monitor className="w-3 h-3" />
          <span>{isDesktop ? t.status.modeDesktop : t.status.modeWebPreview}</span>
        </div>

        <span className="text-neutral-700">|</span>

        {/* Language indicator */}
        <span className="text-neutral-300 font-semibold uppercase">
          {lang}
        </span>
      </div>
    </div>
  );
};
