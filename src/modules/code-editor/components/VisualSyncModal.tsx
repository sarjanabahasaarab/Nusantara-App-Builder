/**
 * Nusantara App Builder - Visual Designer & XML Synchronization Modal
 * Phase 4: Bi-directional synchronization between Code Editor XML and Visual Designer Model.
 */

import React, { useState } from 'react';
import { Layers, AlertTriangle, Check, ArrowRight, Eye, Code } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';
import { useUiStore } from '../../../store/uiStore';
import { useDesignerStore } from '../../../store/designerStore';
import { parseAndroidXmlToVisualScreen } from '../services/xmlParser';

export const VisualSyncModal: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { visualSyncConflict, setVisualSyncConflict, activeProjectId } = useEditorStore();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const [showDiff, setShowDiff] = useState(false);

  if (!visualSyncConflict) return null;

  const handleOpenInVisualDesigner = () => {
    // Parse XML into design model and push into designerStore
    const parseRes = parseAndroidXmlToVisualScreen(
      visualSyncConflict.xmlContent,
      visualSyncConflict.filePath.split('/').pop() || 'activity_main.xml'
    );

    if (parseRes.success && parseRes.screen) {
      const designerStore = useDesignerStore.getState();
      if (designerStore.design) {
        const existing = designerStore.design.screens.find(
          (s) => s.layoutFileName === parseRes.screen!.layoutFileName
        );

        if (existing) {
          existing.root = parseRes.screen.root;
          existing.backgroundColor = parseRes.screen.backgroundColor;
          designerStore.setActiveScreen(existing.id);
        } else {
          const newScreenId = designerStore.addScreen(parseRes.screen.name, parseRes.screen.layoutFileName);
          designerStore.setActiveScreen(newScreenId);
        }
      }

      setVisualSyncConflict(null);
      setActiveView('visual-designer');
      showToast(
        isIndo
          ? 'Layout XML berhasil disinkronkan ke Visual Designer'
          : 'XML layout synced into Visual Designer'
      );
    } else {
      alert(
        isIndo
          ? `Gagal mem-parsing XML: ${parseRes.errors.join(', ')}`
          : `Failed to parse XML: ${parseRes.errors.join(', ')}`
      );
    }
  };

  const handleKeepXmlChanges = () => {
    setVisualSyncConflict(null);
    showToast(isIndo ? 'Perubahan XML dipertahankan' : 'XML changes retained');
  };

  return (
    <div
      onClick={() => setVisualSyncConflict(null)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-5 text-xs text-neutral-200 animate-in fade-in"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-100">
              {isIndo
                ? 'Berkas XML Layout Telah Dimodifikasi Secara Manual'
                : 'The XML layout file has been modified manually'}
            </h3>
            <p className="mt-1 text-neutral-400 text-xs">
              {isIndo
                ? `Berkas "${visualSyncConflict.filePath}" memiliki modifikasi langsung di Code Editor. Pilih tindakan untuk menjaga konsistensi antara kode XML dan kanvas Visual Designer.`
                : `File "${visualSyncConflict.filePath}" has manual modifications in the Code Editor. Choose an action to keep XML and Visual Designer in sync.`}
            </p>
          </div>
        </div>

        {/* Details & Unsupported tags alert */}
        <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">{isIndo ? 'Komponen Terdeteksi:' : 'Detected Components:'}</span>
            <span className="font-mono font-medium text-neutral-200">
              {visualSyncConflict.detectedComponentsCount}
            </span>
          </div>

          {visualSyncConflict.unsupportedTags.length > 0 && (
            <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <div>
                <span className="font-medium">
                  {isIndo ? 'Komponen Kustom/Belum Didukung:' : 'Unsupported Custom Views:'}
                </span>{' '}
                {visualSyncConflict.unsupportedTags.join(', ')}
                <p className="text-[10px] text-amber-400/80 mt-0.5">
                  {isIndo
                    ? 'Elemen ini akan dipertahankan dengan aman dan tidak akan dihapus.'
                    : 'These elements will be safely preserved and never deleted.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Diff preview toggle */}
        {showDiff && (
          <div className="mt-3 max-h-48 overflow-y-auto bg-neutral-950 p-2.5 rounded border border-neutral-800 font-mono text-[11px] whitespace-pre text-neutral-300">
            {visualSyncConflict.xmlContent}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-neutral-800">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showDiff ? (isIndo ? 'Tutup Preview' : 'Hide Preview') : (isIndo ? 'Bandingkan XML' : 'Compare Changes')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVisualSyncConflict(null)}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer font-medium"
            >
              {isIndo ? 'Batal' : 'Cancel'}
            </button>

            <button
              onClick={handleKeepXmlChanges}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer font-medium"
            >
              {isIndo ? 'Pertahankan Perubahan XML' : 'Keep XML Changes'}
            </button>

            <button
              onClick={handleOpenInVisualDesigner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Buka di Visual Designer' : 'Open in Visual Designer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
