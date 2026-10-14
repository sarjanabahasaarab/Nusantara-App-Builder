/**
 * Nusantara App Builder - Visual Designer Store (Phase 3)
 * Zustand store with robust state machine, history stack (Undo/Redo), drag-and-drop, and XML generation.
 */

import { create } from 'zustand';
import { ProjectMetadata } from '../types/project';
import {
  ComponentProperties,
  ComponentType,
  DevicePreset,
  DEVICE_PRESETS,
  GeneratedLayoutResult,
  ScreenOrientation,
  VisualComponent,
  VisualProjectDesign,
  VisualScreen,
} from '../types/visualDesigner';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import {
  canAcceptChildren,
  collectAllComponentIds,
  duplicateComponentWithNewIds,
  findComponentById,
  findParentComponent,
  generateUniqueComponentId,
  isDescendantOf,
} from '../modules/visual-designer/validation/designValidator';
import { COMPONENT_CATALOGUE } from '../modules/visual-designer/catalogue/componentCatalogue';
import { generateAndroidXmlLayout } from '../modules/visual-designer/xml-generator/androidXmlGenerator';
import {
  createDefaultProjectDesign,
  createNewBlankScreen,
} from '../modules/visual-designer/templates/starterScreens';

const MAX_HISTORY_STEPS = 30;

interface DesignerState {
  // Current Design & Navigation
  design: VisualProjectDesign | null;
  activeScreenId: string;
  selectedComponentId: string | null;
  hoveredDropTargetId: string | null;

  // Viewport Settings
  zoom: number;
  orientation: ScreenOrientation;
  devicePreset: string;
  isPreviewMode: boolean; // Interactive test preview mode

  // Storage & State
  isDirty: boolean;
  autoSaveEnabled: boolean;
  lastSaved: string | null;
  isSaving: boolean;
  errorMessage: string | null;

  // History Stacks (Undo/Redo)
  history: VisualProjectDesign[];
  future: VisualProjectDesign[];

  // Modal / Output states
  generatedResult: GeneratedLayoutResult | null;
  isGenerateModalOpen: boolean;

  // Actions
  loadDesignForProject: (project: ProjectMetadata) => Promise<void>;
  saveDesign: () => Promise<boolean>;
  selectComponent: (id: string | null) => void;
  setHoveredDropTarget: (id: string | null) => void;

