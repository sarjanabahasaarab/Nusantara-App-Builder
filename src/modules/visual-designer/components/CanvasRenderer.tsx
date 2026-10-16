/**
 * Nusantara App Builder - Canvas Component Renderer (Phase 3)
 * Recursive renderer for Android components with selection outline, drag-and-drop targets, and interactive preview mode.
 */

import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { VisualComponent, ComponentType } from '../../../types/visualDesigner';
import { useDesignerStore } from '../../../store/designerStore';
import { canAcceptChildren } from '../validation/designValidator';
import { useUiStore } from '../../../store/uiStore';

interface CanvasRendererProps {
  component: VisualComponent;
  isRoot?: boolean;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ component, isRoot = false }) => {
  const selectedComponentId = useDesignerStore((s) => s.selectedComponentId);
  const selectComponent = useDesignerStore((s) => s.selectComponent);
  const deleteComponent = useDesignerStore((s) => s.deleteComponent);
  const duplicateComponent = useDesignerStore((s) => s.duplicateComponent);
  const reorderComponent = useDesignerStore((s) => s.reorderComponent);
  const addComponent = useDesignerStore((s) => s.addComponent);
  const moveComponent = useDesignerStore((s) => s.moveComponent);
  const isPreviewMode = useDesignerStore((s) => s.isPreviewMode);
  const showToast = useUiStore((s) => s.showToast);

  const [isDragOver, setIsDragOver] = useState(false);
  const [interactiveChecked, setInteractiveChecked] = useState(!!component.properties.isChecked);
  const [interactiveInputVal, setInteractiveInputVal] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isSelected = selectedComponentId === component.id && !isPreviewMode;
  const p = component.properties;
  const acceptsChildren = canAcceptChildren(component.type);

  // Drag over handler for containers
  const handleDragOver = (e: React.DragEvent) => {
    if (!acceptsChildren || isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!acceptsChildren || isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Case 1: Dragging a new component from palette
    const newComponentType = e.dataTransfer.getData('application/nusantara-component') as ComponentType;
    if (newComponentType) {
      addComponent(newComponentType, component.id);
      return;
    }

    // Case 2: Moving an existing component
    const movedSourceId = e.dataTransfer.getData('application/nusantara-move-id');
    if (movedSourceId && movedSourceId !== component.id) {
      moveComponent(movedSourceId, component.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isRoot || isPreviewMode) return;
    e.stopPropagation();
    e.dataTransfer.setData('application/nusantara-move-id', component.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      selectComponent(component.id);
    } else {
      // Interactive Mode handling
      if (component.type === 'button') {
        if (p.actionType === 'toast' || !p.actionType || p.actionType === 'none') {
          showToast(p.actionPayload || `Aksi Tombol '${p.buttonLabel || 'Button'}' dipicu!`);
        } else if (p.actionType === 'openUrl' && p.actionPayload) {
          showToast(`Membuka URL: ${p.actionPayload}`);
        } else if (p.actionType === 'navigate') {
          showToast(`Navigasi ke layar: ${p.actionPayload || 'Next Screen'}`);
        }
      }
    }
  };

  // Build styles
  const style: React.CSSProperties = {
    marginTop: p.marginTop ? `${p.marginTop}px` : undefined,
    marginBottom: p.marginBottom ? `${p.marginBottom}px` : undefined,
    marginLeft: p.marginStart ? `${p.marginStart}px` : undefined,
    marginRight: p.marginEnd ? `${p.marginEnd}px` : undefined,
    paddingTop: p.paddingTop ? `${p.paddingTop}px` : undefined,
    paddingBottom: p.paddingBottom ? `${p.paddingBottom}px` : undefined,
    paddingLeft: p.paddingStart ? `${p.paddingStart}px` : undefined,
    paddingRight: p.paddingEnd ? `${p.paddingEnd}px` : undefined,
    backgroundColor: p.backgroundColor || undefined,
    opacity: p.opacity !== undefined ? p.opacity : 1.0,
    width: p.width === 'match_parent' ? '100%' : typeof p.width === 'number' ? `${p.width}px` : 'auto',
    height: p.height === 'match_parent' ? '100%' : typeof p.height === 'number' ? `${p.height}px` : 'auto',
    display: p.visibility === 'gone' ? 'none' : undefined,
    visibility: p.visibility === 'invisible' ? 'hidden' : 'visible',
  };

  // Render Component Inner Content
  const renderInner = () => {
    switch (component.type) {
      case 'linearLayout':
      case 'verticalLayout':
      case 'horizontalLayout': {
        const isHorizontal =
          component.type === 'horizontalLayout' || p.orientation === 'horizontal';

        return (
          <div
            className={`w-full flex ${
              isHorizontal ? 'flex-row' : 'flex-col'
            } min-h-[40px] relative transition-colors ${
              acceptsChildren && isDragOver ? 'bg-blue-950/40' : ''
            }`}
            style={{
              gap: p.spacing ? `${p.spacing}px` : '8px',
              justifyContent: p.gravity === 'center' ? 'center' : undefined,
              alignItems: p.gravity === 'center' ? 'center' : undefined,
            }}
          >
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <CanvasRenderer key={child.id} component={child} />
              ))
            ) : (
              <div className="w-full py-4 border border-dashed border-neutral-700/60 rounded flex items-center justify-center text-[11px] text-neutral-400 select-none">
                {isRoot ? 'Seret komponen dari panel kiri ke sini' : 'Area kontainer kosong (Drop di sini)'}
              </div>
            )}
          </div>
        );
      }

      case 'card': {
        return (
          <div
            className="w-full rounded-xl transition-all relative overflow-hidden"
            style={{
              backgroundColor: p.backgroundColor || '#1E293B',
              borderRadius: p.cardCornerRadius ? `${p.cardCornerRadius}px` : '12px',
              boxShadow: p.elevation
                ? `0 ${p.elevation * 1.5}px ${p.elevation * 3}px rgba(0, 0, 0, 0.35)`
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex flex-col gap-2">
              {component.children && component.children.length > 0 ? (
                component.children.map((child) => (
                  <CanvasRenderer key={child.id} component={child} />
                ))
              ) : (
                <div className="p-4 border border-dashed border-neutral-600/50 rounded flex items-center justify-center text-[11px] text-neutral-400">
                  Kontainer Kartu Kosong (Drop komponen di sini)
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'scrollView': {
        return (
          <div className="w-full h-full overflow-y-auto max-h-[500px] flex flex-col gap-2 pr-1">
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <CanvasRenderer key={child.id} component={child} />
              ))
            ) : (
              <div className="p-6 border border-dashed border-neutral-700 rounded text-center text-xs text-neutral-400">
                ScrollView Kosong (Drop komponen di sini)
              </div>
            )}
          </div>
        );
      }

      case 'container': {
        return (
          <div className="w-full relative min-h-[40px] flex flex-col gap-2">
            {component.children && component.children.length > 0 ? (
              component.children.map((child) => (
                <CanvasRenderer key={child.id} component={child} />
              ))
            ) : (
              <div className="p-3 border border-dashed border-neutral-700 rounded text-center text-xs text-neutral-400">
                FrameLayout Kontainer
              </div>
            )}
          </div>
        );
      }

      case 'heading': {
        return (
          <h2
            className="font-bold tracking-tight select-none"
            style={{
              fontSize: p.textSize ? `${p.textSize}px` : '22px',
              color: p.textColor || '#FFFFFF',
              textAlign: p.textAlignment || 'left',
            }}
          >
            {p.text || 'Judul Halaman'}
          </h2>
        );
      }

      case 'text': {
        return (
          <p
            className="leading-relaxed select-none"
            style={{
              fontSize: p.textSize ? `${p.textSize}px` : '14px',
              color: p.textColor || '#94A3B8',
              fontWeight: p.textStyle === 'bold' ? 'bold' : 'normal',
              fontStyle: p.textStyle === 'italic' ? 'italic' : 'normal',
              textAlign: p.textAlignment || 'left',
            }}
          >
            {p.text || 'Teks deskripsi'}
          </p>
        );
      }

      case 'label': {
        return (
          <span
            className="inline-block font-semibold select-none"
            style={{
              fontSize: p.textSize ? `${p.textSize}px` : '12px',
              color: p.textColor || '#38BDF8',
            }}
          >
            {p.text || 'Label'}
          </span>
        );
      }

      case 'button': {
        return (
          <button
            type="button"
            className="w-full py-2.5 px-4 font-semibold text-center transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: p.buttonBackgroundColor || '#2563EB',
              color: p.buttonTextColor || '#FFFFFF',
              borderRadius: p.cornerRadius ? `${p.cornerRadius}px` : '8px',
              fontSize: p.textSize ? `${p.textSize}px` : '14px',
            }}
          >
            {p.buttonLabel || 'Tombol Aksi'}
          </button>
        );
      }

      case 'textField':
      case 'passwordField': {
        const isPass = component.type === 'passwordField' || p.isPassword;
        return (
          <div className="w-full flex flex-col gap-1">
            <div className="relative">
              <input
                type={isPass && !showPassword ? 'password' : 'text'}
                value={interactiveInputVal}
                onChange={(e) => setInteractiveInputVal(e.target.value)}
                placeholder={p.hint || (isPass ? 'Kata Sandi...' : 'Ketik teks di sini...')}
                readOnly={!isPreviewMode}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
              {isPass && isPreviewMode && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        );
      }

      case 'checkbox': {
        return (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPreviewMode ? interactiveChecked : !!p.isChecked}
              onChange={(e) => {
                if (isPreviewMode) setInteractiveChecked(e.target.checked);
              }}
              className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-neutral-200">{p.label || 'Opsi Centang'}</span>
          </label>
        );
      }

      case 'switch': {
        const checked = isPreviewMode ? interactiveChecked : !!p.isChecked;
        return (
          <div
            className="flex items-center justify-between w-full py-1 cursor-pointer select-none"
            onClick={() => {
              if (isPreviewMode) setInteractiveChecked(!interactiveChecked);
            }}
          >
            <span className="text-xs text-neutral-200">{p.label || 'Opsi Sakelar'}</span>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                checked ? 'bg-blue-600' : 'bg-neutral-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  checked ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        );
      }

      case 'radioButton': {
        return (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="radio"
              checked={isPreviewMode ? interactiveChecked : !!p.isChecked}
              onChange={() => {
                if (isPreviewMode) setInteractiveChecked(true);
              }}
              className="w-4 h-4 border-neutral-600 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-neutral-200">{p.label || 'Pilihan Radio'}</span>
          </label>
        );
      }

      case 'image': {
        return (
          <div
            className="w-full bg-neutral-800 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-700/50"
            style={{
              height: typeof p.height === 'number' ? `${p.height}px` : '160px',
            }}
          >
            {p.imageSrc ? (
              <img
                src={p.imageSrc}
                alt={p.contentDescription || 'Android View'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-neutral-400 text-xs">
                <div>[ImageView]</div>
                <div className="text-[10px] mt-1">{p.contentDescription || 'Pratinjau Gambar'}</div>
              </div>
            )}
          </div>
        );
      }

      case 'imageButton': {
        return (
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-500 cursor-pointer"
          >
            <Check className="w-4 h-4" />
          </button>
        );
      }

      case 'divider': {
        return (
          <div
            className="w-full my-2"
            style={{
              height: typeof p.height === 'number' ? `${p.height}px` : '1px',
              backgroundColor: p.backgroundColor || '#374151',
            }}
          />
        );
      }

      case 'spacer': {
        return (
          <div
            style={{
              height: typeof p.height === 'number' ? `${p.height}px` : '16px',
              width: typeof p.width === 'number' ? `${p.width}px` : '100%',
            }}
          />
        );
      }

      case 'progressBar': {
        const val = p.progress || 60;
        const max = p.maxProgress || 100;
        const pct = Math.min(100, Math.max(0, Math.round((val / max) * 100)));

        return (
          <div className="w-full flex flex-col gap-1 my-1">
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Progress</span>
              <span>{pct}%</span>
            </div>
          </div>
        );
      }

      // AdMob & Monetization (Phase 9)
      case 'admobBanner': {
        return (
          <div className="w-full my-1.5 p-2 bg-neutral-900 border-2 border-dashed border-amber-500/70 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 uppercase font-mono">
                AdMob Banner
              </span>
              <span className="text-xs font-medium text-neutral-200">
                {p.adSize || 'BANNER'} (320x50)
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 truncate max-w-[140px]">
              {p.adUnitId || 'ca-app-pub-test'}
            </span>
          </div>
        );
      }

      case 'admobInterstitial': {
        return (
          <div className="w-full my-1.5 p-3 bg-purple-950/30 border border-purple-500/60 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white uppercase font-mono">
                Interstitial
              </span>
              <span className="text-xs text-neutral-200">
                {p.adTrigger === 'after_navigation' ? 'After Navigation' : p.adTrigger || 'Full Screen Controller'}
              </span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">
              Freq: 60s
            </span>
          </div>
        );
      }

      case 'admobRewarded': {
        return (
          <div className="w-full my-1.5 p-3 bg-emerald-950/30 border border-emerald-500/60 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase font-mono">
                Rewarded Ad
              </span>
              <span className="text-xs text-neutral-200 font-semibold">
                +{p.adRewardAmount || 100} {p.adRewardName || 'Coins'}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              onUserEarnedReward
            </span>
          </div>
        );
      }

      case 'admobNative': {
        return (
          <div className="w-full my-1.5 p-3.5 bg-neutral-900 border border-neutral-700 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                  Ad
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Sponsor Headline</span>
                    <span className="text-[8px] font-bold px-1 rounded bg-amber-500 text-neutral-950">
                      Ad
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Sponsored Content</div>
                </div>
              </div>
              <button className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                Install
              </button>
            </div>
            <p className="text-[11px] text-neutral-300">
              Native AdMob Custom Template ({p.nativeTemplate || 'medium'})
            </p>
          </div>
        );
      }

      default:
        return (
          <div className="p-2 border border-red-500/50 bg-red-950/20 text-red-300 text-xs rounded">
            Komponen tidak dikenal: {component.type}
          </div>
        );
    }
  };

  return (
    <div
      draggable={!isRoot && !isPreviewMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={style}
      className={`relative transition-all ${
        !isPreviewMode
          ? isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900 rounded z-20'
            : isDragOver
            ? 'ring-2 ring-emerald-500 ring-dashed rounded z-10'
            : 'hover:ring-1 hover:ring-neutral-600/80 rounded'
          : ''
      }`}
    >
      {/* Selection Halo Action Badges */}
      {isSelected && !isRoot && (
        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 shadow-xl z-30 select-none">
          <span className="text-[10px] font-mono text-blue-400 font-semibold px-1">
            #{component.id}
          </span>

          <div className="h-3 w-[1px] bg-neutral-700" />

          {/* Move Up */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              reorderComponent(component.id, 'up');
            }}
            className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer"
            title="Pindah ke Atas"
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          {/* Move Down */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              reorderComponent(component.id, 'down');
            }}
            className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer"
            title="Pindah ke Bawah"
          >
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Duplicate */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer"
            title="Gandakan (Ctrl+D)"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComponent(component.id);
            }}
            className="p-1 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 rounded cursor-pointer"
            title="Hapus (Delete)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Component Content */}
      {renderInner()}
    </div>
  );
};
