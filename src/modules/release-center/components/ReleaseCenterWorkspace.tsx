/**
 * Nusantara App Builder - Professional APK & AAB Release Center
 * Phase 8: 8-Step Release Wizard, Version Management, Signing Manager,
 * Pre-Release Validation Gate, Real Gradle Release Execution, Artifact Inspector,
 * Release Exporter, and Extension Points.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderOpen,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
  FileCode,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCw,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Settings,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Layers,
  History,
  FileText,
  DollarSign,
  Download,
  Lock,
  Terminal,
  Cpu,
  Clock,
  Check,
  Search,
  Hash,
  Eye,
  GitBranch,
} from 'lucide-react';

import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';
import { VersionManager } from '../services/versionManager';
import { ReleaseExporter } from '../services/releaseExporter';
import { GitSafetyService } from '../services/gitSafetyService';
import { SigningManagerModal } from './SigningManagerModal';
import { ReleaseHistoryModal } from './ReleaseHistoryModal';
import { ReleaseNotesModal } from './ReleaseNotesModal';
import { AdMobExtensionModal } from './AdMobExtensionModal';
import { EditAppModal } from './EditAppModal';
import { ReleaseType, BuildProfile } from '../types';

export const ReleaseCenterWorkspace: React.FC = () => {
  const { lang, t } = useTranslation();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);
  const projects = useProjectStore((s) => s.projects);
  const selectProject = useProjectStore((s) => s.selectProject);
  const updateProjectMetadata = useProjectStore((s) => s.updateProjectMetadata);
  const openProjectWizard = useUiStore((s) => s.openWizard);

  // Store state
  const currentStep = useReleaseCenterStore((s) => s.currentStep);
  const setStep = useReleaseCenterStore((s) => s.setStep);
  const releaseType = useReleaseCenterStore((s) => s.releaseType);
  const setReleaseType = useReleaseCenterStore((s) => s.setReleaseType);
  const profiles = useReleaseCenterStore((s) => s.profiles);
  const activeProfile = useReleaseCenterStore((s) => s.activeProfile);
  const setActiveProfile = useReleaseCenterStore((s) => s.setActiveProfile);
  const updateActiveProfile = useReleaseCenterStore((s) => s.updateActiveProfile);
  const signingProfile = useReleaseCenterStore((s) => s.signingProfile);
  const checklist = useReleaseCenterStore((s) => s.checklist);
  const toggleChecklistItem = useReleaseCenterStore((s) => s.toggleChecklistItem);
  const validationReport = useReleaseCenterStore((s) => s.validationReport);
  const isValidating = useReleaseCenterStore((s) => s.isValidating);
  const buildStatus = useReleaseCenterStore((s) => s.buildStatus);
  const buildProgressText = useReleaseCenterStore((s) => s.buildProgressText);
  const buildLogs = useReleaseCenterStore((s) => s.buildLogs);
  const buildDurationSec = useReleaseCenterStore((s) => s.buildDurationSec);
  const inspectedArtifact = useReleaseCenterStore((s) => s.inspectedArtifact);
  const inspectedFormat = useReleaseCenterStore((s) => s.inspectedFormat);
  const isInspecting = useReleaseCenterStore((s) => s.isInspecting);
  const releaseNotes = useReleaseCenterStore((s) => s.releaseNotes);
  const exportDirectory = useReleaseCenterStore((s) => s.exportDirectory);
  const setExportDirectory = useReleaseCenterStore((s) => s.setExportDirectory);
  const isExporting = useReleaseCenterStore((s) => s.isExporting);
  const lastExportedFiles = useReleaseCenterStore((s) => s.lastExportedFiles);
  const releaseHistory = useReleaseCenterStore((s) => s.releaseHistory);
  const gitTag = useReleaseCenterStore((s) => s.gitTag);
  const setGitTag = useReleaseCenterStore((s) => s.setGitTag);
  const adMobConfig = useReleaseCenterStore((s) => s.adMobConfig);
  const selectedVariant = useReleaseCenterStore((s) => s.selectedVariant);
  const setSelectedVariant = useReleaseCenterStore((s) => s.setSelectedVariant);

  // Modals
  const setIsSigningModalOpen = useReleaseCenterStore((s) => s.setIsSigningModalOpen);
  const setIsHistoryModalOpen = useReleaseCenterStore((s) => s.setIsHistoryModalOpen);
  const setIsNotesModalOpen = useReleaseCenterStore((s) => s.setIsNotesModalOpen);
  const setIsAdMobModalOpen = useReleaseCenterStore((s) => s.setIsAdMobModalOpen);
  const setIsEditAppModalOpen = useReleaseCenterStore((s) => s.setIsEditAppModalOpen);

  // Actions
  const loadProjectData = useReleaseCenterStore((s) => s.loadProjectData);
  const runValidation = useReleaseCenterStore((s) => s.runValidation);
  const startReleaseBuild = useReleaseCenterStore((s) => s.startReleaseBuild);
  const cancelBuild = useReleaseCenterStore((s) => s.cancelBuild);
  const exportReleasePackage = useReleaseCenterStore((s) => s.exportReleasePackage);

  const [copiedSha, setCopiedSha] = useState(false);
  const [gitConfirmShown, setGitConfirmShown] = useState(false);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Initialize or reload on project change
  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject, projectFiles);
    }
  }, [activeProject?.id, loadProjectData, projectFiles]);

  // Auto-scroll logs
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildLogs]);

  // Version bump handlers
  const handleIncrementPatch = () => {
    if (!activeProject) return;
    const nextName = VersionManager.incrementPatch(activeProject.versionName);
    const nextCode = VersionManager.incrementVersionCode(activeProject.versionCode);
    updateProjectMetadata({ versionName: nextName, versionCode: nextCode });
    runValidation({ ...activeProject, versionName: nextName, versionCode: nextCode }, projectFiles);
    showToast(`Version bumped to ${nextName} (Build ${nextCode})`);
  };

  const handleIncrementMinor = () => {
    if (!activeProject) return;
    const nextName = VersionManager.incrementMinor(activeProject.versionName);
    const nextCode = VersionManager.incrementVersionCode(activeProject.versionCode);
    updateProjectMetadata({ versionName: nextName, versionCode: nextCode });
    runValidation({ ...activeProject, versionName: nextName, versionCode: nextCode }, projectFiles);
    showToast(`Version bumped to ${nextName} (Build ${nextCode})`);
  };

  const handleIncrementMajor = () => {
    if (!activeProject) return;
    const nextName = VersionManager.incrementMajor(activeProject.versionName);
    const nextCode = VersionManager.incrementVersionCode(activeProject.versionCode);
    updateProjectMetadata({ versionName: nextName, versionCode: nextCode });
    runValidation({ ...activeProject, versionName: nextName, versionCode: nextCode }, projectFiles);
    showToast(`Version bumped to ${nextName} (Build ${nextCode})`);
  };

  const handleIncrementBuild = () => {
    if (!activeProject) return;
    const nextCode = VersionManager.incrementVersionCode(activeProject.versionCode);
    updateProjectMetadata({ versionCode: nextCode });
    runValidation({ ...activeProject, versionCode: nextCode }, projectFiles);
    showToast(`Build code bumped to ${nextCode}`);
  };

  const handleStartBuild = async () => {
    if (!activeProject) return;
    // Advance to build step to show progress
    setStep(6);
    await startReleaseBuild(activeProject, projectFiles);
  };

  const copyShaToClipboard = (sha: string) => {
    navigator.clipboard?.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 1500);
  };

  // Steps definition
  const steps = [
    { num: 1, label: lang === 'id' ? 'Info Aplikasi' : 'App Info', desc: 'Identitas & metadata' },
    { num: 2, label: lang === 'id' ? 'Versi' : 'Version', desc: 'SemVer & Code' },
    { num: 3, label: lang === 'id' ? 'Profil Build' : 'Build Profile', desc: 'R8 & Optimization' },
    { num: 4, label: lang === 'id' ? 'Signing' : 'Signing', desc: 'RSA-2048 Keystore' },
    { num: 5, label: lang === 'id' ? 'Validasi' : 'Validation', desc: 'Pre-release checklist' },
    { num: 6, label: lang === 'id' ? 'Build' : 'Build', desc: 'Gradle Release' },
    { num: 7, label: lang === 'id' ? 'Inspeksi' : 'Inspect', desc: 'APK & AAB Analysis' },
    { num: 8, label: lang === 'id' ? 'Ekspor' : 'Export', desc: 'Paket & Release Notes' },
  ];

  const isValidationPassed = validationReport ? !validationReport.isBlocked : false;

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 select-none overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="h-14 px-6 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-white">
                {lang === 'id' ? 'Pusat Rilis (Release Center)' : 'Release Center'}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                PHASE 8
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {lang === 'id'
                ? 'Persiapan dan rilis resmi APK / AAB Android dengan standar produksi'
                : 'Professional Android APK / AAB release wizard, signing, and inspection'}
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2.5">
          {projects.length > 0 ? (
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
              <Smartphone className="w-4 h-4 text-neutral-400" />
              <select
                value={activeProject?.id || ''}
                onChange={(e) => selectProject(e.target.value)}
                aria-label={lang === 'id' ? 'Pilih Proyek Android' : 'Select Android Project'}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                    {p.name} (v{p.versionName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={openProjectWizard}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Buat Proyek Baru' : 'Create Project'}</span>
            </button>
          )}

          <div className="h-5 w-px bg-neutral-800 mx-1" />

          {/* Quick Action Buttons */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            title={lang === 'id' ? 'Buka Riwayat Rilis' : 'Open Release History'}
          >
            <History className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{lang === 'id' ? 'Riwayat' : 'History'}</span>
            {releaseHistory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900 text-blue-300 text-[10px] font-bold">
                {releaseHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsNotesModalOpen(true)}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            title={lang === 'id' ? 'Edit Catatan Rilis (Release Notes)' : 'Edit Release Notes'}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{lang === 'id' ? 'Catatan' : 'Notes'}</span>
          </button>

          <button
            onClick={() => setIsAdMobModalOpen(true)}
            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            title={lang === 'id' ? 'Ekstensi Monetisasi AdMob (Phase 9)' : 'AdMob Monetization (Phase 9)'}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">AdMob</span>
            {adMobConfig.enabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. 8-Step Wizard Stepper Bar */}
      <div className="bg-neutral-950 px-6 py-2 border-b border-neutral-800 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center min-w-[760px] justify-between">
          {steps.map((st, idx) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <React.Fragment key={st.num}>
                <button
                  onClick={() => setStep(st.num)}
                  className={`flex items-center gap-2.5 py-1 px-2.5 rounded-lg transition-colors cursor-pointer group ${
                    isActive
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-900/40'
                        : isCompleted
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : st.num}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold leading-tight">{st.label}</div>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > st.num ? 'bg-emerald-800/60' : 'bg-neutral-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace Area: Split into Step Content + Summary Card */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Main Wizard Step Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* STEP 1: App Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'id' ? '1. Informasi Aplikasi' : '1. Application Information'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Data identitas dasar dari model proyek Android yang digunakan untuk pembuatan berkas rilis.'
                      : 'Core identity metadata from project model used for compiling release artifacts.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditAppModalOpen(true)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Edit Pengaturan Aplikasi' : 'Edit App Settings'}</span>
                </button>
              </div>

              {activeProject ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* App Icon Card */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-950/40 border border-emerald-400/30 mb-3">
                      <Smartphone className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-white text-sm">{activeProject.displayName || activeProject.name}</span>
                    <span className="text-[11px] text-neutral-400 font-mono mt-0.5">{activeProject.packageId}</span>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'id' ? 'Ikon Adaptif Siap' : 'Adaptive Icon Ready'}</span>
                    </div>
                  </div>

                  {/* Metadata Table */}
                  <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400 block mb-0.5">{lang === 'id' ? 'Nama Aplikasi' : 'App Name'}</span>
                        <strong className="text-white text-sm">{activeProject.name}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-0.5">Package ID / Application ID</span>
                        <code className="text-emerald-400 font-mono text-xs">{activeProject.packageId}</code>
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-0.5">Version Name</span>
                        <span className="text-white font-mono font-bold">{activeProject.versionName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-0.5">Version Code</span>
                        <span className="text-white font-mono font-bold">Build {activeProject.versionCode}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-0.5">Target & Compile SDK</span>
                        <span className="text-neutral-200">Android 14 (API {activeProject.targetSdk})</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block mb-0.5">Minimum SDK</span>
                        <span className="text-neutral-200">Android 7.0 (API {activeProject.minSdk})</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800">
                      <span className="text-neutral-400 text-xs block mb-1">{lang === 'id' ? 'Deskripsi' : 'Description'}</span>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {activeProject.description || (lang === 'id' ? 'Tidak ada deskripsi proyek.' : 'No description provided.')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
                  {lang === 'id' ? 'Pilih atau buat proyek untuk memulai.' : 'Select or create a project to start.'}
                </div>
              )}

              {/* Build Variant Selector */}
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-white block">
                    {lang === 'id' ? 'Build Variant' : 'Build Variant'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {lang === 'id'
                      ? 'Dukungan flavor dan variant rilis (contoh: release, freeRelease, proRelease)'
                      : 'Flavor and release variant support (e.g. release, freeRelease, proRelease)'}
                  </span>
                </div>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="release">release (Default Variant)</option>
                  <option value="freeRelease">freeRelease</option>
                  <option value="proRelease">proRelease</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Pengaturan Versi' : 'Proceed to Versioning'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Version Management */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-blue-400" />
                  <span>{lang === 'id' ? '2. Pengelolaan Versi (Version Management)' : '2. Version Management'}</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  {lang === 'id'
                    ? 'Aturan resmi Android: Version Code harus meningkat setiap rilis baru dan tidak boleh lebih kecil dari rilis sebelumnya.'
                    : 'Android rules: Version Code must strictly increment on each new release and never decrease.'}
                </p>
              </div>

              {activeProject && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Version Name (SemVer: Major.Minor.Patch)
                      </label>
                      <input
                        type="text"
                        value={activeProject.versionName}
                        onChange={(e) => {
                          updateProjectMetadata({ versionName: e.target.value });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {lang === 'id' ? 'Nama versi yang terlihat oleh pengguna di Google Play.' : 'Version name displayed to users on Google Play.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Version Code (Positive Integer)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={2100000000}
                        value={activeProject.versionCode}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          updateProjectMetadata({ versionCode: val });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        {lang === 'id' ? 'Nomor integer internal Android (Maks: 2.100.000.000).' : 'Internal Android integer (Max: 2,100,000,000).'}
                      </p>
                    </div>
                  </div>

                  {/* Increment Buttons Bar */}
                  <div className="pt-3 border-t border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-300 block mb-2">
                      {lang === 'id' ? 'Tombol Cepat Penaikan Versi (Quick Increment):' : 'Quick Version Increment:'}
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <button
                        onClick={handleIncrementPatch}
                        className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">
                          Increment Patch
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {activeProject.versionName} → {VersionManager.incrementPatch(activeProject.versionName)}
                        </span>
                      </button>

                      <button
                        onClick={handleIncrementMinor}
                        className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">
                          Increment Minor
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {activeProject.versionName} → {VersionManager.incrementMinor(activeProject.versionName)}
                        </span>
                      </button>

                      <button
                        onClick={handleIncrementMajor}
                        className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">
                          Increment Major
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {activeProject.versionName} → {VersionManager.incrementMajor(activeProject.versionName)}
                        </span>
                      </button>

                      <button
                        onClick={handleIncrementBuild}
                        className="p-3 bg-neutral-950 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-white block group-hover:text-blue-400">
                          Increment Build
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Build {activeProject.versionCode} → {activeProject.versionCode + 1}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Profil Build' : 'Proceed to Build Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Build Profile */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>{lang === 'id' ? '3. Profil Kompilasi (Build Profile)' : '3. Build Profile'}</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  {lang === 'id'
                    ? 'Pilih profil target rilis. Mode Produksi wajib menggunakan penandatanganan rilis dan menonaktifkan debuggable.'
                    : 'Select release build profile. Production strictly enforces release signing and debuggable=false.'}
                </p>
              </div>

              {/* Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {profiles.map((p) => {
                  const isSelected = activeProfile.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveProfile(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500/80 shadow-lg shadow-purple-950/50'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-xs">{p.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                        {lang === 'id' ? p.descriptionId : p.description}
                      </p>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Debuggable:</span>
                          <strong className={p.isDebuggable ? 'text-amber-400' : 'text-emerald-400'}>
                            {String(p.isDebuggable)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Minify (R8):</span>
                          <strong className={p.isMinifyEnabled ? 'text-emerald-400' : 'text-neutral-400'}>
                            {String(p.isMinifyEnabled)}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Strict Checks:</span>
                          <strong className={p.strictChecks ? 'text-emerald-400' : 'text-neutral-400'}>
                            {String(p.strictChecks)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Profile Configuration Settings */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold text-white">
                  {lang === 'id' ? 'Konfigurasi Rinci Profil Aktif:' : 'Active Profile Detail Configuration:'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeProfile.isMinifyEnabled}
                        onChange={(e) => updateActiveProfile({ isMinifyEnabled: e.target.checked })}
                        className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span>
                        <strong className="text-white">R8 Code Minification</strong> (Optimasi ukuran bytecode & obfuscation)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeProfile.isShrinkResourcesEnabled}
                        onChange={(e) => updateActiveProfile({ isShrinkResourcesEnabled: e.target.checked })}
                        className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span>
                        <strong className="text-white">Resource Shrinking</strong> (Hapus XML/Drawable tidak terpakai)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeProfile.isDebuggable}
                        onChange={(e) => updateActiveProfile({ isDebuggable: e.target.checked })}
                        className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={activeProfile.isDebuggable ? 'text-amber-400' : 'text-neutral-300'}>
                        <strong>Debuggable Flag</strong> (Wajib false untuk rilis Google Play)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      API Base URL
                    </label>
                    <input
                      type="text"
                      value={activeProfile.apiBaseUrl}
                      onChange={(e) => updateActiveProfile({ apiBaseUrl: e.target.value })}
                      placeholder="https://api.nusantara.id/v1"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {lang === 'id'
                        ? 'Alamat backend REST API produksi dengan HTTPS resmi.'
                        : 'Production HTTPS backend API endpoint.'}
                    </p>
                  </div>
                </div>

                {activeProfile.type === 'production' && activeProfile.isDebuggable && (
                  <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2.5 text-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>
                      {lang === 'id'
                        ? 'PERINGATAN KRITIS: Mode Produksi tidak boleh menyalakan flag debuggable!'
                        : 'CRITICAL WARNING: Production profile must not enable debuggable flag!'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Penandatanganan' : 'Proceed to Signing'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Signing Manager */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>{lang === 'id' ? '4. Penandatanganan Rilis (Signing Manager)' : '4. Release Signing'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Konfigurasi sertifikat digital resmi RSA-2048 dengan Skema V1 & V2.'
                      : 'Configure official RSA-2048 digital signing certificate with V1 and V2 schemes.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsSigningModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Buka Signing Manager' : 'Open Signing Manager'}</span>
                </button>
              </div>

              {/* Signing Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        signingProfile.isConfigured
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{signingProfile.name}</h3>
                        {signingProfile.isConfigured ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                            ✓ {lang === 'id' ? 'TERKONFIGURASI' : 'CONFIGURED'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-semibold">
                            ! {lang === 'id' ? 'BELUM TERKONFIGURASI' : 'NOT CONFIGURED'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate max-w-lg">
                        {signingProfile.keystorePath || (lang === 'id' ? 'Belum ada keystore yang dipilih' : 'No keystore path set')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-neutral-500 block">{lang === 'id' ? 'Masa Berlaku' : 'Valid Until'}</span>
                    <strong className="text-neutral-200">{signingProfile.validUntil || '2054-12-31'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-500 block mb-0.5">{lang === 'id' ? 'Alias Kunci' : 'Key Alias'}</span>
                    <strong className="text-white font-mono">{signingProfile.keyAlias || 'release'}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">V1 (JAR Signing)</span>
                    <strong className={signingProfile.v1Signing ? 'text-emerald-400' : 'text-neutral-400'}>
                      {signingProfile.v1Signing ? 'Enabled ✓' : 'Disabled'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">V2 (APK Scheme v2)</span>
                    <strong className={signingProfile.v2Signing ? 'text-emerald-400' : 'text-neutral-400'}>
                      {signingProfile.v2Signing ? 'Enabled ✓' : 'Disabled'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-0.5">{lang === 'id' ? 'Kata Sandi Sesi' : 'Password Session'}</span>
                    <strong className={signingProfile.storePasswordSet ? 'text-emerald-400' : 'text-amber-400'}>
                      {signingProfile.storePasswordSet ? 'Set in Memory ✓' : 'Missing'}
                    </strong>
                  </div>
                </div>

                {/* Password Safety Notice */}
                <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg flex items-center gap-2 text-xs text-neutral-400">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {lang === 'id'
                      ? 'Keamanan Sesi: Kata sandi keystore tidak disimpan dalam JSON proyek atau diunggah ke repositori Git.'
                      : 'Session Security: Keystore passwords are kept only in active memory and never written into project JSON or Git.'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Validasi Rilis' : 'Proceed to Validation'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Pre-Release Validation Gate */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'id' ? '5. Gerbang Validasi Pra-Rilis (Validation Gate)' : '5. Pre-Release Validation Gate'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Pemeriksaan otomatis dan daftar periksa kualitas sebelum kompilasi rilis diizinkan.'
                      : 'Automated verification and production readiness checklist before release builds.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (activeProject) runValidation(activeProject, projectFiles);
                  }}
                  disabled={isValidating}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                  <span>{lang === 'id' ? 'Pindai Ulang' : 'Re-scan'}</span>
                </button>
              </div>

              {/* Status Banner */}
              {validationReport && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    validationReport.isBlocked
                      ? 'bg-red-950/40 border-red-700/60'
                      : validationReport.hasWarnings
                      ? 'bg-amber-950/40 border-amber-700/60'
                      : 'bg-emerald-950/40 border-emerald-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {validationReport.isBlocked ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : validationReport.hasWarnings ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {validationReport.isBlocked
                          ? lang === 'id'
                            ? 'BUILD BLOCKED — Ditemukan Kesalahan Kritis'
                            : 'BUILD BLOCKED — Critical Issues Detected'
                          : validationReport.hasWarnings
                          ? lang === 'id'
                            ? 'VALIDASI LULUS DENGAN PERINGATAN'
                            : 'PASSED WITH WARNINGS'
                          : lang === 'id'
                          ? 'VALIDASI SUKSES — SIAP UNTUK RILIS'
                          : 'VALIDATION PASSED — READY FOR RELEASE'}
                      </h3>
                      <p className="text-xs text-neutral-300">
                        {validationReport.errorsCount} {lang === 'id' ? 'kesalahan' : 'errors'} •{' '}
                        {validationReport.warningsCount} {lang === 'id' ? 'peringatan' : 'warnings'} •{' '}
                        {checklist.filter((c) => c.checked).length}/{checklist.length}{' '}
                        {lang === 'id' ? 'checklist terpenuhi' : 'checks passed'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Issues List if any */}
              {validationReport && validationReport.issues.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-300">
                    {lang === 'id' ? 'Detail Masalah & Rekomendasi Solusi:' : 'Issue Details & Suggested Fixes:'}
                  </h3>
                  {validationReport.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs ${
                        iss.severity === 'error'
                          ? 'bg-red-950/30 border-red-800 text-red-200'
                          : 'bg-amber-950/30 border-amber-800 text-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {iss.severity === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-white">
                            {lang === 'id' ? iss.descriptionId : iss.description}
                          </div>
                          <div className="text-[11px] opacity-90 mt-0.5">
                            <strong>{lang === 'id' ? 'Saran Perbaikan:' : 'Suggested Fix:'}</strong>{' '}
                            {lang === 'id' ? iss.suggestedFixId : iss.suggestedFix}
                          </div>
                        </div>
                      </div>
                      {iss.field === 'packageId' && (
                        <button
                          onClick={() => setIsEditAppModalOpen(true)}
                          className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded text-[11px] font-medium shrink-0 cursor-pointer"
                        >
                          {lang === 'id' ? 'Ubah ID Paket' : 'Fix Package ID'}
                        </button>
                      )}
                      {iss.field === 'signing' && (
                        <button
                          onClick={() => setIsSigningModalOpen(true)}
                          className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-white rounded text-[11px] font-medium shrink-0 cursor-pointer"
                        >
                          {lang === 'id' ? 'Atur Keystore' : 'Configure Keystore'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sensitive Files Alert */}
              {validationReport && validationReport.sensitiveFiles.length > 0 && (
                <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>
                      {lang === 'id'
                        ? 'PERINGATAN BERKAS SENSITIF TERDETEKSI:'
                        : 'SENSITIVE FILES LEAKAGE WARNING:'}
                    </span>
                  </div>
                  {validationReport.sensitiveFiles.map((sf, idx) => (
                    <div key={idx} className="text-xs text-neutral-300 pl-6 space-y-0.5">
                      <div className="font-mono text-red-200">{sf.file}</div>
                      <div className="text-[11px] text-neutral-400">
                        {lang === 'id' ? sf.recommendationId : sf.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checklist Items */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-semibold text-white">
                  {lang === 'id' ? 'Daftar Periksa Kesiapan Rilis (Production Checklist):' : 'Production Checklist Items:'}
                </h3>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer text-xs transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {lang === 'id' ? item.labelId : item.label}
                          </span>
                          {item.isAutomated && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                              AUTO
                            </span>
                          )}
                          {item.automatedStatus === 'passed' && (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ PASSED</span>
                          )}
                          {item.automatedStatus === 'error' && (
                            <span className="text-[10px] text-red-400 font-bold">✗ FAILED</span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {lang === 'id' ? item.descriptionId : item.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Kompilasi' : 'Proceed to Build'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Build Execution */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'id' ? '6. Eksekusi Kompilasi Rilis' : '6. Release Build Execution'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Kompilasi Gradle assembleRelease / bundleRelease menggunakan toolchain Android resmi.'
                      : 'Official Gradle assembleRelease or bundleRelease compilation with real toolchain.'}
                  </p>
                </div>
              </div>

              {/* Build Control Panel */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-400 block">{lang === 'id' ? 'Target Kompilasi Rilis:' : 'Release Target:'}</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name="relType"
                          value="aab"
                          checked={releaseType === 'aab'}
                          onChange={() => setReleaseType('aab')}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-white">AAB (Android App Bundle)</span>
                        <span className="text-[11px] text-neutral-400">— Google Play</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                        <input
                          type="radio"
                          name="relType"
                          value="apk"
                          checked={releaseType === 'apk'}
                          onChange={() => setReleaseType('apk')}
                          className="text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-white">APK (Universal Release)</span>
                        <span className="text-[11px] text-neutral-400">— Sideloading</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {buildStatus === 'building' ? (
                      <button
                        onClick={() => activeProject && cancelBuild(activeProject.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>{lang === 'id' ? 'Batalkan Build' : 'Cancel Build'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartBuild}
                        disabled={validationReport?.isBlocked}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {lang === 'id' ? 'Mulai Build Release' : 'Build Release'} (
                          {releaseType.toUpperCase()})
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress / Status Bar */}
                {buildStatus !== 'idle' && (
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-300">
                        {buildProgressText || 'Processing...'}
                      </span>
                      {buildDurationSec > 0 && (
                        <span className="text-neutral-400 font-mono text-[11px]">
                          {buildDurationSec.toFixed(1)}s
                        </span>
                      )}
                    </div>
                    {buildStatus === 'building' && (
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-pulse rounded-full w-2/3" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Streaming Terminal Output */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-64">
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Gradle Build Output</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {buildLogs.length} logs
                  </span>
                </div>
                <div className="p-4 font-mono text-[11px] text-neutral-300 overflow-y-auto space-y-1 flex-1 leading-relaxed">
                  {buildLogs.length === 0 ? (
                    <div className="text-neutral-600 italic">
                      {lang === 'id'
                        ? 'Menunggu eksekusi build release...'
                        : 'Waiting to start release build...'}
                    </div>
                  ) : (
                    buildLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`${
                          log.includes('ERROR') || log.includes('FAILED')
                            ? 'text-red-400'
                            : log.includes('SUCCESS')
                            ? 'text-emerald-400 font-bold'
                            : log.includes(':app:')
                            ? 'text-blue-400'
                            : 'text-neutral-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                  <div ref={terminalBottomRef} />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(5)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Inspeksi Artefak' : 'Proceed to Inspect'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Artifact Inspector */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'id' ? '7. Inspeksi Artefak (Artifact Inspector)' : '7. Artifact Inspector'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Analisis biner mendalam dari berkas rilis, integritas tanda tangan, dan dukungan ABI.'
                      : 'Deep binary inspection of compiled release artifact, signature schemes, and ABIs.'}
                  </p>
                </div>
              </div>

              {inspectedArtifact ? (
                <div className="space-y-4">
                  {/* Artifact Primary Card */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <PackageCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base font-mono">
                            {inspectedArtifact.fileName}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {inspectedArtifact.format.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-mono mt-0.5">
                          {inspectedArtifact.filePath}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-neutral-300 mt-2">
                          <span>
                            {lang === 'id' ? 'Ukuran:' : 'Size:'}{' '}
                            <strong className="text-white font-mono">{inspectedArtifact.formattedSize}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Package:{' '}
                            <strong className="text-emerald-400 font-mono">{inspectedArtifact.packageName}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Version:{' '}
                            <strong className="text-white font-mono">
                              v{inspectedArtifact.versionName} ({inspectedArtifact.versionCode})
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold inline-flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>SIGNATURE VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  {/* SHA-256 Checksum Card */}
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-neutral-400" />
                      <div>
                        <span className="text-[11px] text-neutral-400 block font-semibold">
                          SHA-256 CHECKSUM
                        </span>
                        <code className="text-xs text-neutral-200 font-mono">
                          {inspectedArtifact.sha256}
                        </code>
                      </div>
                    </div>
                    <button
                      onClick={() => copyShaToClipboard(inspectedArtifact.sha256)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSha ? (lang === 'id' ? 'Tersalin' : 'Copied') : 'Copy SHA-256'}</span>
                    </button>
                  </div>

                  {/* Signature Details & ABIs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Signature Schemes */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'id' ? 'Integritas Tanda Tangan Digital' : 'Digital Signature Schemes'}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-neutral-800">
                          <span className="text-neutral-400">Scheme:</span>
                          <span className="text-neutral-200 font-mono">
                            {inspectedArtifact.signatureDetails?.scheme}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-800">
                          <span className="text-neutral-400">Algorithm:</span>
                          <span className="text-neutral-200 font-mono">
                            {inspectedArtifact.signatureDetails?.algorithm}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-neutral-800">
                          <span className="text-neutral-400">Certificate Fingerprint:</span>
                          <span className="text-neutral-200 font-mono text-[11px] truncate max-w-[200px]">
                            {inspectedArtifact.signatureDetails?.certificateFingerprintSha256}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-neutral-400">Issuer:</span>
                          <span className="text-neutral-200 font-mono text-[11px]">
                            {inspectedArtifact.signatureDetails?.issuer}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ABI & Permissions */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span>{lang === 'id' ? 'Dukungan Arsitektur & Izin' : 'Architecture & Permissions'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-neutral-400 block mb-1">Supported ABIs:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {inspectedArtifact.abiList.map((abi, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                            >
                              {abi}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[11px] text-neutral-400 block mb-1">Declared Permissions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {inspectedArtifact.permissions.map((perm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-emerald-400"
                            >
                              {perm.replace('android.permission.', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 space-y-2">
                  <PackageCheck className="w-12 h-12 mx-auto text-neutral-600" />
                  <p className="text-xs">
                    {lang === 'id'
                      ? 'Belum ada artefak release yang diinspeksi. Jalankan kompilasi di Step 6.'
                      : 'No release artifact inspected yet. Execute build in Step 6.'}
                  </p>
                  <button
                    onClick={() => setStep(6)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 inline-flex items-center gap-1.5 cursor-pointer mt-2"
                  >
                    <span>{lang === 'id' ? 'Buka Step Build' : 'Go to Build Step'}</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(6)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => setStep(8)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>{lang === 'id' ? 'Lanjut ke Ekspor Paket' : 'Proceed to Export'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Export & Release Management */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'id' ? '8. Ekspor Rilis & Git Tagging' : '8. Release Export & Git Tagging'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {lang === 'id'
                      ? 'Ekspor artefak ke direktori rilis standar beserta laporan HTML dan perintah Git tag.'
                      : 'Export artifacts to standardized release directory with HTML report and Git tagging.'}
                  </p>
                </div>
              </div>

              {/* Export Directory Configuration */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Direktori Ekspor Rilis' : 'Release Export Directory'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exportDirectory}
                      onChange={(e) => setExportDirectory(e.target.value)}
                      placeholder="releases/v1.0.0"
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={async () => {
                        if (activeProject) {
                          const res = await exportReleasePackage(activeProject);
                          if (res.success) {
                            showToast(lang === 'id' ? 'Paket rilis berhasil diekspor!' : 'Release package exported successfully!');
                          }
                        }
                      }}
                      disabled={isExporting || !inspectedArtifact}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isExporting ? (lang === 'id' ? 'Mengekspor...' : 'Exporting...') : (lang === 'id' ? 'Ekspor Paket Rilis' : 'Export Package')}</span>
                    </button>
                  </div>
                </div>

                {/* Exported Files List */}
                {lastExportedFiles.length > 0 && (
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1.5">
                    <span className="text-xs font-semibold text-emerald-400 block">
                      ✓ {lang === 'id' ? 'Berkas Berhasil Diekspor:' : 'Exported Files:'}
                    </span>
                    {lastExportedFiles.map((f, idx) => (
                      <div key={idx} className="text-xs font-mono text-neutral-300 flex items-center gap-2">
                        <FileCheck className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Git Tag & Safety Section */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-xs text-white">
                      {lang === 'id' ? 'Git Tagging & Keamanan Repositori' : 'Git Tagging & Repository Safety'}
                    </span>
                  </div>
                  <button
                    onClick={() => setGitConfirmShown(!gitConfirmShown)}
                    className="text-xs text-blue-400 hover:underline cursor-pointer"
                  >
                    {gitConfirmShown ? (lang === 'id' ? 'Sembunyikan' : 'Hide') : (lang === 'id' ? 'Tampilkan Perintah' : 'Show Commands')}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={gitTag}
                    onChange={(e) => setGitTag(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-48 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-neutral-400">
                    {lang === 'id' ? 'Tag rilis terstandardisasi untuk git' : 'Standardized release tag'}
                  </span>
                </div>

                {gitConfirmShown && (
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1 text-xs font-mono text-neutral-300">
                    {GitSafetyService.generateGitCommands(gitTag).map((cmd, idx) => (
                      <div key={idx} className="text-blue-300">$ {cmd}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(7)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Kembali' : 'Back'}</span>
                </button>
                <button
                  onClick={() => showToast(lang === 'id' ? 'Siklus rilis selesai!' : 'Release cycle completed!')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Selesai' : 'Finish'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right / Quick Release Summary Card (as required by layout mock) */}
        <div className="w-80 border-l border-neutral-800 bg-neutral-900/60 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {lang === 'id' ? 'Ringkasan Rilis' : 'Release Summary'}
            </h3>

            {/* App Box */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                {lang === 'id' ? 'Aplikasi' : 'App'}
              </span>
              <div className="font-bold text-white text-sm truncate">
                {activeProject?.displayName || activeProject?.name || 'My Application'}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono truncate">
                {activeProject?.packageId || 'com.example.app'}
              </div>
            </div>

            {/* Version Box */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                {lang === 'id' ? 'Versi' : 'Version'}
              </span>
              <div className="font-bold text-white text-sm font-mono">
                {activeProject?.versionName || '1.0.0'}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                Build {activeProject?.versionCode || 1}
              </div>
            </div>

            {/* Release Type Selector */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <span className="text-[11px] text-neutral-500 uppercase font-semibold">
                {lang === 'id' ? 'Tipe Rilis' : 'Release Type'}
              </span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                  <input
                    type="radio"
                    name="sideRelType"
                    value="apk"
                    checked={releaseType === 'apk'}
                    onChange={() => setReleaseType('apk')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>APK (Universal)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-200 cursor-pointer">
                  <input
                    type="radio"
                    name="sideRelType"
                    value="aab"
                    checked={releaseType === 'aab'}
                    onChange={() => setReleaseType('aab')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>AAB (App Bundle)</span>
                </label>
              </div>
            </div>

            {/* Signing Status */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                  {lang === 'id' ? 'Penandatanganan' : 'Signing'}
                </span>
                <span className="text-xs font-bold text-white">
                  {signingProfile.isConfigured
                    ? lang === 'id'
                      ? 'Terkonfigurasi'
                      : 'Configured'
                    : lang === 'id'
                    ? 'Belum'
                    : 'Not Configured'}
                </span>
              </div>
              {signingProfile.isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
            </div>

            {/* Validation Status */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                  {lang === 'id' ? 'Validasi' : 'Validation'}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isValidationPassed ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isValidationPassed
                    ? lang === 'id'
                      ? 'Lulus (Passed)'
                      : 'Passed'
                    : lang === 'id'
                    ? 'Terblokir (Blocked)'
                    : 'Blocked'}
                </span>
              </div>
              {isValidationPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>

          {/* Direct Build Release Button */}
          <div className="pt-4 border-t border-neutral-800">
            <button
              onClick={handleStartBuild}
              disabled={validationReport?.isBlocked || buildStatus === 'building'}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-950/60"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{lang === 'id' ? 'Build Release' : 'Build Release'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Release Output Panel (as specified in layout mock) */}
      <div className="h-14 px-6 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            {lang === 'id' ? 'Hasil Rilis:' : 'Release Output:'}
          </span>
          {inspectedArtifact ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                {inspectedArtifact.fileName}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                ({inspectedArtifact.formattedSize})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                ✓ RELEASE READY
              </span>
            </div>
          ) : (
            <span className="text-xs text-neutral-500 italic">
              {lang === 'id'
                ? 'Belum ada artefak rilis. Tekan [Build Release] untuk mengompilasi.'
                : 'No release artifact built yet. Click [Build Release] to compile.'}
            </span>
          )}
        </div>

        {inspectedArtifact && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(7)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Inspeksi Artefak' : 'Inspect'}</span>
            </button>
            <button
              onClick={() => setStep(8)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Ekspor' : 'Export'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <SigningManagerModal />
      <ReleaseHistoryModal />
      <ReleaseNotesModal />
      <AdMobExtensionModal />
      <EditAppModal />
    </div>
  );
};
