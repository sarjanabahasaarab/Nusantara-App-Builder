/**
 * Nusantara App Builder - Phase 9 Monetization & AdMob Unit Tests
 * Tests AdMobValidator, AdMobGenerator, Store state management,
 * diagnostics audit engine, and official Google test identifiers.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdMobValidator } from '../modules/monetization/services/adMobValidator';
import { AdMobGenerator } from '../modules/monetization/services/adMobGenerator';
import { useMonetizationStore } from '../modules/monetization/store/monetizationStore';
import { OFFICIAL_GOOGLE_TEST_IDS, AdMobConfig } from '../modules/monetization/types';
import { ProjectMetadata, ProjectFile } from '../types/project';

describe('AdMobValidator', () => {
  it('validates official Google AdMob Test App ID', () => {
    const result = AdMobValidator.validateAppId(OFFICIAL_GOOGLE_TEST_IDS.appId);
    expect(result.isValid).toBe(true);
    expect(result.isTestId).toBe(true);
  });

  it('validates registered AdMob App ID format', () => {
    const validId = 'ca-app-pub-1234567890123456~1234567890';
    const result = AdMobValidator.validateAppId(validId);
    expect(result.isValid).toBe(true);
    expect(result.isTestId).toBe(false);
  });

  it('rejects invalid AdMob App ID format', () => {
    const invalidId = 'ca-app-pub-123456';
    const result = AdMobValidator.validateAppId(invalidId);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects empty App ID', () => {
    const result = AdMobValidator.validateAppId('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot be empty');
  });

  it('validates Ad Unit ID format', () => {
    const validUnit = OFFICIAL_GOOGLE_TEST_IDS.banner;
    const result = AdMobValidator.validateAdUnitId(validUnit);
    expect(result.isValid).toBe(true);
    expect(result.isTestId).toBe(true);

    const invalidUnit = 'invalid-ad-unit';
    const invalidRes = AdMobValidator.validateAdUnitId(invalidUnit);
    expect(invalidRes.isValid).toBe(false);
  });

  it('validates Privacy Policy URL with HTTPS requirement', () => {
    const validUrl = 'https://mycompany.com/privacy';
    const res1 = AdMobValidator.validatePrivacyPolicyUrl(validUrl);
    expect(res1.isValid).toBe(true);

    const httpUrl = 'http://mycompany.com/privacy';
    const res2 = AdMobValidator.validatePrivacyPolicyUrl(httpUrl);
    expect(res2.isValid).toBe(false);
    expect(res2.error).toContain('HTTPS');

    const emptyUrl = '';
    const res3 = AdMobValidator.validatePrivacyPolicyUrl(emptyUrl);
    expect(res3.isValid).toBe(false);
  });
});

describe('AdMobGenerator', () => {
  const dummyProject: ProjectMetadata = {
    id: 'test_proj',
    name: 'My Application',
    displayName: 'My Application',
    packageId: 'com.example.myapp',
    location: '/projects/test_proj',
    description: 'Android App',
    template: 'empty-android',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 1,
    versionName: '1.0.0',
    formatVersion: '2.0',
  };

  const dummyFiles: ProjectFile[] = [
    {
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="My Application">
        <activity android:name=".MainActivity" />
    </application>
</manifest>`,
      isDirectory: false,
      size: 200,
    },
    {
      name: 'build.gradle.kts',
      path: 'app/build.gradle.kts',
      content: `dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
}`,
      isDirectory: false,
      size: 100,
    },
  ];

  const dummyConfig: AdMobConfig = {
    enabled: true,
    appId: OFFICIAL_GOOGLE_TEST_IDS.appId,
    environment: 'test',
    privacyPolicyUrl: 'https://example.com/privacy',
    consentConfig: {
      enabled: true,
      provider: 'ump',
      requireUnderAgeOfConsent: false,
      testGeography: 'eea',
      personalizedAds: true,
    },
    websitePlacement: {
      placement: 'bottom_native_banner',
      bannerAdUnitId: OFFICIAL_GOOGLE_TEST_IDS.banner,
      interstitialAdUnitId: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
      blockContentOverlap: true,
      enabled: true,
    },
    globalSettings: {
      autoInitializeOnAppStart: true,
      sdkVersion: '23.6.0',
      tagForChildDirectedTreatment: false,
      maxAdContentRating: 'G',
    },
    units: [
      {
        id: 'u1',
        name: 'Home Banner',
        type: 'banner',
        adUnitId: OFFICIAL_GOOGLE_TEST_IDS.banner,
        placement: 'home_bottom',
        enabled: true,
        mode: 'test',
        bannerPosition: 'bottom',
      },
      {
        id: 'u2',
        name: 'Transition Interstitial',
        type: 'interstitial',
        adUnitId: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
        placement: 'navigation',
        enabled: true,
        mode: 'test',
        interstitialTrigger: 'after_navigation',
        frequencyIntervalSec: 60,
      },
      {
        id: 'u3',
        name: 'Reward Coins',
        type: 'rewarded',
        adUnitId: OFFICIAL_GOOGLE_TEST_IDS.rewarded,
        placement: 'watch_video',
        enabled: true,
        mode: 'test',
        rewardName: 'Coin',
        rewardAmount: 100,
      },
    ],
  };

  it('updates AndroidManifest.xml with AdMob meta-data and network permissions', () => {
    const res = AdMobGenerator.generateAdMobIntegration(dummyConfig, dummyProject, dummyFiles);
    expect(res.success).toBe(true);
    expect(res.manifestUpdated).toBe(true);

    const updatedManifest = res.files.find((f) => f.name === 'AndroidManifest.xml');
    expect(updatedManifest).toBeDefined();
    expect(updatedManifest?.content).toContain('com.google.android.gms.ads.APPLICATION_ID');
    expect(updatedManifest?.content).toContain(dummyConfig.appId);
    expect(updatedManifest?.content).toContain('android.permission.INTERNET');
    expect(updatedManifest?.content).toContain('android.permission.ACCESS_NETWORK_STATE');
  });

  it('injects play-services-ads and UMP consent dependencies into build.gradle.kts', () => {
    const res = AdMobGenerator.generateAdMobIntegration(dummyConfig, dummyProject, dummyFiles);
    expect(res.success).toBe(true);
    expect(res.gradleUpdated).toBe(true);

    const updatedGradle = res.files.find((f) => f.name === 'build.gradle.kts');
    expect(updatedGradle).toBeDefined();
    expect(updatedGradle?.content).toContain('com.google.android.gms:play-services-ads');
    expect(updatedGradle?.content).toContain('com.google.android.ump:user-messaging-platform');
  });

  it('generates production-grade AdMobService.kt Kotlin engine with rewarded callback and frequency capping', () => {
    const kotlinCode = AdMobGenerator.generateKotlinService(dummyProject.packageId, dummyConfig);
    expect(kotlinCode).toContain('package com.example.myapp');
    expect(kotlinCode).toContain('object AdMobService');
    expect(kotlinCode).toContain('MobileAds.initialize');
    expect(kotlinCode).toContain('showRewarded');
    expect(kotlinCode).toContain('onRewardEarned');
    expect(kotlinCode).toContain('showInterstitial');
    expect(kotlinCode).toContain('minIntervalSec');
  });

  it('generates and persists admob.json file in project root', () => {
    const res = AdMobGenerator.generateAdMobIntegration(dummyConfig, dummyProject, dummyFiles);
    const admobJson = res.files.find((f) => f.name === 'admob.json');
    expect(admobJson).toBeDefined();

    const parsed = JSON.parse(admobJson!.content);
    expect(parsed.enabled).toBe(true);
    expect(parsed.appId).toBe(dummyConfig.appId);
  });
});

describe('Monetization Diagnostics & Store', () => {
  const dummyProject: ProjectMetadata = {
    id: 'test_proj',
    name: 'My Application',
    displayName: 'My Application',
    packageId: 'com.example.myapp',
    location: '/projects/test_proj',
    description: 'Android App',
    template: 'empty-android',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 1,
    versionName: '1.0.0',
    formatVersion: '2.0',
  };

  beforeEach(() => {
    useMonetizationStore.getState().useOfficialTestIds();
  });

  it('detects missing App ID as an error during release diagnostics', () => {
    const badConfig: AdMobConfig = {
      ...useMonetizationStore.getState().config,
      enabled: true,
      appId: '',
    };

    const report = AdMobValidator.runDiagnostics(badConfig, dummyProject, [], 'release');
    expect(report.errorsCount).toBeGreaterThan(0);
    const appIdError = report.items.find((i) => i.category === 'appid');
    expect(appIdError).toBeDefined();
    expect(appIdError?.severity).toBe('error');
    expect(appIdError?.problem).toBeDefined();
    expect(appIdError?.cause).toBeDefined();
    expect(appIdError?.suggestedFix).toBeDefined();
  });

  it('detects test IDs in production profile as a blocker', () => {
    const testConfig: AdMobConfig = {
      ...useMonetizationStore.getState().config,
      enabled: true,
      environment: 'test',
    };

    const report = AdMobValidator.runDiagnostics(testConfig, dummyProject, [], 'production');
    expect(report.isBlocked).toBe(true);
    const envIssue = report.items.find((i) => i.category === 'environment');
    expect(envIssue).toBeDefined();
  });

  it('supports adding, updating, and deleting ad units in store', () => {
    const store = useMonetizationStore.getState();
    const initialCount = store.config.units.length;

    store.addAdUnit({
      name: 'Custom Rewarded',
      type: 'rewarded',
      adUnitId: OFFICIAL_GOOGLE_TEST_IDS.rewarded,
      placement: 'quest_reward',
      enabled: true,
      mode: 'test',
      rewardName: 'Diamond',
      rewardAmount: 50,
    });

    const newUnits = useMonetizationStore.getState().config.units;
    expect(newUnits.length).toBe(initialCount + 1);

    const added = newUnits.find((u) => u.name === 'Custom Rewarded');
    expect(added).toBeDefined();
    expect(added?.rewardName).toBe('Diamond');

    // Toggle enabled
    store.toggleAdUnitEnabled(added!.id);
    expect(useMonetizationStore.getState().config.units.find((u) => u.id === added!.id)?.enabled).toBe(false);

    // Delete
    store.deleteAdUnit(added!.id);
    expect(useMonetizationStore.getState().config.units.length).toBe(initialCount);
  });

  it('exports and imports admob.json cleanly', () => {
    const store = useMonetizationStore.getState();
    const jsonStr = store.exportConfigAsJson();
    expect(jsonStr).toContain('ca-app-pub-');

    const importRes = store.importConfigFromJson(jsonStr);
    expect(importRes.success).toBe(true);
  });
});
