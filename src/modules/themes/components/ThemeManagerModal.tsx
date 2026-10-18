/**
 * Nusantara App Builder - Theme Manager Modal (Phase 10)
 * Visual design token editor, theme switcher, and JSON theme import/export.
 */

import React, { useState } from 'react';
import {
  Palette,
  X,
  Check,
  Download,
  Upload,
  Copy,
  Sliders,
  Type,
  Layout,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../../localization/useTranslation';
import { useUiStore } from '../../../store/uiStore';
import { ThemeDefinition } from '../types';

export const ThemeManagerModal: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const isOpen = useThemeStore((s) => s.isThemeModalOpen);
  const setIsOpen = useThemeStore((s) => s.setIsThemeModalOpen);
  const themes = useThemeStore((s) => s.themes);
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);
  const exportThemeAsJson = useThemeStore((s) => s.exportThemeAsJson);
  const importThemeFromJson = useThemeStore((s) => s.importThemeFromJson);

  const [inspectThemeId, setInspectThemeId] = useState(activeThemeId);
  const [isImporting, setIsImporting] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isIndo = lang === 'id';
  const inspectedTheme = themes.find((t) => t.id === inspectThemeId) || themes[0];

  const handleExport = (id: string) => {
    const json = exportThemeAsJson(id);
    navigator.clipboard?.writeText(json);
    showToast(isIndo ? 'Berkas JSON tema telah disalin ke clipboard!' : 'Theme JSON copied to clipboard!');
  };

  const handleImportSubmit = () => {
    setImportError(null);
    const res = importThemeFromJson(importJsonText);
    if (res.success) {
      showToast(isIndo ? 'Tema kustom berhasil diimpor!' : 'Custom theme imported successfully!');
      setIsImporting(false);
      setImportJsonText('');
    } else {
      setImportError(res.error || 'Failed to import theme');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                {isIndo ? 'Manajer Tema & Token Desain' : 'Theme Engine & Design Tokens'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isIndo
                  ? 'Konfigurasikan palet warna, tipografi, jarak, dan gaya komponen secara terpadu'
                  : 'Configure unified color palettes, typography, spacing, and component design tokens'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImporting(!isImporting)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Impor Tema' : 'Import Theme'}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Import Subpanel */}
        {isImporting && (
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 space-y-3">
            <div className="text-xs font-semibold text-neutral-200">
              {isIndo ? 'Tempel Berkas JSON Tema Kustom:' : 'Paste Custom Theme JSON:'}
            </div>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "name": "My Theme", "version": "1.0.0", "colors": { ... } }'
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-pink-500"
            />
            {importError && <div className="text-xs text-red-400">{importError}</div>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImporting(false)}
                className="px-3 py-1.5 text-xs rounded bg-neutral-800 text-neutral-300"
              >
                {isIndo ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-3 py-1.5 text-xs rounded bg-pink-600 hover:bg-pink-500 text-white font-semibold"
              >
                {isIndo ? 'Simpan Tema' : 'Save Theme'}
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Themes List (Col 1) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {isIndo ? 'Daftar Tema Tersedia' : 'Available Themes'}
            </h4>
            <div className="space-y-2">
              {themes.map((theme) => {
                const isActive = activeThemeId === theme.id;
                const isInspected = inspectThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() => setInspectThemeId(theme.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isInspected
                        ? 'bg-neutral-800 border-pink-500 ring-1 ring-pink-500'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white">{theme.name}</span>
                      {isActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-md border border-neutral-700"
                        style={{ backgroundColor: theme.colors.background }}
                        title="Background"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-neutral-700"
                        style={{ backgroundColor: theme.colors.surface }}
                        title="Surface"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-neutral-700"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="w-5 h-5 rounded-md border border-neutral-700"
                        style={{ backgroundColor: theme.colors.sidebarBg }}
                        title="Sidebar"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 font-mono">v{theme.version}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTheme(theme.id);
                          showToast(isIndo ? `Tema "${theme.name}" diterapkan!` : `Theme "${theme.name}" applied!`);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                          isActive
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        {isActive ? (isIndo ? 'Aktif' : 'Active') : isIndo ? 'Gunakan' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Token Details Inspector (Col 2 & 3) */}
          <div className="md:col-span-2 space-y-5 bg-neutral-950 p-5 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-bold text-sm text-white">{inspectedTheme.name}</h3>
                <span className="text-xs text-neutral-400 font-mono">ID: {inspectedTheme.id}</span>
              </div>
              <button
                onClick={() => handleExport(inspectedTheme.id)}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIndo ? 'Ekspor JSON' : 'Export JSON'}</span>
              </button>
            </div>

            {/* Colors Token Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                {isIndo ? 'Token Warna (Colors)' : 'Color Tokens'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.entries(inspectedTheme.colors).map(([key, val]) => (
                  <div key={key} className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[11px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded-full border border-neutral-600 shrink-0" style={{ backgroundColor: val }} />
                      <span className="text-neutral-400 truncate">{key}</span>
                    </div>
                    <span className="font-mono text-neutral-200 block truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-800 text-xs">
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold mb-1">
                  <Type className="w-3.5 h-3.5 text-pink-400" />
                  <span>Typography</span>
                </div>
                <div className="text-[11px] text-neutral-400">Sans: <span className="text-neutral-200 font-mono">{inspectedTheme.typography.fontFamilySans}</span></div>
                <div className="text-[11px] text-neutral-400">Mono: <span className="text-neutral-200 font-mono">{inspectedTheme.typography.fontFamilyMono}</span></div>
                <div className="text-[11px] text-neutral-400">Base Size: <span className="text-neutral-200 font-mono">{inspectedTheme.typography.baseSize}</span></div>
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold mb-1">
                  <Layout className="w-3.5 h-3.5 text-blue-400" />
                  <span>Spacing & Radius</span>
                </div>
                <div className="text-[11px] text-neutral-400">Grid Unit: <span className="text-neutral-200 font-mono">{inspectedTheme.spacing.unit}px</span></div>
                <div className="text-[11px] text-neutral-400">Border Radius: <span className="text-neutral-200 font-mono">{inspectedTheme.spacing.borderRadiusBase}</span></div>
                <div className="text-[11px] text-neutral-400">Sidebar Width: <span className="text-neutral-200 font-mono">{inspectedTheme.spacing.sidebarWidth}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
