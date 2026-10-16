/**
 * Nusantara App Builder - Test Ads Mode Tab
 * Phase 9: Official Google AdMob Test Identifiers, One-Click Test ID injection,
 * interactive simulator (Banner, Interstitial, Rewarded, Native), and safety policy warnings.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Award,
  X,
  ExternalLink,
  Layers,
  Coins,
  Film,
  Info,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useTranslation } from '../../../localization/useTranslation';
import { useUiStore } from '../../../../store/uiStore';
import { OFFICIAL_GOOGLE_TEST_IDS } from '../../types';

export const TestAdsTab: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const config = useMonetizationStore((s) => s.config);
  const updateConfig = useMonetizationStore((s) => s.updateConfig);
  const useOfficialTestIds = useMonetizationStore((s) => s.useOfficialTestIds);
  const setEnvironment = useMonetizationStore((s) => s.setEnvironment);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [simulatedRewardBalance, setSimulatedRewardBalance] = useState(250);
  const [activeSimulator, setActiveSimulator] = useState<
    'none' | 'banner' | 'interstitial' | 'rewarded' | 'native'
  >('none');
  const [interstitialSecondsLeft, setInterstitialSecondsLeft] = useState(5);
  const [rewardedSecondsLeft, setRewardedSecondsLeft] = useState(5);
  const [rewardedGranted, setRewardedGranted] = useState(false);

  const isIndo = lang === 'id';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    showToast(isIndo ? 'ID Disalin ke clipboard!' : 'ID copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleApplyTestIds = () => {
    useOfficialTestIds();
    showToast(
      isIndo
        ? 'ID Uji Resmi Google AdMob berhasil diterapkan ke seluruh konfigurasi!'
        : 'Official Google AdMob Test IDs applied to all configurations!'
    );
  };

  const handleSwitchToProduction = () => {
    setEnvironment('production');
    showToast(
      isIndo
        ? 'Beralih ke mode Produksi. Pastikan semua Ad Unit ID telah diisi dengan ID terdaftar!'
        : 'Switched to Production mode. Ensure all Ad Unit IDs are registered in your AdMob Console!'
    );
  };

  // Interstitial Simulator Handler
  const startInterstitialSimulator = () => {
    setActiveSimulator('interstitial');
    setInterstitialSecondsLeft(5);
    const interval = setInterval(() => {
      setInterstitialSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Rewarded Simulator Handler
  const startRewardedSimulator = () => {
    setActiveSimulator('rewarded');
    setRewardedSecondsLeft(5);
    setRewardedGranted(false);
    const interval = setInterval(() => {
      setRewardedSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRewardedGranted(true);
          const rewardAmount = config.units.find((u) => u.type === 'rewarded')?.rewardAmount || 100;
          setSimulatedRewardBalance((bal) => bal + rewardAmount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const officialTestItems = [
    {
      key: 'appId',
      name: isIndo ? 'Test App ID (Android)' : 'Test App ID (Android)',
      type: 'Application',
      id: OFFICIAL_GOOGLE_TEST_IDS.appId,
    },
    {
      key: 'banner',
      name: isIndo ? 'Test Banner Ad' : 'Test Banner Ad',
      type: 'Banner',
      id: OFFICIAL_GOOGLE_TEST_IDS.banner,
    },
    {
      key: 'interstitial',
      name: isIndo ? 'Test Interstitial Ad' : 'Test Interstitial Ad',
      type: 'Interstitial',
      id: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
    },
    {
      key: 'rewarded',
      name: isIndo ? 'Test Rewarded Video Ad' : 'Test Rewarded Video Ad',
      type: 'Rewarded',
      id: OFFICIAL_GOOGLE_TEST_IDS.rewarded,
    },
    {
      key: 'native',
      name: isIndo ? 'Test Native Advanced Ad' : 'Test Native Advanced Ad',
      type: 'Native',
      id: OFFICIAL_GOOGLE_TEST_IDS.nativeAdvanced,
    },
    {
      key: 'rewardedInterstitial',
      name: isIndo ? 'Test Rewarded Interstitial' : 'Test Rewarded Interstitial',
      type: 'Rewarded Interstitial',
      id: OFFICIAL_GOOGLE_TEST_IDS.rewardedInterstitial,
    },
  ];

  const rewardedUnit = config.units.find((u) => u.type === 'rewarded');
  const rewardName = rewardedUnit?.rewardName || 'Coin';
  const rewardAmount = rewardedUnit?.rewardAmount || 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Environment & Fast Switcher Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {isIndo ? 'Status Lingkungan Iklan' : 'Ad Environment Status'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  config.environment === 'test'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {config.environment === 'test'
                  ? isIndo
                    ? '● MODE TEST (AMAN)'
                    : '● TEST MODE (SAFE)'
                  : isIndo
                  ? '● PRODUKSI (REAL ADS)'
                  : '● PRODUCTION (REAL ADS)'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {isIndo
                ? 'Mode Uji Iklan Resmi Google AdMob'
                : 'Official Google AdMob Test Ads Mode'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {isIndo
                ? 'Gunakan ID pengujian terverifikasi dari Google selama proses pengembangan. Jangan pernah mengklik iklan produksi sendiri untuk mencegah penangguhan akun.'
                : 'Use verified Google test identifiers during development. Never click your own production ads to prevent account termination due to invalid activity.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleApplyTestIds}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Gunakan Google Test IDs' : 'Use Google Test IDs'}</span>
            </button>
            <button
              onClick={handleSwitchToProduction}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              <span>{isIndo ? 'Beralih ke ID Produksi' : 'Switch to Production IDs'}</span>
            </button>
          </div>
        </div>

        {/* Policy Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-3.5 bg-amber-950/30 border border-amber-900/60 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-0.5">
                {isIndo ? 'Peringatan Build Release:' : 'Release Build Warning:'}
              </span>
              {isIndo
                ? 'Jangan mendistribusikan APK/AAB release dengan Test ID. Iklan uji menampilkan label tanda air (watermark) dan tidak menghasilkan pendapatan moneter.'
                : 'Do not distribute release APK/AAB with Test IDs. Test ads render watermarks and do not generate monetization revenue on Google Play.'}
            </div>
          </div>

          <div className="p-3.5 bg-red-950/30 border border-red-900/60 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-red-300 block mb-0.5">
                {isIndo ? 'Peringatan Pengujian Perangkat:' : 'Device Testing Warning:'}
              </span>
              {isIndo
                ? 'Dilarang menguji aplikasi di perangkat pribadi menggunakan ID Produksi tanpa mendaftarkannya sebagai Test Device di Konsol AdMob.'
                : 'Never test apps on personal devices using Production IDs without registering test device IDs in Google AdMob Console to prevent invalid traffic penalties.'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Google Test Identifiers Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isIndo ? 'Daftar ID Uji Resmi Google' : 'Official Google Test Identifiers'}
            </h4>
            <p className="text-xs text-neutral-400">
              {isIndo
                ? 'ID standar Google untuk menguji respons SDK tanpa risiko pelanggaran kebijakan'
                : 'Standard Google IDs for testing SDK responses with zero policy risk'}
            </p>
          </div>
          <a
            href="https://developers.google.com/admob/android/test-ads"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>{isIndo ? 'Dokumentasi Google AdMob' : 'Google AdMob Docs'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="divide-y divide-neutral-800">
          {officialTestItems.map((item) => {
            const isCopied = copiedKey === item.key;
            return (
              <div
                key={item.key}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-800/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-200 text-xs">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                      {item.type}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-amber-400 mt-1 select-all">
                    {item.id}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.id, item.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors self-start sm:self-auto ${
                    isCopied
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? (isIndo ? 'Tersalin' : 'Copied') : isIndo ? 'Salin' : 'Copy'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Ad Simulator */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{isIndo ? 'Simulator Iklan AdMob Interaktif' : 'Interactive AdMob Ad Simulator'}</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isIndo
                ? 'Uji alur callback SDK, visual banner, interstitial, dan listener reward pengguna secara langsung'
                : 'Live preview of SDK callbacks, banner rendering, interstitial transitions, and reward listeners'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs text-neutral-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{isIndo ? 'Saldo Reward Uji:' : 'Test Reward Balance:'}</span>
            <span className="font-mono font-bold text-amber-400">
              {simulatedRewardBalance} {rewardName}s
            </span>
          </div>
        </div>

        {/* Simulator Selection Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <button
            onClick={() => setActiveSimulator(activeSimulator === 'banner' ? 'none' : 'banner')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeSimulator === 'banner'
                ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">{isIndo ? '1. Banner Uji' : '1. Test Banner'}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">320x50 / Adaptive</div>
          </button>

          <button
            onClick={startInterstitialSimulator}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeSimulator === 'interstitial'
                ? 'bg-purple-950/40 border-purple-600 text-purple-200'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">{isIndo ? '2. Interstitial Uji' : '2. Test Interstitial'}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Full Screen Overlay</div>
          </button>

          <button
            onClick={startRewardedSimulator}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeSimulator === 'rewarded'
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">{isIndo ? '3. Rewarded Video' : '3. Test Rewarded'}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">+{rewardAmount} {rewardName}</div>
          </button>

          <button
            onClick={() => setActiveSimulator(activeSimulator === 'native' ? 'none' : 'native')}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeSimulator === 'native'
                ? 'bg-blue-950/40 border-blue-600 text-blue-200'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">{isIndo ? '4. Native Advanced' : '4. Test Native'}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Custom View Card</div>
          </button>
        </div>

        {/* Live Simulator Canvas */}
        <div className="mt-6 p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
          {activeSimulator === 'none' && (
            <div className="text-center text-neutral-500 py-6">
              <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">
                {isIndo
                  ? 'Pilih salah satu tombol di atas untuk mensimulasikan respons iklan AdMob'
                  : 'Select one of the buttons above to simulate AdMob ad responses'}
              </p>
            </div>
          )}

          {/* Banner Simulator View */}
          {activeSimulator === 'banner' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-[11px] text-neutral-400 font-mono">
                {isIndo ? 'Simulasi AdView (com.google.android.gms.ads.AdView):' : 'AdView Simulation:'}
              </div>
              <div className="w-full max-w-sm h-14 bg-neutral-900 border-2 border-dashed border-amber-600/70 rounded flex items-center justify-between px-3 py-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-neutral-950">
                    Ad
                  </span>
                  <div>
                    <div className="text-xs font-bold text-neutral-200">Google Test Ad</div>
                    <div className="text-[10px] text-neutral-400">Nice job! 320x50 Standard Banner</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-amber-400">320x50</div>
              </div>
            </div>
          )}

          {/* Native Simulator View */}
          {activeSimulator === 'native' && (
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-lg p-3.5 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Google Cloud Enterprise</span>
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-500 text-neutral-950">
                        Ad
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Sponsored • 4.8 ★★★★★</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded">
                  Install
                </button>
              </div>
              <p className="text-xs text-neutral-300 leading-snug">
                Scale your Android applications seamlessly with secure cloud infrastructure and native AdMob SDK integration.
              </p>
            </div>
          )}

          {/* Interstitial Simulator Modal */}
          {activeSimulator === 'interstitial' && (
            <div className="absolute inset-0 bg-neutral-900 z-20 flex flex-col items-center justify-center p-4">
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">
                  {interstitialSecondsLeft > 0
                    ? isIndo
                      ? `Dapat ditutup dalam ${interstitialSecondsLeft}s`
                      : `Skippable in ${interstitialSecondsLeft}s`
                    : isIndo
                    ? 'Bisa ditutup sekarang'
                    : 'Ready to close'}
                </span>
                <button
                  disabled={interstitialSecondsLeft > 0}
                  onClick={() => setActiveSimulator('none')}
                  className={`p-1.5 rounded-lg border transition-all ${
                    interstitialSecondsLeft > 0
                      ? 'opacity-30 cursor-not-allowed bg-neutral-800 border-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center max-w-sm space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-neutral-950">
                  Ad • Full Screen Interstitial
                </span>
                <h3 className="text-base font-bold text-white">
                  Google AdMob Interstitial Test
                </h3>
                <p className="text-xs text-neutral-300">
                  {isIndo
                    ? 'Ini adalah simulasi tampilan iklan layar penuh saat perpindahan halaman atau aksi navigasi.'
                    : 'This is a simulation of a full-screen interstitial ad displayed during navigation transitions.'}
                </p>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Unit ID: {OFFICIAL_GOOGLE_TEST_IDS.interstitial}
                </div>
              </div>
            </div>
          )}

          {/* Rewarded Simulator Modal */}
          {activeSimulator === 'rewarded' && (
            <div className="absolute inset-0 bg-neutral-950 z-20 flex flex-col items-center justify-center p-4">
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-xs text-neutral-300 font-mono">
                  {rewardedSecondsLeft > 0 ? (
                    <span className="text-amber-400 font-bold">{rewardedSecondsLeft}s</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">
                      {isIndo ? '✓ HADIAH DIBERIKAN' : '✓ REWARD EARNED'}
                    </span>
                  )}
                </span>
                {rewardedSecondsLeft === 0 && (
                  <button
                    onClick={() => setActiveSimulator('none')}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-center max-w-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <Film className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Google AdMob Rewarded Video
                </h3>
                <p className="text-xs text-neutral-300">
                  {isIndo
                    ? 'Tonton video hingga selesai untuk mendapatkan hadiah dalam aplikasi.'
                    : 'Watch this simulated video to the end to trigger the reward listener.'}
                </p>

                {rewardedGranted && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-200 animate-in zoom-in-95">
                    <span className="font-bold block mb-1">
                      {isIndo ? 'Callback onUserEarnedReward Berhasil!' : 'onUserEarnedReward Callback Fired!'}
                    </span>
                    +{rewardAmount} {rewardName}s {isIndo ? 'telah ditambahkan ke saldo aplikasi!' : 'added to app balance!'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
