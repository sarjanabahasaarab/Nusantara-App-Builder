/**
 * Nusantara App Builder - Website to APK
 * Step 3: App Information & Android Package Identifier
 */

import React from 'react';
import {
  Smartphone,
  Tag,
  Hash,
  User,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';
import { validatePackageId } from '../services/packageIdNormalizer';

export const StepAppInfo: React.FC = () => {
  const { lang } = useTranslation();

  const appInfo = useWebsiteToApkStore((s) => s.appInfo);
  const updateAppInfo = useWebsiteToApkStore((s) => s.updateAppInfo);
  const autoFillPackageIdFromName = useWebsiteToApkStore((s) => s.autoFillPackageIdFromName);

  const packageValidation = validatePackageId(appInfo.packageId);

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
        {/* App Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
            {lang === 'id' ? 'Nama Aplikasi (App Display Name)' : 'App Display Name'} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Smartphone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={appInfo.appName}
              onChange={(e) => {
                updateAppInfo({ appName: e.target.value });
              }}
              placeholder="Contoh: Toko Nusantara"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {lang === 'id'
              ? 'Nama yang akan muncul di layar ponsel Android dan menu launcher.'
              : 'Name displayed on the Android home screen and app launcher.'}
          </p>
        </div>

        {/* Package ID */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-neutral-200">
              {lang === 'id' ? 'ID Paket Android (Package ID)' : 'Android Package ID'} <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={autoFillPackageIdFromName}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'id' ? 'Buat Otomatis' : 'Auto Generate'}</span>
            </button>
          </div>
          <div className="relative">
            <Tag className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={appInfo.packageId}
              onChange={(e) => updateAppInfo({ packageId: e.target.value })}
              placeholder="id.nusantara.tokosaya"
              className={`w-full bg-neutral-950 border rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:ring-1 transition-colors ${
                packageValidation.isValid
                  ? 'border-neutral-700 focus:border-blue-500 focus:ring-blue-500'
                  : 'border-red-500/80 focus:border-red-500 focus:ring-red-500'
              }`}
            />
          </div>

          {/* Package ID validation message */}
          {packageValidation.isValid ? (
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>{lang === 'id' ? 'Package ID valid sesuai aturan Android.' : 'Package ID conforms to Android standards.'}</span>
            </p>
          ) : (
            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{lang === 'id' ? packageValidation.errorId : packageValidation.error}</span>
            </p>
          )}
        </div>

        {/* Versions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
              Version Name
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={appInfo.versionName}
                onChange={(e) => updateAppInfo({ versionName: e.target.value })}
                placeholder="1.0.0"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {lang === 'id' ? 'Versi rilis yang dilihat pengguna (Semantic Versioning)' : 'Display version string'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
              Version Code
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="number"
                min="1"
                step="1"
                value={appInfo.versionCode}
                onChange={(e) => updateAppInfo({ versionCode: parseInt(e.target.value) || 1 })}
                placeholder="1"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm font-mono text-neutral-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {lang === 'id' ? 'Bilangan bulat internal Play Store (naik setiap rilis)' : 'Integer version increment'}
            </p>
          </div>
        </div>

        {/* Developer Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
            {lang === 'id' ? 'Nama Pengembang / Perusahaan' : 'Developer / Organization Name'}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={appInfo.developerName}
              onChange={(e) => updateAppInfo({ developerName: e.target.value })}
              placeholder="Developer Nusantara"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
            {lang === 'id' ? 'Deskripsi Aplikasi' : 'App Description'}
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={appInfo.description}
              onChange={(e) => updateAppInfo({ description: e.target.value })}
              placeholder="Aplikasi Android yang dikonversi dari Website..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
