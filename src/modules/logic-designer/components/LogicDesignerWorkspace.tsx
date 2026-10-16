/**
 * Nusantara App Builder - Logic Designer Workspace
 * Phase 6: Top-level workspace integrating visual logic builder, variable manager, SQLite designer, and API manager.
 */

import React, { useState } from 'react';
import {
  Zap,
  Sliders,
  Database,
  Globe2,
  Compass,
  Bug,
  RotateCcw,
  RotateCw,
  Code2,
  Save,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useLogicStore, LogicDesignerTab } from '../store/logicStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';
import { VisualLogicBuilder } from './VisualLogicBuilder';
import { VariableManager } from './VariableManager';
import { DatabaseDesigner } from './DatabaseDesigner';
import { ApiManager } from './ApiManager';
import { NavigationMap } from './NavigationMap';
import { DebugConsole } from './DebugConsole';
import { KotlinLogicGenerator } from '../services/kotlinLogicGenerator';

export const LogicDesignerWorkspace: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const activeProject = useProjectStore((s) => s.activeProject);

  const activeTab = useLogicStore((s) => s.activeTab);
  const setActiveTab = useLogicStore((s) => s.setActiveTab);
  const undo = useLogicStore((s) => s.undo);
  const redo = useLogicStore((s) => s.redo);
  const undoStack = useLogicStore((s) => s.undoStack);
  const redoStack = useLogicStore((s) => s.redoStack);
  const saveProjectModel = useLogicStore((s) => s.saveProjectModel);

  const [showCodePreviewModal, setShowCodePreviewModal] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'db' | 'api' | 'controller'>('db');

  const handleSave = async () => {
    if (!activeProject) {
      showToast('Logika disimpan ke konfigurasi lokal.');
      return;
    }
    await saveProjectModel(activeProject.id);
    showToast('Seluruh konfigurasi logika, database, & API berhasil disimpan.');
  };

  const currentModel = {
    schemaVersion: 2 as const,
    formatVersion: '6.0' as const,
    project: {
      id: activeProject?.id || 'proj_active',
      name: activeProject?.name || 'My App',
      packageId: activeProject?.packageId || 'id.nusantara.app',
    },
    screens: [],
    events: useLogicStore.getState().events,
    variables: useLogicStore.getState().variables,
    databases: useLogicStore.getState().databases,
    apiEndpoints: useLogicStore.getState().apiEndpoints,
    forms: useLogicStore.getState().forms,
    navigation: useLogicStore.getState().navigation,
    bindings: useLogicStore.getState().bindings,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const packageId = activeProject?.packageId || 'id.nusantara.app';
  const dbCode = currentModel.databases[0]
    ? KotlinLogicGenerator.generateDatabaseHelperKotlin(currentModel.databases[0], packageId)
    : '// Belum ada database SQLite yang terdefinisi.';
  const apiCode = currentModel.apiEndpoints.length > 0
    ? KotlinLogicGenerator.generateApiClientKotlin(currentModel.apiEndpoints, packageId)
    : '// Belum ada API endpoint yang terdefinisi.';
  const controllerCode = KotlinLogicGenerator.generateLogicControllerKotlin(currentModel, packageId);

  const tabs: { id: LogicDesignerTab; label: string; enLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'flow', label: 'Visual Logic Flow', enLabel: 'Visual Logic Flow', icon: Zap },
    { id: 'variables', label: 'Variabel & State', enLabel: 'Variables & State', icon: Sliders },
    { id: 'database', label: 'SQLite Database', enLabel: 'SQLite Database', icon: Database },
    { id: 'api', label: 'REST API & Tester', enLabel: 'REST API & Tester', icon: Globe2 },
    { id: 'navigation', label: 'Peta Navigasi', enLabel: 'Navigation Map', icon: Compass },
    { id: 'debug', label: 'Debug & Simulator', enLabel: 'Debug & Simulator', icon: Bug },
  ];

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 select-none overflow-hidden font-sans">
      {/* Top Workspace Header */}
      <div className="h-12 border-b border-neutral-800 bg-neutral-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-xs text-neutral-100 flex items-center gap-2">
              <span>{lang === 'id' ? 'Logic Designer & Data Engine' : 'Logic Designer & Data Engine'}</span>
              <span className="text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 px-1.5 py-0.2 rounded">
                Phase 6
              </span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          {tabs.map((tab) => {
            const isCurrent = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? tab.label : tab.enLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Actions: Undo, Redo, Preview Code, Save */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowCodePreviewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer border border-neutral-700"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Kode Kotlin</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'flow' && <VisualLogicBuilder />}
        {activeTab === 'variables' && <VariableManager />}
        {activeTab === 'database' && <DatabaseDesigner />}
        {activeTab === 'api' && <ApiManager />}
        {activeTab === 'navigation' && <NavigationMap />}
        {activeTab === 'debug' && <DebugConsole />}
      </div>

      {/* Modal: Generated Kotlin Code Preview */}
      {showCodePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold text-neutral-100">
                  Pratinjau Kode Kotlin Nyata (Generated Production Code)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCodePreviewModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub Tabs for Code */}
            <div className="flex gap-2 pt-3 border-b border-neutral-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveCodeTab('db')}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                  activeCodeTab === 'db' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                DatabaseHelper.kt
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('api')}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                  activeCodeTab === 'api' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                ApiClient.kt
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('controller')}
                className={`px-3 py-1 rounded text-xs font-mono font-semibold cursor-pointer ${
                  activeCodeTab === 'controller' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                AppLogicController.kt
              </button>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-y-auto pt-3">
              <pre className="p-4 bg-neutral-950 rounded-xl text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed">
                {activeCodeTab === 'db' && dbCode}
                {activeCodeTab === 'api' && apiCode}
                {activeCodeTab === 'controller' && controllerCode}
              </pre>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
              <span>
                Kode ini terkompilasi langsung dengan Android SDK 34, SQLite, dan Coroutines tanpa pseudo-code.
              </span>
              <button
                type="button"
                onClick={() => {
                  const text = activeCodeTab === 'db' ? dbCode : activeCodeTab === 'api' ? apiCode : controllerCode;
                  navigator.clipboard.writeText(text);
                  showToast('Kode Kotlin disalin ke clipboard.');
                }}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-semibold transition-colors cursor-pointer"
              >
                Salin Kode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
