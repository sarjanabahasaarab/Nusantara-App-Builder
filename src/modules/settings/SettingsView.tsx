/**
 * Nusantara App Builder - Settings View
 * Comprehensive settings panel: General, Appearance, Language, Projects, Android Environment, About.
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Languages,
  FolderGit2,
  Cpu,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useSettingsStore } from '../../store/settingsStore';
import { useEnvStore } from '../../store/envStore';
import { useUiStore } from '../../store/uiStore';
import { ThemeMode, LanguageCode } from '../../types/settings';
import { isTauriEnvironment } from '../../modules/filesystem/nativeBridge';

type SettingsTab = 'general' | 'appearance' | 'language' | 'projects' | 'environment' | 'about';

export const SettingsView: React.FC = () => {
  const { t, lang, setLanguage } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const updateGeneral = useSettingsStore((s) => s.updateGeneralSettings);
  const updateAppearance = useSettingsStore((s) => s.updateAppearanceSettings);
  const updateProjectDefaults = useSettingsStore((s) => s.updateProjectDefaults);
  const updateToolchain = useSettingsStore((s) => s.updateToolchainSettings);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);

  const envStatus = useEnvStore((s) => s.status);
  const isCheckingEnv = useEnvStore((s) => s.isChecking);
  const checkEnvironment = useEnvStore((s) => s.checkEnvironment);

  const showToast = useUiStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Local draft states for text inputs
  const [defaultDir, setDefaultDir] = useState(settings.general.defaultProjectsDirectory);
  const [autoSaveInterval, setAutoSaveInterval] = useState(settings.general.autoSaveIntervalSeconds);
  const [reopenLast, setReopenLast] = useState(settings.general.reopenLastProjectOnStartup);
  const [telemetry, setTelemetry] = useState(settings.general.telemetryEnabled);

  const [packagePrefix, setPackagePrefix] = useState(settings.projectDefaults.defaultPackagePrefix);
  const [sdkPath, setSdkPath] = useState(settings.toolchain.androidSdkPath);
  const [jdkPath, setJdkPath] = useState(settings.toolchain.jdkPath);
  const [gradlePath, setGradlePath] = useState(settings.toolchain.gradlePath);

  const handleSaveAll = () => {
    updateGeneral({
      defaultProjectsDirectory: defaultDir,
      autoSaveIntervalSeconds: autoSaveInterval,
      reopenLastProjectOnStartup: reopenLast,
      telemetryEnabled: telemetry,
    });
    updateProjectDefaults({
      defaultPackagePrefix: packagePrefix,
    });
    updateToolchain({
      androidSdkPath: sdkPath,
      jdkPath: jdkPath,
      gradlePath: gradlePath,
    });
    showToast(t.settings.savedToast);
  };

  const handleRunEnvironmentCheck = async () => {
    updateToolchain({
      androidSdkPath: sdkPath,
      jdkPath: jdkPath,
      gradlePath: gradlePath,
    });
    await checkEnvironment();
    showToast('Pemindaian toolchain selesai.');
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-blue-400" />
            <span>{t.settings.title}</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Reset ke Bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t.settings.saveChanges}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar Tabs + Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Tabs */}
        <div className="w-56 border-r border-neutral-800 bg-neutral-900/60 p-2 space-y-1 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabGeneral}</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabAppearance}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'language'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Languages className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabLanguage}</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <FolderGit2 className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabProjects}</span>
          </button>

          <button
            onClick={() => setActiveTab('environment')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'environment'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabEnvironment}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{t.settings.tabAbout}</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl text-xs space-y-6">
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.settings.defaultProjectsDir}
                </label>
                <input
                  type="text"
                  value={defaultDir}
                  onChange={(e) => setDefaultDir(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.settings.autoSaveInterval}
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                  className="w-32 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reopenLast}
                    onChange={(e) => setReopenLast(e.target.checked)}
                    className="text-blue-600 focus:ring-0 rounded"
                  />
                  <span className="text-neutral-200">{t.settings.reopenLast}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telemetry}
                    onChange={(e) => setTelemetry(e.target.checked)}
                    className="text-blue-600 focus:ring-0 rounded"
                  />
                  <span className="text-neutral-300">{t.settings.telemetry}</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <label className="block text-neutral-200 font-medium mb-2">
                  {t.settings.theme}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['dark', 'light', 'system'] as ThemeMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      className={`p-3 rounded border text-left cursor-pointer transition-colors ${
                        settings.appearance.theme === m
                          ? 'bg-blue-950/40 border-blue-600 text-neutral-100'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      <div className="font-semibold text-neutral-200 capitalize">
                        {m === 'dark' ? t.settings.themeDark : m === 'light' ? t.settings.themeLight : t.settings.themeSystem}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Language */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <label className="block text-neutral-200 font-medium mb-2">
                {t.settings.languageSelect}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLanguage('id')}
                  className={`p-4 rounded border text-left cursor-pointer transition-colors ${
                    lang === 'id'
                      ? 'bg-blue-950/40 border-blue-600 text-neutral-100'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <div className="font-semibold text-neutral-100">{t.settings.langIndonesian}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Bahasa antarmuka utama Nusantara IDE</div>
                </button>

                <button
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded border text-left cursor-pointer transition-colors ${
                    lang === 'en'
                      ? 'bg-blue-950/40 border-blue-600 text-neutral-100'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <div className="font-semibold text-neutral-100">{t.settings.langEnglish}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">International English user interface</div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.settings.defaultPackagePrefix}
                </label>
                <input
                  type="text"
                  value={packagePrefix}
                  onChange={(e) => setPackagePrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.settings.compileSdkVersion}
                </label>
                <input
                  type="text"
                  disabled
                  value="API 34 (Android 14) [Bawaan Phase 1]"
                  className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800 rounded text-neutral-400 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Android Environment */}
          {activeTab === 'environment' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-200 text-sm">
                    Status Android Toolchain
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {envStatus.overallReady
                      ? 'Android SDK dan JDK telah terverifikasi.'
                      : 'Satu atau lebih komponen toolchain belum terdeteksi secara valid.'}
                  </div>
                </div>

                <button
                  onClick={handleRunEnvironmentCheck}
                  disabled={isCheckingEnv}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingEnv ? 'animate-spin' : ''}`} />
                  <span>{isCheckingEnv ? t.settings.toolchainTesting : t.settings.btnDetectToolchain}</span>
                </button>
              </div>

              {/* Path Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-200 font-medium">
                      {t.settings.androidSdkPath}
                    </label>
                    <span className="text-[11px] font-mono">
                      {envStatus.components.androidSdk.status === 'installed' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.settings.statusDetected}
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {t.settings.statusMissing}
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={sdkPath}
                    onChange={(e) => setSdkPath(e.target.value)}
                    placeholder="C:\Users\User\AppData\Local\Android\Sdk"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {t.settings.androidSdkPathHelp}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-200 font-medium">
                      {t.settings.jdkPath}
                    </label>
                    <span className="text-[11px] font-mono">
                      {envStatus.components.jdk.status === 'installed' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.settings.statusDetected}
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {t.settings.statusMissing}
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={jdkPath}
                    onChange={(e) => setJdkPath(e.target.value)}
                    placeholder="C:\Program Files\Java\jdk-17"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {t.settings.jdkPathHelp}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-200 font-medium">
                      {t.settings.gradlePath}
                    </label>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Embedded 8.5
                    </span>
                  </div>
                  <input
                    type="text"
                    value={gradlePath}
                    onChange={(e) => setGradlePath(e.target.value)}
                    placeholder="Gradle Wrapper otomatis digunakan dari proyek yang dibuat"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: About */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-lg font-bold text-white shadow-xs">
                    N
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-100">
                      Nusantara App Builder
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">
                      {t.settings.aboutVersion}
                    </p>
                  </div>
                </div>

                <p className="text-neutral-300 text-xs leading-relaxed pt-2 border-t border-neutral-800">
                  {t.settings.aboutDesc}
                </p>

                <div className="pt-2 text-[11px] font-mono text-neutral-400 space-y-1">
                  <div>• {t.settings.license}</div>
                  <div>• {t.settings.repository}</div>
                  <div>• Runtime: Tauri 2.x + Rust Backend + React 19 + TypeScript + Vite</div>
                  <div>• Platform: Windows 10/11 x64 Native Desktop</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
