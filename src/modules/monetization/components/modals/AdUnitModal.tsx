/**
 * Nusantara App Builder - Ad Unit Creator & Editor Modal
 * Phase 9: Supports Banner, Interstitial, Rewarded, and Native Ad Units.
 */

import React, { useState } from 'react';
import { DollarSign, X, Check, Sparkles, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useTranslation } from '../../../localization/useTranslation';
import {
  AdType,
  BannerPosition,
  BannerSize,
  InterstitialTrigger,
  NativeTemplate,
  OFFICIAL_GOOGLE_TEST_IDS,
} from '../../types';
import { AdMobValidator } from '../../services/adMobValidator';

export const AdUnitModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useMonetizationStore((s) => s.isAdUnitModalOpen);
  const editingAdUnit = useMonetizationStore((s) => s.editingAdUnit);
  const closeAdUnitModal = useMonetizationStore((s) => s.closeAdUnitModal);
  const addAdUnit = useMonetizationStore((s) => s.addAdUnit);
  const updateAdUnit = useMonetizationStore((s) => s.updateAdUnit);
  const config = useMonetizationStore((s) => s.config);

  const isEditing = Boolean(editingAdUnit?.id);

  const [name, setName] = useState(editingAdUnit?.name || 'Home Banner');
  const [type, setType] = useState<AdType>(editingAdUnit?.type || 'banner');
  const [adUnitId, setAdUnitId] = useState(editingAdUnit?.adUnitId || OFFICIAL_GOOGLE_TEST_IDS.banner);
  const [placement, setPlacement] = useState(editingAdUnit?.placement || 'main_screen');
  const [enabled, setEnabled] = useState(editingAdUnit ? editingAdUnit.enabled : true);
  const [mode, setMode] = useState<'test' | 'production'>(editingAdUnit?.mode || config.environment);

  // Type specific
  const [bannerPosition, setBannerPosition] = useState<BannerPosition>(editingAdUnit?.bannerPosition || 'bottom');
  const [bannerSize, setBannerSize] = useState<BannerSize>(editingAdUnit?.bannerSize || 'adaptive');
  const [interstitialTrigger, setInterstitialTrigger] = useState<InterstitialTrigger>(
    editingAdUnit?.interstitialTrigger || 'after_navigation'
  );
  const [frequencyIntervalSec, setFrequencyIntervalSec] = useState<number>(
    editingAdUnit?.frequencyIntervalSec || 60
  );
  const [rewardName, setRewardName] = useState(editingAdUnit?.rewardName || 'Coin');
  const [rewardAmount, setRewardAmount] = useState<number>(editingAdUnit?.rewardAmount || 100);
  const [rewardTrigger, setRewardTrigger] = useState<'watch_ad_button' | 'manual'>(
    editingAdUnit?.rewardTrigger || 'watch_ad_button'
  );
  const [nativeTemplate, setNativeTemplate] = useState<NativeTemplate>(
    editingAdUnit?.nativeTemplate || 'medium'
  );

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyOfficialTestId = () => {
    if (type === 'banner') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.banner);
    else if (type === 'interstitial') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.interstitial);
    else if (type === 'rewarded') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.rewarded);
    else if (type === 'native') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.nativeAdvanced);
    setMode('test');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = AdMobValidator.validateAdUnitId(adUnitId.trim());
    if (!val.isValid) {
      setError(lang === 'id' ? val.errorId || 'Format Ad Unit ID tidak valid' : val.error || 'Invalid Ad Unit ID');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      adUnitId: adUnitId.trim(),
      placement: placement.trim(),
      enabled,
      mode,
      bannerPosition,
      bannerSize,
      interstitialTrigger,
      frequencyIntervalSec,
      rewardName: rewardName.trim(),
      rewardAmount,
      rewardTrigger,
      nativeTemplate,
    };

    if (isEditing && editingAdUnit?.id) {
      updateAdUnit(editingAdUnit.id, payload);
    } else {
      addAdUnit(payload);
    }

    closeAdUnitModal();
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
                {isEditing
                  ? lang === 'id'
                    ? 'Ubah Unit Iklan (Ad Unit)'
                    : 'Edit Ad Unit'
                  : lang === 'id'
                  ? 'Tambah Unit Iklan Baru (Ad Unit)'
                  : 'Add New Ad Unit'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Konfigurasikan format, penempatan, dan perilaku iklan Google AdMob'
                  : 'Configure Google AdMob ad format, placement, and behavior'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAdUnitModal}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                {lang === 'id' ? 'Nama Unit Iklan' : 'Ad Unit Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Home Banner"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                {lang === 'id' ? 'Tipe Iklan' : 'Ad Type'}
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as AdType;
                  setType(newType);
                  if (mode === 'test') {
                    if (newType === 'banner') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.banner);
                    if (newType === 'interstitial') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.interstitial);
                    if (newType === 'rewarded') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.rewarded);
                    if (newType === 'native') setAdUnitId(OFFICIAL_GOOGLE_TEST_IDS.nativeAdvanced);
                  }
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="banner">Banner (Spanduk)</option>
                <option value="interstitial">Interstitial (Layar Penuh)</option>
                <option value="rewarded">Rewarded (Video Berhadiah)</option>
                <option value="native">Native (Iklan Terpadu)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-neutral-300">
                {lang === 'id' ? 'Ad Unit ID (Format: ca-app-pub-xxxx/yyyy)' : 'Ad Unit ID'}
              </label>
              <button
                type="button"
                onClick={handleApplyOfficialTestId}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{lang === 'id' ? 'Gunakan Test ID Resmi' : 'Use Official Test ID'}</span>
              </button>
            </div>
            <input
              type="text"
              value={adUnitId}
              onChange={(e) => setAdUnitId(e.target.value)}
              placeholder="ca-app-pub-3940256099942544/6300978111"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                {lang === 'id' ? 'Penempatan (Placement Tag)' : 'Placement Tag'}
              </label>
              <input
                type="text"
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="home_screen"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                {lang === 'id' ? 'Mode Lingkungan' : 'Environment Mode'}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'test' | 'production')}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="test">Test Mode (Sample Ads)</option>
                <option value="production">Production Mode (Real Ads)</option>
              </select>
            </div>
          </div>

          {/* TYPE-SPECIFIC SETTINGS */}
          {type === 'banner' && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-amber-400 block">
                {lang === 'id' ? 'Pengaturan Khusus Iklan Banner:' : 'Banner Specific Settings:'}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Position</label>
                  <select
                    value={bannerPosition}
                    onChange={(e) => setBannerPosition(e.target.value as BannerPosition)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="bottom">Bottom (Bawah Layar)</option>
                    <option value="top">Top (Atas Layar)</option>
                    <option value="custom">Custom (Visual Placement)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Size</label>
                  <select
                    value={bannerSize}
                    onChange={(e) => setBannerSize(e.target.value as BannerSize)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="adaptive">Adaptive Banner (Disarankan)</option>
                    <option value="standard">Standard (320x50)</option>
                    <option value="large">Large Banner (320x100)</option>
                    <option value="medium_rectangle">Medium Rectangle (300x250)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {type === 'interstitial' && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-purple-400 block">
                {lang === 'id' ? 'Pengaturan Khusus Iklan Interstisial:' : 'Interstitial Specific Settings:'}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Pemicu Tampil (Trigger)</label>
                  <select
                    value={interstitialTrigger}
                    onChange={(e) => setInterstitialTrigger(e.target.value as InterstitialTrigger)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="after_navigation">Setelah Pindah Layar (After Navigation)</option>
                    <option value="after_page">Setelah Halaman Web Termuat</option>
                    <option value="after_action">Setelah Aksi Tertentu (After Action)</option>
                    <option value="manual">Manual Code / Logic Designer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">
                    {lang === 'id' ? 'Batas Frekuensi (Detik)' : 'Frequency Cap (Seconds)'}
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={600}
                    value={frequencyIntervalSec}
                    onChange={(e) => setFrequencyIntervalSec(parseInt(e.target.value) || 60)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    required
                  />
                  <span className="text-[10px] text-neutral-500">Minimal 30 detik untuk mencegah spam</span>
                </div>
              </div>
            </div>
          )}

          {type === 'rewarded' && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-emerald-400 block">
                {lang === 'id' ? 'Pengaturan Khusus Iklan Berhadiah (Rewarded):' : 'Rewarded Specific Settings:'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Reward Name</label>
                  <input
                    type="text"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    placeholder="Coins"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Reward Amount</label>
                  <input
                    type="number"
                    min={1}
                    max={1000000}
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(parseInt(e.target.value) || 100)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-0.5">Trigger</label>
                  <select
                    value={rewardTrigger}
                    onChange={(e) => setRewardTrigger(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="watch_ad_button">Tombol Tonton Iklan</option>
                    <option value="manual">Manual Call (Logic)</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400">
                {lang === 'id'
                  ? 'Aturan: Hadiah hanya diberikan setelah event OnUserEarnedReward resmi diterima dari SDK.'
                  : 'Rule: Rewards are delivered strictly after official OnUserEarnedReward SDK callback.'}
              </p>
            </div>
          )}

          {type === 'native' && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
              <span className="text-xs font-semibold text-blue-400 block">
                {lang === 'id' ? 'Pengaturan Iklan Native:' : 'Native Ad Settings:'}
              </span>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Template Layout</label>
                <select
                  value={nativeTemplate}
                  onChange={(e) => setNativeTemplate(e.target.value as NativeTemplate)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="small">Small Template (Kompak dalam daftar)</option>
                  <option value="medium">Medium Template (Standard Card)</option>
                  <option value="large">Large Template (Hero Feed)</option>
                  <option value="custom">Custom Native Ad Designer</option>
                </select>
              </div>
            </div>
          )}

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                {lang === 'id' ? 'Aktifkan Unit Iklan Ini' : 'Enable This Ad Unit'}
              </span>
              <span className="text-[11px] text-neutral-400">
                {lang === 'id'
                  ? 'Iklan nonaktif tidak akan dimuat atau dieksekusi di runtime'
                  : 'Disabled units are ignored during runtime load requests'}
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

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={closeAdUnitModal}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? (lang === 'id' ? 'Perbarui Unit' : 'Update Unit') : (lang === 'id' ? 'Simpan Unit Iklan' : 'Save Ad Unit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
