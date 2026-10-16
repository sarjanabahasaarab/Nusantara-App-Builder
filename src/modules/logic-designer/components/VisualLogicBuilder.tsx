/**
 * Nusantara App Builder - Visual Logic Builder
 * Phase 6: Node & block-based visual event-action flow designer with branching and action inspector.
 */

import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Trash2,
  ArrowDown,
  Navigation,
  MessageSquare,
  Database,
  Globe2,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Edit3,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useTranslation } from '../../localization/useTranslation';
import {
  LogicEvent,
  LogicAction,
  ActionType,
  EventTriggerType,
  ActionCategory,
} from '../types';
import { SafeExpressionEngine } from '../services/expressionEngine';

const ACTION_DEFINITIONS: {
  type: ActionType;
  category: ActionCategory;
  label: string;
  enLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultParams: Record<string, any>;
}[] = [
  // Navigation
  {
    type: 'navigate_to_screen',
    category: 'navigation',
    label: 'Navigasi ke Layar',
    enLabel: 'Navigate to Screen',
    icon: Navigation,
    defaultParams: { targetScreenId: 'screen_dashboard', targetActivityName: 'DashboardActivity' },
  },
  {
    type: 'go_back',
    category: 'navigation',
    label: 'Kembali (Go Back)',
    enLabel: 'Go Back',
    icon: Navigation,
    defaultParams: {},
  },
  {
    type: 'open_url',
    category: 'navigation',
    label: 'Buka URL Website',
    enLabel: 'Open URL',
    icon: Globe2,
    defaultParams: { url: 'https://example.com' },
  },

  // UI
  {
    type: 'show_message',
    category: 'ui',
    label: 'Tampilkan Pesan (Toast)',
    enLabel: 'Show Toast Message',
    icon: MessageSquare,
    defaultParams: { message: 'Data berhasil diproses!' },
  },
  {
    type: 'set_text',
    category: 'ui',
    label: 'Ubah Teks Komponen',
    enLabel: 'Set Component Text',
    icon: Edit3,
    defaultParams: { targetComponentId: 'text_label', text: 'Halo Nusantara' },
  },
  {
    type: 'set_visibility',
    category: 'ui',
    label: 'Ubah Visibilitas',
    enLabel: 'Set Visibility',
    icon: Layers,
    defaultParams: { targetComponentId: 'card_loading', visibility: 'gone' },
  },

  // Data
  {
    type: 'set_variable',
    category: 'data',
    label: 'Atur Variabel (Set Variable)',
    enLabel: 'Set Variable',
    icon: Sliders,
    defaultParams: { variableName: 'username', valueExpression: '"Budi"' },
  },

  // Database
  {
    type: 'db_insert',
    category: 'database',
    label: 'SQLite: Insert Data',
    enLabel: 'SQLite: Insert Data',
    icon: Database,
    defaultParams: { table: 'products', values: { name: 'Produk Baru', price: '15000' } },
  },
  {
    type: 'db_query',
    category: 'database',
    label: 'SQLite: Query / Cari',
    enLabel: 'SQLite: Query Data',
    icon: Database,
    defaultParams: { table: 'products', where: 'stock > 0' },
  },
  {
    type: 'db_delete',
    category: 'database',
    label: 'SQLite: Hapus Data',
    enLabel: 'SQLite: Delete Data',
    icon: Database,
    defaultParams: { table: 'products', where: 'id = ?' },
  },

  // Network
  {
    type: 'http_get',
    category: 'network',
    label: 'HTTP GET (Ambil API)',
    enLabel: 'HTTP GET Request',
    icon: Globe2,
    defaultParams: { url: 'https://api.example.com/data', targetVariable: 'apiResponse' },
  },
  {
    type: 'http_post',
    category: 'network',
    label: 'HTTP POST (Kirim API)',
    enLabel: 'HTTP POST Request',
    icon: Globe2,
    defaultParams: { url: 'https://api.example.com/login', bodyJson: '{"user":"test"}' },
  },

  // Logic
  {
    type: 'if_condition',
    category: 'logic',
    label: 'Percabangan IF / ELSE',
    enLabel: 'IF / ELSE Condition',
    icon: GitBranch,
    defaultParams: { condition: 'isLoggedIn == true' },
  },
  {
    type: 'validate_form',
    category: 'logic',
    label: 'Validasi Form Input',
    enLabel: 'Validate Form',
    icon: CheckCircle2,
    defaultParams: { formId: 'form_input' },
  },

  // Utility
  {
    type: 'delay',
    category: 'utility',
    label: 'Tunda / Delay (ms)',
    enLabel: 'Delay Timer',
    icon: Clock,
    defaultParams: { delayMs: 1500 },
  },
];

