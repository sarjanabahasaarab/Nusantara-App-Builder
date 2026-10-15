/**
 * Nusantara App Builder - Website to APK
 * Step 8: Interactive Live Preview & Android Project Generation
 */

import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Tablet,
  RotateCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Palette,
  FolderOpen,
  Download,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
  Wifi,
  Battery,
  Layers,
  ArrowRight,
} from 'lucide-react';
import JSZip from 'jszip';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useUiStore } from '../../../store/uiStore';
import { useProjectStore } from '../../../store/projectStore';
import { useTranslation } from '../../localization/useTranslation';
import { NativeBridge } from '../../filesystem/nativeBridge';

export const StepPreviewGenerate: React.FC = () => {
  const { lang } = useTranslation();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);
  const openProject = useProjectStore((s) => s.openProject);

  const sourceMode = useWebsiteToApkStore((s) => s.sourceMode);
  const websiteUrl = useWebsiteToApkStore((s) => s.websiteUrl);
  const localFiles = useWebsiteToApkStore((s) => s.localFiles);
  const chosenEntryPoint = useWebsiteToApkStore((s) => s.chosenEntryPoint);
  const appInfo = useWebsiteToApkStore((s) => s.appInfo);
  const iconConfig = useWebsiteToApkStore((s) => s.iconConfig);
  const splashScreen = useWebsiteToApkStore((s) => s.splashScreen);
  const webViewConfig = useWebsiteToApkStore((s) => s.webViewConfig);
  const appSettings = useWebsiteToApkStore((s) => s.appSettings);

  const previewDevice = useWebsiteToApkStore((s) => s.previewDevice);
  const setPreviewDevice = useWebsiteToApkStore((s) => s.setPreviewDevice);
  const previewOrientation = useWebsiteToApkStore((s) => s.previewOrientation);
  const setPreviewOrientation = useWebsiteToApkStore((s) => s.setPreviewOrientation);
  const previewZoom = useWebsiteToApkStore((s) => s.previewZoom);
  const setPreviewZoom = useWebsiteToApkStore((s) => s.setPreviewZoom);

  const isGenerating = useWebsiteToApkStore((s) => s.isGenerating);
  const generatedProject = useWebsiteToApkStore((s) => s.generatedProject);
  const generationError = useWebsiteToApkStore((s) => s.generationError);
  const generateProject = useWebsiteToApkStore((s) => s.generateProject);
  const validateAllSteps = useWebsiteToApkStore((s) => s.validateAllSteps);

  const [simulatingSplash, setSimulatingSplash] = useState(false);
  const [simulatingOffline, setSimulatingOffline] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const validation = validateAllSteps();

  // Create preview content URL for local website files
  const localHtmlBlobUrl = useMemo(() => {
    if (sourceMode !== 'local' || localFiles.length === 0) return null;
    const entry = localFiles.find((f) => f.path === chosenEntryPoint) || localFiles[0];
    if (!entry) return null;
    const blob = new Blob([entry.content], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [sourceMode, localFiles, chosenEntryPoint]);

  const targetPreviewUrl = sourceMode === 'local' ? localHtmlBlobUrl : websiteUrl;

  const handleGenerate = async () => {
    const proj = await generateProject();
    if (proj) {
      showToast(`Proyek Android "${proj.name}" berhasil dibuat!`);
    }
  };

  const handleOpenInCodeEditor = async () => {
    if (!generatedProject) return;
    await openProject(generatedProject.id);
    setActiveView('code-editor');
  };

  const handleOpenInVisualDesigner = async () => {
    if (!generatedProject) return;
    await openProject(generatedProject.id);
    setActiveView('visual-designer');
  };

  const handleOpenProjectDetail = async () => {
    if (!generatedProject) return;
    await openProject(generatedProject.id);
    setActiveView('project-detail');
  };

  const handleDownloadZip = async () => {
    if (!generatedProject) return;
    setIsDownloadingZip(true);
    try {
      const files = await NativeBridge.getProjectFiles(generatedProject.id);
      const zip = new JSZip();

      for (const file of files) {
        if (!file.isDirectory) {
          zip.file(file.path, file.content || '');
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedProject.name}-android-project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('ZIP proyek berhasil diunduh.');
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat arsip ZIP.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const playSplash = () => {
    setSimulatingSplash(true);
    setTimeout(() => {
      setSimulatingSplash(false);
    }, splashScreen.durationMs || 1500);
  };

  // Device dimensions
  const deviceWidth =
    previewDevice === 'pixel_7' ? (previewOrientation === 'portrait' ? 360 : 640) :
    previewDevice === 'galaxy_s23' ? (previewOrientation === 'portrait' ? 340 : 600) :
    (previewOrientation === 'portrait' ? 520 : 720);

  const deviceHeight =
    previewDevice === 'pixel_7' ? (previewOrientation === 'portrait' ? 680 : 360) :
    previewDevice === 'galaxy_s23' ? (previewOrientation === 'portrait' ? 640 : 340) :
    (previewOrientation === 'portrait' ? 680 : 520);

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Device selector */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 font-medium">Perangkat:</span>
          <select
            value={previewDevice}
            onChange={(e) => setPreviewDevice(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 rounded px-2.5 py-1 focus:outline-none"
          >
            <option value="pixel_7">Google Pixel 7</option>
            <option value="galaxy_s23">Samsung Galaxy S23</option>
            <option value="tablet">Android Tablet 10"</option>
          </select>

          {/* Orientation button */}
          <button
            type="button"
            onClick={() =>
              setPreviewOrientation(previewOrientation === 'portrait' ? 'landscape' : 'portrait')
            }
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Putar Orientasi"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="capitalize">{previewOrientation}</span>
          </button>
        </div>

        {/* Simulation Buttons */}
        <div className="flex items-center gap-2">
          {splashScreen.enabled && (
            <button
              type="button"
              onClick={playSplash}
              disabled={simulatingSplash}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 text-blue-400" />
              <span>Simulasi Splash</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSimulatingOffline(!simulatingOffline)}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              simulatingOffline
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>{simulatingOffline ? 'Mode Normal' : 'Simulasi Offline'}</span>
          </button>

          {/* Zoom */}
          <div className="flex items-center gap-1 ml-2">
            {[80, 100].map((zoom) => (
              <button
                key={zoom}
                type="button"
                onClick={() => setPreviewZoom(zoom)}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                  previewZoom === zoom
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {zoom}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split: Simulator & Project Generator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Device Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden min-h-[520px]">
          {/* Simulated Phone Frame */}
          <div
            className="rounded-[36px] border-[10px] border-neutral-800 bg-neutral-950 shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300"
            style={{
              width: `${(deviceWidth * previewZoom) / 100}px`,
              height: `${(deviceHeight * previewZoom) / 100}px`,
            }}
          >
            {/* Status Bar */}
            <div className="h-6 bg-neutral-900/90 text-neutral-300 text-[10px] px-4 flex items-center justify-between shrink-0 select-none z-20">
              <span className="font-semibold">09:41</span>
              <div className="w-14 h-3.5 bg-neutral-950 rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Optional Native Top App Bar */}
            {appSettings.enableTopAppBar && (
              <div
                className="h-10 px-4 flex items-center justify-between text-white shrink-0 shadow-md z-10"
                style={{ backgroundColor: appSettings.topAppBarBgColor }}
              >
                <span className="font-bold text-xs truncate">
                  {appSettings.topAppBarTitle || appInfo.appName}
                </span>
                <RefreshCw
                  className="w-3.5 h-3.5 opacity-80 hover:opacity-100 cursor-pointer"
                  onClick={() => setIframeLoaded(false)}
                />
              </div>
            )}

            {/* Loading Progress Bar simulation */}
            {webViewConfig.progressIndicator && !iframeLoaded && (
              <div className="h-1 w-full bg-blue-950 overflow-hidden shrink-0 z-10">
                <div className="h-full bg-blue-500 animate-pulse w-3/4" />
              </div>
            )}

            {/* Main WebView Simulator Display */}
            <div className="flex-1 relative bg-neutral-950 overflow-hidden">
              {/* Simulated Splash Screen Overlay */}
              {simulatingSplash && splashScreen.enabled ? (
                <div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6 animate-fade-in"
                  style={{ backgroundColor: splashScreen.backgroundColor }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 shadow-xl">
                    {iconConfig.iconDataUrl ? (
                      <img src={iconConfig.iconDataUrl} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-3xl">🌐</span>
                    )}
                  </div>
                  {splashScreen.showAppTitle && (
                    <div className="text-sm font-bold text-white tracking-wide">
                      {appInfo.appName}
                    </div>
                  )}
                </div>
              ) : simulatingOffline ? (
                /* Simulated Offline Fallback Page */
                <div className="absolute inset-0 z-20 bg-[#0F172A] flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
                  <div className="text-4xl">📡</div>
                  <div className="text-sm font-bold">Tidak Dapat Terhubung</div>
                  <div className="text-[11px] text-neutral-400 max-w-[200px]">
                    Periksa koneksi internet Anda atau coba muat ulang halaman.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulatingOffline(false)}
                    className="px-3 py-1.5 bg-blue-600 rounded text-xs font-semibold cursor-pointer"
                  >
                    Coba Lagi (Retry)
                  </button>
                </div>
              ) : (
                /* Actual Iframe or Web Content Preview */
                <iframe
                  src={targetPreviewUrl || 'about:blank'}
                  title="App WebView Preview"
                  className="w-full h-full border-none bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  onLoad={() => setIframeLoaded(true)}
                />
              )}
            </div>

            {/* Simulated Android Navigation Bar */}
            <div className="h-6 bg-neutral-950 flex items-center justify-center shrink-0 z-20">
              <div className="w-24 h-1 bg-neutral-600 rounded-full" />
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 mt-4 text-center">
            Pratinjau interaktif Android WebView ({appInfo.packageId})
          </div>
        </div>

        {/* Right: Checklist & Generation Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Validation Checklist Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="text-xs font-semibold text-neutral-200 pb-2 border-b border-neutral-800 flex items-center justify-between">
              <span>{lang === 'id' ? 'Ringkasan Kesiapan Proyek' : 'Project Readiness Summary'}</span>
              {validation.isValid ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SIAP
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> ADA KENDALA
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Mode Sumber:</span>
                <span className="font-semibold text-neutral-200">
                  {sourceMode === 'url' ? 'Online Website' : 'Local Assets Folder'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Target Entry Point:</span>
                <span className="font-mono text-neutral-300 truncate max-w-[180px]">
                  {sourceMode === 'url' ? websiteUrl : chosenEntryPoint}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Nama Aplikasi:</span>
                <span className="font-semibold text-neutral-200">{appInfo.appName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">ID Paket:</span>
                <span className="font-mono text-neutral-300 text-[11px]">{appInfo.packageId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Versi:</span>
                <span className="font-mono text-neutral-300">
                  v{appInfo.versionName} ({appInfo.versionCode})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Cleartext Traffic:</span>
                <span
                  className={
                    webViewConfig.cleartextTrafficAllowed ? 'text-amber-400 font-bold' : 'text-emerald-400'
                  }
                >
                  {webViewConfig.cleartextTrafficAllowed ? 'Diizinkan (HTTP)' : 'Aman (HTTPS Only)'}
                </span>
              </div>
            </div>

            {/* Error alerts if any */}
            {validation.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs space-y-1">
                {validation.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings if any */}
            {validation.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-[11px] space-y-1">
                {validation.warnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Action Button */}
            {!generatedProject ? (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !validation.isValid}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat Struktur Proyek Android...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Buat Proyek Android Sekarang (Generate)</span>
                  </>
                )}
              </button>
            ) : null}

            {generationError && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {generationError}
              </div>
            )}
          </div>

          {/* Success State & Next Actions */}
          {generatedProject && (
            <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-5 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-100">
                    Proyek Berhasil Dibuat!
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Proyek Android native siap untuk diedit atau di-build ke APK & AAB.
                  </div>
                </div>
              </div>

              {/* Action Buttons to Phase 4, Phase 3, and Export */}
              <div className="space-y-2 pt-2">
                {/* 1. Open in Code Editor (Phase 4) */}
                <button
                  type="button"
                  onClick={handleOpenInCodeEditor}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    <span>Buka di Editor Kode (Code Editor)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 2. Open in Visual Designer (Phase 3) */}
                <button
                  type="button"
                  onClick={handleOpenInVisualDesigner}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer border border-neutral-700"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span>Buka di Visual Designer</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 3. Open Project Detail */}
                <button
                  type="button"
                  onClick={handleOpenProjectDetail}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer border border-neutral-700"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-emerald-400" />
                    <span>Lihat Detail Proyek</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 4. Download Project ZIP */}
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip}
                  className="w-full py-2 px-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isDownloadingZip ? 'Mengompresi ZIP...' : 'Unduh Berkas Proyek (.ZIP)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
