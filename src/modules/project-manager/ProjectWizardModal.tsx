/**
 * Nusantara App Builder - Project Creation Wizard
 * Step-by-step project creation wizard with real validation and Android file tree generator.
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
  FolderGit2,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AVAILABLE_TEMPLATES } from './templateGenerator';
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('NusantaraFirstApp');
  const [packageId, setPackageId] = useState(`${defaultPackagePrefix}.firstapp`);
  const [location, setLocation] = useState(defaultProjectsDir);
  const [description, setDescription] = useState('Aplikasi Android pertama dibangun dengan Nusantara App Builder');
  const [template, setTemplate] = useState<ProjectTemplateId>(defaultTemplate);
  const [interfaceLanguage, setInterfaceLanguage] = useState<'id' | 'en'>(lang);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currentInput: CreateProjectInput = {
    name,
    packageId,
    location,
    description,
    template,
    interfaceLanguage,
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-suggest package ID if user hasn't heavily customized it
    const cleanPkgSegment = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanPkgSegment) {
      setPackageId(`${defaultPackagePrefix}.${cleanPkgSegment}`);
    }
  };

  const validateStep1 = () => {
    const res = validateProjectCreation(currentInput, projects);
    const errMap: Record<string, string> = {};
    for (const err of res.errors) {
      if (err.field === 'name' || err.field === 'packageId' || err.field === 'location') {
        errMap[err.field] = lang === 'id' ? err.messageId : err.message;
      }
    }
    setValidationErrors(errMap);
    return Object.keys(errMap).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
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

  const selectedTemplateObj = AVAILABLE_TEMPLATES.find((t) => t.id === template)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[90vh]">
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
          <div
            className={`flex items-center gap-1.5 ${
              step === 1 ? 'text-blue-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            <span>{t.wizard.stepDetails}</span>
          </div>
          <div className="h-[1px] w-8 bg-neutral-800" />
          <div
            className={`flex items-center gap-1.5 ${
              step === 2 ? 'text-blue-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            <span>{t.wizard.stepTemplate}</span>
          </div>
          <div className="h-[1px] w-8 bg-neutral-800" />
          <div
            className={`flex items-center gap-1.5 ${
              step === 3 ? 'text-blue-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            <span>{t.wizard.stepReview}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.projectName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t.wizard.projectNamePlaceholder}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  {t.wizard.projectNameHelp}
                </p>
                {validationErrors.name && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Package ID */}
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
                <p className="text-[11px] text-neutral-400 mt-1">
                  {t.wizard.packageIdHelp}
                </p>
                {validationErrors.packageId && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.packageId}</span>
                  </div>
                )}
              </div>

              {/* Project Location */}
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
                <p className="text-[11px] text-neutral-400 mt-1">
                  {t.wizard.projectLocationHelp}
                </p>
                {validationErrors.location && (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationErrors.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
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

              {/* Interface Language */}
              <div>
                <label className="block text-neutral-200 font-medium mb-1">
                  {t.wizard.interfaceLanguage}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="langPref"
                      checked={interfaceLanguage === 'id'}
                      onChange={() => setInterfaceLanguage('id')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>Bahasa Indonesia (ID)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="langPref"
                      checked={interfaceLanguage === 'en'}
                      onChange={() => setInterfaceLanguage('en')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>English (EN)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Template Selection */}
          {step === 2 && (
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

                    {/* Features list */}
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
            </div>
          )}

          {/* STEP 3: Summary & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded text-[11px] text-blue-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>{t.wizard.summaryNotice}</span>
              </div>

              <div className="bg-neutral-950 p-4 rounded border border-neutral-800 space-y-3 font-mono text-[11px]">
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-400 font-sans">{t.wizard.projectName}:</span>
                  <span className="font-semibold text-neutral-100">{name}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-400 font-sans">{t.wizard.packageId}:</span>
                  <span className="text-blue-400">{packageId}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-400 font-sans">{t.wizard.templateTitle}:</span>
                  <span className="text-neutral-200">
                    {lang === 'id' ? selectedTemplateObj.nameId : selectedTemplateObj.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-400 font-sans">Compile SDK / Min SDK:</span>
                  <span className="text-neutral-200">API 34 (Android 14) / API 26 (Android 8.0)</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800/60 pb-2">
                  <span className="text-neutral-400 font-sans">Bahasa Kode:</span>
                  <span className="text-neutral-200">Kotlin 2.0 + Gradle Kotlin DSL (.kts)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-400 font-sans">{t.wizard.projectLocation}:</span>
                  <span className="text-neutral-300 truncate max-w-xs">{location}\{name}</span>
                </div>
              </div>

              {/* Generated Files Preview List */}
              <div>
                <div className="text-neutral-400 font-sans font-medium mb-1.5 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Struktur Berkas yang Akan Dibuat (15 berkas):</span>
                </div>
                <div className="max-h-36 overflow-y-auto bg-neutral-950 p-2 rounded border border-neutral-800 text-[10px] font-mono text-neutral-400 space-y-1">
                  <div>📁 {name}/</div>
                  <div className="pl-3">├── 📄 build.gradle.kts (Root Project)</div>
                  <div className="pl-3">├── 📄 settings.gradle.kts</div>
                  <div className="pl-3">├── 📄 gradle.properties</div>
                  <div className="pl-3">├── 📁 gradle/libs.versions.toml</div>
                  <div className="pl-3">├── 📁 app/</div>
                  <div className="pl-6">├── 📄 build.gradle.kts</div>
                  <div className="pl-6">├── 📁 src/main/AndroidManifest.xml</div>
                  <div className="pl-6">├── 📁 src/main/java/{packageId.replace(/\./g, '/')}/MainActivity.kt</div>
                  <div className="pl-6">├── 📁 src/main/res/layout/activity_main.xml</div>
                  <div className="pl-6">├── 📁 src/main/res/values/strings.xml, colors.xml, themes.xml</div>
                  <div className="pl-3">├── 📄 nusantara.project.json</div>
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

            {step < 3 ? (
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
