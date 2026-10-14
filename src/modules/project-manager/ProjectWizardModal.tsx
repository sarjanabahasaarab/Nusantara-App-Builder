/**
 * Nusantara App Builder - Project Creation Wizard
 * Phase 2: Android Project Engine with versions, display name, target URL, and toolchain summary.
 */

import React, { useState } from 'react';
import {
  FolderPlus,
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  FileCode2,
  Globe2,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AVAILABLE_TEMPLATES } from './templateGenerator';
import { COMPATIBLE_TOOLCHAIN } from './templates/commonAndroidFiles';
import { CreateProjectInput, ProjectTemplateId } from '../../types/project';
import { validateProjectCreation } from '../../validation/projectValidator';

export const ProjectWizardModal: React.FC = () => {
  const { t, lang } = useTranslation();
  const isOpen = useUiStore((s) => s.wizardOpen);
  const closeWizard = useUiStore((s) => s.closeWizard);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);

  const defaultProjectsDir = useSettingsStore(
    (s) => s.settings.general.defaultProjectsDirectory
  );
  const defaultPackagePrefix = useSettingsStore(
    (s) => s.settings.projectDefaults.defaultPackagePrefix
  );
  const defaultTemplate = useSettingsStore(
    (s) => s.settings.projectDefaults.defaultTemplate
  );

  // Form State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('NusantaraFirstApp');
  const [displayName, setDisplayName] = useState('My Awesome App');
  const [packageId, setPackageId] = useState(`${defaultPackagePrefix}.firstapp`);
  const [location, setLocation] = useState(defaultProjectsDir);
  const [description, setDescription] = useState('Aplikasi Android dibangun dengan Nusantara App Builder (Phase 2)');
  const [template, setTemplate] = useState<ProjectTemplateId>(defaultTemplate);
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [minSdk, setMinSdk] = useState(26);
  const [targetSdk, setTargetSdk] = useState(34);
  const [targetUrl, setTargetUrl] = useState('https://nusantara.dev');
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [interfaceLanguage, setInterfaceLanguage] = useState<'id' | 'en'>(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currentInput: CreateProjectInput = {
    name,
    displayName,
    packageId,
    location,
    description,
    template,
    versionName,
    versionCode,
    minSdk,
    targetSdk,
    compileSdk: targetSdk,
    targetUrl: template === 'webview-starter' ? targetUrl : undefined,
    allowOverwrite,
    interfaceLanguage,
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const cleanPkgSegment = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanPkgSegment) {
      setPackageId(`${defaultPackagePrefix}.${cleanPkgSegment}`);
    }
  };

  const validateStep1 = () => {
    const res = validateProjectCreation(currentInput, projects);
    const errMap: Record<string, string> = {};
    for (const err of res.errors) {
      if (err.field === 'name' || err.field === 'displayName' || err.field === 'packageId' || err.field === 'location') {
        errMap[err.field] = lang === 'id' ? err.messageId : err.message;
      }
    }
    setValidationErrors(errMap);
    return Object.keys(errMap).length === 0;
  };

  const validateStep2 = () => {
    const res = validateProjectCreation(currentInput, projects);
    const errMap: Record<string, string> = {};
    for (const err of res.errors) {
      if (err.field === 'versionCode' || err.field === 'versionName' || err.field === 'targetUrl') {
        errMap[err.field] = lang === 'id' ? err.messageId : err.message;
      }
    }
    setValidationErrors(errMap);
    return Object.keys(errMap).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step === 4) setStep(3);
    else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    const result = await createProject(currentInput);

    if (result.success) {
      showToast(t.wizard.successTitle);
      closeWizard();
      setActiveView('project-detail');
    } else {
      if (result.validation) {
        const errMap: Record<string, string> = {};
        for (const err of result.validation.errors) {
          errMap[err.field] = lang === 'id' ? err.messageId : err.message;
        }
        setValidationErrors(errMap);
      }
      showToast(result.error || 'Terjadi kesalahan saat membuat proyek');
    }
    setIsSubmitting(false);
  };

  const selectedTemplateObj = AVAILABLE_TEMPLATES.find((tmpl) => tmpl.id === template)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                {t.wizard.title}
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {t.wizard.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={closeWizard}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Step Indicator */}
        <div className="px-6 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-blue-400 font-semibold' : ''}`}>
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">1</span>
            <span>{t.wizard.stepDetails}</span>
          </div>
          <div className="h-[1px] w-6 bg-neutral-800" />
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-blue-400 font-semibold' : ''}`}>
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">2</span>
            <span>{t.wizard.stepVersion}</span>
          </div>
          <div className="h-[1px] w-6 bg-neutral-800" />
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-blue-400 font-semibold' : ''}`}>
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">3</span>
            <span>{t.wizard.stepTemplate}</span>
          </div>
          <div className="h-[1px] w-6 bg-neutral-800" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-blue-400 font-semibold' : ''}`}>
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">4</span>
            <span>{t.wizard.stepReview}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* STEP 1: Details & Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.projectName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t.wizard.projectNamePlaceholder}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.projectNameHelp}</p>
                {validationErrors.name && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.appDisplayName}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.wizard.appDisplayNamePlaceholder}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.appDisplayNameHelp}</p>
                {validationErrors.displayName && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.displayName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.packageId} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  placeholder={t.wizard.packageIdPlaceholder}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.packageIdHelp}</p>
                {validationErrors.packageId && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.packageId}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.projectLocation} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.wizard.projectLocationPlaceholder}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.projectLocationHelp}</p>
                {validationErrors.location && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.location}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowOverwrite}
                    onChange={(e) => setAllowOverwrite(e.target.checked)}
                    className="text-blue-600 focus:ring-0 rounded"
                  />
                  <span className="text-neutral-300 font-medium">{t.wizard.allowOverwrite}</span>
                </label>
                <p className="text-[10px] text-neutral-400 pl-6 mt-0.5">{t.wizard.allowOverwriteHelp}</p>
              </div>
            </div>
          )}

          {/* STEP 2: SDK & Versions */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-200 font-medium mb-1">
                    {t.wizard.versionName} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder={t.wizard.versionNamePlaceholder}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.versionNameHelp}</p>
                  {validationErrors.versionName && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.versionName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-200 font-medium mb-1">
                    {t.wizard.versionCode} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={versionCode}
                    onChange={(e) => setVersionCode(Number(e.target.value))}
                    placeholder={t.wizard.versionCodePlaceholder}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.versionCodeHelp}</p>
                  {validationErrors.versionCode && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.versionCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-200 font-medium mb-1">
                    {t.wizard.minSdk}
                  </label>
                  <select
                    value={minSdk}
                    onChange={(e) => setMinSdk(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                  >
                    <option value={24}>API 24 — Android 7.0 (Nougat)</option>
                    <option value={26}>API 26 — Android 8.0 (Oreo) [Direkomendasikan]</option>
                    <option value={28}>API 28 — Android 9.0 (Pie)</option>
                    <option value={30}>API 30 — Android 11</option>
                  </select>
                  <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.minSdkHelp}</p>
                </div>

                <div>
                  <label className="block text-neutral-200 font-medium mb-1">
                    {t.wizard.targetSdk}
                  </label>
                  <select
                    value={targetSdk}
                    onChange={(e) => setTargetSdk(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                  >
                    <option value={34}>API 34 — Android 14 (Standar Google Play)</option>
                  </select>
                  <p className="text-[11px] text-neutral-400 mt-1">{t.wizard.targetSdkHelp}</p>
                </div>
              </div>

              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.description}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.wizard.descriptionPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Template Selection */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="text-neutral-400 text-[11px] mb-2">
                {t.wizard.templateSubtitle}
              </div>

              {AVAILABLE_TEMPLATES.map((tmpl) => {
                const isSelected = template === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    className={`p-3.5 rounded border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-600 text-neutral-100'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-100">
                            {lang === 'id' ? tmpl.nameId : tmpl.name}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {lang === 'id' ? tmpl.descriptionId : tmpl.description}
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="templateSelection"
                        checked={isSelected}
                        onChange={() => setTemplate(tmpl.id)}
                        className="text-blue-600 mt-1"
                      />
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-neutral-800 flex flex-wrap gap-2 text-[10px] text-neutral-400 font-mono">
                      {(lang === 'id' ? tmpl.featuresId : tmpl.features).map((feat, idx) => (
                        <span key={idx} className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* If WebView Starter selected: require targetUrl input */}
              {template === 'webview-starter' && (
                <div className="p-3 bg-neutral-950 rounded border border-blue-900/60 space-y-2 mt-3">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs">
                    <Globe2 className="w-4 h-4" />
                    <span>{t.wizard.targetUrl}</span>
                  </div>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={t.wizard.targetUrlPlaceholder}
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[10px] text-neutral-400">{t.wizard.targetUrlHelp}</p>
                  {validationErrors.targetUrl && (
                    <div className="flex items-center gap-1 text-red-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationErrors.targetUrl}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded text-[11px] text-blue-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{t.wizard.summaryNotice}</span>
              </div>

              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-2.5 font-mono text-[11px]">
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">{t.wizard.projectName}:</span>
                  <span className="font-semibold text-neutral-100">{name}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">{t.wizard.appDisplayName}:</span>
                  <span className="text-neutral-100">{displayName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">{t.wizard.packageId}:</span>
                  <span className="text-blue-400">{packageId}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">{t.wizard.versionName} / {t.wizard.versionCode}:</span>
                  <span className="text-neutral-200">{versionName} (Code: {versionCode})</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">Toolchain Kompatibel:</span>
                  <span className="text-emerald-400">AGP {COMPATIBLE_TOOLCHAIN.agpVersion} · Gradle {COMPATIBLE_TOOLCHAIN.gradleVersion} · Kotlin {COMPATIBLE_TOOLCHAIN.kotlinVersion} · JDK {COMPATIBLE_TOOLCHAIN.jdkVersion}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                  <span className="text-neutral-400 font-sans">{t.wizard.templateTitle}:</span>
                  <span className="text-neutral-200">{lang === 'id' ? selectedTemplateObj.nameId : selectedTemplateObj.name}</span>
                </div>
                {template === 'webview-starter' && (
                  <div className="flex justify-between border-b border-neutral-800/60 pb-1.5">
                    <span className="text-neutral-400 font-sans">{t.wizard.targetUrl}:</span>
                    <span className="text-blue-400 truncate max-w-xs">{targetUrl}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-400 font-sans">{t.wizard.projectLocation}:</span>
                  <span className="text-neutral-300 truncate max-w-xs">{location}\{name}</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-400 font-sans font-medium mb-1.5 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Struktur Berkas Android (22+ berkas termasuk Gradle Wrapper):</span>
                </div>
                <div className="max-h-36 overflow-y-auto bg-neutral-950 p-2 rounded border border-neutral-800 text-[10px] font-mono text-neutral-400 space-y-1">
                  <div>📁 {name}/</div>
                  <div className="pl-3">├── 📄 build.gradle.kts (AGP {COMPATIBLE_TOOLCHAIN.agpVersion})</div>
                  <div className="pl-3">├── 📄 settings.gradle.kts</div>
                  <div className="pl-3">├── 📄 gradle.properties</div>
                  <div className="pl-3">├── 📄 gradlew (POSIX wrapper script)</div>
                  <div className="pl-3">├── 📄 gradlew.bat (Windows wrapper script)</div>
                  <div className="pl-3">├── 📁 gradle/wrapper/gradle-wrapper.properties (Gradle {COMPATIBLE_TOOLCHAIN.gradleVersion})</div>
                  <div className="pl-3">├── 📁 gradle/libs.versions.toml (Version Catalog)</div>
                  <div className="pl-3">├── 📁 app/</div>
                  <div className="pl-6">├── 📄 build.gradle.kts</div>
                  <div className="pl-6">├── 📁 src/main/AndroidManifest.xml</div>
                  <div className="pl-6">├── 📁 src/main/java/{packageId.replace(/\./g, '/')}/MainActivity.kt</div>
                  <div className="pl-6">├── 📁 src/main/res/layout/activity_main.xml</div>
                  <div className="pl-6">├── 📁 src/main/res/drawable/ic_launcher_*.xml</div>
                  <div className="pl-6">├── 📁 src/main/res/mipmap-anydpi-v26/ic_launcher*.xml</div>
                  <div className="pl-6">├── 📁 src/main/res/values/strings.xml, colors.xml, themes.xml</div>
                  <div className="pl-3">├── 📄 nusantara.project.json (Format 2.0)</div>
                  <div className="pl-3">└── 📄 README.md</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            onClick={closeWizard}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer text-xs"
          >
            {t.wizard.btnCancel}
          </button>

          <div className="flex items-center gap-2 text-xs">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.wizard.btnBack}</span>
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
              >
                <span>{t.wizard.btnNext}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? t.wizard.creating : t.wizard.btnCreate}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
