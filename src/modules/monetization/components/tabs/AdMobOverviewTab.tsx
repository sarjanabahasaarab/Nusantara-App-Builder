/**
 * Nusantara App Builder - AdMob Center Overview Tab
 * Phase 9: Matches exact user-specified layout with App, AdMob Status,
 * App ID, Ad Units status box, and Action buttons.
 */

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Save,
  Check,
  ShieldAlert,
  ArrowRight,
  Code,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useProjectStore } from '../../../../store/projectStore';
import { useUiStore } from '../../../../store/uiStore';
import { useTranslation } from '../../../localization/useTranslation';
import { AdMobValidator } from '../../services/adMobValidator';

export const AdMobOverviewTab: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);

  const config = useMonetizationStore((s) => s.config);
  const updateConfig = useMonetizationStore((s) => s.updateConfig);
  const toggleAdMobEnabled = useMonetizationStore((s) => s.toggleAdMobEnabled);
  const setActiveTab = useMonetizationStore((s) => s.setActiveTab);
  const useOfficialTestIds = useMonetizationStore((s) => s.useOfficialTestIds);
  const runDiagnostics = useMonetizationStore((s) => s.runDiagnostics);
  const syncToProject = useMonetizationStore((s) => s.syncToProject);
  const setIsGeneratedCodeModalOpen = useMonetizationStore((s) => s.setIsGeneratedCodeModalOpen);

  const isConfigured = config.enabled && Boolean(config.appId.trim());
  const bannerUnit = config.units.find((u) => u.type === 'banner' && u.enabled);
  const interstitialUnit = config.units.find((u) => u.type === 'interstitial' && u.enabled);
  const rewardedUnit = config.units.find((u) => u.type === 'rewarded' && u.enabled);
  const nativeUnit = config.units.find((u) => u.type === 'native' && u.enabled);

  const handleValidate = () => {
    if (activeProject) {
      const rep = runDiagnostics(activeProject, projectFiles);
      if (rep.errorsCount === 0) {
        showToast(
          lang === 'id'
            ? 'Konfigurasi AdMob valid dan siap digunakan!'
            : 'AdMob configuration is valid and ready!'
        );
      } else {
        showToast(
          lang === 'id'
            ? `Ditemukan ${rep.errorsCount} kesalahan konfigurasi AdMob.`
            : `Found ${rep.errorsCount} AdMob configuration errors.`
        );
      }
      setActiveTab('diagnostics');
    }
  };

  const handleSaveAndSync = () => {
    if (activeProject) {
      const res = syncToProject(activeProject, projectFiles);
      if (res.success) {
        showToast(
          lang === 'id'
            ? 'Konfigurasi AdMob & berkas Android berhasil disinkronkan!'
            : 'AdMob configuration & Android files synced successfully!'
        );
      } else {
        showToast(res.error || 'Failed to sync AdMob');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Required Layout Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'id' ? 'Pusat Kontrol AdMob (AdMob Center)' : 'AdMob Center'}
            </h2>
            <p className="text-xs text-neutral-400">
              {lang === 'id'
                ? 'Kelola integrasi monetisasi Android tanpa pengkodean manual'
                : 'Manage Android monetization integration without manual coding'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">
              {lang === 'id' ? 'Status Monetisasi:' : 'Monetization Status:'}
            </span>
            <button
              onClick={toggleAdMobEnabled}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                config.enabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-md shadow-emerald-950/40'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              {config.enabled ? '● ENABLED' : '○ DISABLED'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* App Name */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {lang === 'id' ? 'Aplikasi (App)' : 'App'}
            </span>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{activeProject?.displayName || activeProject?.name || 'My Application'}</span>
              <span className="text-xs font-mono text-neutral-400 font-normal">
                ({activeProject?.packageId || 'com.example.app'})
              </span>
            </div>
          </div>

          {/* AdMob Status */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              AdMob Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                }`}
              />
              <span className={`text-sm font-bold ${isConfigured ? 'text-emerald-400' : 'text-neutral-400'}`}>
                {isConfigured
                  ? lang === 'id'
                    ? 'Configured (Terkonfigurasi)'
                    : 'Configured'
                  : lang === 'id'
                  ? 'Not configured (Belum Dikonfigurasi)'
                  : 'Not configured'}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 ${
                  config.environment === 'production'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                {config.environment.toUpperCase()} MODE
              </span>
            </div>
          </div>

          {/* App ID Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                AdMob App ID
              </span>
              <button
                type="button"
                onClick={useOfficialTestIds}
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Gunakan Test IDs Resmi' : 'Use Official Test IDs'}</span>
              </button>
            </div>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => updateConfig({ appId: e.target.value })}
              placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500">
              {lang === 'id'
                ? 'Format Android: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY. Format yang valid tidak otomatis menjamin pendaftaran di server Google.'
                : 'Android format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY. Valid syntax does not imply active registration on Google servers.'}
            </p>
          </div>

          {/* Ad Units Status Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {lang === 'id' ? 'Unit Iklan (Ad Units)' : 'Ad Units'}
              </span>
              <button
                onClick={() => setActiveTab('ad-units')}
                className="text-xs text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{lang === 'id' ? 'Kelola Unit Iklan' : 'Manage Ad Units'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800 text-xs font-mono">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-neutral-300 font-sans font-medium">Banner</span>
                <span className={bannerUnit ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {bannerUnit ? '✓ Configured' : 'Not configured'}
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-neutral-300 font-sans font-medium">Interstitial</span>
                <span className={interstitialUnit ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {interstitialUnit ? '✓ Configured' : 'Not configured'}
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-neutral-300 font-sans font-medium">Rewarded</span>
                <span className={rewardedUnit ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {rewardedUnit ? '✓ Configured' : 'Not configured'}
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-neutral-300 font-sans font-medium">Native</span>
                <span className={nativeUnit ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                  {nativeUnit ? '✓ Configured' : 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('test-ads')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Ads</span>
              </button>

              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'id' ? 'Validasi Konfigurasi' : 'Validate'}</span>
              </button>

              <button
                onClick={() => setIsGeneratedCodeModalOpen(true)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{lang === 'id' ? 'Lihat Kode' : 'View Code'}</span>
              </button>
            </div>

            <button
              onClick={handleSaveAndSync}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'id' ? 'Simpan & Sinkronkan Proyek' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Warning Notice if enabled in Production */}
      {config.enabled && config.environment === 'production' && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">
              {lang === 'id' ? 'PERINGATAN MODE PRODUKSI ADMOB:' : 'ADMOB PRODUCTION MODE WARNING:'}
            </span>
            <p className="leading-relaxed">
              {lang === 'id'
                ? 'Pastikan Ad Unit ID dan konfigurasi aplikasi sudah benar sebelum mendistribusikan aplikasi ke Google Play Store. Jangan pernah mengklik iklan produksi Anda sendiri pada perangkat pengujian.'
                : 'Ensure your Ad Unit IDs and application configuration are genuine before distributing to Google Play Store. Never click your own live production ads on test devices.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
