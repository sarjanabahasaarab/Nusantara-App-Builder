/**
 * Nusantara App Builder - Android SDK & Environment View
 * Phase 2: Granular diagnostic view for SDK, ADB, Platforms, JDK, and Gradle.
 */

import React from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  FolderOpen,
  Terminal,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useEnvStore } from '../../store/envStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';
import { ComponentStatus } from '../../types/settings';
import { COMPATIBLE_TOOLCHAIN } from '../project-manager/templates/commonAndroidFiles';

export const AndroidSdkView: React.FC = () => {
  const { t, lang } = useTranslation();
  const envStatus = useEnvStore((s) => s.status);
  const isChecking = useEnvStore((s) => s.isChecking);
  const checkEnvironment = useEnvStore((s) => s.checkEnvironment);
  const toolchain = useSettingsStore((s) => s.settings.toolchain);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const handleScan = async () => {
    await checkEnvironment();
    showToast('Pemindaian toolchain selesai.');
  };

  const getStatusBadge = (status: ComponentStatus) => {
    switch (status) {
      case 'installed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Installed</span>
          </span>
        );
      case 'missing':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-red-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>Missing</span>
          </span>
        );
      case 'misconfigured':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Misconfigured</span>
          </span>
        );
      case 'unable-to-detect':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unable to detect</span>
          </span>
        );
    }
  };

  const componentsList = [
    envStatus.components.androidSdk,
    envStatus.components.adb,
    envStatus.components.sdkPlatform,
    envStatus.components.jdk,
    envStatus.components.gradle,
    envStatus.components.directoryAccess,
  ];

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 p-6 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dasbor</span>
        </button>

        {/* Header Card */}
        <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-100">
                  {t.sidebar.androidSdk}
                </h1>
                <p className="text-xs text-neutral-400">
                  Diagnostik lingkungan SDK 34, ADB, Platform android-34, JDK 17 LTS, dan Gradle 8.7.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Memindai...' : 'Pindai Ulang Sistem'}</span>
          </button>
        </div>

        {/* Toolchain Compatibility Matrix Info */}
        <div className="p-4 bg-neutral-900/60 rounded-lg border border-neutral-800 text-xs">
          <div className="font-semibold text-neutral-200 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Matriks Versi Toolchain Terverifikasi (Phase 2):</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px] text-neutral-300">
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">AGP Version</span>
              <span className="text-blue-400 font-semibold">{COMPATIBLE_TOOLCHAIN.agpVersion}</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Gradle Wrapper</span>
              <span className="text-emerald-400 font-semibold">{COMPATIBLE_TOOLCHAIN.gradleVersion}</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Kotlin Version</span>
              <span className="text-purple-400 font-semibold">{COMPATIBLE_TOOLCHAIN.kotlinVersion}</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Target SDK / JDK</span>
              <span className="text-amber-400 font-semibold">API {COMPATIBLE_TOOLCHAIN.targetSdk} / JDK {COMPATIBLE_TOOLCHAIN.jdkVersion}</span>
            </div>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-lg border flex items-center justify-between text-xs ${
            envStatus.overallReady
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {envStatus.overallReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-sm">
                {envStatus.overallReady
                  ? 'Lingkungan Toolchain Siap Digunakan'
                  : 'Konfigurasi Toolchain Memerlukan Tindakan'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {envStatus.overallReady
                  ? 'Android SDK 34, JDK 17, dan Gradle 8.7 telah terverifikasi untuk kompilasi assembleDebug.'
                  : 'Pastikan jalur direktori SDK dan JDK telah diatur dengan benar di menu Pengaturan.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('settings')}
            className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            Buka Pengaturan
          </button>
        </div>

        {/* Granular Component Breakdown (6 Components) */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Rincian Status Komponen Sistem (6 Komponen)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {componentsList.map((comp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200">{comp.name}</span>
                    {getStatusBadge(comp.status)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                    {lang === 'id' ? comp.statusTextId : comp.statusText}
                  </div>
                  {comp.version && (
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      Versi: {comp.version}
                    </div>
                  )}
                  {comp.configuredPath && (
                    <div className="text-[10px] text-neutral-400 font-mono truncate mt-1">
                      Jalur: {comp.configuredPath}
                    </div>
                  )}
                </div>

                {comp.diagnosticAdvice && (
                  <div className="p-2 bg-neutral-950 rounded text-[10px] text-amber-300 border border-amber-900/40">
                    💡 {lang === 'id' ? comp.diagnosticAdviceId : comp.diagnosticAdvice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Windows Setup Instructions */}
        <div className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3 text-xs">
          <h3 className="font-semibold text-neutral-200">
            Panduan Menyiapkan Android SDK & JDK 17
          </h3>
          <ol className="list-decimal pl-4 space-y-2 text-neutral-300 leading-relaxed">
            <li>
              <strong>Android SDK:</strong> Letakkan pada jalur standar Windows: <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">%LOCALAPPDATA%\Android\Sdk</code>. Pastikan paket <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">platform-tools</code> dan <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">platforms;android-34</code> terpasang.
            </li>
            <li>
              <strong>Java JDK 17 LTS:</strong> Unduh Eclipse Temurin 17 (LTS) dari adoptium.net. Atur variabel lingkungan sistem <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">JAVA_HOME</code> ke direktori instalasi.
            </li>
            <li>
              <strong>Gradle:</strong> Tidak perlu instalasi manual terpisah! Setiap proyek Nusantara menghasilkan Gradle Wrapper 8.7 resmi lengkap dengan skrip <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">gradlew.bat</code>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