export const VisualLogicBuilder: React.FC = () => {
  const { lang } = useTranslation();

  const events = useLogicStore((s) => s.events);
  const selectedEventId = useLogicStore((s) => s.selectedEventId);
  const setSelectedEventId = useLogicStore((s) => s.setSelectedEventId);
  const addEvent = useLogicStore((s) => s.addEvent);
  const deleteEvent = useLogicStore((s) => s.deleteEvent);
  const addActionToEvent = useLogicStore((s) => s.addActionToEvent);
  const removeActionFromEvent = useLogicStore((s) => s.removeActionFromEvent);
  const updateActionInEvent = useLogicStore((s) => s.updateActionInEvent);

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Event form state
  const [newEventComponentId, setNewEventComponentId] = useState('button_submit');
  const [newEventComponentName, setNewEventComponentName] = useState('Tombol Simpan');
  const [newEventType, setNewEventType] = useState<EventTriggerType>('onClick');
  const [newEventDesc, setNewEventDesc] = useState('');

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const activeAction = activeEvent?.actions.find((a) => a.id === selectedActionId);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addEvent({
      screenId: 'screen_main',
      componentId: newEventComponentId.trim(),
      componentName: newEventComponentName.trim(),
      eventType: newEventType,
      description: newEventDesc.trim(),
      actions: [],
      enabled: true,
    });
    setSelectedEventId(id);
    setShowAddEventModal(false);
  };

  const handleSelectAction = (def: typeof ACTION_DEFINITIONS[0]) => {
    if (!activeEvent) return;
    addActionToEvent(activeEvent.id, {
      type: def.type,
      parameters: { ...def.defaultParams },
      description: def.label,
    });
    setShowAddActionModal(false);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Events List Panel (280px) */}
      <div className="w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-neutral-200">
              {lang === 'id' ? 'Daftar Event Komponen' : 'Component Events'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddEventModal(true)}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
            title="Tambah Event Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {events.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs px-4">
              {lang === 'id'
                ? 'Belum ada event logic. Klik "+" di atas untuk membuat event baru.'
                : 'No logic events yet. Click "+" above to add an event.'}
            </div>
          ) : (
            events.map((evt) => {
              const isSelected = (activeEvent?.id === evt.id);
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/80 text-neutral-100 ring-1 ring-blue-500/30'
                      : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200 truncate flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-[11px]">⚡</span>
                      {evt.componentName || evt.componentId}
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-900/60">
                      {evt.eventType}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 mt-1 truncate">
                    {evt.description || `${evt.actions.length} action flow`}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                    <span>{evt.actions.length} tindakan</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(evt.id);
                      }}
                      className="text-neutral-500 hover:text-red-400 transition-colors p-0.5"
                      title="Hapus Event"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER: Visual Flow / Action Chain (Flex-1) */}
      <div className="flex-1 bg-neutral-950 flex flex-col overflow-hidden">
        {activeEvent ? (
          <>
            {/* Header info for selected event */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs font-semibold text-neutral-100 flex items-center gap-2">
                  <span>Komponen:</span>
                  <span className="text-blue-400 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
                    {activeEvent.componentName || activeEvent.componentId}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60">
                    {activeEvent.eventType}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {activeEvent.description || 'Eksekusi berurutan (Top-Down Flow)'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddActionModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Tambah Action' : 'Add Action'}</span>
              </button>
            </div>

            {/* Visual Node Flow Viewport */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
              {/* Event Trigger Root Node */}
              <div className="w-80 rounded-xl bg-amber-950/30 border-2 border-amber-600/70 p-4 shadow-xl text-center relative">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>EVENT TRIGGER</span>
                </div>
                <div className="text-sm font-bold text-neutral-100">
                  {activeEvent.componentName || activeEvent.componentId}
                </div>
                <div className="text-xs font-mono text-amber-300 mt-0.5">
                  .{activeEvent.eventType}()
                </div>
              </div>

              {/* Action Nodes Sequence */}
              {activeEvent.actions.length === 0 ? (
                <div className="flex flex-col items-center mt-6">
                  <ArrowDown className="w-5 h-5 text-neutral-600 mb-3 animate-bounce" />
                  <div className="p-6 rounded-xl border border-dashed border-neutral-800 text-center max-w-sm text-xs text-neutral-500">
                    {lang === 'id'
                      ? 'Belum ada action di dalam event ini. Tekan tombol "+ Tambah Action" di atas untuk menambahkan logika navigasi, API, database, atau pesan.'
                      : 'No actions defined in this event. Click "+ Add Action" to add navigation, API, database, or UI actions.'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full max-w-xl">
                  {activeEvent.actions.map((action, idx) => {
                    const isSelected = selectedActionId === action.id;
                    const def = ACTION_DEFINITIONS.find((d) => d.type === action.type);
                    const Icon = def?.icon || Sparkles;

                    return (
                      <React.Fragment key={action.id}>
                        {/* Down Arrow Connector */}
                        <div className="flex flex-col items-center my-2 text-neutral-600">
                          <div className="w-0.5 h-4 bg-neutral-700" />
                          <ArrowDown className="w-4 h-4 text-neutral-500 -mt-1" />
                        </div>

                        {/* Action Node Card */}
                        <div
                          onClick={() => setSelectedActionId(action.id)}
                          className={`w-96 rounded-xl border p-4 shadow-lg cursor-pointer transition-all relative ${
                            isSelected
                              ? 'bg-neutral-900 border-blue-500 ring-2 ring-blue-500/30'
                              : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-neutral-200">
                                  {def?.label || action.type}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  #{idx + 1} — {action.type}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeActionFromEvent(activeEvent.id, action.id);
                                if (selectedActionId === action.id) setSelectedActionId(null);
                              }}
                              className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors"
                              title="Hapus Action"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Parameter summary badge */}
                          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 text-[11px] font-mono text-neutral-300 overflow-x-auto space-y-1">
                            {Object.entries(action.parameters).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-neutral-500">{k}:</span>
                                <span className="text-blue-300 font-semibold truncate max-w-[200px]">
                                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Conditional Branching indicator */}
                          {action.type === 'if_condition' && (
                            <div className="mt-3 pt-2 border-t border-neutral-800 flex justify-around text-[10px]">
                              <span className="text-emerald-400 font-bold">✓ THEN Branch</span>
                              <span className="text-neutral-500 font-bold">✗ ELSE Branch</span>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
            {lang === 'id' ? 'Pilih salah satu event di sebelah kiri' : 'Select an event from the left panel'}
          </div>
        )}
      </div>

      {/* RIGHT: Action Parameter Inspector Panel (320px) */}
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-neutral-800 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-neutral-200">
            {lang === 'id' ? 'Inspektor Parameter Action' : 'Action Inspector'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeAction ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">Tipe Action:</span>
                <div className="font-mono text-neutral-200 text-xs font-semibold mt-0.5">
                  {activeAction.type}
                </div>
              </div>

              {/* Dynamic Parameter Fields based on action type */}
              {activeAction.type === 'navigate_to_screen' && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Layar Tujuan (Target Screen ID)
                  </label>
                  <input
                    type="text"
                    value={activeAction.parameters.targetScreenId || ''}
                    onChange={(e) =>
                      updateActionInEvent(activeEvent!.id, activeAction.id, {
                        parameters: { ...activeAction.parameters, targetScreenId: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                </div>
              )}

              {activeAction.type === 'show_message' && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Isi Pesan Notifikasi (Toast)
                  </label>
                  <textarea
                    rows={3}
                    value={activeAction.parameters.message || ''}
                    onChange={(e) =>
                      updateActionInEvent(activeEvent!.id, activeAction.id, {
                        parameters: { ...activeAction.parameters, message: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100"
                  />
                </div>
              )}

              {activeAction.type === 'set_variable' && (
                <>
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Nama Variabel
                    </label>
                    <input
                      type="text"
                      value={activeAction.parameters.variableName || ''}
                      onChange={(e) =>
                        updateActionInEvent(activeEvent!.id, activeAction.id, {
                          parameters: { ...activeAction.parameters, variableName: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      Ekspresi Nilai (Value Expression)
                    </label>
                    <input
                      type="text"
                      value={activeAction.parameters.valueExpression || ''}
                      onChange={(e) =>
                        updateActionInEvent(activeEvent!.id, activeAction.id, {
                          parameters: { ...activeAction.parameters, valueExpression: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                    />
                  </div>
                </>
              )}

              {activeAction.type === 'if_condition' && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Kondisi IF (Safe Expression)
                  </label>
                  <input
                    type="text"
                    value={activeAction.parameters.condition || ''}
                    onChange={(e) =>
                      updateActionInEvent(activeEvent!.id, activeAction.id, {
                        parameters: { ...activeAction.parameters, condition: e.target.value },
                      })
                    }
                    placeholder="totalHarga > 100000"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                  {activeAction.parameters.condition && (
                    <div className="mt-2 text-[11px]">
                      {SafeExpressionEngine.validate(activeAction.parameters.condition).isValid ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Sintaks Valid
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {SafeExpressionEngine.validate(activeAction.parameters.condition).error}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(activeAction.type === 'http_get' || activeAction.type === 'http_post') && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Target URL Endpoint
                  </label>
                  <input
                    type="text"
                    value={activeAction.parameters.url || ''}
                    onChange={(e) =>
                      updateActionInEvent(activeEvent!.id, activeAction.id, {
                        parameters: { ...activeAction.parameters, url: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                </div>
              )}

              {activeAction.type === 'delay' && (
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Durasi Delay (Milidetik)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    value={activeAction.parameters.delayMs || 1000}
                    onChange={(e) =>
                      updateActionInEvent(activeEvent!.id, activeAction.id, {
                        parameters: { ...activeAction.parameters, delayMs: parseInt(e.target.value) || 1000 },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 text-xs">
              {lang === 'id'
                ? 'Klik salah satu node action di tengah untuk mengedit parameter konfigurasinya.'
                : 'Click an action node in the flow to inspect and edit its parameters.'}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Tambah Action */}
      {showAddActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                {lang === 'id' ? 'Pilih Action yang Akan Dijalankan' : 'Select Action to Execute'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddActionModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {(['navigation', 'ui', 'data', 'database', 'network', 'logic', 'utility'] as ActionCategory[]).map(
                (category) => {
                  const filtered = ACTION_DEFINITIONS.filter((d) => d.category === category);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {category}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filtered.map((def) => {
                          const Icon = def.icon;
                          return (
                            <button
                              key={def.type}
                              type="button"
                              onClick={() => handleSelectAction(def)}
                              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/80 hover:bg-neutral-900 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-neutral-200 group-hover:text-blue-400 transition-colors">
                                  {lang === 'id' ? def.label : def.enLabel}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {def.type}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Event Baru */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateEvent}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                {lang === 'id' ? 'Buat Event Logika Baru' : 'Create New Logic Event'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                ID Komponen UI (Contoh: btn_login, txt_search)
              </label>
              <input
                type="text"
                required
                value={newEventComponentId}
                onChange={(e) => setNewEventComponentId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nama Tampilan Komponen
              </label>
              <input
                type="text"
                value={newEventComponentName}
                onChange={(e) => setNewEventComponentName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Jenis Event Trigger
              </label>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as EventTriggerType)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              >
                <option value="onClick">onClick (Klik Tombol / Komponen)</option>
                <option value="onLongPress">onLongPress (Tekan Lama)</option>
                <option value="onChange">onChange (Teks Berubah)</option>
                <option value="onCheckedChange">onCheckedChange (Checkbox / Switch)</option>
                <option value="onCreate">onCreate (Saat Layar Dibuka)</option>
                <option value="onResume">onResume (Saat Layar Aktif Kembali)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Deskripsi Event (Opsional)
              </label>
              <input
                type="text"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Contoh: Mengirim form saat tombol diklik"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Buat Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
