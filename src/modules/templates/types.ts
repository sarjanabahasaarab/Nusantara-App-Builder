/**
 * Nusantara App Builder - Project Templates Engine Types
 * Phase 10: Rich starter templates and website-to-app generator definitions.
 */

export type AppTemplateCategory =
  | 'starter'
  | 'web'
  | 'commercial'
  | 'education'
  | 'content'
  | 'database'
  | 'integration';

export interface ProjectTemplateDescriptor {
  id: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  category: AppTemplateCategory;
  iconName: string;
  minSdk: number;
  targetSdk: number;
  features: string[];
  featuresId: string[];
  previewColors: string[];
  hasSQLite?: boolean;
  hasRestApi?: boolean;
  hasAdMob?: boolean;
  hasWebView?: boolean;
  defaultPackageSuffix: string;
}

export interface WebsiteAppConfig {
  url: string;
  appName: string;
  packageId: string;
  enableAdMob: boolean;
  adMobAppId?: string;
  adMobBannerId?: string;
  adMobInterstitialId?: string;
  splashScreenDelaySec: number;
  offlineFallback: boolean;
  enablePullToRefresh: boolean;
}
