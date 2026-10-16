/**
 * Nusantara App Builder - Ad Placement Tab (Visual & Website-to-App)
 * Phase 9: Native Android layout integration and Website-to-App Container placement.
 */

import React from 'react';
import {
  Layers,
  Globe2,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Check,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useProjectStore } from '../../../../store/projectStore';
import { useTranslation } from '../../../localization/useTranslation';
import { WebsiteAdPlacement } from '../../types';

export const AdPlacementTab: React.FC = () => {
  const { lang } = useTranslation();
  const config = useMonetizationStore((s) => s.config);
  const updateConfig = useMonetizationStore((s) => s.updateConfig);
  const activeProject = useProjectStore((s) => s.activeProject);

  const websitePlacement = config.websitePlacement;
  const isWebViewProject = Boolean(activeProject?.targetUrl);
  const isHttps = activeProject?.targetUrl?.toLowerCase().startsWith('https://');

  const updateWebsitePlacement = (updates: Partial<typeof websitePlacement>) => {
    updateConfig({
      websitePlacement: {
        ...websitePlacement,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Website-to-App Native Container Placement */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === 'id' ? 'Penempatan Iklan Website-to-App' : 'Website-to-App Ad Placement'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Integrasi AdMob native pada kontainer pembungkus WebView (bukan injeksi JavaScript)'
                  : 'Native AdMob integration on WebView wrapper container (no risky JS injection)'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={websitePlacement.enabled}
              onChange={(e) => updateWebsitePlacement({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>

        <div className="p-6 space-y-5">
          {/* Architecture Flow Explanation */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-2">
            <span className="font-semibold text-neutral-300 block">
              {lang === 'id' ? 'Arsitektur Kontainer Aman:' : 'Secure Container Architecture Flow:'}
            </span>
            <div className="font-mono text-[11px] text-teal-400 flex items-center gap-2 overflow-x-auto">
              <span>Website URL</span>
              <span>→</span>
              <span>Website-to-App</span>
              <span>→</span>
              <span>WebView</span>
              <span>→</span>
              <span className="text-white font-bold">Native Android Container</span>
              <span>→</span>
              <span className="text-amber-400 font-bold">AdMob</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {lang === 'id'
                ? 'Penting: Jangan menyisipkan AdMob JavaScript ke website pihak ketiga. Nusantara App Builder membungkus WebView di dalam LinearLayout native Android sehingga banner tetap native dan stabil.'
                : 'Important: Do not inject AdMob JavaScript directly into 3rd party websites. Nusantara App Builder hosts WebView inside a native Android layout to render real native banners.'}
            </p>
          </div>

          {/* HTTPS check if targetUrl exists */}
          {activeProject?.targetUrl && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                isHttps
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 font-mono">
                {isHttps ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
                <span>Target: {activeProject.targetUrl}</span>
              </div>
              <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                {isHttps ? (lang === 'id' ? 'Secure Website ✓' : 'Secure Website ✓') : 'Warning: Not HTTPS'}
              </span>
            </div>
          )}

          {/* Placement Options Grid */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-300 block">
              {lang === 'id' ? 'Pilih Posisi Penempatan Banner Native:' : 'Select Native Placement Position:'}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  id: 'bottom_native_banner' as WebsiteAdPlacement,
                  name: lang === 'id' ? 'Bottom Native Banner (Standar)' : 'Bottom Native Banner (Default)',
                  desc: 'Banner disematkan di bagian bawah layar secara native di bawah WebView.',
                },
                {
                  id: 'top_native_banner' as WebsiteAdPlacement,
                  name: 'Top Native Banner',
                  desc: 'Banner disematkan di bagian atas layar di atas WebView.',
                },
                {
                  id: 'before_webview' as WebsiteAdPlacement,
                  name: 'Before WebView (Header Slot)',
                  desc: 'Kontainer iklan vertikal sebelum komponen WebView dimulai.',
                },
                {
                  id: 'interstitial_navigation' as WebsiteAdPlacement,
                  name: 'Interstitial Navigation',
                  desc: 'Menampilkan iklan interstitial layar penuh saat pengguna berpindah halaman web.',
                },
              ].map((opt) => {
                const isSelected = websitePlacement.placement === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => updateWebsitePlacement({ placement: opt.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-950/40'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs">{opt.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlap Prevention */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
            <div>
              <span className="font-semibold text-white block">
                {lang === 'id' ? 'Cegah Tumpang Tindih Konten (Overlap Protection)' : 'Overlap Protection'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {lang === 'id'
                  ? 'Menyesuaikan margin WebView secara otomatis agar iklan tidak menutupi tombol website'
                  : 'Adjusts WebView margin automatically to keep website navigation buttons accessible'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={websitePlacement.blockContentOverlap}
              onChange={(e) => updateWebsitePlacement({ blockContentOverlap: e.target.checked })}
              className="rounded border-neutral-700 text-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Visual Designer Drag-and-Drop Components Overview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {lang === 'id' ? 'Komponen Palet Visual Designer' : 'Visual Designer Palette Components'}
            </h3>
            <p className="text-xs text-neutral-400">
              {lang === 'id'
                ? 'Komponen iklan AdMob tersedia langsung di tab Visual Designer untuk drag-and-drop'
                : 'AdMob components are available directly in Visual Designer for visual drag-and-drop'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
            <strong className="text-amber-400 block">AdMob Banner</strong>
            <span className="text-[11px] text-neutral-400">Standard & Adaptive mobile banners</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
            <strong className="text-purple-400 block">AdMob Interstitial</strong>
            <span className="text-[11px] text-neutral-400">Full-screen transition ad overlay</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
            <strong className="text-emerald-400 block">AdMob Rewarded</strong>
            <span className="text-[11px] text-neutral-400">Opt-in video with rewarded callback</span>
          </div>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
            <strong className="text-blue-400 block">AdMob Native</strong>
            <span className="text-[11px] text-neutral-400">Custom match feed layouts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
