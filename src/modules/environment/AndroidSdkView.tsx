/**
 * Nusantara App Builder - Android SDK & Environment View
 */

import React from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Terminal,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useEnvStore } from '../../store/envStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUiStore } from '../../store/uiStore';

export const AndroidSdkView: React.FC = () => {
  const { t } = useTranslation();
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
                  Verifikasi kesiapan perangkat Android SDK, Java JDK 17/21, dan Gradle Build System.
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
                  ? 'Semua dependensi Android SDK dan JDK ditemukan dengan valid pada sistem Anda.'
                  : 'Pastikan jalur direktori SDK dan JDK telah diatur di menu Pengaturan.'}
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

        {/* Component Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Android SDK */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Android SDK</span>
              {envStatus.components.androidSdk.isAvailable ? (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Belum Siap
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
              <div>API Level: 34 (Android 14)</div>
              <div>Build Tools: 34.0.0</div>
              <div className="truncate text-neutral-400 text-[10px] mt-2">
                Path: {toolchain.androidSdkPath || 'Belum diatur'}
              </div>
            </div>
          </div>

          {/* Card 2: Java JDK */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Java JDK</span>
              {envStatus.components.jdk.isAvailable ? (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Belum Siap
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
              <div>Versi Target: JDK 17/21</div>
              <div>JAVA_HOME: Aktif</div>
              <div className="truncate text-neutral-400 text-[10px] mt-2">
                Path: {toolchain.jdkPath || 'Belum diatur'}
              </div>
            </div>
          </div>

          {/* Card 3: Gradle */}
          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Gradle Wrapper</span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Tersemat
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 space-y-1 font-mono">
              <div>Versi: 8.5 (Gradlew)</div>
              <div>DSL: Kotlin (.kts)</div>
              <div className="text-neutral-400 text-[10px] mt-2">
                Otomatis diikutsertakan di setiap proyek baru
              </div>
            </div>
          </div>
        </div>

        {/* Windows Setup Instructions */}
        <div className="p-5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3 text-xs">
          <h3 className="font-semibold text-neutral-200">
            Panduan Instalasi Toolchain di Windows 10/11
          </h3>
          <ol className="list-decimal pl-4 space-y-2 text-neutral-300 leading-relaxed">
            <li>
              <strong>Unduh Android Command Line Tools atau Android Studio:</strong> Tempatkan SDK pada jalur default Windows, biasanya <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">%LOCALAPPDATA%\Android\Sdk</code>.
            </li>
            <li>
              <strong>Pasang Java Development Kit (JDK 17):</strong> Unduh Eclipse Temurin 17 (LTS) atau OpenJDK 17. Atur variabel lingkungan sistem <code className="bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-[11px]">JAVA_HOME</code> ke direktori instalasi.
            </li>
            <li>
              <strong>Pemeriksaan Otomatis:</strong> Tekan tombol "Pindai Ulang Sistem" di pojok kanan atas untuk memverifikasi jalur yang terkonfigurasi.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
