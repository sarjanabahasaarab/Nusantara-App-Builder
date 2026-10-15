/**
 * Nusantara App Builder - Desktop Menu Bar
 * Menus: File, Edit, View, Project, Tools, Window, Help
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';

export const MenuBar: React.FC = () => {
  const { t } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  const openWizard = useUiStore((s) => s.openWizard);
  const setOpenProjectModalOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleMaximize = useUiStore((s) => s.toggleMaximize);
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);
  const closeActiveProject = useProjectStore((s) => s.closeActiveProject);

  const theme = useSettingsStore((s) => s.settings.appearance.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const executeAction = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  return (
    <div
      ref={menuBarRef}
      className="h-7 w-full bg-neutral-900 border-b border-neutral-800 text-neutral-300 flex items-center px-2 select-none text-xs gap-1 relative z-40 dark:bg-neutral-900 dark:border-neutral-800"
    >
      {/* FILE MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'file' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.file}
        </button>
        {openMenu === 'file' && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(openWizard)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.newProject}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+N</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('website-to-apk'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.sidebar.websiteToApk}</span>
              <span className="text-neutral-400 text-[11px]">Wizard</span>
            </button>
            <button
              onClick={() => executeAction(() => setOpenProjectModalOpen(true))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.openProject}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+O</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              onClick={() => executeAction(() => showToast(t.menu.save))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.save}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+S</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast(t.menu.saveAll))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.saveAll}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+Shift+S</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              disabled={!activeProject}
              onClick={() => executeAction(closeActiveProject)}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                activeProject
                  ? 'hover:bg-blue-600 hover:text-white cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>{t.menu.closeProject}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+W</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              onClick={() => executeAction(() => showToast(t.menu.exit))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.exit}</span>
              <span className="text-neutral-400 text-[11px]">Alt+F4</span>
            </button>
          </div>
        )}
      </div>

      {/* EDIT MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'edit' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.edit}
        </button>
        {openMenu === 'edit' && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => showToast(t.menu.undo))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.undo}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+Z</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast(t.menu.redo))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.redo}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+Y</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              onClick={() => executeAction(() => showToast(t.menu.cut))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.cut}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+X</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast(t.menu.copy))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.copy}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+C</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast(t.menu.paste))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.paste}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+V</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              onClick={() => executeAction(() => setActiveView('settings'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.preferences}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+,</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'view' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.view}
        </button>
        {openMenu === 'view' && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(toggleSidebar)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.toggleSidebar}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+B</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              onClick={() => executeAction(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{theme === 'dark' ? t.settings.themeLight : t.settings.themeDark}</span>
              <span className="text-neutral-400 text-[11px]">Alt+T</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast(t.menu.fullscreen))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.fullscreen}</span>
              <span className="text-neutral-400 text-[11px]">F11</span>
            </button>
          </div>
        )}
      </div>

      {/* PROJECT MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('project')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'project' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.project}
        </button>
        {openMenu === 'project' && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setActiveView('my-projects'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.sidebar.myProjects}</span>
            </button>
            <button
              disabled={!activeProject}
              onClick={() => executeAction(() => setActiveView('project-detail'))}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                activeProject
                  ? 'hover:bg-blue-600 hover:text-white cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>{t.menu.projectSettings}</span>
            </button>
            <button
              disabled={!activeProject}
              onClick={() => executeAction(() => {
                setActiveView('project-detail');
                useProjectStore.getState().validateCurrentProject();
              })}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                activeProject
                  ? 'hover:bg-blue-600 hover:text-white cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>{t.menu.validateProject}</span>
            </button>
            <button
              disabled={!activeProject}
              onClick={() => executeAction(() => {
                setActiveView('project-detail');
                useProjectStore.getState().runDebugBuild();
              })}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                activeProject
                  ? 'hover:bg-blue-600 hover:text-white cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>{t.menu.buildDebug}</span>
            </button>
            <div className="border-t border-neutral-800 my-1" />
            <button
              disabled={!activeProject}
              onClick={() => executeAction(() => showToast(t.menu.cleanBuild))}
              className={`w-full text-left px-3 py-1.5 flex justify-between ${
                activeProject
                  ? 'hover:bg-blue-600 hover:text-white cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              <span>{t.menu.cleanBuild}</span>
            </button>
          </div>
        )}
      </div>

      {/* TOOLS MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('tools')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'tools' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.tools}
        </button>
        {openMenu === 'tools' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setActiveView('website-to-apk'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.sidebar.websiteToApk}</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('android-sdk'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.androidSdkManager}</span>
            </button>
            <button
              onClick={() => executeAction(() => setActiveView('android-sdk'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.checkEnvironment}</span>
            </button>
          </div>
        )}
      </div>

      {/* WINDOW MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('window')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'window' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.window}
        </button>
        {openMenu === 'window' && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(toggleMaximize)}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.maximize}</span>
            </button>
            <button
              onClick={() => executeAction(() => window.location.reload())}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.reloadWindow}</span>
              <span className="text-neutral-400 text-[11px]">Ctrl+R</span>
            </button>
          </div>
        )}
      </div>

      {/* HELP MENU */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          className={`px-2.5 py-1 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer ${
            openMenu === 'help' ? 'bg-neutral-800 text-white' : ''
          }`}
        >
          {t.menu.help}
        </button>
        {openMenu === 'help' && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-700 shadow-xl rounded py-1 z-50 text-neutral-200">
            <button
              onClick={() => executeAction(() => setActiveView('settings'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.about}</span>
            </button>
            <button
              onClick={() => executeAction(() => showToast('https://github.com/nusantara-app-builder/ide'))}
              className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex justify-between cursor-pointer"
            >
              <span>{t.menu.reportIssue}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
