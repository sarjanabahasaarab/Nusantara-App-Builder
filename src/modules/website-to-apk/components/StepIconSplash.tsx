/**
 * Nusantara App Builder - Website to APK
 * Step 4: Application Icon & Android 12+ Splash Screen Settings
 */

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  Layers,
  Palette,
  ShieldCheck,
  Smartphone,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';

const PRESET_ICONS = [
  { id: 'store', label: '🛍️ Toko', emoji: '🛍️' },
  { id: 'globe', label: '🌐 Web', emoji: '🌐' },
  { id: 'newspaper', label: '📰 Berita', emoji: '📰' },
  { id: 'app', label: '📱 App', emoji: '📱' },
  { id: 'cart', label: '🛒 Keranjang', emoji: '🛒' },
  { id: 'rocket', label: '🚀 Cepat', emoji: '🚀' },
];

export const StepIconSplash: React.FC = () => {
  const { lang } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splashLogoInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'icon' | 'splash'>('icon');
  const [iconShape, setIconShape] = useState<'squircle' | 'circle' | 'square'>('squircle');
  const [isSimulatingSplash, setIsSimulatingSplash] = useState(false);

  const iconConfig = useWebsiteToApkStore((s) => s.iconConfig);
  const updateIconConfig = useWebsiteToApkStore((s) => s.updateIconConfig);
  const splashScreen = useWebsiteToApkStore((s) => s.splashScreen);
  const updateSplashScreen = useWebsiteToApkStore((s) => s.updateSplashScreen);
  const appInfo = useWebsiteToApkStore((s) => s.appInfo);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateIconConfig({
        type: 'custom',
        iconDataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSplashLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSplashScreen({
        logoDataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerSplashSimulation = () => {
    setIsSimulatingSplash(true);
    setTimeout(() => {
      setIsSimulatingSplash(false);
    }, splashScreen.durationMs);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs: Icon vs Splash */}
      <div className="flex border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab('icon')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'icon'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{lang === 'id' ? 'Ikon Aplikasi (Launcher Icon)' : 'App Launcher Icon'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('splash')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'splash'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'id' ? 'Layar Pembuka (Splash Screen)' : 'Splash Screen'}</span>
        </button>
      </div>

      {/* TAB 1: LAUNCHER ICON */}
      {activeTab === 'icon' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="md:col-span-2 space-y-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div>
              <div className="text-xs font-semibold text-neutral-200 mb-2">
                {lang === 'id' ? 'Pilih Ikon Cepat / Preset' : 'Quick Preset Icon'}
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_ICONS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      // Generate simple svg data url
                      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><text x="64" y="80" font-size="64" text-anchor="middle">${preset.emoji}</text></svg>`;
                      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
                      updateIconConfig({ type: 'preset', iconDataUrl: dataUrl });
                    }}
                    className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/60"
                  >
                    <span>{preset.emoji}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div>
              <div className="text-xs font-semibold text-neutral-200 mb-2">
                {lang === 'id' ? 'Atau Unggah Ikon Kustom (PNG / SVG)' : 'Or Upload Custom Icon (PNG / SVG)'}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleIconUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer border border-neutral-700"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>{lang === 'id' ? 'Pilih File Gambar...' : 'Choose Image File...'}</span>
              </button>
              <p className="text-[11px] text-neutral-500 mt-1">
                {lang === 'id'
                  ? 'Ukuran disarankan 512x512 piksel dengan latar transparan atau solid.'
                  : 'Recommended size 512x512 pixels with transparent or solid background.'}
              </p>
            </div>

            {/* Background Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                  {lang === 'id' ? 'Warna Latar Belakang Ikon' : 'Icon Background Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={iconConfig.backgroundColor}
                    onChange={(e) => updateIconConfig({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-neutral-700 bg-neutral-950 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={iconConfig.backgroundColor}
                    onChange={(e) => updateIconConfig({ backgroundColor: e.target.value })}
                    className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono text-neutral-200 w-28 uppercase"
                  />
                </div>
              </div>

              {/* Padding Slider (Safe area margin) */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-200 mb-1.5">
                  <span>{lang === 'id' ? 'Padding Area Aman' : 'Safe Area Padding'}</span>
                  <span className="font-mono text-neutral-400">{iconConfig.paddingPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={iconConfig.paddingPercent}
                  onChange={(e) => updateIconConfig({ paddingPercent: parseInt(e.target.value) || 0 })}
                  className="w-full cursor-pointer accent-blue-500"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  {lang === 'id' ? 'Mencegah logo terpotong pada launcher bulat' : 'Prevents clipping on circular launchers'}
                </p>
              </div>
            </div>

            {/* Shape Preview Toggle */}
            <div>
              <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                {lang === 'id' ? 'Bentuk Masking Preview' : 'Preview Masking Shape'}
              </label>
              <div className="flex gap-2">
                {(['squircle', 'circle', 'square'] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setIconShape(shape)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-pointer border ${
                      iconShape === shape
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Icon Live Preview Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="text-xs font-semibold text-neutral-300 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'id' ? 'Android Adaptive Icon' : 'Android Adaptive Icon'}</span>
            </div>

            {/* Shape frame */}
            <div
              className={`w-32 h-32 flex items-center justify-center shadow-2xl relative transition-all border border-neutral-700 overflow-hidden ${
                iconShape === 'circle'
                  ? 'rounded-full'
                  : iconShape === 'squircle'
                  ? 'rounded-3xl'
                  : 'rounded-xl'
              }`}
              style={{ backgroundColor: iconConfig.backgroundColor }}
            >
              {iconConfig.iconDataUrl ? (
                <img
                  src={iconConfig.iconDataUrl}
                  alt="App Icon"
                  className="w-full h-full object-contain"
                  style={{ padding: `${iconConfig.paddingPercent}%` }}
                />
              ) : (
                <div className="text-4xl">🌐</div>
              )}

              {/* Safe area ring overlay */}
              <div className="absolute inset-0 rounded-full border border-dashed border-white/20 pointer-events-none scale-75" />
            </div>

            <div className="text-sm font-semibold text-neutral-200 mt-4">
              {appInfo.appName || 'Aplikasi Saya'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              res/mipmap-xxxhdpi/ic_launcher.png
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPLASH SCREEN */}
      {activeTab === 'splash' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            {/* Enable toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  {lang === 'id' ? 'Aktifkan Layar Pembuka (Splash Screen)' : 'Enable Splash Screen'}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {lang === 'id'
                    ? 'Tampilkan transisi visual yang halus saat aplikasi sedang memuat WebView'
                    : 'Show a smooth visual branding transition while WebView initializes'}
                </p>
              </div>

              <input
                type="checkbox"
                checked={splashScreen.enabled}
                onChange={(e) => updateSplashScreen({ enabled: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {splashScreen.enabled && (
              <>
                {/* Modern Android 12 Badge */}
                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">
                      {lang === 'id' ? 'Android 12+ SplashScreen API' : 'Android 12+ SplashScreen API'}
                    </span>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {lang === 'id'
                        ? 'Mematuhi pedoman Google Play terbaru dengan animasi ikon tengah otomatis dan latar warna tema.'
                        : 'Complies with official Google Play guidelines with center icon animation and theme color window.'}
                    </p>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-200 mb-1.5">
                    <span>{lang === 'id' ? 'Durasi Tampilan' : 'Display Duration'}</span>
                    <span className="font-mono text-neutral-400">
                      {(splashScreen.durationMs / 1000).toFixed(1)}s ({splashScreen.durationMs}ms)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="3000"
                    step="250"
                    value={splashScreen.durationMs}
                    onChange={(e) => updateSplashScreen({ durationMs: parseInt(e.target.value) || 1500 })}
                    className="w-full cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Background color */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                    {lang === 'id' ? 'Warna Latar Belakang Splash' : 'Splash Background Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={splashScreen.backgroundColor}
                      onChange={(e) => updateSplashScreen({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border border-neutral-700 bg-neutral-950 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={splashScreen.backgroundColor}
                      onChange={(e) => updateSplashScreen({ backgroundColor: e.target.value })}
                      className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs font-mono text-neutral-200 w-28 uppercase"
                    />
                  </div>
                </div>

                {/* Show App Title */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-neutral-300">
                    {lang === 'id' ? 'Tampilkan Judul Aplikasi di Bawah Logo' : 'Display App Title Below Logo'}
                  </span>
                  <input
                    type="checkbox"
                    checked={splashScreen.showAppTitle}
                    onChange={(e) => updateSplashScreen({ showAppTitle: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>

          {/* Splash Preview & Simulator */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="text-xs font-semibold text-neutral-300 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>{lang === 'id' ? 'Simulasi Layar Splash' : 'Splash Simulation'}</span>
            </div>

            {/* Mobile frame */}
            <div
              className="w-48 h-80 rounded-2xl border-4 border-neutral-700 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden transition-all"
              style={{
                backgroundColor: splashScreen.enabled ? splashScreen.backgroundColor : '#0F172A',
              }}
            >
              {splashScreen.enabled ? (
                <div
                  className={`flex flex-col items-center justify-center text-center p-4 transition-all duration-500 ${
                    isSimulatingSplash ? 'scale-110 opacity-100' : 'opacity-90'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-white/10 flex items-center justify-center mb-3 shadow-lg">
                    {iconConfig.iconDataUrl ? (
                      <img
                        src={iconConfig.iconDataUrl}
                        alt="Logo"
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-3xl">🌐</span>
                    )}
                  </div>
                  {splashScreen.showAppTitle && (
                    <div className="text-xs font-bold text-white tracking-wide">
                      {appInfo.appName || 'Nusantara App'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-500 text-xs text-center px-4">
                  {lang === 'id' ? 'Splash Screen Dinonaktifkan' : 'Splash Screen Disabled'}
                </div>
              )}
            </div>

            {splashScreen.enabled && (
              <button
                type="button"
                onClick={triggerSplashSimulation}
                disabled={isSimulatingSplash}
                className="mt-4 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'id' ? 'Uji Animasi Splash' : 'Test Splash Animation'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
