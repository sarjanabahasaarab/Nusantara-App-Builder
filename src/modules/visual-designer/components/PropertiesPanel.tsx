/**
 * Nusantara App Builder - Properties Panel (Phase 3)
 * Real-time inspection and editing of Android component properties, layout attributes, and behavior.
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  Layout,
  Palette,
  Maximize2,
  Trash2,
  Copy,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import {
  collectAllComponentIds,
  findComponentById,
  validateComponentId,
} from '../validation/designValidator';
import {
  ComponentProperties,
  LayoutDimension,
  ComponentVisibility,
  TextAlignment,
  ImageScaleType,
  ButtonActionType,
} from '../../../types/visualDesigner';

export const PropertiesPanel: React.FC = () => {
  const { lang } = useTranslation();
  const design = useDesignerStore((s) => s.design);
  const activeScreenId = useDesignerStore((s) => s.activeScreenId);
  const selectedComponentId = useDesignerStore((s) => s.selectedComponentId);
  const updateComponentProperties = useDesignerStore((s) => s.updateComponentProperties);
  const deleteComponent = useDesignerStore((s) => s.deleteComponent);
  const duplicateComponent = useDesignerStore((s) => s.duplicateComponent);

  const [activeTab, setActiveTab] = useState<'general' | 'specific' | 'layout'>('specific');
  const [idInput, setIdInput] = useState('');
  const [idError, setIdError] = useState<string | null>(null);

  const isIndo = lang === 'id';

  const currentScreen = design?.screens.find((s) => s.id === activeScreenId);
  const selectedComponent =
    currentScreen && selectedComponentId
      ? findComponentById(currentScreen.root, selectedComponentId)
      : null;

  useEffect(() => {
    if (selectedComponent) {
      setIdInput(selectedComponent.id);
      setIdError(null);
    }
  }, [selectedComponentId, selectedComponent?.id]);

  if (!selectedComponent) {
    return (
      <aside className="w-72 h-full bg-neutral-900 border-l border-neutral-800 flex flex-col items-center justify-center p-6 text-center select-none shrink-0 text-xs text-neutral-400">
        <Sliders className="w-8 h-8 text-neutral-600 mb-2" />
        <span className="font-semibold text-neutral-300">
          {isIndo ? 'Tidak Ada Komponen Terpilih' : 'No Component Selected'}
        </span>
        <p className="mt-1 text-[11px] text-neutral-400">
          {isIndo
            ? 'Pilih komponen pada kanvas atau tambahkan komponen baru untuk mengubah propertinya.'
            : 'Select a component on the canvas to configure its Android attributes.'}
        </p>
      </aside>
    );
  }

  const p = selectedComponent.properties;
  const isRoot = currentScreen?.root.id === selectedComponent.id;

  const handleIdChange = (newVal: string) => {
    setIdInput(newVal);
    if (!currentScreen) return;
    const existingIds = collectAllComponentIds(currentScreen.root);
    const validation = validateComponentId(newVal, existingIds, selectedComponent.id);

    if (!validation.isValid) {
      setIdError(validation.error || 'ID tidak valid');
    } else {
      setIdError(null);
      updateComponentProperties(selectedComponent.id, { id: newVal.trim() });
    }
  };

  const handlePropChange = (key: keyof ComponentProperties, value: unknown) => {
    updateComponentProperties(selectedComponent.id, { [key]: value });
  };

  return (
    <aside className="w-80 h-full bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0 select-none text-xs">
      {/* Header with Type & Actions */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-400">
            {selectedComponent.type}
          </div>
          <div className="font-semibold text-neutral-100 truncate">
            {selectedComponent.name || selectedComponent.id}
          </div>
        </div>

        {!isRoot && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => duplicateComponent(selectedComponent.id)}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              title={isIndo ? 'Gandakan Komponen' : 'Duplicate'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteComponent(selectedComponent.id)}
              className="p-1.5 rounded hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 cursor-pointer"
              title={isIndo ? 'Hapus Komponen' : 'Delete'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/40 text-[11px] font-medium">
        <button
          onClick={() => setActiveTab('specific')}
          className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'specific'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {isIndo ? 'Spesifik' : 'Specific'}
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'layout'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {isIndo ? 'Tata Letak' : 'Layout'}
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 text-center transition-colors cursor-pointer border-b-2 ${
            activeTab === 'general'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {isIndo ? 'Umum' : 'General'}
        </button>
      </div>

      {/* Property Controls Form */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* SPECIFIC PROPERTIES TAB */}
        {activeTab === 'specific' && (
          <div className="space-y-3.5">
            {/* TEXT / HEADING / LABEL PROPERTIES */}
            {['heading', 'text', 'label'].includes(selectedComponent.type) && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Konten Teks' : 'Text Content'}
                  </label>
                  <textarea
                    rows={3}
                    value={p.text || ''}
                    onChange={(e) => handlePropChange('text', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded p-2 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Ukuran Font (sp)' : 'Font Size (sp)'}
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={p.textSize || 14}
                      onChange={(e) => handlePropChange('textSize', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Gaya Teks' : 'Text Style'}
                    </label>
                    <select
                      value={p.textStyle || 'normal'}
                      onChange={(e) => handlePropChange('textStyle', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold (Tebal)</option>
                      <option value="italic">Italic (Miring)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Warna Teks (Hex)' : 'Text Color'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={p.textColor || '#FFFFFF'}
                        onChange={(e) => handlePropChange('textColor', e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={p.textColor || '#FFFFFF'}
                        onChange={(e) => handlePropChange('textColor', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Perataan Teks' : 'Alignment'}
                    </label>
                    <select
                      value={p.textAlignment || 'start'}
                      onChange={(e) => handlePropChange('textAlignment', e.target.value as TextAlignment)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="start">{isIndo ? 'Kiri (Start)' : 'Left (Start)'}</option>
                      <option value="center">{isIndo ? 'Tengah (Center)' : 'Center'}</option>
                      <option value="end">{isIndo ? 'Kanan (End)' : 'Right (End)'}</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* BUTTON PROPERTIES */}
            {selectedComponent.type === 'button' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Label Tombol' : 'Button Label'}
                  </label>
                  <input
                    type="text"
                    value={p.buttonLabel || ''}
                    onChange={(e) => handlePropChange('buttonLabel', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Warna Latar' : 'Background Tint'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={p.buttonBackgroundColor || '#2563EB'}
                        onChange={(e) => handlePropChange('buttonBackgroundColor', e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={p.buttonBackgroundColor || '#2563EB'}
                        onChange={(e) => handlePropChange('buttonBackgroundColor', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Warna Teks' : 'Text Color'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={p.buttonTextColor || '#FFFFFF'}
                        onChange={(e) => handlePropChange('buttonTextColor', e.target.value)}
                        className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={p.buttonTextColor || '#FFFFFF'}
                        onChange={(e) => handlePropChange('buttonTextColor', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Sudut Membulat (dp)' : 'Corner Radius (dp)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={p.cornerRadius || 8}
                      onChange={(e) => handlePropChange('cornerRadius', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Jenis Aksi Klik' : 'Click Action'}
                    </label>
                    <select
                      value={p.actionType || 'toast'}
                      onChange={(e) => handlePropChange('actionType', e.target.value as ButtonActionType)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="none">{isIndo ? 'Tidak Ada' : 'None'}</option>
                      <option value="toast">{isIndo ? 'Pesan Toast' : 'Toast Notification'}</option>
                      <option value="navigate">{isIndo ? 'Buka Layar Lain' : 'Navigate Screen'}</option>
                      <option value="openUrl">{isIndo ? 'Buka Website' : 'Open URL'}</option>
                    </select>
                  </div>
                </div>

                {p.actionType && p.actionType !== 'none' && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {p.actionType === 'toast'
                        ? isIndo
                          ? 'Teks Pesan Toast'
                          : 'Toast Message'
                        : p.actionType === 'openUrl'
                        ? 'URL Website (https://)'
                        : isIndo
                        ? 'Nama Layar Target'
                        : 'Target Screen ID'}
                    </label>
                    <input
                      type="text"
                      value={p.actionPayload || ''}
                      onChange={(e) => handlePropChange('actionPayload', e.target.value)}
                      placeholder={
                        p.actionType === 'openUrl'
                          ? 'https://google.com'
                          : p.actionType === 'toast'
                          ? 'Halo dari Android!'
                          : 'screen_detail'
                      }
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                )}
              </>
            )}

            {/* TEXT FIELD & PASSWORD PROPERTIES */}
            {['textField', 'passwordField'].includes(selectedComponent.type) && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Petunjuk (Hint / Placeholder)' : 'Hint / Placeholder'}
                  </label>
                  <input
                    type="text"
                    value={p.hint || ''}
                    onChange={(e) => handlePropChange('hint', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Tipe Input (InputType)' : 'Input Type'}
                  </label>
                  <select
                    value={p.inputType || 'text'}
                    onChange={(e) => handlePropChange('inputType', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="text">Teks Standar</option>
                    <option value="number">Angka / Bilangan</option>
                    <option value="textEmailAddress">Alamat Email</option>
                    <option value="phone">Nomor Telepon</option>
                    <option value="textPassword">Kata Sandi (Password)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cb_required"
                    checked={!!p.isRequired}
                    onChange={(e) => handlePropChange('isRequired', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="cb_required" className="text-xs text-neutral-300 cursor-pointer">
                    {isIndo ? 'Wajib diisi (Required)' : 'Required field'}
                  </label>
                </div>
              </>
            )}

            {/* CHECKBOX / SWITCH / RADIO PROPERTIES */}
            {['checkbox', 'switch', 'radioButton'].includes(selectedComponent.type) && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Label Pilihan' : 'Control Label'}
                  </label>
                  <input
                    type="text"
                    value={p.label || ''}
                    onChange={(e) => handlePropChange('label', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cb_checked_default"
                    checked={!!p.isChecked}
                    onChange={(e) => handlePropChange('isChecked', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="cb_checked_default" className="text-xs text-neutral-300 cursor-pointer">
                    {isIndo ? 'Status Awal Aktif (Checked)' : 'Checked by default'}
                  </label>
                </div>
              </>
            )}

            {/* IMAGE PROPERTIES */}
            {selectedComponent.type === 'image' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'URL / Sumber Gambar' : 'Image URL / Source'}
                  </label>
                  <input
                    type="text"
                    value={p.imageSrc || ''}
                    onChange={(e) => handlePropChange('imageSrc', e.target.value)}
                    placeholder="https://... atau drawable/name"
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Deskripsi Aksesibilitas' : 'Content Description'}
                  </label>
                  <input
                    type="text"
                    value={p.contentDescription || ''}
                    onChange={(e) => handlePropChange('contentDescription', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Mode Skala (ScaleType)' : 'Scale Type'}
                  </label>
                  <select
                    value={p.scaleType || 'centerCrop'}
                    onChange={(e) => handlePropChange('scaleType', e.target.value as ImageScaleType)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="centerCrop">centerCrop (Penuh potong tengah)</option>
                    <option value="fitCenter">fitCenter (Muat seluruh gambar)</option>
                    <option value="centerInside">centerInside (Pusat di dalam)</option>
                    <option value="fitXY">fitXY (Rentangkan)</option>
                  </select>
                </div>
              </>
            )}

            {/* CARD PROPERTIES */}
            {selectedComponent.type === 'card' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Elevasi (dp)' : 'Elevation (dp)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={p.elevation || 4}
                      onChange={(e) => handlePropChange('elevation', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Sudut Bulat (dp)' : 'Corner Radius (dp)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={32}
                      value={p.cardCornerRadius || 12}
                      onChange={(e) => handlePropChange('cardCornerRadius', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Warna Latar Kartu' : 'Card Background'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={p.backgroundColor || '#1E293B'}
                      onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                      className="w-7 h-7 rounded border border-neutral-700 bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={p.backgroundColor || '#1E293B'}
                      onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* PROGRESS BAR PROPERTIES */}
            {selectedComponent.type === 'progressBar' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Nilai Progres' : 'Progress Value'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={p.maxProgress || 100}
                      value={p.progress || 50}
                      onChange={(e) => handlePropChange('progress', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Nilai Maksimum' : 'Max Value'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={p.maxProgress || 100}
                      onChange={(e) => handlePropChange('maxProgress', Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    {isIndo ? 'Gaya Progres' : 'Progress Style'}
                  </label>
                  <select
                    value={p.progressStyle || 'horizontal'}
                    onChange={(e) => handlePropChange('progressStyle', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="horizontal">Horizontal Bar</option>
                    <option value="circular">Circular Spinner</option>
                  </select>
                </div>
              </>
            )}

            {/* ADMOB & MONETIZATION PROPERTIES (Phase 9) */}
            {['admobBanner', 'admobInterstitial', 'admobRewarded', 'admobNative'].includes(
              selectedComponent.type
            ) && (
              <>
                <div className="p-2.5 bg-amber-950/20 border border-amber-800/60 rounded-lg text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider">
                      AdMob Integration Settings
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      Phase 9
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Ad Unit ID Android' : 'Android Ad Unit ID'}
                    </label>
                    <input
                      type="text"
                      value={p.adUnitId || ''}
                      onChange={(e) => handlePropChange('adUnitId', e.target.value)}
                      placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  {selectedComponent.type === 'admobBanner' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                          {isIndo ? 'Ukuran Banner (AdSize)' : 'Banner Size'}
                        </label>
                        <select
                          value={p.adSize || 'BANNER'}
                          onChange={(e) => handlePropChange('adSize', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                        >
                          <option value="BANNER">Standard Banner (320x50)</option>
                          <option value="LARGE_BANNER">Large Banner (320x100)</option>
                          <option value="MEDIUM_RECTANGLE">Medium Rectangle (300x250)</option>
                          <option value="FULL_BANNER">Full Banner (468x60)</option>
                          <option value="LEADERBOARD">Leaderboard (728x90)</option>
                          <option value="SMART_BANNER">Smart / Adaptive Banner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                          {isIndo ? 'Posisi Penempatan' : 'Position'}
                        </label>
                        <select
                          value={p.adPosition || 'bottom'}
                          onChange={(e) => handlePropChange('adPosition', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                        >
                          <option value="bottom">{isIndo ? 'Bagian Bawah (Bottom)' : 'Bottom'}</option>
                          <option value="top">{isIndo ? 'Bagian Atas (Top)' : 'Top'}</option>
                          <option value="custom">{isIndo ? 'Kustom / Dalam Alur Konten' : 'Custom Flow'}</option>
                        </select>
                      </div>
                    </>
                  )}

                  {selectedComponent.type === 'admobInterstitial' && (
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                        {isIndo ? 'Pemicu Iklan (Trigger)' : 'Ad Trigger'}
                      </label>
                      <select
                        value={p.adTrigger || 'after_navigation'}
                        onChange={(e) => handlePropChange('adTrigger', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="after_navigation">{isIndo ? 'Setelah Navigasi Layar' : 'After Navigation'}</option>
                        <option value="after_page">{isIndo ? 'Setelah Pergantian Halaman' : 'After Page'}</option>
                        <option value="after_action">{isIndo ? 'Setelah Aksi Tombol' : 'After Action'}</option>
                        <option value="manual">{isIndo ? 'Manual / Kode Program' : 'Manual / Code'}</option>
                      </select>
                    </div>
                  )}

                  {selectedComponent.type === 'admobRewarded' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                          {isIndo ? 'Nama Hadiah' : 'Reward Name'}
                        </label>
                        <input
                          type="text"
                          value={p.adRewardName || 'Coin'}
                          onChange={(e) => handlePropChange('adRewardName', e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                          {isIndo ? 'Jumlah Hadiah' : 'Reward Amount'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={p.adRewardAmount || 100}
                          onChange={(e) => handlePropChange('adRewardAmount', Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedComponent.type === 'admobNative' && (
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                        {isIndo ? 'Templat Native Ads' : 'Native Ad Template'}
                      </label>
                      <select
                        value={p.nativeTemplate || 'medium'}
                        onChange={(e) => handlePropChange('nativeTemplate', e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="small">Small Template (Compact)</option>
                        <option value="medium">Medium Template (Standard Card)</option>
                        <option value="large">Large Template (Feature Media)</option>
                        <option value="custom">Custom Template Layout</option>
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
            {/* Dimensions (Width / Height) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  {isIndo ? 'Lebar (Width)' : 'Width'}
                </label>
                <select
                  value={
                    typeof p.width === 'number'
                      ? 'fixed'
                      : p.width || 'wrap_content'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'fixed') handlePropChange('width', 120);
                    else handlePropChange('width', val as LayoutDimension);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="match_parent">match_parent</option>
                  <option value="wrap_content">wrap_content</option>
                  <option value="fixed">Fixed dp</option>
                </select>
                {typeof p.width === 'number' && (
                  <input
                    type="number"
                    min={0}
                    value={p.width}
                    onChange={(e) => handlePropChange('width', Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100"
                    placeholder="Nilai dp"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  {isIndo ? 'Tinggi (Height)' : 'Height'}
                </label>
                <select
                  value={
                    typeof p.height === 'number'
                      ? 'fixed'
                      : p.height || 'wrap_content'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'fixed') handlePropChange('height', 80);
                    else handlePropChange('height', val as LayoutDimension);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="wrap_content">wrap_content</option>
                  <option value="match_parent">match_parent</option>
                  <option value="fixed">Fixed dp</option>
                </select>
                {typeof p.height === 'number' && (
                  <input
                    type="number"
                    min={0}
                    value={p.height}
                    onChange={(e) => handlePropChange('height', Math.max(0, Number(e.target.value)))}
                    className="mt-1 w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1 text-xs text-neutral-100"
                    placeholder="Nilai dp"
                  />
                )}
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
                {isIndo ? 'Margin Luar (dp)' : 'Margins (dp)'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <span className="text-[10px] text-neutral-400">Atas</span>
                  <input
                    type="number"
                    min={0}
                    value={p.marginTop || 0}
                    onChange={(e) => handlePropChange('marginTop', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Bawah</span>
                  <input
                    type="number"
                    min={0}
                    value={p.marginBottom || 0}
                    onChange={(e) => handlePropChange('marginBottom', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Kiri</span>
                  <input
                    type="number"
                    min={0}
                    value={p.marginStart || 0}
                    onChange={(e) => handlePropChange('marginStart', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Kanan</span>
                  <input
                    type="number"
                    min={0}
                    value={p.marginEnd || 0}
                    onChange={(e) => handlePropChange('marginEnd', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* Paddings */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1.5">
                {isIndo ? 'Padding Dalam (dp)' : 'Padding (dp)'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <span className="text-[10px] text-neutral-400">Atas</span>
                  <input
                    type="number"
                    min={0}
                    value={p.paddingTop || 0}
                    onChange={(e) => handlePropChange('paddingTop', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Bawah</span>
                  <input
                    type="number"
                    min={0}
                    value={p.paddingBottom || 0}
                    onChange={(e) => handlePropChange('paddingBottom', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Kiri</span>
                  <input
                    type="number"
                    min={0}
                    value={p.paddingStart || 0}
                    onChange={(e) => handlePropChange('paddingStart', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400">Kanan</span>
                  <input
                    type="number"
                    min={0}
                    value={p.paddingEnd || 0}
                    onChange={(e) => handlePropChange('paddingEnd', Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-1.5 py-1 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* Container Orientation & Spacing */}
            {['linearLayout', 'verticalLayout', 'horizontalLayout'].includes(selectedComponent.type) && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Orientasi' : 'Orientation'}
                    </label>
                    <select
                      value={p.orientation || 'vertical'}
                      onChange={(e) => handlePropChange('orientation', e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {isIndo ? 'Jarak Antara (dp)' : 'Child Spacing (dp)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={48}
                      value={p.spacing || 8}
                      onChange={(e) => handlePropChange('spacing', Math.max(0, Number(e.target.value)))}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-3.5">
            {/* Component ID */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                {isIndo ? 'ID Komponen (Resource ID)' : 'Component ID'}
              </label>
              <input
                type="text"
                value={idInput}
                onChange={(e) => handleIdChange(e.target.value)}
                disabled={isRoot}
                className={`w-full bg-neutral-950 border rounded px-2.5 py-1.5 text-xs text-neutral-100 font-mono focus:outline-hidden ${
                  idError ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-700/80 focus:border-blue-500'
                } ${isRoot ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {idError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{idError}</span>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                {isIndo ? 'Nama Label Desain' : 'Design Name'}
              </label>
              <input
                type="text"
                value={selectedComponent.name || ''}
                onChange={(e) => handlePropChange('name', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                {isIndo ? 'Visibilitas Android' : 'Visibility'}
              </label>
              <select
                value={p.visibility || 'visible'}
                onChange={(e) => handlePropChange('visibility', e.target.value as ComponentVisibility)}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded px-2.5 py-1.5 text-xs text-neutral-100 focus:outline-hidden focus:border-blue-500"
              >
                <option value="visible">visible (Tampak)</option>
                <option value="invisible">invisible (Tersembunyi tapi memakai ruang)</option>
                <option value="gone">gone (Hilang sepenuhnya tanpa memakan ruang)</option>
              </select>
            </div>

            {/* Opacity / Alpha */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span>{isIndo ? 'Opasitas (Alpha)' : 'Opacity (Alpha)'}</span>
                <span className="font-mono">{Math.round((p.opacity ?? 1.0) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={p.opacity ?? 1.0}
                onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-neutral-800 bg-neutral-950/40 text-[10px] text-neutral-400">
        <p>Android XML ID: <span className="font-mono text-neutral-300">@+id/{selectedComponent.id}</span></p>
      </div>
    </aside>
  );
};
