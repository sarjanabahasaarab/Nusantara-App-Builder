/**
 * Nusantara App Builder - First Run Setup Wizard
 * Phase 7: Guided initial setup detecting JDK, Android SDK, Gradle, and system environment.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Cpu,
  Coffee,
  Check,
  Layers,
} from 'lucide-react';
import { useBuildEngineStore } from '../store/buildEngineStore';
import { useTranslation } from '../../localization/useTranslation';

export const FirstRunSetupModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useBuildEngineStore((s) => s.isFirstRunModalOpen);
  const setIsOpen = useBuildEngineStore((s) => s.setIsFirstRunModalOpen);
  const toolchain = useBuildEngineStore((s) => s.toolchain);
  const diagnose = useBuildEngineStore((s) => s.diagnoseToolchain);

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen && !toolchain) {
      diagnose();
    }
  }, [isOpen, toolchain, diagnose]);

  if (!isOpen) return null;

  const handleFinish = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nusantara_first_run_completed', 'true');
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-neutral-100 text-xs">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-100">
                {lang === 'id' ? 'Selamat Datang di Nusantara App Builder' : 'Welcome to Nusantara App Builder'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Wisaya Konfigurasi Lingkungan Build Android' : 'Android Build Environment Setup Wizard'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-2.5 bg-neutral-950/60 border-b border-neutral-800 flex items-center justify-between text-[11px]">
          <span className={`font-medium ${step === 1 ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
            1. Java JDK
          </span>
          <span className="text-neutral-700">→</span>
          <span className={`font-medium ${step === 2 ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
            2. Android SDK
          </span>
          <span className="text-neutral-700">→</span>
          <span className={`font-medium ${step === 3 ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
            3. Gradle
          </span>
          <span className="text-neutral-700">→</span>
          <span className={`font-medium ${step === 4 ? 'text-blue-400 font-semibold' : 'text-neutral-400'}`}>
            4. {lang === 'id' ? 'Selesai' : 'Finish'}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 min-h-[220px]">
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Coffee className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-sm">
                  {lang === 'id' ? 'Deteksi Java Development Kit (JDK)' : 'Java Development Kit (JDK) Detection'}
                </h4>
              </div>
              <p className="text-neutral-300">
                {lang === 'id'
                  ? 'Nusantara App Builder menggunakan compiler Java/Kotlin modern (JDK 17 LTS atau JDK 21).'
                  : 'Nusantara App Builder requires a modern Java/Kotlin compiler (JDK 17 LTS or JDK 21).'}
              </p>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">JDK Status:</span>
                  {toolchain?.java.installed ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{toolchain.java.version} ({toolchain.java.vendor})</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{lang === 'id' ? 'Belum Terdeteksi' : 'Not Detected'}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>JAVA_HOME:</span>
                  <span className="truncate max-w-[280px]">{toolchain?.java.javaHome || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-sm">
                  {lang === 'id' ? 'Deteksi Android SDK & Toolchain' : 'Android SDK & Toolchain Detection'}
                </h4>
              </div>
              <p className="text-neutral-300">
                {lang === 'id'
                  ? 'Pemeriksaan direktori Android SDK, ADB, AAPT2, dan komponen Build-Tools pada Windows.'
                  : 'Inspection of Android SDK directory, ADB, AAPT2, and Build-Tools on Windows.'}
              </p>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Android SDK:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Terpasang & Siap' : 'Installed & Ready'}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>SDK Path:</span>
                  <span className="truncate max-w-[280px]">{toolchain?.androidSdk.path}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Build Tools:</span>
                  <span>{toolchain?.androidSdk.installedBuildTools.join(', ')}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-sm">
                  {lang === 'id' ? 'Gradle Wrapper & Build Automation' : 'Gradle Wrapper & Build Automation'}
                </h4>
              </div>
              <p className="text-neutral-300">
                {lang === 'id'
                  ? 'Setiap proyek Android di Nusantara App Builder dilengkapi Gradle Wrapper (gradlew.bat) mandiri.'
                  : 'Every Android project in Nusantara App Builder is bundled with a self-contained Gradle Wrapper (gradlew.bat).'}
              </p>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Gradle Wrapper:</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>v8.7 (Android Gradle Plugin 8.4)</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{lang === 'id' ? 'Eksekusi Windows:' : 'Windows Execution:'}</span>
                  <span className="font-mono text-neutral-300">gradlew.bat</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-neutral-100">
                {lang === 'id' ? 'Lingkungan Siap Digunakan!' : 'Environment Ready for Building!'}
              </h4>
              <p className="text-neutral-300 max-w-md mx-auto text-xs">
                {lang === 'id'
                  ? 'Anda siap membangun APK Debug, APK Rilis bertanda tangan, dan App Bundle (AAB) produksi.'
                  : 'You are ready to build Debug APKs, signed Release APKs, and production App Bundles (AAB).'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Sebelumnya' : 'Back'}</span>
              </button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'id' ? 'Lanjutkan' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Mulai Nusantara IDE' : 'Start Nusantara IDE'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
