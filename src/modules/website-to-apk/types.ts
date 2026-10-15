/**
 * Nusantara App Builder - Website to APK & AAB Types
 * Phase 5: Architecture, models, and contracts for Online & Local Website to Android conversion.
 */

export type WebsiteSourceMode = 'url' | 'local';

export interface LocalWebsiteFile {
  path: string; // e.g. "index.html", "css/style.css"
  name: string;
  size: number;
  type: string; // mime or extension
  content: string; // text content or base64 dataUrl
  isBinary?: boolean;
}

export interface WebsiteAnalyzerReport {
  timestamp: string;
  sourceMode: WebsiteSourceMode;
  targetUrl?: string;
  entryPoint?: string;
  protocol?: string;
  hostname?: string;
  isHttps: boolean;
  hasJavaScript: boolean;
  hasResponsiveViewport: boolean;
  externalResources: string[];
  localAssetsCount: number;
  localAssetsTotalSize: number;
  detectedIssues: {
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
  }[];
  isReadyForGeneration: boolean;
}

export interface AppInfoConfig {
  appName: string;
  packageId: string;
  versionName: string;
  versionCode: number;
  description: string;
  developerName: string;
}

export interface IconConfig {
  type: 'preset' | 'custom';
  iconDataUrl: string; // base64 image data URL or SVG
  backgroundColor: string; // hex, e.g. "#1E293B"
  paddingPercent: number; // 0 - 30% for safe area
  safeAreaVerified: boolean;
}

export interface SplashScreenConfig {
  enabled: boolean;
  logoDataUrl?: string;
  backgroundColor: string; // hex, e.g. "#0F172A"
  durationMs: number; // 1000 - 3000ms
  showAppTitle: boolean;
  useAndroid12Api: boolean;
}

export interface WebViewConfig {
  javascriptEnabled: boolean;
  domStorageEnabled: boolean;
  databaseEnabled: boolean;
  zoomEnabled: boolean;
  userAgentType: 'default' | 'desktop' | 'custom';
  customUserAgent?: string;
  pullToRefresh: boolean;
  progressIndicator: boolean;
  offlinePageEnabled: boolean;
  customOfflineHtml?: string;
  errorPageEnabled: boolean;
  backButtonBehavior: 'webview-history' | 'exit-app';
  fileUploadEnabled: boolean;
  downloadEnabled: boolean;
  cleartextTrafficAllowed: boolean;
}

export interface DomainAllowlistRule {
  id: string;
  domain: string; // e.g. "example.com" or "api.example.com"
  includeSubdomains: boolean;
  action: 'allow' | 'external-browser' | 'ask';
  note?: string;
}

export type ExternalLinksPolicy = 'browser' | 'inside' | 'ask';

export interface AppWindowSettings {
  orientation: 'auto' | 'portrait' | 'landscape';
  edgeToEdge: boolean;
  fullScreen: boolean;
  keepScreenOn: boolean;
  appTheme: 'system' | 'light' | 'dark';
  enableTopAppBar: boolean;
  topAppBarTitle?: string;
  topAppBarBgColor: string;
}

export interface PermissionsConfig {
  internet: boolean; // Always true
  accessNetworkState: boolean; // Always true for offline checks
  camera: boolean; // Optional: <input type="file" capture> or WebRTC
  recordAudio: boolean; // Optional: WebRTC audio
  fineLocation: boolean; // Optional: Geolocation API
  readMediaImages: boolean; // Android 13+ file upload
  postNotifications: boolean; // Android 13+ push
}

export interface WebsiteProjectConfig {
  schemaVersion: 1;
  type: 'website-to-app';
  formatVersion: '5.0';
  source: {
    mode: WebsiteSourceMode;
    url?: string;
    entryPoint: string;
    localFilesCount?: number;
  };
  android: {
    applicationId: string;
    appName: string;
    versionName: string;
    versionCode: number;
    developerName: string;
    minSdk: number;
    targetSdk: number;
    compileSdk: number;
  };
  webview: {
    javascript: boolean;
    domStorage: boolean;
    database: boolean;
    zoom: boolean;
    userAgent: string;
    pullToRefresh: boolean;
    progressIndicator: boolean;
    fileUpload: boolean;
    downloadHandling: boolean;
    cleartextTraffic: boolean;
    externalLinksPolicy: ExternalLinksPolicy;
    backNavigation: 'webview-history' | 'exit-app';
  };
  security: {
    domainAllowlist: DomainAllowlistRule[];
    allowedSchemes: string[];
  };
  ui: {
    orientation: 'auto' | 'portrait' | 'landscape';
    edgeToEdge: boolean;
    fullScreen: boolean;
    keepScreenOn: boolean;
    splashScreen: SplashScreenConfig;
    topAppBar: {
      enabled: boolean;
      title?: string;
      backgroundColor: string;
    };
  };
  permissions: PermissionsConfig;
  createdAt: string;
  updatedAt: string;
}
