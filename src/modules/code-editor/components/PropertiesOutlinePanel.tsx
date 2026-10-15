/**
 * Nusantara App Builder - Document Outline & File Properties Panel
 * Phase 4: Structural outline for XML/Kotlin files and file statistics.
 */

import React from 'react';
import {
  FileText,
  SlidersHorizontal,
  Layers,
  Code,
  Tag,
  Hash,
  Maximize2,
  FolderTree,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

interface OutlineItem {
  id: string;
  name: string;
  type: string;
  line: number;
  level: number;
}

export const PropertiesOutlinePanel: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { activeTabId, tabs, isPropertiesOpen, toggleProperties } = useEditorStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!isPropertiesOpen) return null;

  // Extract outline based on language
  const outlineItems: OutlineItem[] = [];

  if (activeTab) {
    const lines = activeTab.content.split('\n');

    if (activeTab.language === 'xml') {
      let currentLevel = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        if (line.startsWith('</')) {
          currentLevel = Math.max(0, currentLevel - 1);
          continue;
        }

        const tagMatch = line.match(/^<([a-zA-Z0-9_.:]+)/);
        if (tagMatch) {
          const tagName = tagMatch[1];
          if (tagName.startsWith('?') || tagName.startsWith('!--')) continue;

          const idMatch = line.match(/android:id=["']@\+?id\/([^"']+)["']/);
          const name = idMatch ? `${tagName} (${idMatch[1]})` : tagName;

          outlineItems.push({
            id: `xml_${lineNum}`,
            name,
            type: 'tag',
            line: lineNum,
            level: currentLevel,
          });

          if (!line.endsWith('/>')) {
            currentLevel++;
          }
        }
      }
    } else if (activeTab.language === 'kotlin' || activeTab.language === 'java') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        if (line.startsWith('package ')) {
          outlineItems.push({
            id: `pkg_${lineNum}`,
            name: line.replace('package ', ''),
            type: 'package',
            line: lineNum,
            level: 0,
          });
        } else if (line.match(/^(public |private |open |abstract |data )*class /)) {
          const className = line.replace(/.*class\s+([a-zA-Z0-9_]+).*/, '$1');
          outlineItems.push({
            id: `cls_${lineNum}`,
            name: `class ${className}`,
            type: 'class',
            line: lineNum,
            level: 1,
          });
        } else if (line.match(/^(override |public |private |protected )*fun /)) {
          const funName = line.replace(/.*fun\s+([a-zA-Z0-9_]+).*/, '$1()');
          outlineItems.push({
            id: `fun_${lineNum}`,
            name: funName,
            type: 'function',
            line: lineNum,
            level: 2,
          });
        }
      }
    }
  }

  const lineCount = activeTab ? activeTab.content.split('\n').length : 0;
  const byteSize = activeTab ? new Blob([activeTab.content]).size : 0;

  return (
    <div className="h-full flex flex-col bg-neutral-900/60 border-l border-neutral-800 overflow-hidden select-none">
      {/* Header */}
      <div className="h-9 px-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{isIndo ? 'Outline & Properti' : 'Outline & Properties'}</span>
        </span>

        <button
          onClick={() => toggleProperties()}
          className="text-neutral-400 hover:text-white p-1 rounded"
          title="Close Outline"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
        {/* Document Outline section */}
        <div>
          <div className="text-[11px] font-medium text-neutral-400 mb-1.5 flex items-center gap-1">
            <FolderTree className="w-3 h-3 text-blue-400" />
            <span>{isIndo ? 'Struktur Dokumen' : 'Document Outline'}</span>
          </div>

          {outlineItems.length === 0 ? (
            <p className="text-[11px] text-neutral-500 italic">
              {isIndo ? 'Tidak ada simbol yang terdeteksi.' : 'No symbols detected.'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {outlineItems.slice(0, 30).map((item) => (
                <div
                  key={item.id}
                  style={{ paddingLeft: `${item.level * 10 + 4}px` }}
                  className="py-1 px-1.5 rounded hover:bg-neutral-800/80 text-neutral-300 hover:text-white cursor-pointer flex items-center justify-between text-[11px] transition-colors"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">L{item.line}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-800" />

        {/* File Properties section */}
        <div>
          <div className="text-[11px] font-medium text-neutral-400 mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>{isIndo ? 'Properti Berkas' : 'File Properties'}</span>
          </div>

          {activeTab ? (
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">{isIndo ? 'Nama' : 'Name'}</span>
                <span className="font-mono text-neutral-200">{activeTab.name}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">{isIndo ? 'Bahasa' : 'Language'}</span>
                <span className="capitalize font-mono text-neutral-200">{activeTab.language}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">{isIndo ? 'Jumlah Baris' : 'Lines'}</span>
                <span className="font-mono text-neutral-200">{lineCount}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">{isIndo ? 'Ukuran' : 'Size'}</span>
                <span className="font-mono text-neutral-200">
                  {byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-neutral-800/60">
                <span className="text-neutral-400">Encoding</span>
                <span className="font-mono text-neutral-200">UTF-8</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">{isIndo ? 'Akhir Baris' : 'End of Line'}</span>
                <span className="font-mono text-neutral-200">LF</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-500 italic">
              {isIndo ? 'Tidak ada berkas aktif.' : 'No active file.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
