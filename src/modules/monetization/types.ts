/**
 * Nusantara App Builder - AdMob & Monetization Manager Types
 * Phase 9: AdMob Center, Ad Unit Manager, Visual Ad Placement,
 * Website-to-App Ad Container, Consent & Privacy, and Diagnostics.
 */

export type AdType = 'banner' | 'interstitial' | 'rewarded' | 'native';

export type AdEnvironment = 'test' | 'production';

export type BannerPosition = 'top' | 'bottom' | 'custom';

export type BannerSize = 'standard' | 'large' | 'medium_rectangle' | 'adaptive';

export type InterstitialTrigger = 'after_page' | 'after_action' | 'after_navigation' | 'manual';

export type NativeTemplate = 'small' | 'medium' | 'large' | 'custom';

export type WebsiteAdPlacement =
  | 'bottom_native_banner'
  | 'top_native_banner'
  | 'before_webview'
  | 'after_webview'
  | 'interstitial_navigation';

export interface AdUnitConfig {
  id: string;
  name: string;
  type: AdType;
  adUnitId: string;
  placement: string;
  enabled: boolean;
  mode: AdEnvironment;

  // Banner specific
  bannerPosition?: BannerPosition;
  bannerSize?: BannerSize;

  // Interstitial specific
  interstitialTrigger?: InterstitialTrigger;
  frequencyIntervalSec?: number; // Capping interval, default 60s

  // Rewarded specific
  rewardName?: string;
  rewardAmount?: number;
  rewardTrigger?: 'watch_ad_button' | 'manual';

  // Native specific
  nativeTemplate?: NativeTemplate;
  customLayoutName?: string;
}

export interface AdConsentConfig {
  enabled: boolean;
  provider: 'ump'; // Google User Messaging Platform SDK
  requireUnderAgeOfConsent: boolean; // COPPA
  testGeography: 'eea' | 'disabled';
  personalizedAds: boolean;
}

export interface WebsiteAdPlacementConfig {
  placement: WebsiteAdPlacement;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  blockContentOverlap: boolean;
  enabled: boolean;
}

export interface AdGlobalSettings {
  autoInitializeOnAppStart: boolean;
  sdkVersion: string; // e.g. "23.6.0"
  tagForChildDirectedTreatment: boolean; // COPPA
  maxAdContentRating: 'G' | 'PG' | 'T' | 'MA';
}

export interface AdMobConfig {
  enabled: boolean;
  appId: string;
  environment: AdEnvironment;
  privacyPolicyUrl?: string;
  consentConfig: AdConsentConfig;
  websitePlacement: WebsiteAdPlacementConfig;
  globalSettings: AdGlobalSettings;
  units: AdUnitConfig[];
}

export interface MonetizationDiagnosticItem {
  id: string;
  severity: 'info' | 'warning' | 'error';
  category: 'appid' | 'adunits' | 'manifest' | 'dependencies' | 'environment' | 'privacy' | 'consent';
  title: string;
  titleId: string;
  problem: string;
  problemId: string;
  cause: string;
  causeId: string;
  suggestedFix: string;
  suggestedFixId: string;
}

export interface MonetizationDiagnosticReport {
  isBlocked: boolean;
  errorsCount: number;
  warningsCount: number;
  infoCount: number;
  items: MonetizationDiagnosticItem[];
  timestamp: string;
}

// ----------------------------------------------------------------------
// OFFICIAL GOOGLE ADMOB TEST IDENTIFIERS
// Source: https://developers.google.com/admob/android/test-ads
// ----------------------------------------------------------------------
export const OFFICIAL_GOOGLE_TEST_IDS = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  interstitialVideo: 'ca-app-pub-3940256099942544/8691691433',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
  nativeAdvanced: 'ca-app-pub-3940256099942544/2247696110',
  nativeVideo: 'ca-app-pub-3940256099942544/1044960115',
} as const;
