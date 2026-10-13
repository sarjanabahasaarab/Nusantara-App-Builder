/**
 * Nusantara App Builder - Windows Desktop Title Bar
 */

import React from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useTranslation } from '../../modules/localization/useTranslation';

export const TitleBar: React.FC = () => {
  const { t } = useTranslation();
  const activeProject = useProjectStore((s) => s.activeProject);
  const isWindowMaximized = useUiStore((s) => s.isWindowMaximized);
  const toggleMaximize = useUiStore((s) => s.toggleMaximize);
  const showToast = useUiStore((s) => s.showToast);

  const handleMinimize = () => {
    showToast(t.menu.minimize);
  };

  const handleClose = () => {
    if (activeProject) {
      useProjectStore.getState().closeActiveProject();
      showToast(t.menu.closeProject);
    } else {
      showToast(t.menu.exit);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-8 w-full bg-neutral-900 border-b border-neutral-800 text-neutral-300 flex items-center justify-between px-2 select-none text-xs shrink-0 z-50 dark:bg-neutral-950 dark:border-neutral-800"
    >
      {/* Left zone: Brand and active project indicator */}
      <div className="flex items-center gap-2">
        {/* Indonesian Garuda / Nusantara Shield Icon */}
        <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
          N
        </div>
        <span className="font-semibold text-neutral-200 tracking-tight">
          Nusantara App Builder
        </span>

        {activeProject ? (
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span>—</span>
            <span className="text-neutral-200 font-medium">{activeProject.name}</span>
            <span className="text-[10px] font-mono text-neutral-400">[{activeProject.packageId}]</span>
          </div>
        ) : (
          <span className="text-neutral-400 hidden sm:inline">
            — {t.app.tagline}
          </span>
        )}
      </div>

      {/* Right zone: Window controls */}
      <div className="flex items-center">
        <button
          onClick={handleMinimize}
          title={t.menu.minimize}
          aria-label={t.menu.minimize}
          className="w-10 h-8 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleMaximize}
          title={isWindowMaximized ? 'Restore' : t.menu.maximize}
          aria-label={isWindowMaximized ? 'Restore' : t.menu.maximize}
          className="w-10 h-8 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          {isWindowMaximized ? (
            <Copy className="w-3.5 h-3.5" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </button>
        <button
          onClick={handleClose}
          title={t.menu.exit}
          aria-label={t.menu.exit}
          className="w-10 h-8 flex items-center justify-center hover:bg-red-600 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
