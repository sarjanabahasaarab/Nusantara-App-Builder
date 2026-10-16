/**
 * Nusantara App Builder - Logic Debug Console & State Inspector
 * Phase 6: Simulated runtime execution, event listener triggers, variable inspection, and SQL logs.
 */

import React, { useState } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Globe2,
  Sliders,
  Zap,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useTranslation } from '../../localization/useTranslation';

interface ExecutionLog {
  id: string;
  timestamp: string;
  type: 'event' | 'action' | 'variable' | 'database' | 'api' | 'error';
  title: string;
  details: string;
  status: 'success' | 'running' | 'error';
}

export const DebugConsole: React.FC = () => {
  const { lang } = useTranslation();

  const events = useLogicStore((s) => s.events);
  const variables = useLogicStore((s) => s.variables);
  const databases = useLogicStore((s) => s.databases);
  const apiEndpoints = useLogicStore((s) => s.apiEndpoints);

  const [logs, setLogs] = useState<ExecutionLog[]>([
    {
      id: 'log_1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'event',
      title: 'Activity.onCreate() Triggered',
      details: 'Layar utama diinisialisasi dan variabel default dimuat.',
      status: 'success',
    },
    {
      id: 'log_2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'database',
      title: 'SQLite OpenHelper Verified',
      details: `Database ${databases[0]?.name || 'app_database.db'} siap dengan ${databases[0]?.tables.length || 1} tabel.`,
      status: 'success',
    },
  ]);

  const [simulatingEventId, setSimulatingEventId] = useState<string>(events[0]?.id || '');

  const handleSimulateEvent = () => {
    const targetEvt = events.find((e) => e.id === simulatingEventId);
    if (!targetEvt) return;

    const time = new Date().toLocaleTimeString();
    const newLogs: ExecutionLog[] = [
      {
        id: `log_${Date.now()}_1`,
        timestamp: time,
        type: 'event',
        title: `Triggered ${targetEvt.componentName || targetEvt.componentId}.${targetEvt.eventType}()`,
        details: `Menjalankan ${targetEvt.actions.length} action berurutan.`,
        status: 'running',
      },
    ];

    for (let i = 0; i < targetEvt.actions.length; i++) {
      const act = targetEvt.actions[i];
      newLogs.push({
        id: `log_${Date.now()}_${i + 2}`,
        timestamp: time,
        type: act.type.startsWith('db_') ? 'database' : act.type.startsWith('http_') ? 'api' : 'action',
        title: `Step #${i + 1}: ${act.type}`,
        details: JSON.stringify(act.parameters),
        status: 'success',
      });
    }

    setLogs((prev) => [...newLogs, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-sm font-bold text-neutral-100">
              {lang === 'id' ? 'Konsol Debug & Inspektor Eksekusi' : 'Debug Console & Execution Inspector'}
            </h2>
            <p className="text-[11px] text-neutral-400">
              Simulasikan jalannya logika event, inspeksi nilai variabel, dan pantau query database secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Event Selector */}
          <select
            value={simulatingEventId}
            onChange={(e) => setSimulatingEventId(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded px-2.5 py-1.5 focus:outline-none"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                ⚡ {e.componentName || e.componentId} ({e.eventType})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSimulateEvent}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi Event</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
            title="Bersihkan Log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Log Stream & Live State View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left: Execution Log Stream (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-800 text-xs font-bold text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Execution Stream Trace ({logs.length})</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Sandboxed Simulator</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                Log kosong. Jalankan "Simulasi Event" di atas untuk memicu flow logika.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    {log.type === 'event' && <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {log.type === 'action' && <Play className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                    {log.type === 'database' && <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {log.type === 'api' && <Globe2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}

                    <div>
                      <div className="font-bold text-neutral-100 flex items-center gap-2">
                        <span>{log.title}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">
                          {log.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 break-all">
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Live Variable & State Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-800 text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Variable State</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {variables.map((v) => (
              <div
                key={v.id}
                className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono flex items-center justify-between"
              >
                <div>
                  <div className="text-neutral-200 font-semibold">{v.name}</div>
                  <div className="text-[10px] text-neutral-500">{v.type} ({v.scope})</div>
                </div>
                <span className="text-blue-300 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900/60">
                  {String(v.defaultValue ?? '') || '""'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
