/**
 * Nusantara App Builder - Release History & Artifact Comparison Modal
 * Phase 8: Historical releases, artifact sizes, status, and side-by-side release diffing.
 */

import React, { useState } from 'react';
import {
  History,
  X,
  FileCheck2,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Copy,
  Check,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { useTranslation } from '../../localization/useTranslation';
import { ReleaseHistoryItem } from '../types';

export const ReleaseHistoryModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useReleaseCenterStore((s) => s.isHistoryModalOpen);
  const setIsOpen = useReleaseCenterStore((s) => s.setIsHistoryModalOpen);
  const releaseHistory = useReleaseCenterStore((s) => s.releaseHistory);

  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const itemA = releaseHistory.find((r) => r.id === selectedForCompare[0]);
  const itemB = releaseHistory.find((r) => r.id === selectedForCompare[1]);

  const copySha = (sha: string) => {
    navigator.clipboard?.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Riwayat Rilis & Artefak' : 'Release History & Artifacts'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Audit jejak build rilis, ukuran paket, dan perbandingan antar-versi'
                  : 'Audit release builds, package sizes, and side-by-side version comparison'}
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

        {/* Side-by-Side Comparison Box if 2 items selected */}
        {itemA && itemB && (
          <div className="p-4 bg-blue-950/30 border-b border-blue-900/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Scale className="w-4 h-4" />
                <span>
                  {lang === 'id'
                    ? `Perbandingan Rilis: v${itemA.version} vs v${itemB.version}`
                    : `Release Comparison: v${itemA.version} vs v${itemB.version}`}
                </span>
              </div>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
              >
                {lang === 'id' ? 'Tutup Perbandingan' : 'Clear Comparison'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>v{itemA.version} (Build {itemA.versionCode})</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {itemA.releaseType}
                  </span>
                </div>
                <div className="text-neutral-400">Ukuran: <strong className="text-neutral-200">{itemA.artifactSize}</strong></div>
                <div className="text-neutral-400">Durasi: <span className="text-neutral-200">{(itemA.buildDurationMs / 1000).toFixed(1)}s</span></div>
                <div className="text-neutral-400 text-[11px] truncate">Path: {itemA.artifactPath}</div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>v{itemB.version} (Build {itemB.versionCode})</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {itemB.releaseType}
                  </span>
                </div>
                <div className="text-neutral-400">Ukuran: <strong className="text-neutral-200">{itemB.artifactSize}</strong></div>
                <div className="text-neutral-400">Durasi: <span className="text-neutral-200">{(itemB.buildDurationMs / 1000).toFixed(1)}s</span></div>
                <div className="text-neutral-400 text-[11px] truncate">Path: {itemB.artifactPath}</div>
              </div>
            </div>
          </div>
        )}

        {/* Release List */}
        <div className="p-5 overflow-y-auto flex-1">
          {releaseHistory.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <History className="w-12 h-12 mx-auto text-neutral-600 stroke-[1.5]" />
              <p className="text-sm font-medium text-neutral-300">
                {lang === 'id' ? 'Belum Ada Riwayat Rilis' : 'No Release History Yet'}
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {lang === 'id'
                  ? 'Setelah Anda menjalankan kompilasi rilis pertama (Step 6), catatan rilis dan artefak akan tersimpan secara otomatis di sini.'
                  : 'After executing your first release build (Step 6), historical release metadata and artifacts will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400 flex items-center justify-between mb-1">
                <span>
                  {lang === 'id'
                    ? 'Pilih hingga 2 entri untuk membandingkan artefak secara langsung:'
                    : 'Select up to 2 entries to compare artifacts side-by-side:'}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {releaseHistory.length} {lang === 'id' ? 'rilis tercatat' : 'recorded releases'}
                </span>
              </div>

              {releaseHistory.map((item) => {
                const isSelected = selectedForCompare.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-600/60'
                        : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectForCompare(item.id)}
                          className="rounded border-neutral-700 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">
                              v{item.version}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                              Build {item.versionCode}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                item.releaseType === 'aab'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {item.releaseType.toUpperCase()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                              ✓ {item.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-neutral-500" />
                              {item.variant}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              {(item.buildDurationMs / 1000).toFixed(1)}s
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-white text-sm font-mono">
                          {item.artifactSize}
                        </div>
                        {item.gitTag && (
                          <div className="text-[11px] text-blue-400 flex items-center justify-end gap-1 mt-0.5">
                            <GitBranch className="w-3 h-3" />
                            <span>{item.gitTag}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs">
                      <div className="text-neutral-400 font-mono text-[11px] truncate max-w-lg">
                        {item.artifactPath}
                      </div>
                      {item.sha256 && (
                        <button
                          onClick={() => copySha(item.sha256!)}
                          className="flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-700 text-neutral-300 text-[11px] cursor-pointer"
                        >
                          {copiedSha === item.sha256 ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy SHA-256</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
