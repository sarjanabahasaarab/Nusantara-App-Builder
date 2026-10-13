/**
 * Nusantara App Builder - Coming Soon & Service Contract View
 * Transparently presents upcoming Phase roadmap modules and formal TypeScript service contracts.
 */

import React, { useState } from 'react';
import {
  Code2,
  Palette,
  Globe2,
  PlaySquare,
  DollarSign,
  Blocks,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '../localization/useTranslation';
import { useUiStore, ActiveView } from '../../store/uiStore';

interface ModuleContractInfo {
  phase: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  contractCode: string;
}

const CONTRACT_DEFINITIONS: Partial<Record<ActiveView, ModuleContractInfo>> = {
  'visual-designer': {
    phase: 2,
    title: 'Visual Drag-and-Drop Designer',
    subtitle: 'Desainer Visual Tata Letak Android WYSIWYG',
    description:
      'Modul perancangan visual antarmuka pengguna Android berbasis XML Layout (ConstraintLayout, LinearLayout) dengan pratinjau komponen real-time.',
    icon: Palette,
    contractCode: `/**
 * Phase 2 Service Contract: IVisualDesignerService
 * Target: Real-time Android XML Layout Canvas & Component Tree
 */
export interface IVisualDesignerService {
  readonly phase: 2;
  readonly status: 'planned';

  /** Memuat dokumen tata letak dari file layout XML Android */
  loadLayout(layoutXmlPath: string): Promise<VisualLayoutDocument>;

  /** Menyimpan perubahan visual kembali ke format XML Android yang valid */
  saveLayout(layoutXmlPath: string, document: VisualLayoutDocument): Promise<boolean>;

  /** Mengambil daftar komponen palet yang didukung (Button, TextView, Card, dll.) */
  getPaletteComponents(): ComponentDescriptor[];

  /** Menghasilkan representasi XML murni dari tree dokumen visual */
  generateXml(document: VisualLayoutDocument): string;
}`,
  },
  'code-editor': {
    phase: 3,
    title: 'Multi-Tab Code Editor & Kotlin LSP',
    subtitle: 'Editor Kode Terintegrasi dengan Sintaks Android',
    description:
      'Modul editor teks performa tinggi dengan dukungan pewarnaan sintaks Kotlin, Gradle (.kts), XML, autocomplete, dan diagnosa error kompilasi.',
    icon: Code2,
    contractCode: `/**
 * Phase 3 Service Contract: ICodeEditorService
 * Target: Multi-tab code editor with LSP and Android Kotlin Lint
 */
export interface ICodeEditorService {
  readonly phase: 3;
  readonly status: 'planned';

  /** Membuka sesi berkas kode baru untuk disunting */
  openFile(filePath: string): Promise<EditorSession>;

  /** Menyimpan sesi berkas yang sedang aktif */
  saveFile(sessionId: string): Promise<boolean>;

  /** Mengambil diagnosa lint dan error kompilasi real-time */
  getDiagnostics(sessionId: string): Promise<EditorDiagnostic[]>;

  /** Format kode sesuai gaya standar Kotlin Official Style */
  formatDocument(sessionId: string): Promise<string>;
}`,
  },
  'website-to-apk': {
    phase: 4,
    title: 'Website to APK / AAB Converter',
    subtitle: 'Konverter Web Responsif ke Aplikasi Android Mandiri',
    description:
      'Modul otomatisasi konversi URL situs web menjadi paket aplikasi Android native lengkap dengan offline fallback, penanganan cookie, dan bridge native.',
    icon: Globe2,
    contractCode: `/**
 * Phase 4 Service Contract: IWebsiteToApkService
 * Target: One-click Website to APK/AAB wrapper generator
 */
export interface IWebsiteToApkService {
  readonly phase: 4;
  readonly status: 'planned';

  /** Validasi kelayakan URL target dan sertifikat SSL/TLS */
  validateUrl(url: string): Promise<{ isValid: boolean; sslSecure: boolean; error?: string }>;

  /** Menghasilkan proyek Android wrapper lengkap berdasarkan konfigurasi */
  generateWebViewWrapper(config: WebsiteToApkConfig): Promise<{ projectPath: string; success: boolean }>;
}`,
  },
  'build-run': {
    phase: 5,
    title: 'Build Engine & ADB Device Runner',
    subtitle: 'Mesin Kompilasi Gradle & Pemasangan Otomatis ke Perangkat',
    description:
      'Modul kompilasi APK Debug/Release, Android App Bundle (AAB), penandatanganan keystore (v2/v3 signature), serta instalasi via Android Debug Bridge (ADB).',
    icon: PlaySquare,
    contractCode: `/**
 * Phase 5 Service Contract: IBuildEngineService
 * Target: Gradle Build runner, Keystore Signing & ADB Device Deployment
 */
export interface IBuildEngineService {
  readonly phase: 5;
  readonly status: 'planned';

  /** Kompilasi berkas APK (Debug / Release) menggunakan Gradle daemon */
  buildApk(projectPath: string, mode: 'debug' | 'release'): Promise<BuildResult>;

  /** Kompilasi Google Play Android App Bundle (.aab) */
  buildBundleAab(projectPath: string, mode: 'release'): Promise<BuildResult>;

  /** Mendeteksi emulator dan perangkat fisik Android yang terhubung via ADB */
  listConnectedDevices(): Promise<AndroidDevice[]>;

  /** Memasang APK hasil build dan menjalankan MainActivity pada perangkat target */
  installAndRun(projectPath: string, deviceId: string): Promise<boolean>;
}`,
  },
  monetization: {
    phase: 6,
    title: 'Integrated Monetization & Google AdMob',
    subtitle: 'Konfigurasi Iklan Banner, Interstitial, dan Reward',
    description:
      'Modul integrasi Google Mobile Ads SDK resmi dengan validasi Ad Unit ID, kepatuhan privasi Google Play, dan injeksi dependensi Gradle otomatis.',
    icon: DollarSign,
    contractCode: `/**
 * Phase 6 Service Contract: IAdMobService
 * Target: Safe Google AdMob SDK injection with strict ID validation
 */
export interface IAdMobService {
  readonly phase: 6;
  readonly status: 'planned';

  /** Validasi format App ID AdMob (ca-app-pub-xxxxxxxx~yyyyyyyy) */
  validateAdMobAppId(appId: string): boolean;

  /** Validasi format Ad Unit ID sesuai tipe unit iklan */
  validateAdUnitId(adUnitId: string, format: 'banner' | 'interstitial' | 'rewarded'): boolean;

  /** Menginjeksi dependensi Gradle dan inisialisasi MobileAds ke MainActivity */
  injectAdMobDependencies(projectPath: string, config: AdMobConfig): Promise<boolean>;
}`,
  },
  extensions: {
    phase: 7,
    title: 'Extensions Ecosystem & Plugin Registry',
    subtitle: 'Dukungan Ekstensi dan Pustaka Pihak Ketiga',
    description:
      'Modul pengelolaan plugin kustom komunitas, pustaka pihak ketiga (Retrofit, Room, Glide), dan template komunitas.',
    icon: Blocks,
    contractCode: `/**
 * Phase 7 Service Contract: IExtensionService
 * Target: Plugin Registry, third-party libraries manager
 */
export interface IExtensionService {
  readonly phase: 7;
  readonly status: 'planned';
  listInstalledExtensions(): Promise<ExtensionManifest[]>;
  installExtension(extensionId: string): Promise<boolean>;
  uninstallExtension(extensionId: string): Promise<boolean>;
}`,
  },
};

export const ComingSoonView: React.FC<{ view: ActiveView }> = ({ view }) => {
  const { t } = useTranslation();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const [copied, setCopied] = useState(false);

  const info = CONTRACT_DEFINITIONS[view] || {
    phase: 2,
    title: 'Modul Masa Depan',
    subtitle: 'Dalam Pengembangan',
    description: 'Modul ini sedang disiapkan untuk roadmap versi selanjutnya.',
    icon: Terminal,
    contractCode: '// Kontrak arsitektur sedang disusun',
  };

  const Icon = info.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(info.contractCode);
    setCopied(true);
    showToast('Kontrak TypeScript berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 p-6 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dasbor</span>
        </button>

        {/* Feature Header Card */}
        <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-neutral-100">
                    {info.title}
                  </h1>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    [Phase {info.phase} — {t.sidebar.comingSoonTag}]
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                  {info.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-900/60 text-[11px] text-amber-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparansi Phase 1</span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed pt-2 border-t border-neutral-800/80">
            {info.description}
          </p>

          <div className="p-3 bg-neutral-950 rounded border border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
            💡 <strong className="text-neutral-200">Prinsip Arsitektur:</strong> Fitur ini tidak berpura-pura aktif. Nusantara App Builder mengimplementasikan fondasi desktop secara nyata di Phase 1, dan menyediakan kontrak layanan formal di bawah ini agar implementasi engine di Phase {info.phase} dapat disambungkan secara deterministik.
          </div>
        </div>

        {/* Formal Service Contract Code Box */}
        <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
          <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-300">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Kontrak Layanan TypeScript (Service Contract)</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kontrak</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-neutral-950 text-neutral-300 font-mono text-xs overflow-x-auto">
            <pre className="select-text whitespace-pre leading-relaxed">
              <code>{info.contractCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
