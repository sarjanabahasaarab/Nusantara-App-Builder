/**
 * Nusantara App Builder - Go to Line Modal (Ctrl+G)
 * Phase 4: Direct navigation to target source line number.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useEditorStore } from '../store/editorStore';

export const GoToLineModal: React.FC = () => {
  const { lang } = useTranslation();
  const isIndo = lang === 'id';

  const { goToLineVisible, setGoToLineVisible, activeTabId, tabs, updateCursorPosition } =
    useEditorStore();
  const [lineNumber, setLineNumber] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const maxLines = activeTab ? activeTab.content.split('\n').length : 1;

  useEffect(() => {
    if (goToLineVisible) {
      setLineNumber('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [goToLineVisible]);

  if (!goToLineVisible) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setGoToLineVisible(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const num = parseInt(lineNumber, 10);
      if (!isNaN(num) && num > 0 && activeTabId) {
        const clamped = Math.min(num, maxLines);
        updateCursorPosition(activeTabId, clamped, 1);
        setGoToLineVisible(false);
      }
    }
  };

  return (
    <div
      onClick={() => setGoToLineVisible(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-700 shadow-2xl rounded-lg p-3 text-xs text-neutral-200 animate-in fade-in"
      >
        <div className="flex items-center gap-2 mb-2 font-medium text-neutral-300">
          <Hash className="w-4 h-4 text-blue-400" />
          <span>
            {isIndo ? 'Ke Baris' : 'Go to Line'} (1 - {maxLines})
          </span>
        </div>

        <input
          ref={inputRef}
          type="number"
          min="1"
          max={maxLines}
          value={lineNumber}
          onChange={(e) => setLineNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="25"
          className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-sm text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
        />

        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setGoToLineVisible(false)}
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
          >
            {isIndo ? 'Batal' : 'Cancel'}
          </button>
          <button
            onClick={() => {
              const num = parseInt(lineNumber, 10);
              if (!isNaN(num) && num > 0 && activeTabId) {
                const clamped = Math.min(num, maxLines);
                updateCursorPosition(activeTabId, clamped, 1);
                setGoToLineVisible(false);
              }
            }}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer"
          >
            {isIndo ? 'Lompat' : 'Go'}
          </button>
        </div>
      </div>
    </div>
  );
};
