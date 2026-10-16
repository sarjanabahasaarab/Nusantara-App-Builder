/**
 * Nusantara App Builder - Monetization & AdMob Zustand Store
 * Phase 9: State management for AdMob Center, Ad Units, Visual Placement,
 * Test IDs, Consent & Privacy, and Diagnostics.
 */

import { create } from 'zustand';
import {
  AdMobConfig,
  AdUnitConfig,
  AdType,
  AdEnvironment,
  MonetizationDiagnosticReport,
  OFFICIAL_GOOGLE_TEST_IDS,
} from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';
import { AdMobValidator } from '../services/adMobValidator';
import { AdMobGenerator, GenerationResult } from '../services/adMobGenerator';

export type MonetizationTab =
  | 'admob'
  | 'ad-units'
  | 'placement'
  | 'consent'
  | 'test-ads'
  | 'diagnostics';

const DEFAULT_CONFIG: AdMobConfig = {
  enabled: false,
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
      id: 'unit_banner_home',
      name: 'Home Bottom Banner',
      type: 'banner',
      adUnitId: OFFICIAL_GOOGLE_TEST_IDS.banner,
      placement: 'home_screen_bottom',
      enabled: true,
      mode: 'test',
      bannerPosition: 'bottom',
      bannerSize: 'adaptive',
    },
    {
      id: 'unit_interstitial_nav',
      name: 'Navigation Transition',
      type: 'interstitial',
      adUnitId: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
      placement: 'screen_transition',
      enabled: true,
      mode: 'test',
      interstitialTrigger: 'after_navigation',
      frequencyIntervalSec: 60,
    },
  ],
};

interface MonetizationState {
  activeTab: MonetizationTab;
  setActiveTab: (tab: MonetizationTab) => void;

  config: AdMobConfig;
  updateConfig: (updates: Partial<AdMobConfig>) => void;
  toggleAdMobEnabled: () => void;
  setEnvironment: (env: AdEnvironment) => void;
  useOfficialTestIds: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: AdType | 'all';
  setTypeFilter: (filter: AdType | 'all') => void;
  statusFilter: 'all' | 'enabled' | 'disabled';
  setStatusFilter: (filter: 'all' | 'enabled' | 'disabled') => void;

  // Unit Operations
  addAdUnit: (unit: Omit<AdUnitConfig, 'id'>) => void;
  updateAdUnit: (id: string, updates: Partial<AdUnitConfig>) => void;
  deleteAdUnit: (id: string) => void;
  toggleAdUnitEnabled: (id: string) => void;

  // Modals
  isAdUnitModalOpen: boolean;
  editingAdUnit: AdUnitConfig | null;
  openCreateAdUnitModal: (presetType?: AdType) => void;
  openEditAdUnitModal: (unit: AdUnitConfig) => void;
  closeAdUnitModal: () => void;

  isImportExportModalOpen: boolean;
  setIsImportExportModalOpen: (open: boolean) => void;
  isGeneratedCodeModalOpen: boolean;
  setIsGeneratedCodeModalOpen: (open: boolean) => void;

  // Diagnostics
  diagnosticReport: MonetizationDiagnosticReport | null;
  runDiagnostics: (
    project: ProjectMetadata,
    files: ProjectFile[],
    profile?: 'debug' | 'release' | 'production'
  ) => MonetizationDiagnosticReport;

  // Code Generation & Sync
  syncToProject: (
    project: ProjectMetadata,
    files: ProjectFile[]
  ) => GenerationResult;

  // Import / Export
  importConfigFromJson: (jsonStr: string) => { success: boolean; error?: string };
  exportConfigAsJson: () => string;

  loadProjectConfig: (project: ProjectMetadata, files: ProjectFile[]) => void;
}

