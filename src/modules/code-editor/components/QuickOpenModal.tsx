/**
 * Nusantara App Builder - Quick Open Modal (Ctrl+P)
 * Phase 4: Instant fuzzy file search and jump.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileCode, FileText } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

export const QuickOpenModal: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { files, quickOpenVisible, setQuickOpenVisible, openFile } = useEditorStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const nonDirFiles = files.filter((f) => !f.isDirectory);
  const filtered = query.trim()
    ? nonDirFiles.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.path.toLowerCase().includes(query.toLowerCase())
      )
    : nonDirFiles;

  useEffect(() => {
    if (quickOpenVisible) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickOpenVisible]);

  if (!quickOpenVisible) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuickOpenVisible(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        openFile(filtered[selectedIndex].path);
        setQuickOpenVisible(false);
      }
    }
  };

  return (
    <div
      onClick={() => setQuickOpenVisible(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg overflow-hidden flex flex-col text-xs text-neutral-200 animate-in fade-in zoom-in-95"
      >
        {/* Input */}
        <div className="p-3 border-b border-neutral-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isIndo ? 'Ketik nama berkas untuk mencari...' : 'Type a file name to open...'}
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden"
          />
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-1 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-xs">
              {isIndo ? 'Tidak ada berkas yang cocok.' : 'No matching files.'}
            </div>
          ) : (
            filtered.slice(0, 40).map((file, idx) => (
              <div
                key={file.path}
                onClick={() => {
                  openFile(file.path);
                  setQuickOpenVisible(false);
                }}
                className={`px-3 py-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-blue-600 text-white' : 'hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-neutral-400 truncate ml-2 font-mono">
                  {file.path}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
