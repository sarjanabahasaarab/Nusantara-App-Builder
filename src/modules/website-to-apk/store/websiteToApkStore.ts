/**
 * Nusantara App Builder - Website to APK & AAB Zustand Store
 * Phase 5: Multi-step wizard state management, website analysis, security rules, and generation lifecycle.
 */

import { create } from 'zustand';
import {
  WebsiteSourceMode,
  LocalWebsiteFile,
  WebsiteAnalyzerReport,
  AppInfoConfig,
  IconConfig,
  SplashScreenConfig,
  WebViewConfig,
  DomainAllowlistRule,
  ExternalLinksPolicy,
  AppWindowSettings,
  PermissionsConfig,
  WebsiteProjectConfig,
} from '../types';
import { validateWebsiteUrl, testUrlConnectivity, ConnectionTestResult } from '../services/urlValidator';
import { normalizeAppNameToPackageId, validatePackageId } from '../services/packageIdNormalizer';
import { analyzeOnlineWebsite, analyzeLocalWebsite } from '../services/websiteAnalyzer';
import { generateAndroidWebViewProject } from '../services/androidWebViewGenerator';
import { NativeBridge } from '../../filesystem/nativeBridge';
import { ProjectMetadata } from '../../../types/project';
import { COMPATIBLE_TOOLCHAIN } from '../../project-manager/templates/commonAndroidFiles';

interface WebsiteToApkState {
  currentStep: number; // 1 to 8
  sourceMode: WebsiteSourceMode;

  // Step 1: Source
  websiteUrl: string;
  testUrlResult: ConnectionTestResult | null;
  isTestingUrl: boolean;
  localFiles: LocalWebsiteFile[];
  chosenEntryPoint: string;

  // Step 2: Analyzer
  analyzerReport: WebsiteAnalyzerReport | null;
  isAnalyzing: boolean;

  // Step 3: App Information
  appInfo: AppInfoConfig;

  // Step 4: Application Icon & Splash Screen
  iconConfig: IconConfig;
  splashScreen: SplashScreenConfig;

  // Step 5: WebView Settings
  webViewConfig: WebViewConfig;

  // Step 6: Domain Allowlist
  domainRules: DomainAllowlistRule[];
  externalLinksPolicy: ExternalLinksPolicy;

  // Step 7: App Settings & Permissions
  appSettings: AppWindowSettings;
  permissions: PermissionsConfig;

  // Step 8: Preview & Generation
  previewMode: 'mobile' | 'desktop';
  previewOrientation: 'portrait' | 'landscape';
  previewDevice: string;
  previewZoom: number;

  isGenerating: boolean;
  generatedProject: ProjectMetadata | null;
  generationError: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSourceMode: (mode: WebsiteSourceMode) => void;
  setWebsiteUrl: (url: string) => void;
  runTestUrl: () => Promise<void>;
  setLocalFiles: (files: LocalWebsiteFile[], entryPoint?: string) => void;
  loadSampleLocalWebsite: () => void;

  runAnalysis: () => void;
  updateAppInfo: (info: Partial<AppInfoConfig>) => void;
  autoFillPackageIdFromName: () => void;

  updateIconConfig: (icon: Partial<IconConfig>) => void;
  updateSplashScreen: (splash: Partial<SplashScreenConfig>) => void;
  updateWebViewConfig: (config: Partial<WebViewConfig>) => void;

  addDomainRule: (domain: string, includeSubdomains?: boolean, action?: 'allow' | 'external-browser' | 'ask') => void;
  removeDomainRule: (ruleId: string) => void;
  setExternalLinksPolicy: (policy: ExternalLinksPolicy) => void;

  updateAppSettings: (settings: Partial<AppWindowSettings>) => void;
  updatePermissions: (permissions: Partial<PermissionsConfig>) => void;

  setPreviewMode: (mode: 'mobile' | 'desktop') => void;
  setPreviewOrientation: (orientation: 'portrait' | 'landscape') => void;
  setPreviewDevice: (device: string) => void;
  setPreviewZoom: (zoom: number) => void;

  validateAllSteps: () => { isValid: boolean; errors: string[]; warnings: string[] };
  generateProject: () => Promise<ProjectMetadata | null>;
  resetWizard: () => void;
}

