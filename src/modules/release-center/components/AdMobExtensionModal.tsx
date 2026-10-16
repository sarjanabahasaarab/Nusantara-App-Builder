/**
 * Nusantara App Builder - Phase 9 Extension Point: Google AdMob Monetization Foundation
 * Pre-configures AdMob App ID, banner/interstitial units, and GDPR/CCPA user consent settings.
 */

import React, { useState } from 'react';
import { DollarSign, X, Check, ShieldAlert, Sparkles, AlertCircle, Info } from 'lucide-react';
import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { useTranslation } from '../../localization/useTranslation';

export const AdMobExtensionModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useReleaseCenterStore((s) => s.isAdMobModalOpen);
  const setIsOpen = useReleaseCenterStore((s) => s.setIsAdMobModalOpen);
  const adMobConfig = useReleaseCenterStore((s) => s.adMobConfig);
  const setAdMobConfig = useReleaseCenterStore((s) => s.setAdMobConfig);

  const [enabled, setEnabled] = useState(adMobConfig.enabled);
  const [appId, setAppId] = useState(adMobConfig.appId);
  const [testMode, setTestMode] = useState(adMobConfig.testMode);
  const [bannerId, setBannerId] = useState(adMobConfig.bannerAdUnitId || '');
  const [interstitialId, setInterstitialId] = useState(adMobConfig.interstitialAdUnitId || '');
  const [rewardedId, setRewardedId] = useState(adMobConfig.rewardedAdUnitId || '');
  const [consentConfigured, setConsentConfigured] = useState(adMobConfig.consentConfigured);

  if (!isOpen) return null;

  const handleSave = () => {
    setAdMobConfig({
      enabled,
      appId: appId.trim(),
      testMode,
      bannerAdUnitId: bannerId.trim(),
      interstitialAdUnitId: interstitialId.trim(),
      rewardedAdUnitId: rewardedId.trim(),
      consentConfigured,
      placementsCount: (bannerId ? 1 : 0) + (interstitialId ? 1 : 0) + (rewardedId ? 1 : 0),
    });
    setIsOpen(false);
  };

  const useGoogleTestIds = () => {
    setAppId('ca-app-pub-3940256099942544~3347511713');
    setBannerId('ca-app-pub-3940256099942544/6300978111');
    setInterstitialId('ca-app-pub-3940256099942544/1033173712');
    setRewardedId('ca-app-pub-3940256099942544/5224354917');
    setTestMode(true);
    setEnabled(true);
    setConsentConfigured(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Ekstensi Monetisasi (Google AdMob Foundation)' : 'Google AdMob Monetization Foundation'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Konfigurasi iklan rilis & UMP (User Messaging Platform) GDPR untuk Phase 9'
                  : 'Configure release ad units & UMP GDPR consent for Phase 9'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Enable Toggle */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-medium text-xs text-white block">
                {lang === 'id' ? 'Aktifkan Google Mobile Ads SDK di Release' : 'Enable Google Mobile Ads SDK in Release'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {lang === 'id'
                  ? 'Menyisipkan dependensi play-services-ads ke build.gradle dan meta-data manifest'
                  : 'Injects play-services-ads dependency into build.gradle and manifest meta-data'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {enabled && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-neutral-300">
                  {lang === 'id' ? 'AdMob App ID' : 'AdMob App ID'}
                </label>
                <button
                  type="button"
                  onClick={useGoogleTestIds}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'id' ? 'Gunakan Test IDs Resmi' : 'Use Official Test IDs'}</span>
                </button>
              </div>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="ca-app-pub-################~##########"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Banner Ad Unit ID
                  </label>
                  <input
                    type="text"
                    value={bannerId}
                    onChange={(e) => setBannerId(e.target.value)}
                    placeholder="ca-app-pub-.../..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Interstitial Ad Unit ID
                  </label>
                  <input
                    type="text"
                    value={interstitialId}
                    onChange={(e) => setInterstitialId(e.target.value)}
                    placeholder="ca-app-pub-.../..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Rewarded Video Ad Unit ID
                </label>
                <input
                  type="text"
                  value={rewardedId}
                  onChange={(e) => setRewardedId(e.target.value)}
                  placeholder="ca-app-pub-.../..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* GDPR Consent */}
              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg space-y-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfigured}
                    onChange={(e) => setConsentConfigured(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    <strong className="text-white">UMP SDK / GDPR User Consent Dialog</strong>
                  </span>
                </label>
                <p className="text-[11px] text-neutral-400 pl-6">
                  {lang === 'id'
                    ? 'Wajib oleh Google Play untuk pengguna Uni Eropa & Inggris guna mematuhi privasi GDPR.'
                    : 'Required by Google Play for European Economic Area (EEA) and UK privacy compliance.'}
                </p>
              </div>

              {/* Strict Notice if in Production */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg flex items-start gap-2 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    {lang === 'id' ? 'Catatan Produksi Google Play:' : 'Google Play Production Note:'}
                  </span>{' '}
                  {lang === 'id'
                    ? 'Pastikan mengganti Test IDs dengan ID Unit Iklan asli sebelum mengunggah APK/AAB ke Google Play Console.'
                    : 'Ensure you replace test IDs with real ad units before publishing the AAB artifact to production.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 flex justify-end gap-2 bg-neutral-900/90 shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
          >
            {lang === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-900/20"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'id' ? 'Terapkan Monetisasi' : 'Apply Monetization'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
