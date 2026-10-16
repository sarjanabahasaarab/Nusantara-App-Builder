/**
 * Nusantara App Builder - SQLite Database Designer & Query Builder
 * Phase 6: Visual database tables, column constraints, safe SQL generator, and one-click CRUD screen generation.
 */

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Table as TableIcon,
  Sparkles,
  Key,
  ShieldCheck,
  Code2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';
import { DatabaseTable, DatabaseColumn, SqliteColumnType } from '../types';
import { DatabaseService } from '../services/databaseService';

export const DatabaseDesigner: React.FC = () => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const setActiveView = useUiStore((s) => s.setActiveView);

  const databases = useLogicStore((s) => s.databases);
  const addTable = useLogicStore((s) => s.addTable);
  const deleteTable = useLogicStore((s) => s.deleteTable);
  const addColumn = useLogicStore((s) => s.addColumn);
  const deleteColumn = useLogicStore((s) => s.deleteColumn);
  const generateCrudScreens = useLogicStore((s) => s.generateCrudScreens);

  const activeDb = databases[0]; // Primary app database
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    activeDb?.tables[0]?.id || null
  );

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [showAddColModal, setShowAddColModal] = useState(false);

  // New Column form state
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState<SqliteColumnType>('TEXT');
  const [isPrimaryKey, setIsPrimaryKey] = useState(false);
  const [isAutoIncrement, setIsAutoIncrement] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [isNullable, setIsNullable] = useState(true);
  const [colDefault, setColDefault] = useState('');

  const activeTable = activeDb?.tables.find((t) => t.id === selectedTableId) || activeDb?.tables[0];

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || !activeDb) return;
    addTable(activeDb.id, newTableName.trim());
    setNewTableName('');
    setShowAddTableModal(false);
    showToast(`Tabel "${newTableName}" berhasil dibuat.`);
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim() || !activeDb || !activeTable) return;
    addColumn(activeDb.id, activeTable.id, {
      name: colName.trim(),
      type: colType,
      isPrimaryKey,
      isAutoIncrement,
      isUnique,
      isNullable,
      defaultValue: colDefault || undefined,
    });
    setColName('');
    setIsPrimaryKey(false);
    setIsAutoIncrement(false);
    setIsUnique(false);
    setIsNullable(true);
    setColDefault('');
    setShowAddColModal(false);
  };

  const handleTriggerCrudGeneration = () => {
    if (!activeTable) return;
    generateCrudScreens(activeTable);
    showToast(
      `4 Layar CRUD (${activeTable.name} List, Add, Edit, Detail) berhasil digenerate di Visual Designer!`
    );
  };

  const ddlSql = activeTable ? DatabaseService.generateCreateTableSql(activeTable) : '';

  return (
    <div className="h-full flex overflow-hidden">
      {/* LEFT: Tables List Panel (260px) */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-neutral-200">
              {activeDb?.name || 'app_database.db'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTableModal(true)}
            className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
            title="Tambah Tabel Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeDb?.tables.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTableId(t.id)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                activeTable?.id === t.id
                  ? 'bg-blue-600/10 border-blue-500/80 text-neutral-100 ring-1 ring-blue-500/30'
                  : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <TableIcon className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-xs font-semibold truncate">{t.name}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {t.columns.length} col
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Table Columns & CRUD Action (Flex-1) */}
      <div className="flex-1 bg-neutral-950 flex flex-col overflow-hidden">
        {activeTable ? (
          <>
            {/* Header with CRUD screen generator button */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <div>
                <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <span className="font-mono text-emerald-400">{activeTable.name}</span>
                  <span className="text-xs font-normal text-neutral-400">
                    ({activeTable.columns.length} kolom terdefinisi)
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Tabel SQLite internal Android dengan query parameterized yang aman dari SQL injection.
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* One-Click CRUD Screens Generator */}
                <button
                  type="button"
                  onClick={handleTriggerCrudGeneration}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Generate 4 layar CRUD di Visual Designer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Layar CRUD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddColModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kolom</span>
                </button>
              </div>
            </div>

            {/* Columns Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Nama Kolom</th>
                      <th className="py-2.5 px-4 font-semibold">Tipe SQLite</th>
                      <th className="py-2.5 px-4 font-semibold">Primary Key</th>
                      <th className="py-2.5 px-4 font-semibold">Unique</th>
                      <th className="py-2.5 px-4 font-semibold">Nullable</th>
                      <th className="py-2.5 px-4 font-semibold">Default</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {activeTable.columns.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-neutral-100 flex items-center gap-2">
                          {c.isPrimaryKey && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900/60">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {c.isPrimaryKey ? (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              ✓ PK {c.isAutoIncrement ? '(Auto)' : ''}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {c.isUnique ? '✓ Unique' : '—'}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {c.isNullable ? 'YES' : 'NOT NULL'}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400">
                          {c.defaultValue !== undefined ? c.defaultValue : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!c.isPrimaryKey && (
                            <button
                              type="button"
                              onClick={() => deleteColumn(activeDb.id, activeTable.id, c.id)}
                              className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                              title="Hapus Kolom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DDL SQL Preview */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>Generated SQLite DDL Syntax (Safe Schema)</span>
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px]">SQLite 3.x</span>
                </div>
                <pre className="p-3 bg-neutral-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-neutral-800">
                  {ddlSql}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
            {lang === 'id' ? 'Pilih atau buat tabel database di sebelah kiri' : 'Select or create a table from the left panel'}
          </div>
        )}
      </div>

      {/* MODAL: Tambah Tabel Baru */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTable}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                {lang === 'id' ? 'Buat Tabel SQLite Baru' : 'New SQLite Table'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nama Tabel (Contoh: customers, orders, categories)
              </label>
              <input
                type="text"
                required
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="products"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Buat Tabel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Tambah Kolom Baru */}
      {showAddColModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateColumn}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                Tambah Kolom ke `{activeTable?.name}`
              </span>
              <button
                type="button"
                onClick={() => setShowAddColModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nama Kolom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="price, title, status"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Tipe Data SQLite
                </label>
                <select
                  value={colType}
                  onChange={(e) => setColType(e.target.value as SqliteColumnType)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
                >
                  <option value="TEXT">TEXT (String / Teks)</option>
                  <option value="INTEGER">INTEGER (Bilangan Bulat)</option>
                  <option value="REAL">REAL (Pecahan / Decimal)</option>
                  <option value="BLOB">BLOB (Binary Data)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-neutral-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimaryKey}
                  onChange={(e) => setIsPrimaryKey(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-neutral-200">Primary Key</span>
              </label>

              {isPrimaryKey && colType === 'INTEGER' && (
                <label className="flex items-center gap-2 cursor-pointer pl-6">
                  <input
                    type="checkbox"
                    checked={isAutoIncrement}
                    onChange={(e) => setIsAutoIncrement(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="text-neutral-300">AUTOINCREMENT</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnique}
                  onChange={(e) => setIsUnique(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-neutral-200">UNIQUE (Nilai harus unik)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isNullable}
                  onChange={(e) => setIsNullable(!e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <span className="text-neutral-200">NOT NULL (Wajib diisi)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nilai Default (Opsional)
              </label>
              <input
                type="text"
                value={colDefault}
                onChange={(e) => setColDefault(e.target.value)}
                placeholder="0, 'pending', dll."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddColModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Tambah Kolom
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
