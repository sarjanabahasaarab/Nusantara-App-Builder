/**
 * Nusantara App Builder - Consent & Privacy Tab
 * Phase 9: Google User Messaging Platform (UMP) SDK, GDPR/CCPA settings,
 * Privacy Policy URL validation, and regional compliance disclaimers.
 */

import React from 'react';
import {
  Shield,
  Lock,
  Globe2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
  Scale,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useTranslation } from '../../../localization/useTranslation';
import { AdMobValidator } from '../../services/adMobValidator';

export const ConsentPrivacyTab: React.FC = () => {
  const { lang } = useTranslation();
  const config = useMonetizationStore((s) => s.config);
  const updateConfig = useMonetizationStore((s) => s.updateConfig);

  const consent = config.consentConfig;
  const globalSettings = config.globalSettings;
  const privacyUrl = config.privacyPolicyUrl || '';

  const privValidation = AdMobValidator.validatePrivacyPolicyUrl(privacyUrl);

  const updateConsent = (updates: Partial<typeof consent>) => {
    updateConfig({
      consentConfig: {
        ...consent,
        ...updates,
      },
    });
  };

  const updateGlobalSettings = (updates: Partial<typeof globalSettings>) => {
    updateConfig({
      globalSettings: {
        ...globalSettings,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Legal Disclaimer Banner (MANDATORY REQUIREMENT) */}
      <div className="p-4 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-start gap-3 text-xs text-blue-200">
        <Scale className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            {lang === 'id' ? 'Kepatuhan Hukum & Privasi Pengguna:' : 'Legal Compliance & User Privacy:'}
          </span>
          <p className="leading-relaxed">
            {lang === 'id'
              ? 'Konfigurasi consent tersedia. Pastikan pengembang menyesuaikan implementasi dengan wilayah pengguna dan kebijakan yang berlaku. Nusantara App Builder tidak memberikan jaminan hukum legal mutlak.'
              : 'Consent configuration is provided. Developers must ensure their implementation aligns with their user regions and applicable laws (GDPR, CCPA, COPPA). Nusantara App Builder provides technical tooling, not legal advice.'}
          </p>
        </div>
      </div>

      {/* 2. Privacy Policy URL Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {lang === 'id' ? 'URL Kebijakan Privasi (Privacy Policy URL)' : 'Privacy Policy URL'}
            </h3>
          </div>
          {privValidation.isValid ? (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ {lang === 'id' ? 'Terkonfigurasi' : 'Configured'}</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>{lang === 'id' ? 'Belum Diisi' : 'Missing'}</span>
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            {lang === 'id' ? 'Alamat URL Kebijakan Privasi (Wajib untuk Google Play Release)' : 'Public Privacy Policy URL (Required for Google Play Release)'}
          </label>
          <input
            type="url"
            value={privacyUrl}
            onChange={(e) => updateConfig({ privacyPolicyUrl: e.target.value })}
            placeholder="https://example.com/privacy"
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            {lang === 'id'
              ? 'Google Play mewajibkan tautan kebijakan privasi publik yang menjelaskan data yang dikumpulkan oleh SDK pihak ketiga seperti AdMob.'
              : 'Google Play strictly requires an accessible public privacy policy explaining data usage by 3rd party SDKs like AdMob.'}
          </p>
        </div>
      </div>

      {/* 3. Google User Messaging Platform (UMP) Consent SDK Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-white text-sm">
                Google User Messaging Platform (UMP) SDK
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Format dialog persetujuan resmi Google untuk regulasi privasi Uni Eropa (GDPR) dan Inggris'
                  : 'Official Google consent dialog framework for GDPR and UK privacy requirements'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={consent.enabled}
              onChange={(e) => updateConsent({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {consent.enabled && (
          <div className="space-y-4 pt-2 border-t border-neutral-800 text-xs">
            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.personalizedAds}
                  onChange={(e) => updateConsent({ personalizedAds: e.target.checked })}
                  className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500 mt-0.5"
                />
                <div>
                  <strong className="text-white block">
                    {lang === 'id' ? 'Izinkan Permintaan Iklan Dipersonalisasi' : 'Allow Personalized Ads Request'}
                  </strong>
                  <span className="text-[11px] text-neutral-400">
                    {lang === 'id'
                      ? 'Iklan yang dipersonalisasi menghasilkan eCPM lebih tinggi setelah pengguna memberikan persetujuan consent.'
                      : 'Personalized ads yield higher eCPM once the user grants explicit consent.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.requireUnderAgeOfConsent}
                  onChange={(e) => updateConsent({ requireUnderAgeOfConsent: e.target.checked })}
                  className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500 mt-0.5"
                />
                <div>
                  <strong className="text-white block">
                    {lang === 'id' ? 'Pengguna di Bawah Umur Persetujuan (Under Age of Consent)' : 'Tag as Under Age of Consent'}
                  </strong>
                  <span className="text-[11px] text-neutral-400">
                    {lang === 'id'
                      ? 'Menonaktifkan pengumpulan data analitik jika aplikasi menargetkan anak-anak (kepatuhan COPPA).'
                      : 'Prevents personalized data collection if your app targets children (COPPA compliance).'}
                  </span>
                </div>
              </label>
            </div>

            {/* Test Geography */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">
                  {lang === 'id' ? 'Geografi Pengujian (Test Geography)' : 'Consent Test Geography'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {lang === 'id'
                    ? 'Simulasikan perangkat pengujian seolah berada di Wilayah Ekonomi Eropa (EEA)'
                    : 'Forces the UMP consent dialog to appear during emulator and local debug runs'}
                </span>
              </div>
              <select
                value={consent.testGeography}
                onChange={(e) => updateConsent({ testGeography: e.target.value as any })}
                className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
              >
                <option value="eea">Simulate EEA (European Economic Area)</option>
                <option value="disabled">Disabled (Device Location)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Global Ad Content Rating & COPPA */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4 shadow-xl text-xs">
        <h3 className="font-bold text-white text-sm">
          {lang === 'id' ? 'Filter Konten & Klasifikasi Usia Iklan' : 'Ad Content Rating & COPPA'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Max Ad Content Rating
            </label>
            <select
              value={globalSettings.maxAdContentRating}
              onChange={(e) => updateGlobalSettings({ maxAdContentRating: e.target.value as any })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
            >
              <option value="G">G — General Audiences (Semua Umur)</option>
              <option value="PG">PG — Parental Guidance</option>
              <option value="T">T — Teens (Remaja 13+)</option>
              <option value="MA">MA — Mature Audiences</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Google Mobile Ads SDK Version
            </label>
            <input
              type="text"
              value={globalSettings.sdkVersion}
              onChange={(e) => updateGlobalSettings({ sdkVersion: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
