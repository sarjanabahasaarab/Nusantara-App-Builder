/**
 * Nusantara App Builder - Variable Manager
 * Phase 6: Variable definition, typing, default values, and scope management with security guidelines.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  HelpCircle,
  Database,
  Smartphone,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { useLogicStore } from '../store/logicStore';
import { useTranslation } from '../../localization/useTranslation';
import { Variable, VariableType, VariableScope } from '../types';

export const VariableManager: React.FC = () => {
  const { lang } = useTranslation();

  const variables = useLogicStore((s) => s.variables);
  const addVariable = useLogicStore((s) => s.addVariable);
  const updateVariable = useLogicStore((s) => s.updateVariable);
  const deleteVariable = useLogicStore((s) => s.deleteVariable);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<VariableType>('string');
  const [defaultValue, setDefaultValue] = useState('');
  const [scope, setScope] = useState<VariableScope>('screen');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setType('string');
    setDefaultValue('');
    setScope('screen');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (v: Variable) => {
    setEditingId(v.id);
    setName(v.name);
    setType(v.type);
    setDefaultValue(String(v.defaultValue ?? ''));
    setScope(v.scope);
    setDescription(v.description || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let parsedVal: any = defaultValue;
    if (type === 'integer') parsedVal = parseInt(defaultValue) || 0;
    else if (type === 'decimal') parsedVal = parseFloat(defaultValue) || 0.0;
    else if (type === 'boolean') parsedVal = defaultValue === 'true';

    if (editingId) {
      updateVariable(editingId, {
        name: name.trim(),
        type,
        defaultValue: parsedVal,
        scope,
        description: description.trim(),
        isSensitive: name.toLowerCase().includes('pass') || name.toLowerCase().includes('secret'),
      });
    } else {
      addVariable({
        name: name.trim(),
        type,
        defaultValue: parsedVal,
        scope,
        description: description.trim(),
        isSensitive: name.toLowerCase().includes('pass') || name.toLowerCase().includes('secret'),
      });
    }
    setShowModal(false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto space-y-6">
      {/* Top Banner & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>{lang === 'id' ? 'Manajer Variabel Aplikasi (Variables)' : 'Application Variable Manager'}</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {lang === 'id'
              ? 'Definisikan variabel keadaan, data formulir, dan status sesi aplikasi.'
              : 'Define app state variables, form data holders, and session state.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'id' ? 'Buat Variabel Baru' : 'New Variable'}</span>
        </button>
      </div>

      {/* Scope Explanation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Local Scope</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Hanya tersedia di dalam rantai action event terkait.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Screen Scope</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Tersimpan selama layar (Activity) sedang aktif.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>App Scope</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Tersimpan di memori selama aplikasi berjalan.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Persistent Scope</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Disimpan ke memori perangkat (SharedPreferences).
          </div>
        </div>
      </div>

      {/* Variables Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-200">
            {lang === 'id' ? 'Daftar Variabel Terdaftar' : 'Registered Variables'} ({variables.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Nama Variabel</th>
                <th className="py-2.5 px-4 font-semibold">Tipe Data</th>
                <th className="py-2.5 px-4 font-semibold">Nilai Default</th>
                <th className="py-2.5 px-4 font-semibold">Scope (Cakupan)</th>
                <th className="py-2.5 px-4 font-semibold">Deskripsi</th>
                <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {variables.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-100 flex items-center gap-2">
                    <span>{v.name}</span>
                    {v.isSensitive && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-900/60 flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" /> Sensitif
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900/60">
                      {v.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-300">
                    {String(v.defaultValue ?? '') || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        v.scope === 'persistent'
                          ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                          : v.scope === 'app'
                          ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {v.scope}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 truncate max-w-xs">
                    {v.description || '—'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(v)}
                      className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteVariable(v.id)}
                      className="p-1 text-neutral-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Tip Banner */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Pedoman Keamanan Variabel (Security Constitution)</div>
          <p className="mt-1 opacity-90 leading-relaxed text-[11px]">
            Jangan menyimpan kata sandi (password) atau token rahasia server ke dalam variabel dengan cakupan
            <code> persistent</code> tanpa enkripsi tambahan. SharedPreferences di Android dapat dibaca jika perangkat dalam kondisi root. Gunakan variabel <code>screen</code> atau <code>local</code> untuk data sensitif pengguna.
          </p>
        </div>
      </div>

      {/* Modal: Add / Edit Variable */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-bold text-neutral-100">
                {editingId
                  ? lang === 'id'
                    ? 'Ubah Variabel'
                    : 'Edit Variable'
                  : lang === 'id'
                  ? 'Tambah Variabel Baru'
                  : 'New Variable'}
              </span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nama Variabel (Identifier) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="totalHarga"
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Tipe Data
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as VariableType)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
                >
                  <option value="string">String (Teks)</option>
                  <option value="integer">Integer (Bilangan Bulat)</option>
                  <option value="decimal">Decimal (Pecahan / Float)</option>
                  <option value="boolean">Boolean (True / False)</option>
                  <option value="date">Date (Tanggal)</option>
                  <option value="list">List (Array Daftar)</option>
                  <option value="object">Object (JSON Key-Value)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Scope (Cakupan)
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as VariableScope)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
                >
                  <option value="local">Local (Event Saja)</option>
                  <option value="screen">Screen (Layar Aktif)</option>
                  <option value="app">App (Memori Global)</option>
                  <option value="persistent">Persistent (Disk/SharedPrefs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nilai Awal (Default Value)
              </label>
              <input
                type="text"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder={type === 'boolean' ? 'true atau false' : '0 atau teks'}
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Deskripsi
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan fungsi variabel..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-1.5 text-xs text-neutral-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