const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toko Nusantara</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0; padding: 20px;
            background: #0f172a; color: #f8fafc;
        }
        header { text-align: center; margin-bottom: 24px; }
        h1 { color: #38bdf8; font-size: 24px; margin: 0 0 8px 0; }
        .card {
            background: #1e293b; border-radius: 12px; padding: 16px;
            margin-bottom: 16px; border: 1px solid #334155;
        }
        .btn {
            background: #2563eb; color: #fff; border: none;
            padding: 10px 20px; border-radius: 8px; font-weight: 600;
            width: 100%; cursor: pointer;
        }
        .btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <header>
        <h1>🛍️ Toko Nusantara</h1>
        <p>Aplikasi Web Responsif Lokal</p>
    </header>
    <div class="card">
        <h3>Selamat Datang di Toko Nusantara</h3>
        <p>Aplikasi ini dimuat dari bundle lokal tanpa memerlukan koneksi internet server.</p>
        <button class="btn" onclick="alert('Halo dari Website Lokal Nusantara!')">Klik Saya</button>
    </div>
</body>
</html>`;

export const useWebsiteToApkStore = create<WebsiteToApkState>((set, get) => ({
  currentStep: 1,
  sourceMode: 'url',

  websiteUrl: 'https://',
  testUrlResult: null,
  isTestingUrl: false,
  localFiles: [],
  chosenEntryPoint: 'index.html',

  analyzerReport: null,
  isAnalyzing: false,

  appInfo: {
    appName: 'Website Saya',
    packageId: 'id.nusantara.websitesaya',
    versionName: '1.0.0',
    versionCode: 1,
    description: 'Aplikasi Android yang dikonversi dari Website menggunakan Nusantara App Builder.',
    developerName: 'Developer Nusantara',
  },

  iconConfig: {
    type: 'preset',
    iconDataUrl: '',
    backgroundColor: '#1E293B',
    paddingPercent: 10,
    safeAreaVerified: true,
  },

  splashScreen: {
    enabled: true,
    backgroundColor: '#0F172A',
    durationMs: 1500,
    showAppTitle: true,
    useAndroid12Api: true,
  },

  webViewConfig: {
    javascriptEnabled: true,
    domStorageEnabled: true,
    databaseEnabled: true,
    zoomEnabled: false,
    userAgentType: 'default',
    pullToRefresh: true,
    progressIndicator: true,
    offlinePageEnabled: true,
    errorPageEnabled: true,
    backButtonBehavior: 'webview-history',
    fileUploadEnabled: true,
    downloadEnabled: true,
    cleartextTrafficAllowed: false,
  },

  domainRules: [],
  externalLinksPolicy: 'browser',

  appSettings: {
    orientation: 'auto',
    edgeToEdge: true,
    fullScreen: false,
    keepScreenOn: false,
    appTheme: 'system',
    enableTopAppBar: false,
    topAppBarTitle: '',
    topAppBarBgColor: '#0F172A',
  },

  permissions: {
    internet: true,
    accessNetworkState: true,
    camera: false,
    recordAudio: false,
    fineLocation: false,
    readMediaImages: true,
    postNotifications: false,
  },

  previewMode: 'mobile',
  previewOrientation: 'portrait',
  previewDevice: 'pixel_7',
  previewZoom: 100,

  isGenerating: false,
  generatedProject: null,
  generationError: null,

  setStep: (step) => set({ currentStep: Math.max(1, Math.min(8, step)) }),
  nextStep: () => {
    const s = get().currentStep;
    if (s === 1) {
      get().runAnalysis();
    }
    set({ currentStep: Math.min(8, s + 1) });
  },
  prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),

  setSourceMode: (mode) => {
    set({ sourceMode: mode });
    get().runAnalysis();
  },

  setWebsiteUrl: (url) => set({ websiteUrl: url }),

  runTestUrl: async () => {
    const { websiteUrl } = get();
    set({ isTestingUrl: true, testUrlResult: null });

    const result = await testUrlConnectivity(websiteUrl);
    set({ isTestingUrl: false, testUrlResult: result });

    if (result.isAccessible) {
      const parsed = validateWebsiteUrl(websiteUrl);
      if (parsed.isValid && parsed.hostname) {
        // Auto add hostname to domain allowlist if not present
        const currentRules = get().domainRules;
        if (!currentRules.some((r) => r.domain === parsed.hostname)) {
          get().addDomainRule(parsed.hostname, true, 'allow');
        }
        // Auto-update package ID if default
        if (get().appInfo.packageId === 'id.nusantara.websitesaya') {
          const autoPkg = normalizeAppNameToPackageId(get().appInfo.appName, parsed.hostname);
          get().updateAppInfo({ packageId: autoPkg });
        }
      }
    }
  },

  setLocalFiles: (files, entryPoint = 'index.html') => {
    set({ localFiles: files, chosenEntryPoint: entryPoint, sourceMode: 'local' });
    get().runAnalysis();
  },

  loadSampleLocalWebsite: () => {
    const sampleFiles: LocalWebsiteFile[] = [
      {
        path: 'index.html',
        name: 'index.html',
        size: DEFAULT_SAMPLE_HTML.length,
        type: 'text/html',
        content: DEFAULT_SAMPLE_HTML,
      },
    ];
    set({ localFiles: sampleFiles, chosenEntryPoint: 'index.html', sourceMode: 'local' });
    get().runAnalysis();
  },

  runAnalysis: () => {
    const state = get();
    set({ isAnalyzing: true });

    if (state.sourceMode === 'url') {
      const report = analyzeOnlineWebsite(state.websiteUrl);
      set({ analyzerReport: report, isAnalyzing: false });

      if (report.hostname) {
        const rules = state.domainRules;
        if (!rules.some((r) => r.domain === report.hostname)) {
          get().addDomainRule(report.hostname, true, 'allow');
        }
      }
    } else {
      const report = analyzeLocalWebsite(state.localFiles, state.chosenEntryPoint);
      set({ analyzerReport: report, isAnalyzing: false });
    }
  },

  updateAppInfo: (info) => {
    set((s) => ({ appInfo: { ...s.appInfo, ...info } }));
  },

  autoFillPackageIdFromName: () => {
    const { appInfo, analyzerReport } = get();
    const pkg = normalizeAppNameToPackageId(appInfo.appName, analyzerReport?.hostname);
    set((s) => ({ appInfo: { ...s.appInfo, packageId: pkg } }));
  },

  updateIconConfig: (icon) => set((s) => ({ iconConfig: { ...s.iconConfig, ...icon } })),
  updateSplashScreen: (splash) =>
    set((s) => ({ splashScreen: { ...s.splashScreen, ...splash } })),
  updateWebViewConfig: (config) =>
    set((s) => ({ webViewConfig: { ...s.webViewConfig, ...config } })),

  addDomainRule: (domain, includeSubdomains = true, action = 'allow') => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!cleanDomain) return;

    const rule: DomainAllowlistRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      domain: cleanDomain,
      includeSubdomains,
      action,
    };
    set((s) => ({
      domainRules: [...s.domainRules.filter((r) => r.domain !== cleanDomain), rule],
    }));
  },

  removeDomainRule: (ruleId) => {
    set((s) => ({ domainRules: s.domainRules.filter((r) => r.id !== ruleId) }));
  },

  setExternalLinksPolicy: (policy) => set({ externalLinksPolicy: policy }),

  updateAppSettings: (settings) =>
    set((s) => ({ appSettings: { ...s.appSettings, ...settings } })),
  updatePermissions: (permissions) =>
    set((s) => ({ permissions: { ...s.permissions, ...permissions } })),

  setPreviewMode: (mode) => set({ previewMode: mode }),
  setPreviewOrientation: (orientation) => set({ previewOrientation: orientation }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  setPreviewZoom: (zoom) => set({ previewZoom: zoom }),

  validateAllSteps: () => {
    const state = get();
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Source check
    if (state.sourceMode === 'url') {
      const urlVal = validateWebsiteUrl(state.websiteUrl);
      if (!urlVal.isValid) {
        errors.push(`URL Website tidak valid: ${urlVal.errorId || urlVal.error}`);
      }
    } else {
      if (state.localFiles.length === 0) {
        errors.push('Folder website lokal belum dipilih atau berkas kosong.');
      } else {
        const hasEntry = state.localFiles.some((f) => f.name.toLowerCase() === 'index.html');
        if (!hasEntry) {
          errors.push('Berkas "index.html" tidak ditemukan pada website lokal.');
        }
      }
    }

    // 2. App info check
    if (!state.appInfo.appName.trim()) {
      errors.push('Nama aplikasi tidak boleh kosong.');
    }
    const pkgVal = validatePackageId(state.appInfo.packageId);
    if (!pkgVal.isValid) {
      errors.push(`Package ID tidak valid: ${pkgVal.errorId || pkgVal.error}`);
    }

    // 3. Security warnings
    if (state.webViewConfig.cleartextTrafficAllowed) {
      warnings.push('Cleartext traffic (HTTP) diizinkan. Ini hanya direkomendasikan untuk pengembangan lokal.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  generateProject: async () => {
    const state = get();
    const validation = state.validateAllSteps();

    if (!validation.isValid) {
      set({ generationError: validation.errors.join('; ') });
      return null;
    }

    set({ isGenerating: true, generationError: null });

    try {
      const targetUrl =
        state.sourceMode === 'url'
          ? validateWebsiteUrl(state.websiteUrl).normalizedUrl
          : undefined;

      const projectConfig: WebsiteProjectConfig = {
        schemaVersion: 1,
        type: 'website-to-app',
        formatVersion: '5.0',
        source: {
          mode: state.sourceMode,
          url: targetUrl,
          entryPoint: state.chosenEntryPoint || 'index.html',
          localFilesCount: state.localFiles.length,
        },
        android: {
          applicationId: state.appInfo.packageId.trim(),
          appName: state.appInfo.appName.trim(),
          versionName: state.appInfo.versionName.trim(),
          versionCode: state.appInfo.versionCode || 1,
          developerName: state.appInfo.developerName.trim(),
          minSdk: 24, // Android 7.0+ for modern WebView & TLS
          targetSdk: COMPATIBLE_TOOLCHAIN.targetSdk,
          compileSdk: COMPATIBLE_TOOLCHAIN.compileSdk,
        },
        webview: {
          javascript: state.webViewConfig.javascriptEnabled,
          domStorage: state.webViewConfig.domStorageEnabled,
          database: state.webViewConfig.databaseEnabled,
          zoom: state.webViewConfig.zoomEnabled,
          userAgent:
            state.webViewConfig.userAgentType === 'custom'
              ? state.webViewConfig.customUserAgent || ''
              : '',
          pullToRefresh: state.webViewConfig.pullToRefresh,
          progressIndicator: state.webViewConfig.progressIndicator,
          fileUpload: state.webViewConfig.fileUploadEnabled,
          downloadHandling: state.webViewConfig.downloadEnabled,
          cleartextTraffic: state.webViewConfig.cleartextTrafficAllowed,
          externalLinksPolicy: state.externalLinksPolicy,
          backNavigation: state.webViewConfig.backButtonBehavior,
        },
        security: {
          domainAllowlist: state.domainRules,
          allowedSchemes: ['https', 'http', 'file'],
        },
        ui: {
          orientation: state.appSettings.orientation,
          edgeToEdge: state.appSettings.edgeToEdge,
          fullScreen: state.appSettings.fullScreen,
          keepScreenOn: state.appSettings.keepScreenOn,
          splashScreen: state.splashScreen,
          topAppBar: {
            enabled: state.appSettings.enableTopAppBar,
            title: state.appSettings.topAppBarTitle,
            backgroundColor: state.appSettings.topAppBarBgColor,
          },
        },
        permissions: state.permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generate actual Android project files
      const projectFiles = generateAndroidWebViewProject(projectConfig, state.localFiles);

      // Register project into Phase 2 Project Engine / NativeBridge
      const now = new Date().toISOString();
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const projectMetadata: ProjectMetadata = {
        id: projectId,
        name: state.appInfo.appName.trim(),
        displayName: state.appInfo.appName.trim(),
        packageId: state.appInfo.packageId.trim(),
        location: 'C:\\NusantaraProjects',
        description: state.appInfo.description || `Website to Android App for ${state.appInfo.appName}`,
        template: 'webview-starter',
        language: 'kotlin',
        interfaceLanguage: 'id',
        createdAt: now,
        updatedAt: now,
        minSdk: 24,
        targetSdk: COMPATIBLE_TOOLCHAIN.targetSdk,
        compileSdk: COMPATIBLE_TOOLCHAIN.compileSdk,
        versionCode: state.appInfo.versionCode || 1,
        versionName: state.appInfo.versionName || '1.0.0',
        targetUrl,
        formatVersion: '2.0',
        filesCount: projectFiles.length,
        toolchainVersion: {
          agp: COMPATIBLE_TOOLCHAIN.agpVersion,
          gradle: COMPATIBLE_TOOLCHAIN.gradleVersion,
          kotlin: COMPATIBLE_TOOLCHAIN.kotlinVersion,
          jdk: COMPATIBLE_TOOLCHAIN.jdkVersion,
        },
      };

      // Save files directly to local storage / filesystem index
      const existingProjects = await NativeBridge.listProjects();
      const updatedList = [projectMetadata, ...existingProjects.filter((p) => p.id !== projectId)];

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nusantara_projects_index', JSON.stringify(updatedList));
        localStorage.setItem(`nusantara_project_files_${projectId}`, JSON.stringify(projectFiles));
        localStorage.setItem(`nusantara_website_config_${projectId}`, JSON.stringify(projectConfig));
      }

      set({
        isGenerating: false,
        generatedProject: projectMetadata,
        generationError: null,
      });

      return projectMetadata;
    } catch (err) {
      console.error('Failed to generate Website-to-App project:', err);
      set({
        isGenerating: false,
        generationError: (err as Error).message || 'Gagal membuat proyek Android.',
      });
      return null;
    }
  },

  resetWizard: () => {
    set({
      currentStep: 1,
      sourceMode: 'url',
      websiteUrl: 'https://',
      testUrlResult: null,
      localFiles: [],
      analyzerReport: null,
      generatedProject: null,
      generationError: null,
    });
  },
}));
