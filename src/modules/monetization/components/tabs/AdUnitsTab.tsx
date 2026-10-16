/**
 * Nusantara App Builder - Ad Units Manager Tab
 * Phase 9: Search, filter by type & status, toggle enabled, edit/delete, and add ad units.
 */

import React from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  DollarSign,
  Copy,
  Check,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useMonetizationStore } from '../../store/monetizationStore';
import { useTranslation } from '../../../localization/useTranslation';
import { AdType, AdUnitConfig } from '../../types';

export const AdUnitsTab: React.FC = () => {
  const { lang } = useTranslation();
  const config = useMonetizationStore((s) => s.config);
  const searchQuery = useMonetizationStore((s) => s.searchQuery);
  const setSearchQuery = useMonetizationStore((s) => s.setSearchQuery);
  const typeFilter = useMonetizationStore((s) => s.typeFilter);
  const setTypeFilter = useMonetizationStore((s) => s.setTypeFilter);
  const statusFilter = useMonetizationStore((s) => s.statusFilter);
  const setStatusFilter = useMonetizationStore((s) => s.setStatusFilter);
  const openCreateAdUnitModal = useMonetizationStore((s) => s.openCreateAdUnitModal);
  const openEditAdUnitModal = useMonetizationStore((s) => s.openEditAdUnitModal);
  const deleteAdUnit = useMonetizationStore((s) => s.deleteAdUnit);
  const toggleAdUnitEnabled = useMonetizationStore((s) => s.toggleAdUnitEnabled);

  // Filter units
  const filteredUnits = config.units.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.adUnitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.placement.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || unit.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && unit.enabled) ||
      (statusFilter === 'disabled' && !unit.enabled);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: AdType) => {
    switch (type) {
      case 'banner':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'interstitial':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'rewarded':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'native':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari unit iklan...' : 'Search ad units...'}
            className="w-full bg-transparent text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="all">{lang === 'id' ? 'Semua Tipe' : 'All Types'}</option>
            <option value="banner">Banner</option>
            <option value="interstitial">Interstitial</option>
            <option value="rewarded">Rewarded</option>
            <option value="native">Native</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="all">{lang === 'id' ? 'Semua Status' : 'All Status'}</option>
            <option value="enabled">{lang === 'id' ? 'Aktif' : 'Enabled'}</option>
            <option value="disabled">{lang === 'id' ? 'Nonaktif' : 'Disabled'}</option>
          </select>

          <button
            onClick={() => openCreateAdUnitModal('banner')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'id' ? 'Tambah Unit Iklan' : 'Add Ad Unit'}</span>
          </button>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        {filteredUnits.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-3">
            <DollarSign className="w-12 h-12 mx-auto text-neutral-600 stroke-[1.5]" />
            <p className="text-sm font-semibold text-neutral-300">
              {lang === 'id' ? 'Tidak Ada Unit Iklan yang Sesuai' : 'No Ad Units Found'}
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {lang === 'id'
                ? 'Tambahkan unit Banner, Interstisial, Berhadiah, atau Native untuk memonetisasi aplikasi.'
                : 'Add Banner, Interstitial, Rewarded, or Native ad units to monetize your Android app.'}
            </p>
            <button
              onClick={() => openCreateAdUnitModal('banner')}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg border border-neutral-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Buat Unit Pertama' : 'Create First Ad Unit'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Name & Placement</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Ad Unit ID</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredUnits.map((unit) => (
                  <tr
                    key={unit.id}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{unit.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {unit.placement}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getTypeBadge(
                          unit.type
                        )}`}
                      >
                        {unit.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-300">
                      {unit.adUnitId}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          unit.mode === 'production'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {unit.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAdUnitEnabled(unit.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          unit.enabled
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}
                      >
                        {unit.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditAdUnitModal(unit)}
                          className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-white cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAdUnit(unit.id)}
                          className="p-1.5 hover:bg-red-950/60 rounded-md text-neutral-400 hover:text-red-400 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
