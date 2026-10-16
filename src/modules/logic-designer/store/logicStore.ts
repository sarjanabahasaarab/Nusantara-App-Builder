/**
 * Nusantara App Builder - App Logic, Events, Database & API Zustand Store
 * Phase 6: Full state management for visual logic flows, variables, SQLite, REST APIs, and schema migration.
 */

import { create } from 'zustand';
import {
  LogicEvent,
  LogicAction,
  Variable,
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  ApiEndpoint,
  FormConfig,
  NavigationConfig,
  DataBinding,
  ProjectDataModelV2,
  ApiTestExecutionResult,
} from '../types';
import { DatabaseService } from '../services/databaseService';
import { ApiService } from '../services/apiService';
import { useDesignerStore } from '../../../store/designerStore';

export type LogicDesignerTab = 'flow' | 'variables' | 'database' | 'api' | 'navigation' | 'debug';

interface LogicDesignerState {
  // Navigation / Tab state
  activeTab: LogicDesignerTab;
  setActiveTab: (tab: LogicDesignerTab) => void;

  // Selected event for editing in flow builder
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Data Model V2
  events: LogicEvent[];
  variables: Variable[];
  databases: DatabaseSchema[];
  apiEndpoints: ApiEndpoint[];
  forms: FormConfig[];
  navigation: NavigationConfig;
  bindings: DataBinding[];

  // API Tester state
  apiTestResults: Record<string, ApiTestExecutionResult>;
  isTestingApi: boolean;

  // History (Undo / Redo)
  undoStack: string[]; // Serialized snapshots
  redoStack: string[];

  // Model Lifecycle
  loadProjectModel: (projectId: string, packageId?: string) => Promise<void>;
  saveProjectModel: (projectId: string) => Promise<void>;
  migrateV1ToV2: (v1Design: any) => ProjectDataModelV2;

  // Event Actions
  addEvent: (event: Omit<LogicEvent, 'id'>) => string;
  updateEvent: (id: string, updates: Partial<LogicEvent>) => void;
  deleteEvent: (id: string) => void;
  addActionToEvent: (eventId: string, action: Omit<LogicAction, 'id'>) => void;
  removeActionFromEvent: (eventId: string, actionId: string) => void;
  updateActionInEvent: (eventId: string, actionId: string, updates: Partial<LogicAction>) => void;

  // Variable Actions
  addVariable: (variable: Omit<Variable, 'id'>) => void;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  deleteVariable: (id: string) => void;

  // Database Actions
  addDatabase: (name: string) => void;
  addTable: (dbId: string, name: string) => void;
  deleteTable: (dbId: string, tableId: string) => void;
  addColumn: (dbId: string, tableId: string, column: Omit<DatabaseColumn, 'id'>) => void;
  deleteColumn: (dbId: string, tableId: string, colId: string) => void;
  generateCrudScreens: (table: DatabaseTable) => void;

  // API Actions
  addEndpoint: (endpoint: Omit<ApiEndpoint, 'id'>) => void;
  updateEndpoint: (id: string, updates: Partial<ApiEndpoint>) => void;
  deleteEndpoint: (id: string) => void;
  testEndpoint: (endpoint: ApiEndpoint) => Promise<ApiTestExecutionResult>;

  // Navigation Map Actions
  setStartScreen: (screenId: string) => void;
  addNavigationRoute: (fromScreenId: string, toScreenId: string) => void;
  deleteNavigationRoute: (routeId: string) => void;

