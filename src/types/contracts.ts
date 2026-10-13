/**
 * Nusantara App Builder - Service Contracts
 * Formal TypeScript contracts for future roadmap modules (Phases 2-7).
 * These define architectural interfaces so future modules integrate seamlessly.
 */

// Phase 2: Visual Designer Contract
export interface IVisualDesignerService {
  readonly phase: 2;
  readonly status: 'planned';
  loadLayout(layoutXmlPath: string): Promise<VisualLayoutDocument>;
  saveLayout(layoutXmlPath: string, document: VisualLayoutDocument): Promise<boolean>;
  getPaletteComponents(): ComponentDescriptor[];
  generateXml(document: VisualLayoutDocument): string;
}

export interface VisualLayoutDocument {
  id: string;
  rootType: 'ConstraintLayout' | 'LinearLayout' | 'FrameLayout' | 'CoordinatorLayout';
  children: VisualComponentNode[];
}

export interface VisualComponentNode {
  id: string;
  type: string;
  attributes: Record<string, string>;
  children?: VisualComponentNode[];
}

export interface ComponentDescriptor {
  type: string;
  category: 'Widgets' | 'Layouts' | 'Containers' | 'Google' | 'Legacy';
  displayName: string;
  defaultAttributes: Record<string, string>;
  icon: string;
}

// Phase 3: Code Editor Contract
export interface ICodeEditorService {
  readonly phase: 3;
  readonly status: 'planned';
  openFile(path: string): Promise<EditorSession>;
  saveFile(sessionId: string): Promise<boolean>;
  getDiagnostics(sessionId: string): Promise<EditorDiagnostic[]>;
  formatDocument(sessionId: string): Promise<string>;
}

export interface EditorSession {
  id: string;
  filePath: string;
  language: 'kotlin' | 'java' | 'xml' | 'groovy' | 'json';
  content: string;
  isDirty: boolean;
}

export interface EditorDiagnostic {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

// Phase 4: Website to APK Contract
export interface IWebsiteToApkService {
  readonly phase: 4;
  readonly status: 'planned';
  validateUrl(url: string): Promise<{ isValid: boolean; sslSecure: boolean; error?: string }>;
  generateWebViewWrapper(config: WebsiteToApkConfig): Promise<{ projectPath: string; success: boolean }>;
}

export interface WebsiteToApkConfig {
  appName: string;
  targetUrl: string;
  packageId: string;
  enableOfflineCache: boolean;
  enablePullToRefresh: boolean;
  enableGeolocation: boolean;
  enableCameraUpload: boolean;
  admobAppId?: string;
  bannerAdUnitId?: string;
}

// Phase 5: Build & Run Engine Contract
export interface IBuildEngineService {
  readonly phase: 5;
  readonly status: 'planned';
  buildApk(projectPath: string, mode: 'debug' | 'release'): Promise<BuildResult>;
  buildBundleAab(projectPath: string, mode: 'release'): Promise<BuildResult>;
  listConnectedDevices(): Promise<AndroidDevice[]>;
  installAndRun(projectPath: string, deviceId: string): Promise<boolean>;
}

export interface BuildResult {
  success: boolean;
  outputArtifactPath?: string;
  durationMs: number;
  logs: string[];
  errorCode?: string;
}

export interface AndroidDevice {
  id: string;
  name: string;
  type: 'emulator' | 'physical';
  androidVersion: string;
  apiLevel: number;
  state: 'online' | 'offline' | 'unauthorized';
}

// Phase 6: Monetization (AdMob) Contract
export interface IAdMobService {
  readonly phase: 6;
  readonly status: 'planned';
  validateAdMobAppId(appId: string): boolean;
  validateAdUnitId(adUnitId: string, format: 'banner' | 'interstitial' | 'rewarded'): boolean;
  injectAdMobDependencies(projectPath: string, config: AdMobConfig): Promise<boolean>;
}

export interface AdMobConfig {
  appId: string;
  bannerAds: { enabled: boolean; adUnitId?: string; position: 'top' | 'bottom' }[];
  interstitialAds: { enabled: boolean; adUnitId?: string }[];
  testDeviceIds: string[];
}

// Android SDK Environment Service Contract
export interface IAndroidSdkService {
  readonly status: 'active';
  detectSdkPath(): Promise<string | null>;
  detectJdkPath(): Promise<string | null>;
  detectGradlePath(): Promise<string | null>;
  validateSdkInstallation(path: string): Promise<{ valid: boolean; installedPlatforms: string[]; buildTools: string[] }>;
}
