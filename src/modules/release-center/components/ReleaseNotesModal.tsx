/**
 * Nusantara App Builder - Release Notes Editor Modal
 * Phase 8: Markdown editor with instant preview and release changelog generation.
 */

import React, { useState } from 'react';
import { FileText, X, Check, Eye, Edit3, Sparkles } from 'lucide-react';
import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { useTranslation } from '../../localization/useTranslation';
import { useProjectStore } from '../../../store/projectStore';

export const ReleaseNotesModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useReleaseCenterStore((s) => s.isNotesModalOpen);
  const setIsOpen = useReleaseCenterStore((s) => s.setIsNotesModalOpen);
  const releaseNotes = useReleaseCenterStore((s) => s.releaseNotes);
  const setReleaseNotes = useReleaseCenterStore((s) => s.setReleaseNotes);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [notesDraft, setNotesDraft] = useState(releaseNotes);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  if (!isOpen) return null;

  const handleSave = () => {
    setReleaseNotes(notesDraft);
    setIsOpen(false);
  };

  const insertTemplate = () => {
    const vName = activeProject?.versionName || '1.0.0';
    const template = `## What's New in Version ${vName}\n\n### 🚀 Features & Enhancements\n- Native Android Material Design 3 interface improvements.\n- Optimized data caching with SQLite local database.\n- REST API network response latency optimizations.\n\n### 🛡️ Security & Performance\n- Production release compiled with R8 code shrinking.\n- Cryptographically verified with RSA-2048 signing scheme v2.\n\n### 🐛 Bug Fixes\n- Resolved edge-case layout stretching on high-DPI displays.`;
    setNotesDraft(template);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Editor Catatan Rilis (Release Notes)' : 'Release Notes Editor'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Format Markdown yang akan diekspor bersama paket release-notes.md dan Google Play Console'
                  : 'Markdown format to be exported with release-notes.md and Google Play Console'}
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

        {/* Toolbar */}
        <div className="px-5 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs rounded-md flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Edit Markdown' : 'Edit Markdown'}</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs rounded-md flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Pratinjau' : 'Preview'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={insertTemplate}
            className="px-2.5 py-1 text-[11px] bg-neutral-900 hover:bg-neutral-800 text-emerald-400 rounded border border-emerald-900/60 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{lang === 'id' ? 'Gunakan Template Standar' : 'Insert Template'}</span>
          </button>
        </div>

        {/* Editor or Preview */}
        <div className="p-5 flex-1 overflow-y-auto min-h-[300px]">
          {activeTab === 'edit' ? (
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="## What's New..."
              rows={14}
              className="w-full h-full min-h-[280px] bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
            />
          ) : (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg min-h-[280px] text-xs text-neutral-200 space-y-2 whitespace-pre-wrap leading-relaxed">
              {notesDraft || <span className="text-neutral-500 italic">No release notes written.</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 flex justify-end gap-2 bg-neutral-900/90 shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
          >
            {lang === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'id' ? 'Simpan Catatan Rilis' : 'Save Release Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
