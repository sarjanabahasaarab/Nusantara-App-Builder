/**
 * Nusantara App Builder - Open & Import Project Modal (Phase 10)
 * Unified dialog supporting:
 * 1. Open saved local projects
 * 2. Import Nusantara Project (.json backup)
 * 3. Import Native Android Project (safe Manifest & Gradle parser)
 * 4. Import Community Template
 */

import React, { useState } from 'react';
import {
  FolderOpen,
  X,
  ArrowRight,
  FolderGit2,
  Upload,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { ProjectImportService, AndroidImportAnalysis } from '../../modules/project-manager/projectImportService';
import { ProjectMetadata } from '../../types/project';

type ImportTab = 'saved' | 'nusantara' | 'android' | 'template';

export const OpenProjectModal: React.FC = () => {
  const { t, lang } = useTranslation();
  const isOpen = useUiStore((s) => s.openProjectModalOpen);
  const setIsOpen = useUiStore((s) => s.setOpenProjectModalOpen);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const projects = useProjectStore((s) => s.projects);
  const openProject = useProjectStore((s) => s.openProject);
  const createProject = useProjectStore((s) => s.createProject);

  const [activeTab, setActiveTab] = useState<ImportTab>('saved');
  const [customPath, setCustomPath] = useState('');

  // Nusantara JSON import state
  const [nusantaraJsonText, setNusantaraJsonText] = useState('');
  const [nusantaraImportError, setNusantaraImportError] = useState<string | null>(null);

  // Android Project import state
  const [manifestInput, setManifestInput] = useState('');
  const [buildGradleInput, setBuildGradleInput] = useState('');
  const [androidAnalysis, setAndroidAnalysis] = useState<AndroidImportAnalysis | null>(null);

  if (!isOpen) return null;

  const isIndo = lang === 'id';

  const handleOpenFromList = async (id: string) => {
    const success = await openProject(id);
    if (success) {
      setIsOpen(false);
      setActiveView('project-detail');
      showToast(isIndo ? 'Proyek berhasil dibuka' : 'Project opened successfully');
    }
  };

  const handleOpenFromPath = async () => {
    const match = projects.find(
      (p) => p.location.toLowerCase() === customPath.trim().toLowerCase()
    );
    if (match) {
      await handleOpenFromList(match.id);
    } else {
      showToast(
        isIndo
          ? 'Jalur direktori tidak ditemukan dalam indeks lokal.'
          : 'Directory path not found in local index.'
      );
    }
  };

  const handleAnalyzeAndroid = () => {
    if (!manifestInput.trim()) {
      showToast(isIndo ? 'Masukkan konten AndroidManifest.xml' : 'Please provide AndroidManifest.xml content');
      return;
    }

    const files = [
      { path: 'app/src/main/AndroidManifest.xml', content: manifestInput },
      { path: 'app/build.gradle.kts', content: buildGradleInput },
    ];

    const res = ProjectImportService.analyzeAndroidProject(files);
    setAndroidAnalysis(res);
  };

  const handleCommitAndroidImport = async () => {
    if (!androidAnalysis || !androidAnalysis.extractedMetadata) return;
    const meta = androidAnalysis.extractedMetadata;

    const newProjectInput = {
      name: meta.appName.replace(/[^a-zA-Z0-9]/g, '') || 'ImportedAndroidApp',
      displayName: meta.appName,
      packageId: meta.packageId,
      location: `C:\\Users\\Developer\\NusantaraProjects\\${meta.appName.replace(/[^a-zA-Z0-9]/g, '')}`,
      description: `Imported Native Android project (minSdk: ${meta.minSdk}, targetSdk: ${meta.targetSdk})`,
      template: 'blank-app' as const,
      minSdk: meta.minSdk,
      targetSdk: meta.targetSdk,
      compileSdk: meta.compileSdk,
      versionCode: 1,
      versionName: '1.0.0',
      interfaceLanguage: lang,
    };

    const res = await createProject(newProjectInput);
    if (res.success) {
      setIsOpen(false);
      setActiveView('visual-designer');
      showToast(
        isIndo
          ? `Proyek Android "${newProjectInput.displayName}" berhasil diimpor ke Nusantara!`
          : `Android project "${newProjectInput.displayName}" imported successfully!`
      );
    }
  };

  const handleCommitNusantaraJson = async () => {
    setNusantaraImportError(null);
    const parsed = ProjectImportService.parseNusantaraProjectJson(nusantaraJsonText);
    if (!parsed.success || !parsed.metadata) {
      setNusantaraImportError(parsed.error || 'Failed to parse JSON');
      return;
    }

    const m = parsed.metadata;
    const res = await createProject({
      name: m.name,
      displayName: m.displayName,
      packageId: m.packageId,
      location: m.location,
      description: m.description,
      template: m.template,
      minSdk: m.minSdk,
      targetSdk: m.targetSdk,
      compileSdk: m.compileSdk,
      versionCode: m.versionCode,
      versionName: m.versionName,
      targetUrl: m.targetUrl,
      interfaceLanguage: m.interfaceLanguage || lang,
    });

    if (res.success) {
      setIsOpen(false);
      setActiveView('project-detail');
      showToast(
        isIndo
          ? `Proyek "${m.name}" berhasil dipulihkan!`
          : `Project "${m.name}" restored successfully!`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5 text-blue-400">
            <FolderOpen className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm text-neutral-100">
                {isIndo ? 'Buka & Impor Proyek' : 'Open & Import Project'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isIndo
                  ? 'Buka proyek tersimpan, impor berkas Nusantara JSON, atau impor proyek Android native'
                  : 'Open saved projects, restore Nusantara JSON, or import native Android codebase'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-950/80 border-b border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isIndo ? 'Proyek Tersimpan' : 'Saved Projects'}
          </button>
          <button
            onClick={() => setActiveTab('nusantara')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'nusantara'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isIndo ? 'Impor Berkas Nusantara (JSON)' : 'Import Nusantara (.json)'}
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isIndo ? 'Impor Proyek Android (Gradle)' : 'Import Android Project'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: SAVED PROJECTS */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  {isIndo ? 'Daftar Proyek Tersimpan di Workspace' : 'Projects in Local Workspace'}
                </label>
                {projects.length === 0 ? (
                  <div className="p-6 bg-neutral-950 rounded-lg border border-neutral-800 text-center text-neutral-400">
                    {isIndo
                      ? 'Belum ada proyek tersimpan. Silakan buat baru atau impor dari menu di atas.'
                      : 'No saved projects found. Create a new project or import above.'}
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleOpenFromList(p.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-neutral-800 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderGit2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-neutral-200 group-hover:text-blue-400 flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-normal">
                                {p.packageId}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono truncate max-w-sm mt-0.5">
                              {p.location}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <label className="block text-neutral-300 font-medium mb-1.5">
                  {isIndo ? 'Buka dari jalur folder absolut:' : 'Open by absolute folder path:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="C:\Users\Developer\NusantaraProjects\MyApp"
                    className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={handleOpenFromPath}
                    disabled={!customPath.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded font-medium transition-colors cursor-pointer"
                  >
                    {isIndo ? 'Buka' : 'Open'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NUSANTARA JSON IMPORT */}
          {activeTab === 'nusantara' && (
            <div className="space-y-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {isIndo
                    ? 'Tempel konten berkas "nusantara.project.json" atau cadangan proyek:'
                    : 'Paste "nusantara.project.json" or exported backup content:'}
                </label>
                <textarea
                  value={nusantaraJsonText}
                  onChange={(e) => setNusantaraJsonText(e.target.value)}
                  placeholder={`{\n  "name": "MyImportedApp",\n  "packageId": "com.example.imported",\n  "versionName": "1.0.0",\n  "template": "blank-app"\n}`}
                  rows={8}
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {nusantaraImportError && (
                <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{nusantaraImportError}</span>
                </div>
              )}

              <button
                onClick={handleCommitNusantaraJson}
                disabled={!nusantaraJsonText.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{isIndo ? 'Impor Proyek Nusantara' : 'Import Nusantara Project'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: NATIVE ANDROID IMPORT */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isIndo ? 'Validasi Keamanan Proyek Android Asli' : 'Safe Native Android Import'}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isIndo
                    ? 'Nusantara memverifikasi AndroidManifest.xml, namespace Gradle, minSdk, dan mencegah path traversal secara otomatis.'
                    : 'Automatically parses and audits AndroidManifest.xml and Gradle build script.'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    AndroidManifest.xml <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={manifestInput}
                    onChange={(e) => setManifestInput(e.target.value)}
                    placeholder={`<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.example.nativeapp">\n    <application android:label="My Native App">\n        <activity android:name=".MainActivity" android:exported="true" />\n    </application>\n</manifest>`}
                    rows={5}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    build.gradle / build.gradle.kts ({isIndo ? 'Opsional' : 'Optional'})
                  </label>
                  <textarea
                    value={buildGradleInput}
                    onChange={(e) => setBuildGradleInput(e.target.value)}
                    placeholder={`android {\n    namespace = "com.example.nativeapp"\n    compileSdk = 34\n    defaultConfig {\n        minSdk = 26\n        targetSdk = 34\n    }\n}`}
                    rows={4}
                    className="w-full p-2.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-100 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeAndroid}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isIndo ? 'Analisis & Verifikasi Proyek' : 'Analyze & Verify Codebase'}</span>
                </button>
              </div>

              {/* Analysis Results */}
              {androidAnalysis && (
                <div className="p-4 rounded-lg border bg-neutral-950 border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {isIndo ? 'Hasil Analisis Proyek' : 'Audit Analysis Results'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        androidAnalysis.isValid
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {androidAnalysis.isValid ? (isIndo ? 'VALID' : 'PASSED') : 'INVALID'}
                    </span>
                  </div>

                  {androidAnalysis.errors.length > 0 && (
                    <div className="space-y-1">
                      {androidAnalysis.errors.map((err, idx) => (
                        <div key={idx} className="text-red-400 text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {androidAnalysis.warnings.length > 0 && (
                    <div className="space-y-1">
                      {androidAnalysis.warnings.map((warn, idx) => (
                        <div key={idx} className="text-amber-400 text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{warn}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {androidAnalysis.extractedMetadata && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900 p-3 rounded border border-neutral-800">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">App Name:</span>
                        <span className="font-semibold text-white">
                          {androidAnalysis.extractedMetadata.appName}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Package ID:</span>
                        <span className="font-mono text-blue-300">
                          {androidAnalysis.extractedMetadata.packageId}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Min / Target SDK:</span>
                        <span className="text-neutral-200">
                          API {androidAnalysis.extractedMetadata.minSdk} / {androidAnalysis.extractedMetadata.targetSdk}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Activities:</span>
                        <span className="text-neutral-200">
                          {androidAnalysis.extractedMetadata.activities.length} activity terdeteksi
                        </span>
                      </div>
                    </div>
                  )}

                  {androidAnalysis.isValid && (
                    <button
                      onClick={handleCommitAndroidImport}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-emerald-900/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isIndo ? 'Impor & Buka di Nusantara IDE' : 'Import & Open in Nusantara IDE'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end text-xs">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {t.wizard.btnCancel}
          </button>
        </div>
      </div>
    </div>
  );
};