  // Component Tree Manipulation
  addComponent: (
    type: ComponentType,
    targetParentId?: string,
    insertIndex?: number
  ) => string | null;
  updateComponentProperties: (id: string, props: Partial<ComponentProperties>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (sourceId: string, targetParentId: string, targetIndex?: number) => boolean;
  reorderComponent: (id: string, direction: 'up' | 'down') => void;

  // Screen Management
  setActiveScreen: (screenId: string) => void;
  setStartScreen: (screenId: string) => void;
  addScreen: (name: string, layoutFileName?: string) => string;
  renameScreen: (screenId: string, newName: string) => void;
  duplicateScreen: (screenId: string) => void;
  deleteScreen: (screenId: string) => boolean;

  // Viewport Controls
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setOrientation: (orientation: ScreenOrientation) => void;
  toggleOrientation: () => void;
  setDevicePreset: (presetId: string) => void;
  togglePreviewMode: () => void;
  toggleAutoSave: () => void;

  // Undo & Redo
  undo: () => void;
  redo: () => void;

  // Android XML Generation
  generateAndroidLayouts: () => Promise<{
    success: boolean;
    results: GeneratedLayoutResult[];
    error?: string;
  }>;
  setGenerateModalOpen: (open: boolean) => void;
  clearError: () => void;
}

export const useDesignerStore = create<DesignerState>((set, get) => {
  // Helper to snapshot current design for Undo before making mutations
  const pushHistory = (currentDesign: VisualProjectDesign) => {
    const cloned: VisualProjectDesign = JSON.parse(JSON.stringify(currentDesign));
    set((state) => ({
      history: [cloned, ...state.history.slice(0, MAX_HISTORY_STEPS - 1)],
      future: [], // Clear redo stack on new action
      isDirty: true,
    }));
  };

  return {
    design: null,
    activeScreenId: '',
    selectedComponentId: null,
    hoveredDropTargetId: null,
    zoom: 1.0,
    orientation: 'portrait',
    devicePreset: 'pixel_7',
    isPreviewMode: false,
    isDirty: false,
    autoSaveEnabled: false,
    lastSaved: null,
    isSaving: false,
    errorMessage: null,
    history: [],
    future: [],
    generatedResult: null,
    isGenerateModalOpen: false,

    loadDesignForProject: async (project: ProjectMetadata) => {
      try {
        const stored = await NativeBridge.loadVisualDesign(project.id);
        if (stored && stored.screens && stored.screens.length > 0) {
          set({
            design: stored,
            activeScreenId: stored.activeScreenId || stored.screens[0].id,
            selectedComponentId: null,
            isDirty: false,
            history: [],
            future: [],
            errorMessage: null,
          });
        } else {
          // Initialize fresh default starter design for this project
          const initial = createDefaultProjectDesign(project);
          await NativeBridge.saveVisualDesign(project.id, initial);
          set({
            design: initial,
            activeScreenId: initial.activeScreenId,
            selectedComponentId: null,
            isDirty: false,
            history: [],
            future: [],
            errorMessage: null,
          });
        }
      } catch (err) {
        console.error('Failed to load visual design for project:', err);
        const fallback = createDefaultProjectDesign(project);
        set({
          design: fallback,
          activeScreenId: fallback.activeScreenId,
          selectedComponentId: null,
          isDirty: false,
          errorMessage: 'Gagal memuat desain dari penyimpanan. Memuat model desain standar.',
        });
      }
    },

    saveDesign: async () => {
      const design = get().design;
      if (!design) return false;

      set({ isSaving: true });
      try {
        const updated: VisualProjectDesign = {
          ...design,
          updatedAt: new Date().toISOString(),
        };
        await NativeBridge.saveVisualDesign(design.projectId, updated);
        set({
          design: updated,
          isDirty: false,
          isSaving: false,
          lastSaved: new Date().toLocaleTimeString(),
          errorMessage: null,
        });
        return true;
      } catch (err) {
        set({
          isSaving: false,
          errorMessage: err instanceof Error ? err.message : 'Gagal menyimpan desain',
        });
        return false;
      }
    },

    selectComponent: (id: string | null) => {
      set({ selectedComponentId: id });
    },

    setHoveredDropTarget: (id: string | null) => {
      set({ hoveredDropTargetId: id });
    },

    addComponent: (type: ComponentType, targetParentId?: string, insertIndex?: number) => {
      const { design, activeScreenId } = get();
      if (!design) return null;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return null;

      pushHistory(design);

      const targetScreen = design.screens[screenIndex];
      const existingIds = collectAllComponentIds(targetScreen.root);
      const newId = generateUniqueComponentId(type, existingIds);

      // Look up catalogue default properties
      const itemInfo = COMPONENT_CATALOGUE.find((c) => c.type === type);
      const defaultProps: ComponentProperties = {
        id: newId,
        name: itemInfo ? itemInfo.name : type,
        width: itemInfo?.defaultProperties.width ?? 'wrap_content',
        height: itemInfo?.defaultProperties.height ?? 'wrap_content',
        ...itemInfo?.defaultProperties,
      };

      const newComponent: VisualComponent = {
        id: newId,
        type,
        name: defaultProps.name,
        properties: defaultProps,
        children: itemInfo?.isContainer ? [] : undefined,
      };

      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;

      // Determine parent container
      let parent: VisualComponent | null = null;
      if (targetParentId) {
        parent = findComponentById(clonedRoot, targetParentId);
      }
      if (!parent || !canAcceptChildren(parent.type)) {
        parent = clonedRoot; // Fallback to root layout
      }

      if (!parent.children) {
        parent.children = [];
      }

      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= parent.children.length) {
        parent.children.splice(insertIndex, 0, newComponent);
      } else {
        parent.children.push(newComponent);
      }

      clonedScreens[screenIndex] = {
        ...targetScreen,
        root: clonedRoot,
      };

      set({
        design: { ...design, screens: clonedScreens },
        selectedComponentId: newId,
        isDirty: true,
      });

      return newId;
    },

    updateComponentProperties: (id: string, props: Partial<ComponentProperties>) => {
      const { design, activeScreenId } = get();
      if (!design) return;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return;

      pushHistory(design);

      const targetScreen = design.screens[screenIndex];
      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;

      const target = findComponentById(clonedRoot, id);
      if (target) {
        target.properties = {
          ...target.properties,
          ...props,
        };
        if (props.name) {
          target.name = props.name;
        }

        clonedScreens[screenIndex] = {
          ...targetScreen,
          root: clonedRoot,
        };

        set({
          design: { ...design, screens: clonedScreens },
          isDirty: true,
        });
      }
    },

    deleteComponent: (id: string) => {
      const { design, activeScreenId } = get();
      if (!design) return;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return;

      const targetScreen = design.screens[screenIndex];
      // Do not allow deleting the root layout
      if (targetScreen.root.id === id) return;

      pushHistory(design);

      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;

      const parentRes = findParentComponent(clonedRoot, id);
      if (parentRes && parentRes.parent.children) {
        parentRes.parent.children.splice(parentRes.index, 1);
        clonedScreens[screenIndex] = {
          ...targetScreen,
          root: clonedRoot,
        };

        set({
          design: { ...design, screens: clonedScreens },
          selectedComponentId: parentRes.parent.id,
          isDirty: true,
        });
      }
    },

    duplicateComponent: (id: string) => {
      const { design, activeScreenId } = get();
      if (!design) return;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return;

      const targetScreen = design.screens[screenIndex];
      if (targetScreen.root.id === id) return;

      pushHistory(design);

      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;

      const parentRes = findParentComponent(clonedRoot, id);
      if (parentRes && parentRes.parent.children) {
        const targetComp = parentRes.parent.children[parentRes.index];
        const existingIds = collectAllComponentIds(clonedRoot);
        const duplicated = duplicateComponentWithNewIds(targetComp, existingIds);

        // Insert directly after original
        parentRes.parent.children.splice(parentRes.index + 1, 0, duplicated);

        clonedScreens[screenIndex] = {
          ...targetScreen,
          root: clonedRoot,
        };

        set({
          design: { ...design, screens: clonedScreens },
          selectedComponentId: duplicated.id,
          isDirty: true,
        });
      }
    },

    moveComponent: (sourceId: string, targetParentId: string, targetIndex?: number) => {
      const { design, activeScreenId } = get();
      if (!design || sourceId === targetParentId) return false;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return false;

      const targetScreen = design.screens[screenIndex];
      // Prevent circular references: cannot move a parent inside its own descendant
      if (isDescendantOf(targetScreen.root, sourceId, targetParentId)) {
        return false;
      }

      pushHistory(design);

      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;

      const oldParentRes = findParentComponent(clonedRoot, sourceId);
      const newParent = findComponentById(clonedRoot, targetParentId);

      if (!oldParentRes || !newParent || !canAcceptChildren(newParent.type)) {
        return false;
      }

      // Detach from old parent
      const [movedItem] = oldParentRes.parent.children!.splice(oldParentRes.index, 1);
      if (!movedItem) return false;

      // Attach to new parent
      if (!newParent.children) {
        newParent.children = [];
      }

      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= newParent.children.length) {
        newParent.children.splice(targetIndex, 0, movedItem);
      } else {
        newParent.children.push(movedItem);
      }

      clonedScreens[screenIndex] = {
        ...targetScreen,
        root: clonedRoot,
      };

      set({
        design: { ...design, screens: clonedScreens },
        selectedComponentId: sourceId,
        isDirty: true,
      });

      return true;
    },

    reorderComponent: (id: string, direction: 'up' | 'down') => {
      const { design, activeScreenId } = get();
      if (!design) return;

      const screenIndex = design.screens.findIndex((s) => s.id === activeScreenId);
      if (screenIndex === -1) return;

      const targetScreen = design.screens[screenIndex];
      if (targetScreen.root.id === id) return;

      const clonedScreens = [...design.screens];
      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;
      const parentRes = findParentComponent(clonedRoot, id);

      if (!parentRes || !parentRes.parent.children) return;

      const siblings = parentRes.parent.children;
      const curIndex = parentRes.index;
      const targetIndex = direction === 'up' ? curIndex - 1 : curIndex + 1;

      if (targetIndex < 0 || targetIndex >= siblings.length) return;

      pushHistory(design);

      // Swap positions
      const temp = siblings[curIndex];
      siblings[curIndex] = siblings[targetIndex];
      siblings[targetIndex] = temp;

      clonedScreens[screenIndex] = {
        ...targetScreen,
        root: clonedRoot,
      };

      set({
        design: { ...design, screens: clonedScreens },
        selectedComponentId: id,
        isDirty: true,
      });
    },

    setActiveScreen: (screenId: string) => {
      set({
        activeScreenId: screenId,
        selectedComponentId: null,
      });
    },

    setStartScreen: (screenId: string) => {
      const { design } = get();
      if (!design) return;
      pushHistory(design);
      set({
        design: { ...design, startScreenId: screenId },
        isDirty: true,
      });
    },

    addScreen: (name: string, layoutFileName?: string) => {
      const { design } = get();
      if (!design) return '';

      pushHistory(design);

      const screenId = `screen_${Date.now().toString(36).substring(2, 7)}`;
      const fileName =
        layoutFileName || `activity_${name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}.xml`;

      const newScreen = createNewBlankScreen(screenId, name, fileName);
      const updatedScreens = [...design.screens, newScreen];

      set({
        design: {
          ...design,
          screens: updatedScreens,
          activeScreenId: screenId,
        },
        activeScreenId: screenId,
        selectedComponentId: null,
        isDirty: true,
      });

      return screenId;
    },

    renameScreen: (screenId: string, newName: string) => {
      const { design } = get();
      if (!design) return;

      pushHistory(design);
      const updated = design.screens.map((s) =>
        s.id === screenId ? { ...s, name: newName.trim() } : s
      );

      set({
        design: { ...design, screens: updated },
        isDirty: true,
      });
    },

    duplicateScreen: (screenId: string) => {
      const { design } = get();
      if (!design) return;

      const targetScreen = design.screens.find((s) => s.id === screenId);
      if (!targetScreen) return;

      pushHistory(design);

      const newScreenId = `screen_${Date.now().toString(36).substring(2, 7)}`;
      const newName = `${targetScreen.name} (Salinan)`;
      const newLayoutName = `activity_${newScreenId}.xml`;

      const clonedRoot = JSON.parse(JSON.stringify(targetScreen.root)) as VisualComponent;
      const existingIds = new Set<string>();
      const refreshedRoot = duplicateComponentWithNewIds(clonedRoot, existingIds);

      const duplicatedScreen: VisualScreen = {
        ...targetScreen,
        id: newScreenId,
        name: newName,
        layoutFileName: newLayoutName,
        root: refreshedRoot,
      };

      set({
        design: {
          ...design,
          screens: [...design.screens, duplicatedScreen],
          activeScreenId: newScreenId,
        },
        activeScreenId: newScreenId,
        selectedComponentId: null,
        isDirty: true,
      });
    },

    deleteScreen: (screenId: string) => {
      const { design, activeScreenId } = get();
      if (!design || design.screens.length <= 1) {
        return false; // Cannot delete the only remaining screen
      }

      pushHistory(design);

      const filtered = design.screens.filter((s) => s.id !== screenId);
      const nextActive = activeScreenId === screenId ? filtered[0].id : activeScreenId;
      const nextStart = design.startScreenId === screenId ? filtered[0].id : design.startScreenId;

      set({
        design: {
          ...design,
          screens: filtered,
          activeScreenId: nextActive,
          startScreenId: nextStart,
        },
        activeScreenId: nextActive,
        selectedComponentId: null,
        isDirty: true,
      });

      return true;
    },

    setZoom: (zoom: number) => {
      set({ zoom: Math.min(2.0, Math.max(0.5, zoom)) });
    },

    zoomIn: () => {
      set((state) => ({ zoom: Math.min(2.0, parseFloat((state.zoom + 0.15).toFixed(2))) }));
    },

    zoomOut: () => {
      set((state) => ({ zoom: Math.max(0.5, parseFloat((state.zoom - 0.15).toFixed(2))) }));
    },

    resetZoom: () => {
      set({ zoom: 1.0 });
    },

    setOrientation: (orientation: ScreenOrientation) => {
      set({ orientation });
    },

    toggleOrientation: () => {
      set((state) => ({
        orientation: state.orientation === 'portrait' ? 'landscape' : 'portrait',
      }));
    },

    setDevicePreset: (presetId: string) => {
      set({ devicePreset: presetId });
    },

    togglePreviewMode: () => {
      set((state) => ({
        isPreviewMode: !state.isPreviewMode,
        selectedComponentId: null, // Clear selection when previewing
      }));
    },

    toggleAutoSave: () => {
      set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled }));
    },

    undo: () => {
      const { history, future, design } = get();
      if (history.length === 0 || !design) return;

      const previous = history[0];
      const remainingHistory = history.slice(1);

      set({
        design: previous,
        history: remainingHistory,
        future: [design, ...future],
        isDirty: true,
      });
    },

    redo: () => {
      const { history, future, design } = get();
      if (future.length === 0 || !design) return;

      const next = future[0];
      const remainingFuture = future.slice(1);

      set({
        design: next,
        history: [design, ...history],
        future: remainingFuture,
        isDirty: true,
      });
    },

    generateAndroidLayouts: async () => {
      const { design } = get();
      if (!design) {
        return { success: false, results: [], error: 'Tidak ada desain visual yang dimuat' };
      }

      try {
        const results: GeneratedLayoutResult[] = [];

        for (const screen of design.screens) {
          const result = generateAndroidXmlLayout(screen);
          results.push(result);

          // Save directly into the project file tree
          await NativeBridge.saveGeneratedLayoutXml(
            design.projectId,
            result.relativePath,
            result.fullXml
          );
        }

        // Set active screen's result for display in the generation modal
        const activeResult =
          results.find((r) => r.fileName.includes(get().activeScreenId)) || results[0];

        set({
          generatedResult: activeResult,
          isGenerateModalOpen: true,
          errorMessage: null,
        });

        return { success: true, results };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal menghasilkan Android XML Layout';
        set({ errorMessage: msg });
        return { success: false, results: [], error: msg };
      }
    },

    setGenerateModalOpen: (open: boolean) => {
      set({ isGenerateModalOpen: open });
    },

    clearError: () => {
      set({ errorMessage: null });
    },
  };
});
