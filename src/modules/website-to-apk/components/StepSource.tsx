/**
 * Nusantara App Builder - Website to APK
 * Step 1: Source Selection (Online Website vs Local Website Folder)
 */

import React, { useRef } from 'react';
import {
  Globe2,
  FolderArchive,
  Link2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Upload,
  FileCode,
  FolderOpen,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';
import { validateWebsiteUrl } from '../services/urlValidator';
import { LocalWebsiteFile } from '../types';

export const StepSource: React.FC = () => {
  const { lang } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sourceMode = useWebsiteToApkStore((s) => s.sourceMode);
  const setSourceMode = useWebsiteToApkStore((s) => s.setSourceMode);
  const websiteUrl = useWebsiteToApkStore((s) => s.websiteUrl);
  const setWebsiteUrl = useWebsiteToApkStore((s) => s.setWebsiteUrl);
  const isTestingUrl = useWebsiteToApkStore((s) => s.isTestingUrl);
  const testUrlResult = useWebsiteToApkStore((s) => s.testUrlResult);
  const runTestUrl = useWebsiteToApkStore((s) => s.runTestUrl);

  const localFiles = useWebsiteToApkStore((s) => s.localFiles);
  const setLocalFiles = useWebsiteToApkStore((s) => s.setLocalFiles);
  const chosenEntryPoint = useWebsiteToApkStore((s) => s.chosenEntryPoint);
  const loadSampleLocalWebsite = useWebsiteToApkStore((s) => s.loadSampleLocalWebsite);

  const urlValidation = validateWebsiteUrl(websiteUrl);

  // Handle local folder upload via input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const parsedFiles: LocalWebsiteFile[] = [];
    let defaultEntry = 'index.html';

    const readers: Promise<void>[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Get relative path if webkitRelativePath is available
      const relPath = file.webkitRelativePath
        ? file.webkitRelativePath.split('/').slice(1).join('/') || file.name
        : file.name;

      if (file.name.toLowerCase() === 'index.html') {
        defaultEntry = relPath;
      }

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader();
        const isText =
          file.type.startsWith('text/') ||
          /\.(html|htm|css|js|json|svg|txt|xml|md)$/i.test(file.name);

        if (isText) {
          reader.readAsText(file);
          reader.onload = () => {
            parsedFiles.push({
              path: relPath,
              name: file.name,
              size: file.size,
              type: file.type || 'text/plain',
              content: reader.result as string,
              isBinary: false,
            });
            resolve();
          };
        } else {
          reader.readAsDataURL(file);
          reader.onload = () => {
            parsedFiles.push({
              path: relPath,
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              content: reader.result as string,
              isBinary: true,
            });
            resolve();
          };
        }
      });
      readers.push(p);
    }

    Promise.all(readers).then(() => {
      setLocalFiles(parsedFiles, defaultEntry);
    });
  };

  const samplePresets = [
    { label: 'Wikipedia', url: 'https://id.wikipedia.org' },
    { label: 'Hacker News', url: 'https://news.ycombinator.com' },
    { label: 'GitHub Docs', url: 'https://docs.github.com' },
    { label: 'Google', url: 'https://www.google.com' },
  ];

  return (
    <div className="space-y-6">
      {/* Source Mode Selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setSourceMode('url')}
          className={`flex-1 p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
            sourceMode === 'url'
              ? 'bg-blue-600/10 border-blue-500 text-neutral-100 ring-1 ring-blue-500/50'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              sourceMode === 'url' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              {lang === 'id' ? 'Website Online (URL)' : 'Online Website (URL)'}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {lang === 'id'
                ? 'Konversi website live di internet menggunakan URL HTTPS'
                : 'Convert a live online website via HTTPS URL'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSourceMode('local')}
          className={`flex-1 p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left cursor-pointer ${
            sourceMode === 'local'
              ? 'bg-blue-600/10 border-blue-500 text-neutral-100 ring-1 ring-blue-500/50'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              sourceMode === 'local' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              {lang === 'id' ? 'Website Lokal (Folder / Offline)' : 'Local Website (Folder / Offline)'}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {lang === 'id'
                ? 'Bundle berkas HTML, CSS, JS lokal ke dalam asset APK'
                : 'Package local HTML, CSS, JS bundle into APK assets'}
            </div>
          </div>
        </button>
      </div>

      {/* Online Website Config */}
      {sourceMode === 'url' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
              {lang === 'id' ? 'URL Website' : 'Website URL'} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={runTestUrl}
                disabled={isTestingUrl || !urlValidation.isValid}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {isTestingUrl ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'id' ? 'Menguji...' : 'Testing...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>{lang === 'id' ? 'Uji URL' : 'Test URL'}</span>
                  </>
                )}
              </button>
            </div>

            {/* URL Validation Message */}
            {!urlValidation.isValid && websiteUrl.length > 8 && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'id' ? urlValidation.errorId : urlValidation.error}</span>
              </div>
            )}

            {urlValidation.isValid && !urlValidation.isHttps && (
              <div className="mt-2 text-xs text-amber-400 flex items-center gap-1.5 bg-amber-950/40 p-2 rounded border border-amber-900/60">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>
                  {lang === 'id'
                    ? 'Peringatan: URL ini menggunakan HTTP polos. Android 9+ memblokir cleartext secara default. Fitur Cleartext Traffic akan diaktifkan otomatis.'
                    : 'Warning: This URL uses plain HTTP. Android 9+ blocks cleartext by default. Cleartext traffic will be enabled.'}
                </span>
              </div>
            )}
          </div>

          {/* Connection Test Result */}
          {testUrlResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testUrlResult.status === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : testUrlResult.status === 'inconclusive'
                  ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                  : 'bg-red-950/40 border-red-800/60 text-red-300'
              }`}
            >
              {testUrlResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : testUrlResult.status === 'inconclusive' ? (
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">
                  {testUrlResult.status === 'success'
                    ? lang === 'id'
                      ? 'Koneksi Berhasil'
                      : 'Connection Successful'
                    : testUrlResult.status === 'inconclusive'
                    ? lang === 'id'
                      ? 'Format URL Valid (Siap untuk Android WebView)'
                      : 'Valid URL Format (Ready for Android WebView)'
                    : lang === 'id'
                    ? 'Koneksi Gagal'
                    : 'Connection Failed'}
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  {lang === 'id' ? testUrlResult.messageId : testUrlResult.message}
                </div>
              </div>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[11px] font-medium text-neutral-400 mb-2">
              {lang === 'id' ? 'Atau coba contoh URL populer:' : 'Or try popular sample URLs:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setWebsiteUrl(preset.url);
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Local Website Config */}
      {sourceMode === 'local' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-200">
                {lang === 'id' ? 'Pilih Berkas Website Lokal' : 'Select Local Website Files'}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'id'
                  ? 'Folder dapat berisi index.html, style.css, script.js, gambar, font, dan assets.'
                  : 'Folder can contain index.html, style.css, script.js, images, fonts, and assets.'}
              </p>
            </div>

            <button
              type="button"
              onClick={loadSampleLocalWebsite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'id' ? 'Muat Demo Toko Nusantara' : 'Load Demo Store Bundle'}</span>
            </button>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-neutral-950/50 hover:bg-neutral-950 transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is standard for folder picker
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-neutral-800 group-hover:bg-blue-600/20 text-neutral-400 group-hover:text-blue-400 flex items-center justify-center mx-auto mb-3 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-neutral-200 group-hover:text-blue-400 transition-colors">
              {lang === 'id'
                ? 'Klik untuk Memilih Folder Website'
                : 'Click to Choose Website Folder'}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {lang === 'id'
                ? 'Pilih folder website lengkap dari disk lokal Anda'
                : 'Select full website folder from your local drive'}
            </div>
          </div>

          {/* Privacy & Offline banner */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-400 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'id'
                ? 'Jaminan Keamanan: Semua pemrosesan berkas website lokal berlangsung 100% di browser dan komputer Anda. Tidak ada berkas yang dikirim ke server eksternal.'
                : 'Security Guarantee: All local file processing is 100% on your device. No files are uploaded to any external server.'}
            </span>
          </div>

          {/* Loaded Files Summary */}
          {localFiles.length > 0 && (
            <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-950/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {localFiles.length} {lang === 'id' ? 'berkas dimuat' : 'files loaded'} (
                  {(localFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB)
                </span>

                {/* Entry point selector */}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">{lang === 'id' ? 'Entry Point:' : 'Entry Point:'}</span>
                  <select
                    value={chosenEntryPoint}
                    onChange={(e) => useWebsiteToApkStore.getState().setLocalFiles(localFiles, e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded px-2 py-1 focus:outline-none"
                  >
                    {localFiles
                      .filter((f) => f.name.endsWith('.html') || f.name.endsWith('.htm'))
                      .map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.path}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Sample files list preview */}
              <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono text-neutral-400 pr-1">
                {localFiles.slice(0, 15).map((f) => (
                  <div key={f.path} className="flex items-center justify-between py-0.5 border-b border-neutral-900">
                    <span className="truncate flex items-center gap-1.5 text-neutral-300">
                      <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {f.path}
                    </span>
                    <span className="text-neutral-500 shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
                {localFiles.length > 15 && (
                  <div className="text-neutral-500 text-center py-1">
                    +{localFiles.length - 15} {lang === 'id' ? 'berkas lainnya...' : 'more files...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
