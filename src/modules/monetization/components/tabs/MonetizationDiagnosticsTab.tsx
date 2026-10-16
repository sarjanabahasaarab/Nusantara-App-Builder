/**
 * Nusantara App Builder - Monetization Diagnostics Tab
 * Phase 9: Pre-release audit & real-time diagnosis for AdMob configuration,
 * AndroidManifest meta-data, Gradle dependencies, and policy safety checks.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Download,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useProjectStore } from '../../../../store/projectStore';
import { useUiStore } from '../../../../store/uiStore';
import { useTranslation } from '../../../localization/useTranslation';
import { MonetizationDiagnosticItem } from '../../types';

export const MonetizationDiagnosticsTab: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);

  const config = useMonetizationStore((s) => s.config);
  const updateConfig = useMonetizationStore((s) => s.updateConfig);
  const updateAdUnit = useMonetizationStore((s) => s.updateAdUnit);
  const useOfficialTestIds = useMonetizationStore((s) => s.useOfficialTestIds);
  const syncToProject = useMonetizationStore((s) => s.syncToProject);
  const setActiveTab = useMonetizationStore((s) => s.setActiveTab);
  const diagnosticReport = useMonetizationStore((s) => s.diagnosticReport);
  const runDiagnostics = useMonetizationStore((s) => s.runDiagnostics);

  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const isIndo = lang === 'id';

  // Run diagnostics on mount if not ran yet
  React.useEffect(() => {
    if (!diagnosticReport && activeProject) {
      runDiagnostics(activeProject, projectFiles);
    }
  }, [activeProject, projectFiles, diagnosticReport, runDiagnostics]);

  const handleRefreshDiagnostics = () => {
    if (activeProject) {
      const rep = runDiagnostics(activeProject, projectFiles);
      showToast(
        isIndo
          ? `Audit selesai: ${rep.errorsCount} Error, ${rep.warningsCount} Peringatan.`
          : `Diagnostics completed: ${rep.errorsCount} Errors, ${rep.warningsCount} Warnings.`
      );
    }
  };

  const handleExportReport = () => {
    if (!diagnosticReport) return;
    const blob = new Blob([JSON.stringify(diagnosticReport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monetization-diagnostics-${activeProject?.name || 'app'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isIndo ? 'Laporan audit berhasil diekspor!' : 'Diagnostic report exported!');
  };

  // Quick fix handler for specific diagnostic items
  const handleApplyQuickFix = (item: MonetizationDiagnosticItem) => {
    if (!activeProject) return;

    if (item.category === 'appid') {
      useOfficialTestIds();
      showToast(
        isIndo
          ? 'Memasang Google Test App ID yang valid.'
          : 'Injected valid official Google Test App ID.'
      );
      runDiagnostics(activeProject, projectFiles);
    } else if (item.category === 'manifest' || item.category === 'dependencies') {
      const res = syncToProject(activeProject, projectFiles);
      if (res.success) {
        showToast(
          isIndo
            ? 'Sinkronisasi berkas AndroidManifest & Gradle berhasil diperbaiki!'
            : 'AndroidManifest & Gradle sync fixed successfully!'
        );
      }
      runDiagnostics(activeProject, projectFiles);
    } else if (item.category === 'privacy') {
      updateConfig({
        privacyPolicyUrl: 'https://example.com/privacy-policy',
      });
      showToast(
        isIndo
          ? 'URL Kebijakan Privasi HTTPS default telah diterapkan.'
          : 'Default HTTPS Privacy Policy URL applied.'
      );
      runDiagnostics(activeProject, projectFiles);
    } else if (item.category === 'adunits') {
      useOfficialTestIds();
      showToast(
        isIndo
          ? 'Seluruh Ad Unit ID diselaraskan dengan Test ID Google.'
          : 'All Ad Unit IDs aligned with Google Test IDs.'
      );
      runDiagnostics(activeProject, projectFiles);
    } else if (item.category === 'consent') {
      updateConfig({
        consentConfig: {
          ...config.consentConfig,
          enabled: true,
          provider: 'ump',
        },
      });
      showToast(
        isIndo
          ? 'Google User Messaging Platform (UMP) consent SDK diaktifkan.'
          : 'Google UMP Consent SDK activated.'
      );
      runDiagnostics(activeProject, projectFiles);
    }
  };

  const report = diagnosticReport || {
    isBlocked: false,
    errorsCount: 0,
    warningsCount: 0,
    infoCount: 0,
    items: [],
    timestamp: new Date().toISOString(),
  };

  const filteredItems = report.items.filter((item) => {
    const matchSeverity = severityFilter === 'all' || item.severity === severityFilter;
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSeverity && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Overview & Severity Summary Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {isIndo ? 'Audit & Pra-Rilis Monetisasi' : 'Monetization Pre-Release Audit'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  report.errorsCount > 0
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : report.warningsCount > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {report.errorsCount > 0
                  ? isIndo
                    ? '● RELEASE BLOCKED'
                    : '● RELEASE BLOCKED'
                  : report.warningsCount > 0
                  ? isIndo
                    ? '● PERLU PERHATIAN'
                    : '● ATTENTION NEEDED'
                  : isIndo
                    ? '● VALID & SIAP RILIS'
                    : '● VALID & READY TO RELEASE'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {isIndo ? 'Diagnostik & Pemeriksaan Kebijakan AdMob' : 'AdMob Policy & Configuration Diagnostics'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              {isIndo
                ? 'Pemeriksaan otomatis mendalam untuk memastikan integritas App ID, Ad Unit, izin AndroidManifest, dependensi Gradle, dan kepatuhan privasi pengguna sebelum rilis ke Google Play Store.'
                : 'Automated deep check ensuring App ID integrity, Ad Units, AndroidManifest permissions, Gradle dependencies, and privacy compliance before publishing to Google Play Store.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefreshDiagnostics}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Jalankan Audit Sekarang' : 'Run Diagnostics Now'}</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Ekspor Laporan' : 'Export Report'}</span>
            </button>
          </div>
        </div>

        {/* Status Counter Badges */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div
            onClick={() => setSeverityFilter(severityFilter === 'error' ? 'all' : 'error')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              severityFilter === 'error'
                ? 'bg-red-950/40 border-red-500 text-red-200 ring-1 ring-red-500'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isIndo ? 'Kesalahan Kritis' : 'Critical Errors'}
              </span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-2">
              {report.errorsCount}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              {isIndo ? 'Memblokir build release' : 'Blocks release build'}
            </div>
          </div>

          <div
            onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              severityFilter === 'warning'
                ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isIndo ? 'Peringatan Kebijakan' : 'Policy Warnings'}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
              {report.warningsCount}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              {isIndo ? 'Potensi penolakan Play Store' : 'Potential Play Store issues'}
            </div>
          </div>

          <div
            onClick={() => setSeverityFilter(severityFilter === 'info' ? 'all' : 'info')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              severityFilter === 'info'
                ? 'bg-blue-950/40 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {isIndo ? 'Saran Optimalisasi' : 'Best Practice Hints'}
              </span>
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
              {report.infoCount}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              {isIndo ? 'Rekomendasi kinerja' : 'Performance optimization'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">
            {isIndo ? 'Filter Kategori:' : 'Category Filter:'}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">{isIndo ? 'Semua Kategori' : 'All Categories'}</option>
            <option value="appid">App ID</option>
            <option value="adunits">Ad Units</option>
            <option value="manifest">AndroidManifest</option>
            <option value="dependencies">Gradle Dependencies</option>
            <option value="privacy">Privacy Policy</option>
            <option value="consent">Consent & UMP</option>
            <option value="environment">Environment</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            {isIndo
              ? `Menampilkan ${filteredItems.length} dari ${report.items.length} temuan`
              : `Showing ${filteredItems.length} of ${report.items.length} items`}
          </span>
        </div>
      </div>

      {/* 3. Diagnostic Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              {isIndo ? 'Semua Pemeriksaan Diagnostik Lolos!' : 'All Diagnostics Passed!'}
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {isIndo
                ? 'Tidak ditemukan kesalahan konfigurasi pada filter yang dipilih. Konfigurasi AdMob Anda memenuhi standar arsitektur Android.'
                : 'No diagnostic issues found matching the selected filter. Your AdMob setup complies with Android architecture standards.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isError = item.severity === 'error';
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border bg-neutral-900 shadow-md space-y-3 transition-all ${
                  isError
                    ? 'border-red-900/60 bg-red-950/10'
                    : isWarning
                    ? 'border-amber-900/60 bg-amber-950/10'
                    : 'border-blue-900/60 bg-blue-950/10'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isError ? (
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-400 shrink-0" />
                    )}
                    <span className="font-bold text-sm text-white">
                      {isIndo ? item.titleId : item.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isError
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase">
                      {item.category}
                    </span>
                  </div>

                  {/* Auto-Fix button */}
                  <button
                    onClick={() => handleApplyQuickFix(item)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{isIndo ? 'Perbaiki Otomatis' : 'Quick Auto-Fix'}</span>
                  </button>
                </div>

                {/* Problem, Cause, Suggested Fix Triad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
                    <span className="font-semibold text-neutral-300 block mb-1">
                      {isIndo ? 'Problem (Masalah):' : 'Problem:'}
                    </span>
                    <p className="text-neutral-400 leading-relaxed">
                      {isIndo ? item.problemId : item.problem}
                    </p>
                  </div>

                  <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800">
                    <span className="font-semibold text-neutral-300 block mb-1">
                      {isIndo ? 'Cause (Penyebab):' : 'Cause:'}
                    </span>
                    <p className="text-neutral-400 leading-relaxed">
                      {isIndo ? item.causeId : item.cause}
                    </p>
                  </div>

                  <div className="p-2.5 bg-blue-950/30 rounded-lg border border-blue-900/50">
                    <span className="font-semibold text-blue-300 block mb-1">
                      {isIndo ? 'Suggested Fix (Solusi):' : 'Suggested Fix:'}
                    </span>
                    <p className="text-blue-200 leading-relaxed">
                      {isIndo ? item.suggestedFixId : item.suggestedFix}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
