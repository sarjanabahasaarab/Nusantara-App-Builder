/**
 * Nusantara App Builder - Website to APK & AAB Test Suite
 * Phase 5: Verification of URL validation, package normalizer, analyzer, generator, and store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateWebsiteUrl } from '../modules/website-to-apk/services/urlValidator';
import {
  normalizeAppNameToPackageId,
  validatePackageId,
} from '../modules/website-to-apk/services/packageIdNormalizer';
import {
  analyzeOnlineWebsite,
  analyzeLocalWebsite,
} from '../modules/website-to-apk/services/websiteAnalyzer';
import { generateAndroidWebViewProject } from '../modules/website-to-apk/services/androidWebViewGenerator';
import { useWebsiteToApkStore } from '../modules/website-to-apk/store/websiteToApkStore';
import { WebsiteProjectConfig, LocalWebsiteFile } from '../modules/website-to-apk/types';

describe('Phase 5: Website to APK - URL Validator', () => {
  it('validates a standard HTTPS url', () => {
    const res = validateWebsiteUrl('https://example.com');
    expect(res.isValid).toBe(true);
    expect(res.isHttps).toBe(true);
    expect(res.hostname).toBe('example.com');
  });

  it('auto-prepends https when protocol is missing', () => {
    const res = validateWebsiteUrl('myportal.co.id/dashboard');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toContain('https://myportal.co.id');
    expect(res.hostname).toBe('myportal.co.id');
  });

  it('rejects dangerous javascript: scheme', () => {
    const res = validateWebsiteUrl('javascript:alert(1)');
    expect(res.isValid).toBe(false);
    expect(res.errorId).toContain('berbahaya');
  });

  it('rejects file: scheme for online inputs', () => {
    const res = validateWebsiteUrl('file:///C:/Users/Secret/file.html');
    expect(res.isValid).toBe(false);
  });

  it('rejects command execution characters', () => {
    const res = validateWebsiteUrl('https://example.com; rm -rf /');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('shell');
  });

  it('flags plain HTTP with warning', () => {
    const res = validateWebsiteUrl('http://insecure-site.com');
    expect(res.isValid).toBe(true);
    expect(res.isHttps).toBe(false);
  });
});

describe('Phase 5: Package ID Normalizer & Validator', () => {
  it('normalizes app name to valid package ID', () => {
    const pkg = normalizeAppNameToPackageId('Toko Online Saya');
    expect(pkg).toBe('id.nusantara.tokoonlinesaya');
    expect(validatePackageId(pkg).isValid).toBe(true);
  });

  it('generates reverse domain package ID when hostname is available', () => {
    const pkg = normalizeAppNameToPackageId('Portal', 'news.nusantara.co.id');
    expect(pkg).toBe('id.co.nusantara.news');
    expect(validatePackageId(pkg).isValid).toBe(true);
  });

  it('handles Java reserved keywords safely', () => {
    const pkg = normalizeAppNameToPackageId('class');
    expect(pkg).toBe('id.nusantara.classapp');
    expect(validatePackageId(pkg).isValid).toBe(true);
  });

  it('rejects package ID with less than two segments', () => {
    const res = validatePackageId('singleword');
    expect(res.isValid).toBe(false);
  });

  it('rejects package ID beginning with numbers in segments', () => {
    const res = validatePackageId('id.nusantara.123store');
    expect(res.isValid).toBe(false);
  });

  it('rejects reserved keywords in package ID', () => {
    const res = validatePackageId('id.nusantara.void');
    expect(res.isValid).toBe(false);
  });
});

describe('Phase 5: Website Analyzer', () => {
  it('analyzes online website report correctly', () => {
    const report = analyzeOnlineWebsite('https://nusantara.dev');
    expect(report.sourceMode).toBe('url');
    expect(report.hostname).toBe('nusantara.dev');
    expect(report.isHttps).toBe(true);
    expect(report.isReadyForGeneration).toBe(true);
  });

  it('analyzes local website and warns on missing viewport', () => {
    const files: LocalWebsiteFile[] = [
      {
        path: 'index.html',
        name: 'index.html',
        size: 150,
        type: 'text/html',
        content: '<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>',
      },
    ];
    const report = analyzeLocalWebsite(files, 'index.html');
    expect(report.isReadyForGeneration).toBe(true);
    expect(report.hasResponsiveViewport).toBe(false);
    expect(report.detectedIssues.some((i) => i.title.includes('Viewport'))).toBe(true);
  });

  it('detects Windows absolute paths in local website and flags warning', () => {
    const files: LocalWebsiteFile[] = [
      {
        path: 'index.html',
        name: 'index.html',
        size: 200,
        type: 'text/html',
        content: '<html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="C:\\Users\\Developer\\style.css"></head><body></body></html>',
      },
    ];
    const report = analyzeLocalWebsite(files);
    expect(report.detectedIssues.some((i) => i.title.includes('Absolute Windows Paths'))).toBe(true);
  });

  it('errors when index.html is missing in local bundle', () => {
    const files: LocalWebsiteFile[] = [
      {
        path: 'about.html',
        name: 'about.html',
        size: 100,
        type: 'text/html',
        content: '<html><body>About</body></html>',
      },
    ];
    const report = analyzeLocalWebsite(files, 'index.html');
    expect(report.isReadyForGeneration).toBe(false);
    expect(report.detectedIssues.some((i) => i.type === 'error')).toBe(true);
  });
});

describe('Phase 5: Android WebView Project Generator', () => {
  const dummyConfig: WebsiteProjectConfig = {
    schemaVersion: 1,
    type: 'website-to-app',
    formatVersion: '5.0',
    source: {
      mode: 'url',
      url: 'https://mysite.com',
      entryPoint: 'https://mysite.com',
    },
    android: {
      applicationId: 'id.nusantara.mysite',
      appName: 'My Site App',
      versionName: '1.0.0',
      versionCode: 1,
      developerName: 'Developer Nusantara',
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
    },
    webview: {
      javascript: true,
      domStorage: true,
      database: true,
      zoom: false,
      userAgent: '',
      pullToRefresh: true,
      progressIndicator: true,
      fileUpload: true,
      downloadHandling: true,
      cleartextTraffic: false,
      externalLinksPolicy: 'browser',
      backNavigation: 'webview-history',
    },
    security: {
      domainAllowlist: [
        {
          id: '1',
          domain: 'mysite.com',
          includeSubdomains: true,
          action: 'allow',
        },
      ],
      allowedSchemes: ['https', 'http'],
    },
    ui: {
      orientation: 'portrait',
      edgeToEdge: true,
      fullScreen: false,
      keepScreenOn: false,
      splashScreen: {
        enabled: true,
        backgroundColor: '#0F172A',
        durationMs: 1500,
        showAppTitle: true,
        useAndroid12Api: true,
      },
      topAppBar: {
        enabled: true,
        title: 'My Site App',
        backgroundColor: '#1E293B',
      },
    },
    permissions: {
      internet: true,
      accessNetworkState: true,
      camera: true,
      recordAudio: false,
      fineLocation: true,
      readMediaImages: true,
      postNotifications: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates all expected Android project files', () => {
    const files = generateAndroidWebViewProject(dummyConfig, []);
    const filePaths = files.map((f) => f.path);

    expect(filePaths).toContain('build.gradle.kts');
    expect(filePaths).toContain('settings.gradle.kts');
    expect(filePaths).toContain('app/build.gradle.kts');
    expect(filePaths).toContain('app/src/main/AndroidManifest.xml');
    expect(filePaths).toContain('app/src/main/res/xml/network_security_config.xml');
    expect(filePaths).toContain('app/src/main/res/layout/activity_main.xml');
    expect(filePaths).toContain('app/src/main/java/id/nusantara/mysite/MainActivity.kt');
    expect(filePaths).toContain('app/src/main/assets/offline.html');
  });

  it('includes permissions in AndroidManifest.xml', () => {
    const files = generateAndroidWebViewProject(dummyConfig, []);
    const manifest = files.find((f) => f.path.endsWith('AndroidManifest.xml'))!;
    expect(manifest.content).toContain('android.permission.INTERNET');
    expect(manifest.content).toContain('android.permission.ACCESS_NETWORK_STATE');
    expect(manifest.content).toContain('android.permission.CAMERA');
    expect(manifest.content).toContain('android.permission.ACCESS_FINE_LOCATION');
    expect(manifest.content).toContain('android:screenOrientation="portrait"');
  });

  it('includes SwipeRefreshLayout and ProgressBar in activity_main.xml', () => {
    const files = generateAndroidWebViewProject(dummyConfig, []);
    const layout = files.find((f) => f.path.endsWith('activity_main.xml'))!;
    expect(layout.content).toContain('SwipeRefreshLayout');
    expect(layout.content).toContain('ProgressBar');
    expect(layout.content).toContain('MaterialToolbar');
  });

  it('configures network security with domain allowlist', () => {
    const files = generateAndroidWebViewProject(dummyConfig, []);
    const sec = files.find((f) => f.path.endsWith('network_security_config.xml'))!;
    expect(sec.content).toContain('<domain includeSubdomains="true">mysite.com</domain>');
    expect(sec.content).toContain('cleartextTrafficPermitted="false"');
  });

  it('copies local assets into app/src/main/assets/website when in local mode', () => {
    const localConfig: WebsiteProjectConfig = {
      ...dummyConfig,
      source: {
        mode: 'local',
        entryPoint: 'index.html',
      },
    };
    const localFiles: LocalWebsiteFile[] = [
      {
        path: 'index.html',
        name: 'index.html',
        size: 50,
        type: 'text/html',
        content: '<h1>Hello Local</h1>',
      },
      {
        path: 'css/style.css',
        name: 'style.css',
        size: 30,
        type: 'text/css',
        content: 'body { color: red; }',
      },
    ];

    const files = generateAndroidWebViewProject(localConfig, localFiles);
    const assetFiles = files.filter((f) => f.path.startsWith('app/src/main/assets/website/'));
    expect(assetFiles.length).toBe(2);
    expect(assetFiles.some((f) => f.path.endsWith('index.html'))).toBe(true);
    expect(assetFiles.some((f) => f.path.endsWith('css/style.css'))).toBe(true);
  });
});

describe('Phase 5: Website to APK Zustand Store', () => {
  beforeEach(() => {
    useWebsiteToApkStore.getState().resetWizard();
  });

  it('initializes on step 1 with default url mode', () => {
    const s = useWebsiteToApkStore.getState();
    expect(s.currentStep).toBe(1);
    expect(s.sourceMode).toBe('url');
  });

  it('loads sample local website correctly', () => {
    useWebsiteToApkStore.getState().loadSampleLocalWebsite();
    const s = useWebsiteToApkStore.getState();
    expect(s.localFiles.length).toBeGreaterThan(0);
    expect(s.localFiles[0].name).toBe('index.html');
    expect(s.analyzerReport?.sourceMode).toBe('local');
  });

  it('adds and removes domain rules', () => {
    useWebsiteToApkStore.getState().addDomainRule('api.partner.com', true, 'allow');
    let s = useWebsiteToApkStore.getState();
    expect(s.domainRules.some((r) => r.domain === 'api.partner.com')).toBe(true);

    const ruleId = s.domainRules.find((r) => r.domain === 'api.partner.com')!.id;
    useWebsiteToApkStore.getState().removeDomainRule(ruleId);
    s = useWebsiteToApkStore.getState();
    expect(s.domainRules.some((r) => r.domain === 'api.partner.com')).toBe(false);
  });

  it('validates steps and catches missing app name or invalid package ID', () => {
    useWebsiteToApkStore.getState().updateAppInfo({ appName: '', packageId: 'invalid' });
    const validation = useWebsiteToApkStore.getState().validateAllSteps();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('generates a full project successfully into storage', async () => {
    useWebsiteToApkStore.getState().setWebsiteUrl('https://mytoko.com');
    useWebsiteToApkStore.getState().updateAppInfo({
      appName: 'My Toko',
      packageId: 'id.nusantara.mytoko',
    });

    const project = await useWebsiteToApkStore.getState().generateProject();
    expect(project).not.toBeNull();
    expect(project?.name).toBe('My Toko');
    expect(project?.packageId).toBe('id.nusantara.mytoko');
    expect(project?.template).toBe('webview-starter');
    expect(useWebsiteToApkStore.getState().generatedProject).toEqual(project);
  });
});
