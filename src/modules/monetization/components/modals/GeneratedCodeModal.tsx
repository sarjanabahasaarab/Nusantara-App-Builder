/**
 * Nusantara App Builder - AdMob Generated Code Viewer Modal
 * Phase 9: Displays idempotent generated Kotlin code, manifest snippets, and Gradle dependencies.
 */

import React, { useState } from 'react';
import { FileCode, X, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useProjectStore } from '../../../../store/projectStore';
import { useTranslation } from '../../../localization/useTranslation';
import { AdMobGenerator } from '../../services/adMobGenerator';

export const GeneratedCodeModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useMonetizationStore((s) => s.isGeneratedCodeModalOpen);
  const setIsOpen = useMonetizationStore((s) => s.setIsGeneratedCodeModalOpen);
  const config = useMonetizationStore((s) => s.config);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [activeTab, setActiveTab] = useState<'kotlin' | 'manifest' | 'gradle'>('kotlin');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pkg = activeProject?.packageId || 'id.nusantara.myapp';
  const kotlinCode = AdMobGenerator.generateKotlinService(pkg, config);
  const manifestSnippet = `<!-- Add inside <application> in AndroidManifest.xml -->\n<meta-data\n    android:name="com.google.android.gms.ads.APPLICATION_ID"\n    android:value="${config.appId}" />\n\n<uses-permission android:name="android.permission.INTERNET" />\n<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`;
  const gradleSnippet = `// Add to dependencies in app/build.gradle.kts\nimplementation("com.google.android.gms:play-services-ads:${config.globalSettings.sdkVersion || '23.6.0'}")`;

  const activeContent =
    activeTab === 'kotlin'
      ? kotlinCode
      : activeTab === 'manifest'
      ? manifestSnippet
      : gradleSnippet;

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  {lang === 'id' ? 'Kode yang Dihasilkan (Generated Code)' : 'Generated AdMob Code'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  READ ONLY
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Kode Kotlin Android resmi yang dihasilkan secara otomatis oleh AdMobGenerator'
                  : 'Official Android Kotlin code generated automatically by AdMobGenerator'}
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

        {/* Warning bar */}
        <div className="px-5 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>
              {lang === 'id'
                ? 'Jangan mengedit bagian yang dihasilkan secara manual.'
                : 'Do not edit generated sections manually.'}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1.5 cursor-pointer text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'id' ? 'Tersalin' : 'Copied') : (lang === 'id' ? 'Salin Kode' : 'Copy Code')}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-5 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('kotlin')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'kotlin'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            AdMobService.kt
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'manifest'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            AndroidManifest.xml
          </button>
          <button
            onClick={() => setActiveTab('gradle')}
            className={`pb-2 px-3 text-xs font-mono font-medium border-b-2 cursor-pointer transition-colors ${
              activeTab === 'gradle'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            build.gradle.kts
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-neutral-950">
          <pre className="font-mono text-xs text-neutral-200 leading-relaxed overflow-x-auto whitespace-pre selection:bg-neutral-800">
            <code>{activeContent}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 flex justify-end bg-neutral-900/90 shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg cursor-pointer"
          >
            {lang === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