export const useMonetizationStore = create<MonetizationState>((set, get) => ({
  activeTab: 'admob',
  setActiveTab: (activeTab) => set({ activeTab }),

  config: DEFAULT_CONFIG,
  updateConfig: (updates) =>
    set((s) => ({ config: { ...s.config, ...updates } })),

  toggleAdMobEnabled: () =>
    set((s) => ({ config: { ...s.config, enabled: !s.config.enabled } })),

  setEnvironment: (environment) =>
    set((s) => ({ config: { ...s.config, environment } })),

  useOfficialTestIds: () => {
    set((s) => ({
      config: {
        ...s.config,
        enabled: true,
        environment: 'test',
        appId: OFFICIAL_GOOGLE_TEST_IDS.appId,
        websitePlacement: {
          ...s.config.websitePlacement,
          bannerAdUnitId: OFFICIAL_GOOGLE_TEST_IDS.banner,
          interstitialAdUnitId: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
        },
        units: [
          {
            id: 'unit_banner_home',
            name: 'Sample Banner',
            type: 'banner',
            adUnitId: OFFICIAL_GOOGLE_TEST_IDS.banner,
            placement: 'bottom_bar',
            enabled: true,
            mode: 'test',
            bannerPosition: 'bottom',
            bannerSize: 'adaptive',
          },
          {
            id: 'unit_interstitial_nav',
            name: 'Sample Interstitial',
            type: 'interstitial',
            adUnitId: OFFICIAL_GOOGLE_TEST_IDS.interstitial,
            placement: 'navigation',
            enabled: true,
            mode: 'test',
            interstitialTrigger: 'after_navigation',
            frequencyIntervalSec: 60,
          },
          {
            id: 'unit_rewarded_video',
            name: 'Sample Rewarded Video',
            type: 'rewarded',
            adUnitId: OFFICIAL_GOOGLE_TEST_IDS.rewarded,
            placement: 'watch_ad_button',
            enabled: true,
            mode: 'test',
            rewardName: 'Coins',
            rewardAmount: 100,
            rewardTrigger: 'watch_ad_button',
          },
          {
            id: 'unit_native_feed',
            name: 'Sample Native Ad',
            type: 'native',
            adUnitId: OFFICIAL_GOOGLE_TEST_IDS.nativeAdvanced,
            placement: 'feed_item',
            enabled: true,
            mode: 'test',
            nativeTemplate: 'medium',
          },
        ],
      },
    }));
  },

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  typeFilter: 'all',
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  statusFilter: 'all',
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  addAdUnit: (unit) => {
    const newUnit: AdUnitConfig = {
      ...unit,
      id: `unit_${Date.now()}`,
    };
    set((s) => ({
      config: {
        ...s.config,
        units: [...s.config.units, newUnit],
      },
    }));
  },

  updateAdUnit: (id, updates) => {
    set((s) => ({
      config: {
        ...s.config,
        units: s.config.units.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      },
    }));
  },

  deleteAdUnit: (id) => {
    set((s) => ({
      config: {
        ...s.config,
        units: s.config.units.filter((u) => u.id !== id),
      },
    }));
  },

  toggleAdUnitEnabled: (id) => {
    set((s) => ({
      config: {
        ...s.config,
        units: s.config.units.map((u) =>
          u.id === id ? { ...u, enabled: !u.enabled } : u
        ),
      },
    }));
  },

  isAdUnitModalOpen: false,
  editingAdUnit: null,
  openCreateAdUnitModal: (presetType = 'banner') => {
    const defaultId =
      presetType === 'banner'
        ? OFFICIAL_GOOGLE_TEST_IDS.banner
        : presetType === 'interstitial'
        ? OFFICIAL_GOOGLE_TEST_IDS.interstitial
        : presetType === 'rewarded'
        ? OFFICIAL_GOOGLE_TEST_IDS.rewarded
        : OFFICIAL_GOOGLE_TEST_IDS.nativeAdvanced;

    set({
      isAdUnitModalOpen: true,
      editingAdUnit: {
        id: '',
        name: `New ${presetType.charAt(0).toUpperCase() + presetType.slice(1)} Ad`,
        type: presetType,
        adUnitId: defaultId,
        placement: 'main_view',
        enabled: true,
        mode: get().config.environment,
        bannerPosition: 'bottom',
        bannerSize: 'adaptive',
        interstitialTrigger: 'after_navigation',
        frequencyIntervalSec: 60,
        rewardName: 'Points',
        rewardAmount: 50,
        rewardTrigger: 'watch_ad_button',
        nativeTemplate: 'medium',
      },
    });
  },

  openEditAdUnitModal: (unit) => {
    set({
      isAdUnitModalOpen: true,
      editingAdUnit: { ...unit },
    });
  },

  closeAdUnitModal: () => {
    set({ isAdUnitModalOpen: false, editingAdUnit: null });
  },

  isImportExportModalOpen: false,
  setIsImportExportModalOpen: (open) => set({ isImportExportModalOpen: open }),
  isGeneratedCodeModalOpen: false,
  setIsGeneratedCodeModalOpen: (open) => set({ isGeneratedCodeModalOpen: open }),

  diagnosticReport: null,
  runDiagnostics: (project, files, profile = 'release') => {
    const report = AdMobValidator.runDiagnostics(get().config, project, files, profile);
    set({ diagnosticReport: report });
    return report;
  },

  syncToProject: (project, files) => {
    const result = AdMobGenerator.generateAdMobIntegration(get().config, project, files);
    if (result.success) {
      // Re-run diagnostics
      get().runDiagnostics(project, result.files);
    }
    return result;
  },

  importConfigFromJson: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed.enabled !== 'boolean' || !Array.isArray(parsed.units)) {
        return { success: false, error: 'Invalid admob.json structure.' };
      }
      set({ config: { ...DEFAULT_CONFIG, ...parsed } });
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Invalid JSON string',
      };
    }
  },

  exportConfigAsJson: () => {
    return JSON.stringify(get().config, null, 2);
  },

  loadProjectConfig: (project, files) => {
    // Check if admob.json exists in files
    const jsonFile = files.find((f) => f.path === 'admob.json');
    if (jsonFile) {
      try {
        const parsed = JSON.parse(jsonFile.content);
        set({ config: { ...DEFAULT_CONFIG, ...parsed } });
      } catch {}
    } else {
      // Check localStorage for saved config
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem(`nusantara_admob_${project.id}`);
          if (raw) {
            set({ config: JSON.parse(raw) });
          }
        } catch {}
      }
    }
    // Initial diagnostic scan
    get().runDiagnostics(project, files);
  },
}));
