/**
 * Nusantara App Builder - Website to APK
 * Step 5: Android WebView Engine & Runtime Settings
 */

import React, { useState } from 'react';
import {
  Settings,
  Code2,
  Database,
  ZoomIn,
  RefreshCw,
  Sliders,
  FileUp,
  Download,
  AlertTriangle,
  WifiOff,
  Navigation,
  Eye,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';

export const StepWebView: React.FC = () => {
  const { lang } = useTranslation();
  const webViewConfig = useWebsiteToApkStore((s) => s.webViewConfig);
  const updateWebViewConfig = useWebsiteToApkStore((s) => s.updateWebViewConfig);

  const [showOfflineModal, setShowOfflineModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Cleartext Alert Banner if turned on */}
      {webViewConfig.cleartextTrafficAllowed && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">
              {lang === 'id' ? 'Peringatan Keamanan: Cleartext Traffic Aktif' : 'Security Warning: Cleartext Traffic Allowed'}
            </div>
            <div className="mt-1 opacity-90 leading-relaxed">
              {lang === 'id'
                ? 'Aplikasi diizinkan memuat traffic HTTP tanpa enkripsi SSL/TLS. Google Play Store merekomendasikan hanya menggunakan HTTPS untuk aplikasi produksi. Pastikan opsi ini hanya aktif untuk pengujian lokal.'
                : 'The application is permitted to load unencrypted HTTP traffic. Google Play recommends HTTPS only for production releases.'}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Web Capabilities */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>{lang === 'id' ? 'Kapabilitas Web Utama' : 'Core Web Capabilities'}</span>
          </div>

          {/* JavaScript */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Eksekusi JavaScript' : 'JavaScript Execution'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Wajib untuk website interaktif (React, Vue, SPA)' : 'Required for interactive websites & SPAs'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.javascriptEnabled}
              onChange={(e) => updateWebViewConfig({ javascriptEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* DOM Storage */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'DOM Storage (LocalStorage / SessionStorage)' : 'DOM Storage (LocalStorage)'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Menyimpan sesi login, keranjang belanja, & cache' : 'Stores user sessions, auth tokens, & cache'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.domStorageEnabled}
              onChange={(e) => updateWebViewConfig({ domStorageEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Database */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Database (IndexedDB)' : 'Database (IndexedDB)'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Penyimpanan data offline sisi klien' : 'Client-side offline database'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.databaseEnabled}
              onChange={(e) => updateWebViewConfig({ databaseEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Kontrol Zoom (Pinch to Zoom)' : 'Zoom & Pinch Controls'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Izinkan pengguna memperbesar halaman' : 'Allow user to pinch to zoom'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.zoomEnabled}
              onChange={(e) => updateWebViewConfig({ zoomEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* User Experience & Navigation */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'id' ? 'Interaksi & Navigasi Pengguna' : 'UX & Navigation'}</span>
          </div>

          {/* Pull to Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Tarik untuk Muat Ulang (Pull-to-Refresh)' : 'Pull to Refresh'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Menggunakan SwipeRefreshLayout bawaan Android' : 'Native Android SwipeRefreshLayout'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.pullToRefresh}
              onChange={(e) => updateWebViewConfig({ pullToRefresh: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Indikator Progres Memuat (Loading Bar)' : 'Linear Progress Bar'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Bilah horizontal di bagian atas saat halaman berpindah' : 'Horizontal loading bar at top'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.progressIndicator}
              onChange={(e) => updateWebViewConfig({ progressIndicator: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Back Button Behavior */}
          <div>
            <div className="text-xs font-medium text-neutral-200 mb-1">
              {lang === 'id' ? 'Perilaku Tombol Kembali (Back Button)' : 'Back Button Behavior'}
            </div>
            <select
              value={webViewConfig.backButtonBehavior}
              onChange={(e) =>
                updateWebViewConfig({
                  backButtonBehavior: e.target.value as 'webview-history' | 'exit-app',
                })
              }
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="webview-history">
                {lang === 'id'
                  ? 'Kembali ke halaman sebelumnya di WebView dulu (Disarankan)'
                  : 'Navigate back in WebView history first (Recommended)'}
              </option>
              <option value="exit-app">
                {lang === 'id' ? 'Langsung keluar dari aplikasi' : 'Exit application immediately'}
              </option>
            </select>
          </div>
        </div>

        {/* Native Android Integrations */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <FileUp className="w-4 h-4 text-purple-400" />
            <span>{lang === 'id' ? 'Integrasi Fitur Android' : 'Android System Integrations'}</span>
          </div>

          {/* File Upload */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Dukungan Unggah Berkas (File Upload)' : 'File Chooser / Upload'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Mengizinkan tag <input type="file"> membuka pemilih file' : 'Allows <input type="file"> dialog'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.fileUploadEnabled}
              onChange={(e) => updateWebViewConfig({ fileUploadEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Download Manager */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Manajer Unduhan (Download Manager)' : 'Native Download Manager'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Unduh berkas PDF, ZIP, gambar langsung ke folder Download' : 'Direct downloads to Downloads folder'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.downloadEnabled}
              onChange={(e) => updateWebViewConfig({ downloadEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Cleartext HTTP Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <div>
              <div className="text-xs font-medium text-amber-300">
                {lang === 'id' ? 'Izinkan Traffic HTTP Polos (Cleartext)' : 'Allow Cleartext HTTP Traffic'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Hanya aktifkan jika website tidak memiliki SSL/HTTPS' : 'Only enable for non-SSL/HTTP testing'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={webViewConfig.cleartextTrafficAllowed}
              onChange={(e) => updateWebViewConfig({ cleartextTrafficAllowed: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* User Agent & Offline Page */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'id' ? 'User Agent & Halaman Offline' : 'User Agent & Offline'}</span>
          </div>

          {/* User Agent */}
          <div>
            <div className="text-xs font-medium text-neutral-200 mb-1">
              User Agent String
            </div>
            <select
              value={webViewConfig.userAgentType}
              onChange={(e) =>
                updateWebViewConfig({
                  userAgentType: e.target.value as 'default' | 'desktop' | 'custom',
                })
              }
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 mb-2"
            >
              <option value="default">Default Android Mobile WebView</option>
              <option value="desktop">Desktop Chrome Emulation</option>
              <option value="custom">Custom User Agent</option>
            </select>

            {webViewConfig.userAgentType === 'custom' && (
              <input
                type="text"
                value={webViewConfig.customUserAgent || ''}
                onChange={(e) => updateWebViewConfig({ customUserAgent: e.target.value })}
                placeholder="Mozilla/5.0 (Linux; Android 14) ..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Offline Fallback */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'id' ? 'Halaman Offline Otomatis' : 'Offline Fallback Page'}</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Menampilkan layar modern saat koneksi internet terputus' : 'Modern screen when network is down'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOfflineModal(true)}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>{lang === 'id' ? 'Pratinjau' : 'Preview'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Page Preview Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-semibold text-neutral-200">
                {lang === 'id' ? 'Pratinjau Halaman Offline (assets/offline.html)' : 'Offline Page Preview'}
              </span>
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            <div className="bg-[#0F172A] rounded-xl p-8 text-center text-white space-y-3 border border-neutral-800">
              <div className="text-4xl">📡</div>
              <div className="text-base font-bold">Tidak Dapat Terhubung</div>
              <div className="text-xs text-neutral-400 max-w-xs mx-auto">
                Periksa koneksi internet Anda atau coba muat ulang halaman aplikasi.
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Coba Lagi (Retry)
              </button>
            </div>

            <div className="text-[11px] text-neutral-500 text-center">
              File ini disimpan otomatis ke <code>app/src/main/assets/offline.html</code> di proyek Android.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
