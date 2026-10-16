/**
 * Nusantara App Builder - REST API Manager & Live API Tester
 * Phase 6: Endpoint configuration, authentication, live desktop request runner, and JSON response mapping.
 */

import React, { useState } from 'react';
import {
  Globe2,
  Plus,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  Lock,
  Copy,
  ShieldAlert,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useTranslation } from '../../localization/useTranslation';
import { ApiEndpoint, HttpMethod, ApiAuthType } from '../types';

export const ApiManager: React.FC = () => {
  const { lang } = useTranslation();

  const apiEndpoints = useLogicStore((s) => s.apiEndpoints);
  const addEndpoint = useLogicStore((s) => s.addEndpoint);
  const updateEndpoint = useLogicStore((s) => s.updateEndpoint);
  const deleteEndpoint = useLogicStore((s) => s.deleteEndpoint);
  const testEndpoint = useLogicStore((s) => s.testEndpoint);
  const apiTestResults = useLogicStore((s) => s.apiTestResults);
  const isTestingApi = useLogicStore((s) => s.isTestingApi);

  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    apiEndpoints[0]?.id || null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEpName, setNewEpName] = useState('Get Katalog Produk');
  const [newEpMethod, setNewEpMethod] = useState<HttpMethod>('GET');
  const [newEpUrl, setNewEpUrl] = useState('https://fakestoreapi.com/products');

  const activeEp = apiEndpoints.find((e) => e.id === selectedEndpointId) || apiEndpoints[0];
  const testResult = activeEp ? apiTestResults[activeEp.id] : null;

  const handleCreateEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpName.trim() || !newEpUrl.trim()) return;

    addEndpoint({
      name: newEpName.trim(),
      method: newEpMethod,
      url: newEpUrl.trim(),
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      queryParams: [],
      timeoutMs: 10000,
      authType: 'none',
      authConfig: {},
      responseType: 'json',
    });

    setNewEpName('');
    setShowAddModal(false);
  };

  const handleRunTest = async () => {
    if (!activeEp) return;
    await testEndpoint(activeEp);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Endpoints List Panel (260px) */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-neutral-200">
              {lang === 'id' ? 'REST API Endpoints' : 'REST Endpoints'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
            title="Tambah Endpoint Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {apiEndpoints.map((ep) => {
            const isSelected = activeEp?.id === ep.id;
            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEndpointId(ep.id)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-600/10 border-blue-500/80 text-neutral-100 ring-1 ring-blue-500/30'
                    : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      ep.method === 'GET'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                        : ep.method === 'POST'
                        ? 'bg-blue-950 text-blue-400 border-blue-800/60'
                        : ep.method === 'DELETE'
                        ? 'bg-red-950 text-red-400 border-red-800/60'
                        : 'bg-amber-950 text-amber-400 border-amber-800/60'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[120px]">
                    {ep.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-neutral-200 mt-1 truncate">
                  {ep.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER: Endpoint Editor & Live Tester */}
      <div className="flex-1 bg-neutral-950 flex flex-col overflow-hidden">
        {activeEp ? (
          <>
            {/* Top Toolbar */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-bold px-2 py-1 rounded border ${
                    activeEp.method === 'GET'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                      : activeEp.method === 'POST'
                      ? 'bg-blue-950 text-blue-400 border-blue-800/60'
                      : activeEp.method === 'DELETE'
                      ? 'bg-red-950 text-red-400 border-red-800/60'
                      : 'bg-amber-950 text-amber-400 border-amber-800/60'
                  }`}
                >
                  {activeEp.method}
                </span>
                <div>
                  <div className="text-xs font-bold text-neutral-100">{activeEp.name}</div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate max-w-md">
                    {activeEp.url}
                  </div>
                </div>
              </div>

              {/* Send / Test Request Button */}
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTestingApi}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {isTestingApi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirim Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Test Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Split: Config (Top) & Response (Bottom) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Endpoint Config Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="text-xs font-bold text-neutral-200 pb-2 border-b border-neutral-800">
                  Konfigurasi Endpoint & Autentikasi
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Nama Endpoint</label>
                    <input
                      type="text"
                      value={activeEp.name}
                      onChange={(e) => updateEndpoint(activeEp.id, { name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Metode HTTP</label>
                    <select
                      value={activeEp.method}
                      onChange={(e) => updateEndpoint(activeEp.id, { method: e.target.value as HttpMethod })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Jenis Autentikasi</label>
                    <select
                      value={activeEp.authType}
                      onChange={(e) => updateEndpoint(activeEp.id, { authType: e.target.value as ApiAuthType })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100"
                    >
                      <option value="none">Tanpa Auth (None)</option>
                      <option value="bearer">Bearer Token (JWT)</option>
                      <option value="api_key">API Key</option>
                      <option value="basic">Basic Auth</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">URL Endpoint</label>
                  <input
                    type="text"
                    value={activeEp.url}
                    onChange={(e) => updateEndpoint(activeEp.id, { url: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                </div>

                {/* JSON Body (for POST / PUT / PATCH) */}
                {['POST', 'PUT', 'PATCH'].includes(activeEp.method) && (
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">JSON Request Body</label>
                    <textarea
                      rows={4}
                      value={activeEp.bodyContent || ''}
                      onChange={(e) => updateEndpoint(activeEp.id, { bodyContent: e.target.value, bodyType: 'json' })}
                      placeholder='{"title": "Nama Produk", "price": 10000}'
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Live Test Result Output */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold text-neutral-200">
                    Hasil Pengujian API (Response Inspector)
                  </span>

                  {testResult && (
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded border ${
                          testResult.isSuccess
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : 'bg-red-950 text-red-400 border-red-800/60'
                        }`}
                      >
                        {testResult.statusCode} {testResult.statusText}
                      </span>
                      <span className="text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {testResult.responseTimeMs}ms
                      </span>
                    </div>
                  )}
                </div>

                {testResult ? (
                  <pre className="p-4 bg-neutral-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 border border-neutral-800">
                    {typeof testResult.data === 'object'
                      ? JSON.stringify(testResult.data, null, 2)
                      : testResult.data || testResult.error}
                  </pre>
                ) : (
                  <div className="py-12 text-center text-neutral-500 text-xs">
                    Klik tombol "Kirim Test Request" untuk menguji respons endpoint secara langsung.
                  </div>
                )}
              </div>

              {/* Security Warning */}
              <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Keamanan API Client Android</div>
                  <p className="mt-1 opacity-90 leading-relaxed text-[11px]">
                    API Key atau secret token yang dimasukkan langsung ke aplikasi mobile berpotensi dapat diekstraksi dari file APK/AAB jika didekompilasi. Untuk credential rahasia server atau database production, gunakan backend proxy atau autentikasi OAuth berbasis sesi.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
            Pilih endpoint di sebelah kiri
          </div>
        )}
      </div>

      {/* MODAL: Tambah Endpoint Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateEndpoint}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                Tambah Endpoint REST API Baru
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Nama Endpoint</label>
              <input
                type="text"
                required
                value={newEpName}
                onChange={(e) => setNewEpName(e.target.value)}
                placeholder="Get User Profile"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Metode</label>
                <select
                  value={newEpMethod}
                  onChange={(e) => setNewEpMethod(e.target.value as HttpMethod)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">URL</label>
                <input
                  type="text"
                  required
                  value={newEpUrl}
                  onChange={(e) => setNewEpUrl(e.target.value)}
                  placeholder="https://api.example.com/items"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Tambah Endpoint
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
