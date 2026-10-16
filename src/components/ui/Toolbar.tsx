/**
 * Nusantara App Builder - Desktop Toolbar
 * Action buttons: New Project, Open Project, Save, Language, Theme, Settings, SDK Check
 */

import React from 'react';
import {
  FolderPlus,
  FolderOpen,
  Save,
  Languages,
  Sun,
  Moon,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProjectStore } from '../../store/projectStore';
import { useEnvStore } from '../../store/envStore';

export const Toolbar: React.FC = () => {
  const { t, lang, setLanguage } = useTranslation();
  const openWizard = useUiStore((s) => s.openWizard);
  const setOpenProjectModalOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);

  const theme = useSettingsStore((s) => s.settings.appearance.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const envStatus = useEnvStore((s) => s.status);
  const checkEnvironment = useEnvStore((s) => s.checkEnvironment);

  const toggleLanguage = () => {
    const nextLang = lang === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
    showToast(nextLang === 'id' ? 'Bahasa: Bahasa Indonesia' : 'Language: English');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif');
  };

  const handleSave = () => {
    if (activeProject) {
      showToast(`${t.menu.save}: ${activeProject.name}`);
    } else {
      showToast('Tidak ada proyek aktif yang dibuka');
    }
  };

  return (
    <div className="h-10 w-full bg-neutral-900 border-b border-neutral-800 text-neutral-300 flex items-center justify-between px-3 select-none text-xs shrink-0 dark:bg-neutral-900 dark:border-neutral-800">
      {/* Left zone: Primary actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={openWizard}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
          title={t.toolbar.newProject}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.toolbar.newProject}</span>
        </button>

        <button
          onClick={() => setOpenProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          title={t.toolbar.openProject}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.toolbar.openProject}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={!activeProject}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${
            activeProject
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer'
              : 'text-neutral-400 cursor-not-allowed'
          }`}
          title={t.toolbar.save}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.toolbar.save}</span>
        </button>

        {activeProject && (
          <>
            <div className="h-4 w-[1px] bg-neutral-800 mx-1" />
            <button
              onClick={() => {
                setActiveView('project-detail');
                useProjectStore.getState().validateCurrentProject();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer text-xs"
              title={t.toolbar.validate}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">{t.toolbar.validate}</span>
            </button>
            <button
              onClick={() => {
                setActiveView('build-run');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer text-xs font-medium shadow-xs"
              title="Build Center (APK/AAB)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden md:inline">Build Center</span>
            </button>
          </>
        )}
      </div>

      {/* Right zone: System toggles & Settings */}
      <div className="flex items-center gap-1.5">
        {/* Toolchain quick status */}
        <button
          onClick={() => {
            checkEnvironment();
            setActiveView('android-sdk');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            envStatus.overallReady
              ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/50'
              : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900 border border-amber-800/50'
          }`}
          title="Status Android SDK & JDK"
        >
          {envStatus.overallReady ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden md:inline">
            {envStatus.overallReady ? 'SDK Ready' : 'SDK Check'}
          </span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Language switch */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          title={`Ubah Bahasa / Switch Language (${lang.toUpperCase()})`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="font-semibold">{lang.toUpperCase()}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          title={theme === 'dark' ? t.settings.themeLight : t.settings.themeDark}
          aria-label={theme === 'dark' ? t.settings.themeLight : t.settings.themeDark}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-300" />
          )}
        </button>

        {/* Settings view */}
        <button
          onClick={() => setActiveView('settings')}
          className="flex items-center justify-center w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          title={t.toolbar.settings}
          aria-label={t.toolbar.settings}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
