/**
 * Nusantara App Builder - Component Palette (Phase 3)
 * Categorized, searchable Android component palette with drag-and-drop & click-to-add support.
 */

import React, { useState } from 'react';
import {
  Search,
  Rows,
  Columns,
  CreditCard,
  ScrollText,
  Box,
  Heading1,
  Type,
  Tag,
  RectangleHorizontal,
  FormInput,
  KeyRound,
  CheckSquare,
  ToggleRight,
  Disc,
  Image as ImageIcon,
  Minus,
  Maximize2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  DollarSign,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useTranslation } from '../../localization/useTranslation';
import { useDesignerStore } from '../../../store/designerStore';
import {
  COMPONENT_CATALOGUE,
  CATEGORIES_METADATA,
} from '../catalogue/componentCatalogue';
import { ComponentType, ComponentPaletteItem } from '../../../types/visualDesigner';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rows,
  Columns,
  CreditCard,
  ScrollText,
  Box,
  Heading1,
  Type,
  Tag,
  RectangleHorizontal,
  FormInput,
  KeyRound,
  CheckSquare,
  ToggleRight,
  Disc,
  Image: ImageIcon,
  ImageIcon,
  Minus,
  Maximize2,
  Loader2,
  DollarSign,
  Award,
  Sparkles,
  Layers,
};

export const ComponentPalette: React.FC = () => {
  const { lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const addComponent = useDesignerStore((s) => s.addComponent);
  const selectedComponentId = useDesignerStore((s) => s.selectedComponentId);

  const isIndo = lang === 'id';

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/nusantara-component', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClickAdd = (type: ComponentType) => {
    // Adds to the currently selected container if valid, or root layout
    addComponent(type, selectedComponentId || undefined);
  };

  const filteredItems = COMPONENT_CATALOGUE.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q) || item.nameId.toLowerCase().includes(q);
    const descMatch = item.description.toLowerCase().includes(q) || item.descriptionId.toLowerCase().includes(q);
    const typeMatch = item.type.toLowerCase().includes(q);
    return nameMatch || descMatch || typeMatch;
  });

  return (
    <aside className="w-64 h-full bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 select-none text-xs">
      {/* Search Header */}
      <div className="p-2.5 border-b border-neutral-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isIndo ? 'Cari komponen Android...' : 'Search components...'}
            className="w-full bg-neutral-950 border border-neutral-700/80 rounded pl-8 pr-2.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories & Components List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {CATEGORIES_METADATA.map((cat) => {
          const items = filteredItems.filter((i) => i.category === cat.id);
          if (items.length === 0) return null;

          const isCollapsed = !!collapsedCategories[cat.id];

          return (
            <div key={cat.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-1.5 py-1 text-[11px] font-semibold text-neutral-400 hover:text-neutral-200 uppercase tracking-wider cursor-pointer"
              >
                <span>{isIndo ? cat.nameId : cat.name}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Items in Category */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-1">
                  {items.map((item) => {
                    const IconComp = ICON_MAP[item.iconName] || Box;

                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.type)}
                        onClick={() => handleClickAdd(item.type)}
                        className="group flex items-center justify-between p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/40 hover:border-blue-500/60 transition-all cursor-grab active:cursor-grabbing hover:shadow-xs"
                        title={
                          isIndo
                            ? `${item.nameId} — Seret ke kanvas atau klik untuk menambahkan`
                            : `${item.name} — Drag to canvas or click to add`
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded bg-neutral-700/60 group-hover:bg-blue-600/20 text-neutral-300 group-hover:text-blue-400 flex items-center justify-center shrink-0 transition-colors">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
                              {isIndo ? item.nameId : item.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              {isIndo ? item.descriptionId : item.description}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClickAdd(item.type);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-600 text-neutral-300 hover:text-white transition-opacity shrink-0 cursor-pointer"
                          title={isIndo ? 'Tambahkan ke kanvas' : 'Add to canvas'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-neutral-400 text-xs">
            {isIndo ? 'Tidak ada komponen yang cocok' : 'No components found'}
          </div>
        )}
      </div>

      {/* Palette footer info */}
      <div className="p-2.5 border-t border-neutral-800 bg-neutral-950/40 text-[10px] text-neutral-400">
        <p className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>{isIndo ? 'Trik: Seret atau klik untuk menyisipkan' : 'Tip: Drag or click to insert'}</span>
        </p>
      </div>
    </aside>
  );
};
