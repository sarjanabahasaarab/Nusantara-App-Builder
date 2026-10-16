/**
 * Nusantara App Builder - Visual Navigation Map & Screen Graph
 * Phase 6: Screen route mapping, start screen selector, and Activity navigation visualization.
 */

import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Smartphone,
  ArrowRight,
  Flag,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useDesignerStore } from '../../../store/designerStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';

export const NavigationMap: React.FC = () => {
  const { lang } = useTranslation();
  const setActiveView = useUiStore((s) => s.setActiveView);
  const showToast = useUiStore((s) => s.showToast);

  const navigation = useLogicStore((s) => s.navigation);
  const setStartScreen = useLogicStore((s) => s.setStartScreen);
  const addNavigationRoute = useLogicStore((s) => s.addNavigationRoute);
  const deleteNavigationRoute = useLogicStore((s) => s.deleteNavigationRoute);

  const screens = useDesignerStore((s) => s.design?.screens || []);
  const setActiveScreen = useDesignerStore((s) => s.setActiveScreen);

  const [fromScreen, setFromScreen] = useState(screens[0]?.id || 'screen_main');
  const [toScreen, setToScreen] = useState(screens[1]?.id || screens[0]?.id || 'screen_dashboard');

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromScreen || !toScreen) return;
    addNavigationRoute(fromScreen, toScreen);
    showToast('Rute navigasi baru berhasil ditambahkan.');
  };

  const handleJumpToScreen = (screenId: string) => {
    setActiveScreen(screenId);
    setActiveView('visual-designer');
    showToast(`Membuka layar di Visual Designer.`);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'id' ? 'Peta Navigasi Aplikasi (Navigation Map)' : 'App Navigation Map'}</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {lang === 'id'
              ? 'Kelola alur perpindahan antar layar (Intent & Activity Navigation Graph).'
              : 'Manage screen transition flows and start screen selector.'}
          </p>
        </div>

        {/* Start Screen Selector */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs">
          <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-neutral-400">Layar Utama (Start Screen):</span>
          <select
            value={navigation.startScreenId}
            onChange={(e) => setStartScreen(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 text-neutral-100 rounded px-2 py-1 font-semibold focus:outline-none"
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.layoutFileName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Screen Nodes Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-bold text-neutral-200 pb-2 border-b border-neutral-800 flex items-center justify-between">
          <span>Layar Terdaftar di Proyek ({screens.length})</span>
          <span className="text-neutral-500 text-[11px]">Klik kartu untuk membuka di Visual Designer</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {screens.map((screen) => {
            const isStart = navigation.startScreenId === screen.id;
            const outgoingRoutes = navigation.routes.filter((r) => r.fromScreenId === screen.id);

            return (
              <div
                key={screen.id}
                onClick={() => handleJumpToScreen(screen.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative group ${
                  isStart
                    ? 'bg-amber-950/20 border-amber-600/70 text-neutral-100 ring-1 ring-amber-500/40'
                    : 'bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {isStart && (
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center gap-1">
                    <Flag className="w-2.5 h-2.5" /> START
                  </span>
                )}

                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>

                <div className="font-bold text-xs text-neutral-100 group-hover:text-blue-400 transition-colors">
                  {screen.name}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  {screen.layoutFileName}
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>{outgoingRoutes.length} rute keluar</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routes Connection Manager */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="text-xs font-bold text-neutral-200 pb-2 border-b border-neutral-800">
          Hubungan Alur Navigasi Antar Layar
        </div>

        {/* Add route form */}
        <form onSubmit={handleAddRoute} className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400">Dari:</span>
          <select
            value={fromScreen}
            onChange={(e) => setFromScreen(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <ArrowRight className="w-4 h-4 text-neutral-500" />

          <span className="text-neutral-400">Ke:</span>
          <select
            value={toScreen}
            onChange={(e) => setToScreen(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-200"
          >
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rute</span>
          </button>
        </form>

        {/* Existing Routes list */}
        <div className="space-y-2 pt-2">
          {navigation.routes.map((route) => {
            const fromObj = screens.find((s) => s.id === route.fromScreenId);
            const toObj = screens.find((s) => s.id === route.toScreenId);

            return (
              <div
                key={route.id}
                className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-neutral-200">
                    {fromObj?.name || route.fromScreenId}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-emerald-400">
                    {toObj?.name || route.toScreenId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteNavigationRoute(route.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Hapus Rute"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
