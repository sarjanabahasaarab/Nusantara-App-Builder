/**
 * Nusantara App Builder - Plugin Manager Workspace (Phase 10)
 * Visual management for extensions, component plugins, and permission security audits.
 */

import React, { useState } from 'react';
import {
  Blocks,
  Search,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Upload,
  ExternalLink,
  Code2,
  Trash2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePluginStore } from '../store/pluginStore';
import { PluginManifest, PluginPermission } from '../types';
import { PERMISSION_METADATA } from '../services/pluginSecurity';
import { useTranslation } from '../../localization/useTranslation';
import { useUiStore } from '../../../store/uiStore';
import { PluginPermissionModal } from './PluginPermissionModal';

export const PluginManagerWorkspace: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);

  const plugins = usePluginStore((s) => s.plugins);
  const searchQuery = usePluginStore((s) => s.searchQuery);
  const setSearchQuery = usePluginStore((s) => s.setSearchQuery);
  const selectedCategory = usePluginStore((s) => s.selectedCategory);
  const setSelectedCategory = usePluginStore((s) => s.setSelectedCategory);
  const togglePlugin = usePluginStore((s) => s.togglePlugin);
  const uninstallPlugin = usePluginStore((s) => s.uninstallPlugin);
  const updatePermissions = usePluginStore((s) => s.updatePermissions);
  const installPlugin = usePluginStore((s) => s.installPlugin);

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [manifestJsonInput, setManifestJsonInput] = useState('');
  const [installError, setInstallError] = useState<string | null>(null);

  const isIndo = lang === 'id';

  const categories = [
    { id: 'all', label: isIndo ? 'Semua Kategori' : 'All Categories' },
    { id: 'component', label: isIndo ? 'Komponen UI' : 'UI Components' },
    { id: 'template', label: isIndo ? 'Templat Proyek' : 'Project Templates' },
    { id: 'database', label: isIndo ? 'Basis Data' : 'Database' },
    { id: 'api', label: 'REST API' },
    { id: 'theme', label: isIndo ? 'Tema' : 'Themes' },
    { id: 'build-extension', label: isIndo ? 'Ekstensi Build' : 'Build Extensions' },
  ];

  const filteredPlugins = plugins.filter((p) => {
    const matchesSearch =
      p.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || p.manifest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTogglePermission = (
    pluginId: string,
    perm: PluginPermission,
    currentValue: boolean
  ) => {
    const plugin = plugins.find((p) => p.manifest.id === pluginId);
    if (!plugin) return;

    const newPerms = { ...plugin.grantedPermissions, [perm]: !currentValue };
    updatePermissions(pluginId, newPerms);
    showToast(
      isIndo
        ? `Izin "${perm}" telah diubah untuk ${plugin.manifest.name}`
        : `Permission "${perm}" updated for ${plugin.manifest.name}`
    );
  };

  const handleInstallJson = () => {
    setInstallError(null);
    try {
      const parsed = JSON.parse(manifestJsonInput);
      const res = installPlugin(parsed as PluginManifest);
      if (res.success) {
        showToast(
          isIndo
            ? `Plugin "${parsed.name}" berhasil dipasang!`
            : `Plugin "${parsed.name}" installed successfully!`
        );
        setIsInstallModalOpen(false);
        setManifestJsonInput('');
      } else {
        setInstallError(res.error || 'Failed to install plugin');
      }
    } catch (e: any) {
      setInstallError(e.message || 'Invalid JSON format');
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 overflow-hidden select-none">
      {/* 1. Header Bar */}
      <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Blocks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                {isIndo ? 'Manajer Ekstensi & Plugin' : 'Plugin & Extension Engine'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold uppercase">
                {plugins.length} {isIndo ? 'TERPASANG' : 'INSTALLED'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isIndo
                ? 'Perluas kemampuan Visual Designer, generator kode, basis data, dan tema dengan arsitektur plugin modular'
                : 'Extend Visual Designer, code generators, databases, and themes with sandboxed modular plugins'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isIndo ? 'Pasang Plugin Baru' : 'Install Plugin'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-900/40 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isIndo ? 'Cari plugin atau ekstensi...' : 'Search plugins or extensions...'}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-neutral-800 text-purple-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Plugin Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredPlugins.map((plugin) => {
            const isEnabled = plugin.isEnabled;

            return (
              <div
                key={plugin.manifest.id}
                className={`p-5 rounded-xl border bg-neutral-900 transition-all shadow-md ${
                  isEnabled ? 'border-neutral-800' : 'border-neutral-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Info Column */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-sm text-white">{plugin.manifest.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        v{plugin.manifest.version}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                        API v{plugin.manifest.apiVersion}
                      </span>
                      {plugin.isBuiltin && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                          BUILT-IN
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        by {plugin.manifest.author}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {plugin.manifest.description}
                    </p>

                    {/* Permissions list */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{isIndo ? 'Izin Keamanan & Hak Akses:' : 'Security Permissions:'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {plugin.manifest.permissions.map((perm) => {
                          const isGranted = Boolean(plugin.grantedPermissions[perm]);
                          const meta = PERMISSION_METADATA[perm];

                          return (
                            <button
                              key={perm}
                              onClick={() => handleTogglePermission(plugin.manifest.id, perm, isGranted)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 transition-colors ${
                                isGranted
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                                  : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                              }`}
                              title={meta ? (isIndo ? meta.descriptionId : meta.description) : perm}
                            >
                              {isGranted ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                              <span>{perm}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => togglePlugin(plugin.manifest.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isEnabled
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isEnabled ? (isIndo ? 'Nonaktifkan' : 'Disable') : isIndo ? 'Aktifkan' : 'Enable'}
                    </button>

                    {!plugin.isBuiltin && (
                      <button
                        onClick={() => uninstallPlugin(plugin.manifest.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                        title={isIndo ? 'Hapus Plugin' : 'Uninstall Plugin'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Install Plugin Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  {isIndo ? 'Pasang Plugin dari Manifest JSON' : 'Install Plugin from Manifest JSON'}
                </h3>
              </div>
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-neutral-400">
                {isIndo
                  ? 'Masukkan manifest.json plugin yang valid dengan id, nama, versi, dan izin yang dibutuhkan:'
                  : 'Enter a valid plugin manifest.json containing id, name, version, and requested permissions:'}
              </p>

              <textarea
                rows={9}
                value={manifestJsonInput}
                onChange={(e) => setManifestJsonInput(e.target.value)}
                placeholder={`{\n  "id": "my.custom-plugin",\n  "name": "Custom Component Pack",\n  "version": "1.0.0",\n  "apiVersion": "1",\n  "author": "Community Developer",\n  "description": "Adds custom Android widgets",\n  "category": "component",\n  "permissions": ["project.read", "project.write"]\n}`}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-purple-500"
              />

              {installError && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800 text-xs text-red-300">
                  {installError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              >
                {isIndo ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={handleInstallJson}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
              >
                {isIndo ? 'Pasang Sekarang' : 'Install Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Request Dialog */}
      <PluginPermissionModal />
    </div>
  );
};
