/**
 * Nusantara App Builder - Monetization & AdMob Workspace (Phase 9)
 * Full AdMob Center workspace with Submenu navigation, Ad Unit Manager,
 * Visual Placement, Consent & Privacy, Official Google Test Ads Mode, and Diagnostics.
 */

import React, { useEffect } from 'react';
import {
  DollarSign,
  Layers,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  FileCode,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useMonetizationStore, MonetizationTab } from '../store/monetizationStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';

// Tabs
import { AdMobOverviewTab } from './tabs/AdMobOverviewTab';
import { AdUnitsTab } from './tabs/AdUnitsTab';
import { AdPlacementTab } from './tabs/AdPlacementTab';
import { ConsentPrivacyTab } from './tabs/ConsentPrivacyTab';
import { TestAdsTab } from './tabs/TestAdsTab';
import { MonetizationDiagnosticsTab } from './tabs/MonetizationDiagnosticsTab';

// Modals
import { AdUnitModal } from './modals/AdUnitModal';
import { GeneratedCodeModal } from './modals/GeneratedCodeModal';
import { ImportExportModal } from './modals/ImportExportModal';

export const MonetizationWorkspace: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);

  const activeTab = useMonetizationStore((s) => s.activeTab);
  const setActiveTab = useMonetizationStore((s) => s.setActiveTab);
  const config = useMonetizationStore((s) => s.config);
  const diagnosticReport = useMonetizationStore((s) => s.diagnosticReport);
  const runDiagnostics = useMonetizationStore((s) => s.runDiagnostics);
  const syncToProject = useMonetizationStore((s) => s.syncToProject);
  const setIsGeneratedCodeModalOpen = useMonetizationStore((s) => s.setIsGeneratedCodeModalOpen);
  const setIsImportExportModalOpen = useMonetizationStore((s) => s.setIsImportExportModalOpen);
  const loadProjectConfig = useMonetizationStore((s) => s.loadProjectConfig);

  const isIndo = lang === 'id';

  // Load config on mount if project is active
  useEffect(() => {
    if (activeProject) {
      loadProjectConfig(activeProject, projectFiles);
    }
  }, [activeProject?.id]);

  const handleSync = () => {
    if (!activeProject) {
      showToast(isIndo ? 'Tidak ada proyek aktif.' : 'No active project.');
      return;
    }
    const res = syncToProject(activeProject, projectFiles);
    if (res.success) {
      showToast(
        isIndo
          ? 'Konfigurasi AdMob, AndroidManifest & Gradle berhasil disinkronkan!'
          : 'AdMob configuration, AndroidManifest & Gradle synced successfully!'
      );
    } else {
      showToast(res.error || 'Failed to sync');
    }
  };

  const navTabs: { id: MonetizationTab; label: string; badge?: number }[] = [
    { id: 'admob', label: isIndo ? 'AdMob Center' : 'AdMob Center' },
    {
      id: 'ad-units',
      label: isIndo ? 'Ad Units' : 'Ad Units',
      badge: config.units.length,
    },
    { id: 'placement', label: isIndo ? 'Penempatan Iklan' : 'Ad Placement' },
    { id: 'consent', label: isIndo ? 'Consent & Privasi' : 'Consent & Privacy' },
    { id: 'test-ads', label: isIndo ? 'Test Ads' : 'Test Ads' },
    {
      id: 'diagnostics',
      label: isIndo ? 'Diagnostik Monetisasi' : 'Monetization Diagnostics',
      badge: diagnosticReport?.errorsCount || 0,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admob':
        return <AdMobOverviewTab />;
      case 'ad-units':
        return <AdUnitsTab />;
      case 'placement':
        return <AdPlacementTab />;
      case 'consent':
        return <ConsentPrivacyTab />;
      case 'test-ads':
        return <TestAdsTab />;
      case 'diagnostics':
        return <MonetizationDiagnosticsTab />;
      default:
        return <AdMobOverviewTab />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 overflow-hidden select-none">
      {/* 1. Header Toolbar */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">
                  {isIndo ? 'Manajer Monetisasi & AdMob' : 'AdMob & Monetization Manager'}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    config.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {config.enabled
                    ? isIndo
                      ? '● TERKONFIGURASI'
                      : '● CONFIGURED'
                    : isIndo
                    ? '○ NONAKTIF'
                    : '○ DISABLED'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    config.environment === 'test'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-blue-950 text-blue-300 border border-blue-800'
                  }`}
                >
                  {config.environment === 'test' ? 'TEST ADS' : 'PRODUCTION'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {activeProject
                  ? `${activeProject.name} (${activeProject.packageId})`
                  : isIndo
                  ? 'Pilih atau buka proyek untuk mengonfigurasi AdMob'
                  : 'Select or open a project to configure AdMob'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGeneratedCodeModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Lihat Kode Kotlin' : 'View Kotlin Code'}</span>
          </button>
          <button
            onClick={() => setIsImportExportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Impor / Ekspor' : 'Import / Export'}</span>
          </button>
          <button
            onClick={handleSync}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Sinkron ke Proyek' : 'Sync to Project'}</span>
          </button>
        </div>
      </div>

      {/* 2. Submenu Tab Bar */}
      <div className="px-6 border-b border-neutral-800 bg-neutral-900/40 shrink-0 flex items-center gap-1 overflow-x-auto">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.id === 'diagnostics'
                      ? 'bg-red-950 text-red-300 border border-red-800 font-bold'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main Dynamic Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* 4. Modals */}
      <AdUnitModal />
      <GeneratedCodeModal />
      <ImportExportModal />
    </div>
  );
};