  // Undo / Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const STORAGE_PREFIX = 'nusantara_logic_model_';

export const useLogicStore = create<LogicDesignerState>((set, get) => ({
  activeTab: 'flow',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  events: [
    {
      id: 'evt_sample_click',
      screenId: 'screen_main',
      componentId: 'btn_login',
      componentName: 'Tombol Login',
      eventType: 'onClick',
      description: 'Validasi form login dan redirect ke Dashboard',
      enabled: true,
      actions: [
        {
          id: 'act_val_1',
          type: 'validate_form',
          parameters: { formId: 'form_login' },
          description: 'Periksa input username dan password',
        },
        {
          id: 'act_msg_1',
          type: 'show_message',
          parameters: { message: 'Login berhasil! Selamat datang di Nusantara App.' },
          description: 'Tampilkan pesan selamat datang',
        },
        {
          id: 'act_nav_1',
          type: 'navigate_to_screen',
          parameters: { targetScreenId: 'screen_dashboard', targetActivityName: 'DashboardActivity' },
          description: 'Navigasi ke Layar Dashboard',
        },
      ],
    },
  ],

  variables: [
    {
      id: 'var_username',
      name: 'username',
      type: 'string',
      defaultValue: '',
      scope: 'screen',
      description: 'Nama pengguna yang sedang login',
    },
    {
      id: 'var_isLoggedIn',
      name: 'isLoggedIn',
      type: 'boolean',
      defaultValue: false,
      scope: 'app',
      description: 'Status autentikasi sesi aktif',
    },
    {
      id: 'var_totalHarga',
      name: 'totalHarga',
      type: 'decimal',
      defaultValue: 0.0,
      scope: 'screen',
      description: 'Kalkulasi total harga keranjang',
    },
  ],

  databases: [DatabaseService.createDefaultSchema()],

  apiEndpoints: [
    {
      id: 'api_products_get',
      name: 'Get Products Katalog',
      method: 'GET',
      url: 'https://fakestoreapi.com/products',
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      queryParams: [{ key: 'limit', value: '10', enabled: true }],
      timeoutMs: 8000,
      authType: 'none',
      authConfig: {},
      responseType: 'json',
      responseMapping: [
        { jsonPath: 'data[].title', targetComponentId: 'text_product_title' },
      ],
    },
  ],

  forms: [],

  navigation: {
    startScreenId: 'screen_main',
    routes: [
      {
        id: 'route_main_to_dash',
        fromScreenId: 'screen_main',
        toScreenId: 'screen_dashboard',
        clearBackStack: false,
      },
    ],
  },

  bindings: [],

  apiTestResults: {},
  isTestingApi: false,

  undoStack: [],
  redoStack: [],

  pushHistory: () => {
    const state = get();
    const snapshot = JSON.stringify({
      events: state.events,
      variables: state.variables,
      databases: state.databases,
      apiEndpoints: state.apiEndpoints,
      navigation: state.navigation,
    });
    set((s) => ({
      undoStack: [...s.undoStack.slice(-20), snapshot],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const current = JSON.stringify({
      events: get().events,
      variables: get().variables,
      databases: get().databases,
      apiEndpoints: get().apiEndpoints,
      navigation: get().navigation,
    });

    try {
      const parsed = JSON.parse(previous);
      set((s) => ({
        ...parsed,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, current],
      }));
    } catch (e) {
      console.error('Failed to undo logic state:', e);
    }
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const current = JSON.stringify({
      events: get().events,
      variables: get().variables,
      databases: get().databases,
      apiEndpoints: get().apiEndpoints,
      navigation: get().navigation,
    });

    try {
      const parsed = JSON.parse(next);
      set((s) => ({
        ...parsed,
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, current],
      }));
    } catch (e) {
      console.error('Failed to redo logic state:', e);
    }
  },

  migrateV1ToV2: (v1Design: any): ProjectDataModelV2 => {
    return {
      schemaVersion: 2,
      formatVersion: '6.0',
      project: {
        id: v1Design?.projectId || 'proj_default',
        name: v1Design?.projectName || 'NusantaraApp',
        packageId: v1Design?.packageId || 'id.nusantara.app',
      },
      screens: v1Design?.screens || [],
      events: [],
      variables: [],
      navigation: {
        startScreenId: v1Design?.startScreenId || 'screen_main',
        routes: [],
      },
      databases: [DatabaseService.createDefaultSchema()],
      apiEndpoints: [],
      forms: [],
      bindings: [],
      createdAt: v1Design?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  loadProjectModel: async (projectId: string, packageId = 'id.nusantara.app') => {
    if (typeof localStorage === 'undefined') return;

    const savedRaw = localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        if (parsed.schemaVersion === 2) {
          set({
            events: parsed.events || [],
            variables: parsed.variables || [],
            databases: parsed.databases || [DatabaseService.createDefaultSchema()],
            apiEndpoints: parsed.apiEndpoints || [],
            forms: parsed.forms || [],
            navigation: parsed.navigation || { startScreenId: 'screen_main', routes: [] },
            bindings: parsed.bindings || [],
          });
          return;
        }
      } catch (e) {
        console.error('Failed parsing logic model from storage:', e);
      }
    }

    // Try migrating from Phase 3 visual design if available
    const v1Raw = localStorage.getItem(`nusantara_visual_design_${projectId}`);
    if (v1Raw) {
      try {
        const v1Obj = JSON.parse(v1Raw);
        const migrated = get().migrateV1ToV2(v1Obj);
        set({
          events: migrated.events,
          variables: migrated.variables,
          databases: migrated.databases,
          apiEndpoints: migrated.apiEndpoints,
          forms: migrated.forms,
          navigation: migrated.navigation,
          bindings: migrated.bindings,
        });
        localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(migrated));
      } catch (e) {
        console.error('Failed migrating V1 design to V2:', e);
      }
    }
  },

  saveProjectModel: async (projectId: string) => {
    if (typeof localStorage === 'undefined') return;
    const s = get();
    const model: ProjectDataModelV2 = {
      schemaVersion: 2,
      formatVersion: '6.0',
      project: {
        id: projectId,
        name: 'Nusantara Project',
        packageId: 'id.nusantara.app',
      },
      screens: useDesignerStore.getState().design?.screens || [],
      events: s.events,
      variables: s.variables,
      databases: s.databases,
      apiEndpoints: s.apiEndpoints,
      forms: s.forms,
      navigation: s.navigation,
      bindings: s.bindings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, JSON.stringify(model));
  },

  addEvent: (eventData) => {
    get().pushHistory();
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: LogicEvent = { ...eventData, id };
    set((s) => ({
      events: [...s.events, newEvent],
      selectedEventId: id,
    }));
    return id;
  },

  updateEvent: (id, updates) => {
    get().pushHistory();
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  deleteEvent: (id) => {
    get().pushHistory();
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      selectedEventId: s.selectedEventId === id ? null : s.selectedEventId,
    }));
  },

  addActionToEvent: (eventId, actionData) => {
    get().pushHistory();
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAction: LogicAction = { ...actionData, id };

    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, actions: [...e.actions, newAction] } : e
      ),
    }));
  },

  removeActionFromEvent: (eventId, actionId) => {
    get().pushHistory();
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId
          ? { ...e, actions: e.actions.filter((a) => a.id !== actionId) }
          : e
      ),
    }));
  },

  updateActionInEvent: (eventId, actionId, updates) => {
    get().pushHistory();
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              actions: e.actions.map((a) => (a.id === actionId ? { ...a, ...updates } : a)),
            }
          : e
      ),
    }));
  },

  addVariable: (varData) => {
    get().pushHistory();
    const id = `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((s) => ({
      variables: [...s.variables, { ...varData, id }],
    }));
  },

  updateVariable: (id, updates) => {
    get().pushHistory();
    set((s) => ({
      variables: s.variables.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  },

  deleteVariable: (id) => {
    get().pushHistory();
    set((s) => ({
      variables: s.variables.filter((v) => v.id !== id),
    }));
  },

  addDatabase: (name) => {
    get().pushHistory();
    const newDb: DatabaseSchema = {
      id: `db_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.endsWith('.db') ? name : `${name}.db`,
      version: 1,
      tables: [],
    };
    set((s) => ({ databases: [...s.databases, newDb] }));
  },

  addTable: (dbId, name) => {
    get().pushHistory();
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newTable: DatabaseTable = {
      id: `table_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      columns: [
        {
          id: `col_id_${Date.now()}`,
          name: 'id',
          type: 'INTEGER',
          isPrimaryKey: true,
          isAutoIncrement: true,
          isUnique: true,
          isNullable: false,
        },
      ],
    };
    set((s) => ({
      databases: s.databases.map((db) =>
        db.id === dbId ? { ...db, tables: [...db.tables, newTable] } : db
      ),
    }));
  },

  deleteTable: (dbId, tableId) => {
    get().pushHistory();
    set((s) => ({
      databases: s.databases.map((db) =>
        db.id === dbId
          ? { ...db, tables: db.tables.filter((t) => t.id !== tableId) }
          : db
      ),
    }));
  },

  addColumn: (dbId, tableId, colData) => {
    get().pushHistory();
    const cleanName = colData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newCol: DatabaseColumn = {
      ...colData,
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
    };
    set((s) => ({
      databases: s.databases.map((db) =>
        db.id === dbId
          ? {
              ...db,
              tables: db.tables.map((t) =>
                t.id === tableId ? { ...t, columns: [...t.columns, newCol] } : t
              ),
            }
          : db
      ),
    }));
  },

  deleteColumn: (dbId, tableId, colId) => {
    get().pushHistory();
    set((s) => ({
      databases: s.databases.map((db) =>
        db.id === dbId
          ? {
              ...db,
              tables: db.tables.map((t) =>
                t.id === tableId
                  ? { ...t, columns: t.columns.filter((c) => c.id !== colId) }
                  : t
              ),
            }
          : db
      ),
    }));
  },

  generateCrudScreens: (table) => {
    const screens = DatabaseService.generateCrudScreens(table);
    // Add screens to VisualDesigner store
    const visualStore = useDesignerStore.getState();
    for (const screen of screens) {
      visualStore.addScreen(screen.name, screen.layoutFileName);
    }
  },

  addEndpoint: (epData) => {
    get().pushHistory();
    const id = `api_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((s) => ({
      apiEndpoints: [...s.apiEndpoints, { ...epData, id }],
    }));
  },

  updateEndpoint: (id, updates) => {
    get().pushHistory();
    set((s) => ({
      apiEndpoints: s.apiEndpoints.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep)),
    }));
  },

  deleteEndpoint: (id) => {
    get().pushHistory();
    set((s) => ({
      apiEndpoints: s.apiEndpoints.filter((ep) => ep.id !== id),
    }));
  },

  testEndpoint: async (endpoint) => {
    set({ isTestingApi: true });
    const result = await ApiService.executeTestRequest(endpoint);
    set((s) => ({
      isTestingApi: false,
      apiTestResults: { ...s.apiTestResults, [endpoint.id]: result },
    }));
    return result;
  },

  setStartScreen: (screenId) => {
    get().pushHistory();
    set((s) => ({
      navigation: { ...s.navigation, startScreenId: screenId },
    }));
  },

  addNavigationRoute: (fromScreenId, toScreenId) => {
    get().pushHistory();
    const id = `route_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((s) => ({
      navigation: {
        ...s.navigation,
        routes: [...s.navigation.routes, { id, fromScreenId, toScreenId, clearBackStack: false }],
      },
    }));
  },

  deleteNavigationRoute: (routeId) => {
    get().pushHistory();
    set((s) => ({
      navigation: {
        ...s.navigation,
        routes: s.navigation.routes.filter((r) => r.id !== routeId),
      },
    }));
  },
}));
