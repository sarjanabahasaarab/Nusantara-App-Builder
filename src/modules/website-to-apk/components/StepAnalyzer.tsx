/**
 * Nusantara App Builder - Website to APK
 * Step 2: Website Structural Analyzer
 */

import React, { useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe2,
  FolderArchive,
  RefreshCw,
  Code2,
  Maximize2,
  ExternalLink,
  Layers,
  HardDrive,
  FileCheck,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';

export const StepAnalyzer: React.FC = () => {
  const { lang } = useTranslation();
  const analyzerReport = useWebsiteToApkStore((s) => s.analyzerReport);
  const isAnalyzing = useWebsiteToApkStore((s) => s.isAnalyzing);
  const runAnalysis = useWebsiteToApkStore((s) => s.runAnalysis);
  const sourceMode = useWebsiteToApkStore((s) => s.sourceMode);

  useEffect(() => {
    if (!analyzerReport) {
      runAnalysis();
    }
  }, [analyzerReport, runAnalysis]);

  if (!analyzerReport) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-3">
        <Activity className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
        <div className="text-sm font-semibold text-neutral-200">
          {lang === 'id' ? 'Menganalisis Website...' : 'Analyzing Website...'}
        </div>
      </div>
    );
  }

  const errorIssues = analyzerReport.detectedIssues.filter((i) => i.type === 'error');
  const warningIssues = analyzerReport.detectedIssues.filter((i) => i.type === 'warning');

  return (
    <div className="space-y-6">
      {/* Top Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          analyzerReport.isReadyForGeneration
            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
            : 'bg-red-950/30 border-red-800/60 text-red-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {analyzerReport.isReadyForGeneration ? (
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">
              {analyzerReport.isReadyForGeneration
                ? lang === 'id'
                  ? 'Website Siap Dikonversi ke Android'
                  : 'Website Ready for Android Conversion'
                : lang === 'id'
                ? 'Peringatan: Konfigurasi Perlu Diperbaiki'
                : 'Warning: Configuration Needs Attention'}
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              {analyzerReport.isReadyForGeneration
                ? lang === 'id'
                  ? 'Struktur website valid dan kompatibel dengan Android WebView Engine.'
                  : 'Website structure is valid and compatible with Android WebView Engine.'
                : lang === 'id'
                ? 'Ada kendala kritis yang perlu diselesaikan sebelum proyek dapat dibuat.'
                : 'There are critical issues that must be addressed before generating project.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{lang === 'id' ? 'Pindai Ulang' : 'Re-analyze'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-neutral-500 text-[11px] font-medium flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'id' ? 'Protokol / Mode' : 'Protocol / Mode'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100 uppercase font-mono">
            {analyzerReport.protocol || (sourceMode === 'url' ? 'HTTPS' : 'LOCAL ASSETS')}
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            {analyzerReport.isHttps ? 'TLS / SSL Aman' : 'Cleartext HTTP'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-neutral-500 text-[11px] font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{lang === 'id' ? 'Hostname / Origin' : 'Hostname / Origin'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100 truncate font-mono">
            {analyzerReport.hostname || 'localhost'}
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            {sourceMode === 'url' ? 'Domain Terverifikasi' : 'Internal App Bundle'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-neutral-500 text-[11px] font-medium flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'id' ? 'Mobile Viewport' : 'Mobile Viewport'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
            {analyzerReport.hasResponsiveViewport ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Responsif
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Default Zoom
              </span>
            )}
          </div>
          <div className="text-[11px] text-neutral-400">
            {analyzerReport.hasResponsiveViewport ? 'Meta tag terpasang' : 'Perlu penyesuaian'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-neutral-500 text-[11px] font-medium flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'id' ? 'Asset & Kode' : 'Assets & Code'}</span>
          </div>
          <div className="text-sm font-semibold text-neutral-100 font-mono">
            {sourceMode === 'local'
              ? `${analyzerReport.localAssetsCount} Berkas`
              : 'Web Streaming'}
          </div>
          <div className="text-[11px] text-neutral-400">
            {sourceMode === 'local'
              ? `${(analyzerReport.localAssetsTotalSize / 1024).toFixed(1)} KB`
              : 'Direct WebView CDN'}
          </div>
        </div>
      </div>

      {/* Detailed Technical Specs */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-semibold text-neutral-200">
          {lang === 'id' ? 'Detail Analisis Teknis' : 'Technical Analysis Details'}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-400">{lang === 'id' ? 'Target Entry Point:' : 'Target Entry Point:'}</span>
            <span className="font-mono text-neutral-200 truncate max-w-md">
              {analyzerReport.entryPoint || analyzerReport.targetUrl}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-400">{lang === 'id' ? 'Dukungan JavaScript:' : 'JavaScript Support:'}</span>
            <span className="text-emerald-400 font-medium">
              {analyzerReport.hasJavaScript ? 'Aktif (Dibutuhkan)' : 'Minimal'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-400">
              {lang === 'id' ? 'Domain Eksternal / CDN Terdeteksi:' : 'External Domains / CDNs Detected:'}
            </span>
            <span className="text-neutral-200">
              {analyzerReport.externalResources.length > 0
                ? `${analyzerReport.externalResources.length} Domain (${analyzerReport.externalResources.slice(0, 2).join(', ')}${
                    analyzerReport.externalResources.length > 2 ? '...' : ''
                  })`
                : 'Tidak ada'}
            </span>
          </div>
        </div>
      </div>

      {/* Issues & Warnings List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-neutral-300">
          {lang === 'id' ? 'Hasil Diagnostik & Rekomendasi' : 'Diagnostic Results & Recommendations'} (
          {analyzerReport.detectedIssues.length})
        </div>

        {analyzerReport.detectedIssues.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'id'
                ? 'Tidak ada masalah terdeteksi. Website memenuhi semua kriteria WebView modern.'
                : 'No issues detected. Website meets all modern WebView criteria.'}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {analyzerReport.detectedIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                  issue.type === 'error'
                    ? 'bg-red-950/30 border-red-800/60 text-red-300'
                    : issue.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                    : 'bg-blue-950/30 border-blue-800/60 text-blue-300'
                }`}
              >
                {issue.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : issue.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-neutral-100">{issue.title}</div>
                  <div className="text-[11px] text-neutral-300 mt-0.5 opacity-90">
                    {issue.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
