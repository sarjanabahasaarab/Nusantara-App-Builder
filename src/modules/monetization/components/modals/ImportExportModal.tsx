/**
 * Nusantara App Builder - AdMob Configuration Import & Export Modal
 * Phase 9: admob.json format validation, diff inspection, and safe import confirmation.
 */

import React, { useState } from 'react';
import { Download, Upload, X, Copy, Check, AlertCircle, FileJson, Sparkles } from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useTranslation } from '../../../localization/useTranslation';

export const ImportExportModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useMonetizationStore((s) => s.isImportExportModalOpen);
  const setIsOpen = useMonetizationStore((s) => s.setIsImportExportModalOpen);
  const exportConfigAsJson = useMonetizationStore((s) => s.exportConfigAsJson);
  const importConfigFromJson = useMonetizationStore((s) => s.importConfigFromJson);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonText, setJsonText] = useState(exportConfigAsJson());
  const [importDraft, setImportDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleImport = () => {
    setError(null);
    setSuccessMsg(null);

    if (!importDraft.trim()) {
      setError(lang === 'id' ? 'Teks JSON tidak boleh kosong.' : 'JSON content cannot be empty.');
      return;
    }

    const res = importConfigFromJson(importDraft);
    if (res.success) {
      setSuccessMsg(
        lang === 'id'
          ? 'Konfigurasi admob.json berhasil diimpor!'
          : 'admob.json configuration successfully imported!'
      );
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    } else {
      setError(res.error || 'Failed to import JSON configuration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Ekspor / Impor admob.json' : 'Export / Import admob.json'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Format JSON terstruktur untuk portabilitas konfigurasi antar-proyek'
                  : 'Structured JSON format for cross-project configuration portability'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('export');
              setJsonText(exportConfigAsJson());
              setError(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'id' ? 'Ekspor Konfigurasi' : 'Export Configuration'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setError(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{lang === 'id' ? 'Impor admob.json' : 'Import admob.json'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>{lang === 'id' ? 'Isi berkas admob.json saat ini:' : 'Current admob.json contents:'}</span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'id' ? 'Tersalin' : 'Copied') : (lang === 'id' ? 'Salin JSON' : 'Copy JSON')}</span>
                </button>
              </div>
              <textarea
                value={jsonText}
                readOnly
                rows={14}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none select-all leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs text-neutral-400 block">
                {lang === 'id'
                  ? 'Tempelkan isi admob.json di bawah ini untuk meninjau dan menerapkan perubahan:'
                  : 'Paste your admob.json contents below to review and apply:'}
              </span>
              <textarea
                value={importDraft}
                onChange={(e) => setImportDraft(e.target.value)}
                placeholder='{\n  "enabled": true,\n  "appId": "...",\n  "units": []\n}'
                rows={13}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Terapkan Impor' : 'Apply Import'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
