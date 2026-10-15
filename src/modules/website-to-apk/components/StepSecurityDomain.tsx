/**
 * Nusantara App Builder - Website to APK
 * Step 6: Domain Allowlist & Security Policies
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Globe2,
  ExternalLink,
  Lock,
  Compass,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';
import { ExternalLinksPolicy } from '../types';

export const StepSecurityDomain: React.FC = () => {
  const { lang } = useTranslation();
  const domainRules = useWebsiteToApkStore((s) => s.domainRules);
  const addDomainRule = useWebsiteToApkStore((s) => s.addDomainRule);
  const removeDomainRule = useWebsiteToApkStore((s) => s.removeDomainRule);
  const externalLinksPolicy = useWebsiteToApkStore((s) => s.externalLinksPolicy);
  const setExternalLinksPolicy = useWebsiteToApkStore((s) => s.setExternalLinksPolicy);

  const [newDomain, setNewDomain] = useState('');
  const [includeSubdomains, setIncludeSubdomains] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    addDomainRule(newDomain.trim(), includeSubdomains, 'allow');
    setNewDomain('');
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-neutral-100">
            {lang === 'id' ? 'Kebijakan Keamanan Domain WebView' : 'WebView Domain Security Policy'}
          </div>
          <p className="text-neutral-400 mt-0.5 leading-relaxed">
            {lang === 'id'
              ? 'Tentukan domain mana yang diizinkan untuk dibuka di dalam aplikasi. Tautan luar yang tidak masuk dalam daftar ini akan dialihkan sesuai kebijakan tautan eksternal demi melindungi privasi dan keamanan pengguna.'
              : 'Specify which domains are authorized to render inside the WebView. External links will follow external link routing to safeguard user security.'}
          </p>
        </div>
      </div>

      {/* External Links Routing Policy */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'id' ? 'Kebijakan Tautan Eksternal (Outbound Links)' : 'External Links Routing Policy'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'browser',
                title: lang === 'id' ? 'Browser Eksternal (Disarankan)' : 'External Browser (Recommended)',
                desc: lang === 'id' ? 'Buka tautan luar di Chrome / browser bawaan HP' : 'Open external links in default device browser',
                icon: ExternalLink,
              },
              {
                id: 'inside',
                title: lang === 'id' ? 'Buka di dalam WebView' : 'Open in WebView',
                desc: lang === 'id' ? 'Pertahankan pengguna tetap berada di dalam jendela aplikasi' : 'Keep user inside app window',
                icon: Globe2,
              },
              {
                id: 'ask',
                title: lang === 'id' ? 'Tanyakan Pengguna' : 'Prompt User',
                desc: lang === 'id' ? 'Tampilkan dialog konfirmasi sebelum membuka link luar' : 'Show dialog prompt before external navigation',
                icon: HelpCircle,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setExternalLinksPolicy(item.id as ExternalLinksPolicy)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                externalLinksPolicy === item.id
                  ? 'bg-blue-600/10 border-blue-500 text-neutral-100 ring-1 ring-blue-500/40'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <item.icon className="w-4 h-4 text-blue-400 mb-2" />
              <div className="font-semibold text-xs text-neutral-200 mb-1">{item.title}</div>
              <div className="text-[11px] text-neutral-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Domain Allowlist Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>{lang === 'id' ? 'Daftar Domain Diizinkan (Allowlist)' : 'Domain Allowlist'}</span>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {domainRules.length} {lang === 'id' ? 'Domain Terdaftar' : 'Rules Configured'}
          </span>
        </div>

        {/* Add domain form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="contoh: api.mysite.com atau cdn.jsdelivr.net"
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
          />
          <label className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSubdomains}
              onChange={(e) => setIncludeSubdomains(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded"
            />
            <span>{lang === 'id' ? 'Semua Subdomain (*.domain)' : 'Include Subdomains (*)'}</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Tambah Domain' : 'Add Domain'}</span>
          </button>
        </form>

        {/* Table of rules */}
        {domainRules.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
            {lang === 'id'
              ? 'Belum ada domain khusus. Domain utama website akan diizinkan secara default.'
              : 'No custom domains added. The primary website domain will be allowed by default.'}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/40">
            {domainRules.map((rule) => (
              <div key={rule.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Globe2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="font-mono font-semibold text-neutral-200">{rule.domain}</span>
                    <span className="text-[11px] text-neutral-500 ml-2">
                      {rule.includeSubdomains
                        ? lang === 'id'
                          ? '(termasuk *.subdomain)'
                          : '(including *.subdomain)'
                        : lang === 'id'
                        ? '(tepat)'
                        : '(exact)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDomainRule(rule.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                  title="Hapus Aturan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Deep Link Protocols Note */}
        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
          <div className="font-semibold text-neutral-300">
            {lang === 'id' ? 'Dukungan Deep Linking & Intent Bawaan:' : 'Supported Deep Links & Intent Handlers:'}
          </div>
          <div>
            Aplikasi otomatis mendukung skema <code>tel:</code> (telepon), <code>mailto:</code> (email),{' '}
            <code>whatsapp:</code> (WhatsApp chat), dan <code>sms:</code> dengan meluncurkan aplikasi native yang sesuai.
          </div>
        </div>
      </div>
    </div>
  );
};
