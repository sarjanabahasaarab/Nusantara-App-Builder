/**
 * Nusantara App Builder - Code Editor State Management
 * Phase 4: Zustand store for multi-tab editor, problems, terminal, filesystem, and visual sync.
 */

import { create } from 'zustand';
import {
  EditorTab,
  EditorProblem,
  OutputLogItem,
  TerminalTask,
  AutoSaveMode,
  SaveStatus,
  BottomPanelTab,
  FileTreeNode,
  SearchMatch,
  VisualSyncConflict,
  SupportedLanguage,
} from '../types';
import { detectLanguageByPath, buildFileTree, validateProjectFilePath } from '../services/fileSystemService';
import { validateFileContent } from '../services/syntaxValidator';
import { executeTerminalProcess } from '../services/terminalService';
import { NativeBridge } from '../../filesystem/nativeBridge';
import { parseAndroidXmlToVisualScreen } from '../services/xmlParser';
import { ProjectFile } from '../../../types/project';

interface EditorState {
  // Project & Files
  activeProjectId: string | null;
  files: ProjectFile[];
  fileTree: FileTreeNode[];
  expandedFolders: Set<string>;
  selectedPath: string | null;

  // Tabs & Current File
  tabs: EditorTab[];
  activeTabId: string | null;
  saveStatus: SaveStatus;
  autoSaveMode: AutoSaveMode;
  editorTheme: 'vs-dark' | 'light';
  fontSize: number;
  wordWrap: 'on' | 'off';

  // Panels & Resizing
  isExplorerOpen: boolean;
  explorerWidth: number;
  isPropertiesOpen: boolean;
  propertiesWidth: number;
  activeBottomPanel: BottomPanelTab | null;
  bottomPanelHeight: number;

  // Diagnostics & Logs
  problems: EditorProblem[];
  problemFilter: 'all' | 'error' | 'warning';
  outputLogs: OutputLogItem[];
  terminalTasks: TerminalTask[];
  activeTerminalTask: TerminalTask | null;
  terminalHistory: string[];
  terminalHistoryIndex: number;
  terminalCancelRef: { isCancelled: boolean };

  // Search & Navigation
  isSearchOpen: boolean;
  isReplaceMode: boolean;
  searchQuery: string;
  replaceQuery: string;
  matchCase: boolean;
  matchWholeWord: boolean;
  isRegex: boolean;
  searchMatches: SearchMatch[];
  activeMatchIndex: number;

  // Modals & Dialogs
  quickOpenVisible: boolean;
  goToLineVisible: boolean;
  closeDirtyTabCandidate: EditorTab | null;
  deleteItemCandidate: { path: string; name: string; isDirectory: boolean } | null;
  renameItemCandidate: { path: string; name: string } | null;
  newItemModal: { parentPath: string; isDirectory: boolean } | null;
  visualSyncConflict: VisualSyncConflict | null;

  // Actions
  initProject: (projectId: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  toggleFolder: (folderPath: string) => void;
  selectPath: (path: string | null) => void;

  openFile: (path: string) => Promise<void>;
  closeTab: (tabId: string, force?: boolean) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepTabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, newContent: string) => void;
  updateCursorPosition: (tabId: string, line: number, col: number) => void;

  saveActiveFile: () => Promise<boolean>;
  saveAllFiles: () => Promise<void>;
  setAutoSaveMode: (mode: AutoSaveMode) => void;
  setEditorTheme: (theme: 'vs-dark' | 'light') => void;
  setFontSize: (size: number) => void;
  toggleWordWrap: () => void;

  // Layout Controls
  toggleExplorer: () => void;
  setExplorerWidth: (w: number) => void;
  toggleProperties: () => void;
  setPropertiesWidth: (w: number) => void;
  setActiveBottomPanel: (panel: BottomPanelTab | null) => void;
  setBottomPanelHeight: (h: number) => void;

  // Diagnostics
  runDiagnostics: (tab?: EditorTab) => void;
  setProblemFilter: (filter: 'all' | 'error' | 'warning') => void;
  addOutputLog: (text: string, type?: OutputLogItem['type'], source?: string) => void;
  clearOutputLogs: () => void;

  // Terminal
  runTerminalCommand: (cmd: string) => Promise<void>;
  cancelRunningTerminal: () => void;
  clearTerminal: () => void;

  // Search & Navigation
  toggleSearch: (replace?: boolean) => void;
  setSearchQuery: (q: string) => void;
  setReplaceQuery: (r: string) => void;
  setSearchOptions: (opts: { matchCase?: boolean; matchWholeWord?: boolean; isRegex?: boolean }) => void;
  performSearch: () => Promise<void>;
  goToNextMatch: () => void;
  goToPrevMatch: () => void;
  replaceCurrentMatch: () => Promise<void>;
  replaceAllMatches: () => Promise<void>;

  // Modals & CRUD
  setQuickOpenVisible: (visible: boolean) => void;
  setGoToLineVisible: (visible: boolean) => void;
  setCloseDirtyTabCandidate: (tab: EditorTab | null) => void;
  setDeleteItemCandidate: (item: { path: string; name: string; isDirectory: boolean } | null) => void;
  confirmDeleteItem: () => Promise<boolean>;
  setRenameItemCandidate: (item: { path: string; name: string } | null) => void;
  confirmRenameItem: (newName: string) => Promise<boolean>;
  setNewItemModal: (modal: { parentPath: string; isDirectory: boolean } | null) => void;
  confirmCreateItem: (name: string) => Promise<boolean>;
  setVisualSyncConflict: (conflict: VisualSyncConflict | null) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeProjectId: null,
  files: [],
  fileTree: [],
  expandedFolders: new Set(['app', 'app/src', 'app/src/main', 'app/src/main/res', 'app/src/main/res/layout']),
  selectedPath: null,

  tabs: [],
  activeTabId: null,
  saveStatus: 'saved',
  autoSaveMode: 'off',
  editorTheme: 'vs-dark',
  fontSize: 13,
  wordWrap: 'off',

  isExplorerOpen: true,
  explorerWidth: 260,
  isPropertiesOpen: false,
  propertiesWidth: 260,
  activeBottomPanel: null,
  bottomPanelHeight: 220,

  problems: [],
  problemFilter: 'all',
  outputLogs: [
    {
      id: 'init_log',
      timestamp: new Date().toLocaleTimeString(),
      text: 'Nusantara Code Editor Engine v0.4.0 (Phase 4) initialized.',
      type: 'info',
      source: 'System',
    },
  ],
  terminalTasks: [],
  activeTerminalTask: null,
  terminalHistory: [],
  terminalHistoryIndex: -1,
  terminalCancelRef: { isCancelled: false },

  isSearchOpen: false,
  isReplaceMode: false,
  searchQuery: '',
  replaceQuery: '',
  matchCase: false,
  matchWholeWord: false,
  isRegex: false,
  searchMatches: [],
  activeMatchIndex: 0,

  quickOpenVisible: false,
  goToLineVisible: false,
  closeDirtyTabCandidate: null,
  deleteItemCandidate: null,
  renameItemCandidate: null,
  newItemModal: null,
  visualSyncConflict: null,

  initProject: async (projectId: string) => {
    set({ activeProjectId: projectId });
    await get().refreshFiles();

    // If no active tabs, open MainActivity.kt or AndroidManifest.xml by default
    const state = get();
    if (state.tabs.length === 0 && state.files.length > 0) {
      const mainKt = state.files.find((f) => f.path.endsWith('MainActivity.kt'));
      const manifest = state.files.find((f) => f.path.endsWith('AndroidManifest.xml'));
      const firstTarget = mainKt || manifest || state.files.find((f) => !f.isDirectory);
      if (firstTarget) {
        await get().openFile(firstTarget.path);
      }
    }
  },

  refreshFiles: async () => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;

    try {
      const files = await NativeBridge.getProjectFiles(activeProjectId);
      const fileTree = buildFileTree(files);
      set({ files, fileTree });
      get().runDiagnostics();
    } catch (err) {
      console.error('Failed to load project files:', err);
    }
  },

  toggleFolder: (folderPath: string) => {
    set((s) => {
      const next = new Set(s.expandedFolders);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return { expandedFolders: next };
    });
  },

  selectPath: (path: string | null) => set({ selectedPath: path }),

  openFile: async (path: string) => {
    const state = get();
    // Check if already open
    const existing = state.tabs.find((t) => t.path === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const file = state.files.find((f) => f.path === path);
    if (!file || file.isDirectory) return;

    const lang: SupportedLanguage = detectLanguageByPath(path);
    const newTab: EditorTab = {
      id: path,
      path,
      name: file.name,
      language: lang,
      content: file.content || '',
      savedContent: file.content || '',
      isDirty: false,
      cursorLine: 1,
      cursorColumn: 1,
    };

    set((s) => ({
      tabs: [...s.tabs, newTab],
      activeTabId: newTab.id,
      selectedPath: path,
    }));

    get().runDiagnostics(newTab);
  },

  closeTab: (tabId: string, force: boolean = false) => {
    const state = get();
    const tabToClose = state.tabs.find((t) => t.id === tabId);
    if (!tabToClose) return;

    // Check if dirty and not forced
    if (tabToClose.isDirty && !force) {
      set({ closeDirtyTabCandidate: tabToClose });
      return;
    }

    const remaining = state.tabs.filter((t) => t.id !== tabId);
    let nextActiveId = state.activeTabId;

    if (state.activeTabId === tabId) {
      const closedIndex = state.tabs.findIndex((t) => t.id === tabId);
      if (remaining.length > 0) {
        const nextIndex = Math.min(closedIndex, remaining.length - 1);
        nextActiveId = remaining[nextIndex].id;
      } else {
        nextActiveId = null;
      }
    }

    set({
      tabs: remaining,
      activeTabId: nextActiveId,
      closeDirtyTabCandidate: null,
    });
  },

  closeAllTabs: () => {
    const state = get();
    const dirtyTabs = state.tabs.filter((t) => t.isDirty);
    if (dirtyTabs.length > 0) {
      set({ closeDirtyTabCandidate: dirtyTabs[0] });
      return;
    }
    set({ tabs: [], activeTabId: null });
  },

  closeOtherTabs: (keepTabId: string) => {
    const state = get();
    const kept = state.tabs.find((t) => t.id === keepTabId);
    if (!kept) return;
    set({ tabs: [kept], activeTabId: kept.id });
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId });
    const tab = get().tabs.find((t) => t.id === tabId);
    if (tab) {
      get().runDiagnostics(tab);
    }
  },

  updateTabContent: (tabId: string, newContent: string) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const isDirty = newContent !== tab.savedContent;

    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId
          ? { ...t, content: newContent, isDirty }
          : t
      ),
      saveStatus: isDirty ? 'unsaved' : 'saved',
    }));

    // Auto-save logic
    if (state.autoSaveMode === 'afterDelay') {
      clearTimeout((window as unknown as { _autoSaveTimer: number })._autoSaveTimer);
      (window as unknown as { _autoSaveTimer: number })._autoSaveTimer = window.setTimeout(() => {
        get().saveActiveFile();
      }, 1200);
    }

    // Run debounced diagnostics for active file
    clearTimeout((window as unknown as { _diagTimer: number })._diagTimer);
    (window as unknown as { _diagTimer: number })._diagTimer = window.setTimeout(() => {
      get().runDiagnostics();
    }, 400);
  },

  updateCursorPosition: (tabId: string, line: number, col: number) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId ? { ...t, cursorLine: line, cursorColumn: col } : t
      ),
    }));
  },

  saveActiveFile: async () => {
    const state = get();
    if (!state.activeProjectId || !state.activeTabId) return false;

    const tab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!tab) return false;

    set({ saveStatus: 'saving' });
    try {
      await NativeBridge.saveProjectFile(state.activeProjectId, tab.path, tab.content);

      set((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === tab.id ? { ...t, savedContent: t.content, isDirty: false } : t
        ),
        saveStatus: 'saved',
      }));

      get().addOutputLog(`Saved "${tab.path}" successfully.`, 'success', 'Save');
      get().refreshFiles();
      get().runDiagnostics(tab);
      return true;
    } catch (err) {
      console.error('Failed to save file:', err);
      set({ saveStatus: 'error' });
      get().addOutputLog(`Failed to save "${tab.path}": ${(err as Error).message}`, 'error', 'Save');
      return false;
    }
  },

  saveAllFiles: async () => {
    const state = get();
    if (!state.activeProjectId) return;

    const dirtyTabs = state.tabs.filter((t) => t.isDirty);
    for (const tab of dirtyTabs) {
      await NativeBridge.saveProjectFile(state.activeProjectId, tab.path, tab.content);
    }

    set((s) => ({
      tabs: s.tabs.map((t) => ({ ...t, savedContent: t.content, isDirty: false })),
      saveStatus: 'saved',
    }));

    get().addOutputLog(`Saved ${dirtyTabs.length} modified files.`, 'success', 'SaveAll');
    get().refreshFiles();
  },

  setAutoSaveMode: (mode: AutoSaveMode) => set({ autoSaveMode: mode }),
  setEditorTheme: (theme: 'vs-dark' | 'light') => set({ editorTheme: theme }),
  setFontSize: (size: number) => set({ fontSize: Math.max(10, Math.min(24, size)) }),
  toggleWordWrap: () => set((s) => ({ wordWrap: s.wordWrap === 'on' ? 'off' : 'on' })),

  toggleExplorer: () => set((s) => ({ isExplorerOpen: !s.isExplorerOpen })),
  setExplorerWidth: (w: number) => set({ explorerWidth: Math.max(180, Math.min(500, w)) }),
  toggleProperties: () => set((s) => ({ isPropertiesOpen: !s.isPropertiesOpen })),
  setPropertiesWidth: (w: number) => set({ propertiesWidth: Math.max(180, Math.min(500, w)) }),
  setActiveBottomPanel: (panel: BottomPanelTab | null) => set({ activeBottomPanel: panel }),
  setBottomPanelHeight: (h: number) => set({ bottomPanelHeight: Math.max(120, Math.min(600, h)) }),

  runDiagnostics: (tab?: EditorTab) => {
    const state = get();
    const currentTab = tab || state.tabs.find((t) => t.id === state.activeTabId);
    if (!currentTab) return;

    const problems = validateFileContent(currentTab.path, currentTab.language, currentTab.content);
    set({ problems });
  },

  setProblemFilter: (filter: 'all' | 'error' | 'warning') => set({ problemFilter: filter }),

  addOutputLog: (text: string, type: OutputLogItem['type'] = 'info', source: string = 'IDE') => {
    const item: OutputLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      text,
      type,
      source,
    };
    set((s) => ({ outputLogs: [...s.outputLogs.slice(-150), item] }));
  },

  clearOutputLogs: () => set({ outputLogs: [] }),

  runTerminalCommand: async (cmd: string) => {
    const state = get();
    const activeProject = state.activeProjectId;
    const workingDir = activeProject ? `C:\\NusantaraProjects\\${activeProject}` : 'C:\\Workspace';

    // Update history
    set((s) => ({
      terminalHistory: [...s.terminalHistory.filter((h) => h !== cmd), cmd],
      terminalHistoryIndex: -1,
      terminalCancelRef: { isCancelled: false },
    }));

    const cancelRef = get().terminalCancelRef;

    const task = await executeTerminalProcess(
      workingDir,
      cmd,
      (chunk, isErr) => {
        get().addOutputLog(chunk, isErr ? 'stderr' : 'stdout', 'Terminal');
      },
      () => cancelRef.isCancelled
    );

    set((s) => ({
      terminalTasks: [...s.terminalTasks, task],
      activeTerminalTask: task,
    }));
  },

  cancelRunningTerminal: () => {
    const state = get();
    state.terminalCancelRef.isCancelled = true;
    get().addOutputLog('Process cancelled by user.', 'warning', 'Terminal');
  },

  clearTerminal: () => set({ terminalTasks: [], activeTerminalTask: null }),

  toggleSearch: (replace: boolean = false) => {
    set((s) => ({
      isSearchOpen: !s.isSearchOpen,
      isReplaceMode: replace,
    }));
  },

  setSearchQuery: (q: string) => {
    set({ searchQuery: q });
    get().performSearch();
  },

  setReplaceQuery: (r: string) => set({ replaceQuery: r }),

  setSearchOptions: (opts) => {
    set((s) => ({
      matchCase: opts.matchCase ?? s.matchCase,
      matchWholeWord: opts.matchWholeWord ?? s.matchWholeWord,
      isRegex: opts.isRegex ?? s.isRegex,
    }));
    get().performSearch();
  },

  performSearch: async () => {
    const state = get();
    if (!state.activeProjectId || !state.searchQuery) {
      set({ searchMatches: [], activeMatchIndex: 0 });
      return;
    }

    const matches = await NativeBridge.searchInProject(state.activeProjectId, state.searchQuery, {
      matchCase: state.matchCase,
      wholeWord: state.matchWholeWord,
      isRegex: state.isRegex,
    });

    const mapped: SearchMatch[] = matches.map((m, idx) => ({
      id: `match_${idx}`,
      filePath: m.filePath,
      line: m.line,
      column: m.column,
      lineText: m.lineText,
      matchLength: m.matchLength,
    }));

    set({ searchMatches: mapped, activeMatchIndex: 0 });
  },

  goToNextMatch: () => {
    const state = get();
    if (state.searchMatches.length === 0) return;
    const nextIdx = (state.activeMatchIndex + 1) % state.searchMatches.length;
    set({ activeMatchIndex: nextIdx });

    const match = state.searchMatches[nextIdx];
    get().openFile(match.filePath);
  },

  goToPrevMatch: () => {
    const state = get();
    if (state.searchMatches.length === 0) return;
    const prevIdx =
      (state.activeMatchIndex - 1 + state.searchMatches.length) % state.searchMatches.length;
    set({ activeMatchIndex: prevIdx });

    const match = state.searchMatches[prevIdx];
    get().openFile(match.filePath);
  },

  replaceCurrentMatch: async () => {
    const state = get();
    if (state.searchMatches.length === 0 || !state.activeTabId) return;

    const match = state.searchMatches[state.activeMatchIndex];
    const tab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!tab) return;

    const lines = tab.content.split('\n');
    if (match.line <= lines.length) {
      const line = lines[match.line - 1];
      const col = match.column - 1;
      const before = line.slice(0, col);
      const after = line.slice(col + match.matchLength);
      lines[match.line - 1] = before + state.replaceQuery + after;

      get().updateTabContent(tab.id, lines.join('\n'));
      await get().performSearch();
    }
  },

  replaceAllMatches: async () => {
    const state = get();
    if (state.searchMatches.length === 0 || !state.activeTabId) return;

    const tab = state.tabs.find((t) => t.id === state.activeTabId);
    if (!tab) return;

    let pattern = state.isRegex
      ? state.searchQuery
      : state.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (state.matchWholeWord) pattern = `\\b${pattern}\\b`;

    const regex = new RegExp(pattern, state.matchCase ? 'g' : 'gi');
    const newContent = tab.content.replace(regex, state.replaceQuery);

    get().updateTabContent(tab.id, newContent);
    await get().performSearch();
  },

  setQuickOpenVisible: (visible: boolean) => set({ quickOpenVisible: visible }),
  setGoToLineVisible: (visible: boolean) => set({ goToLineVisible: visible }),
  setCloseDirtyTabCandidate: (tab: EditorTab | null) => set({ closeDirtyTabCandidate: tab }),
  setDeleteItemCandidate: (item) => set({ deleteItemCandidate: item }),

  confirmDeleteItem: async () => {
    const state = get();
    if (!state.activeProjectId || !state.deleteItemCandidate) return false;

    const targetPath = state.deleteItemCandidate.path;
    try {
      await NativeBridge.deleteProjectFile(state.activeProjectId, targetPath);

      // Close tabs that were deleted
      const tabsToClose = state.tabs.filter(
        (t) => t.path === targetPath || t.path.startsWith(`${targetPath}/`)
      );
      for (const t of tabsToClose) {
        get().closeTab(t.id, true);
      }

      set({ deleteItemCandidate: null, selectedPath: null });
      await get().refreshFiles();
      get().addOutputLog(`Deleted "${targetPath}".`, 'info', 'FileExplorer');
      return true;
    } catch (err) {
      console.error('Failed to delete file:', err);
      get().addOutputLog(`Failed to delete "${targetPath}": ${(err as Error).message}`, 'error', 'FileExplorer');
      return false;
    }
  },

  setRenameItemCandidate: (item) => set({ renameItemCandidate: item }),

  confirmRenameItem: async (newName: string) => {
    const state = get();
    if (!state.activeProjectId || !state.renameItemCandidate || !newName.trim()) return false;

    const oldPath = state.renameItemCandidate.path;
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName.trim();
    const newPath = parts.join('/');

    const val = validateProjectFilePath(newPath);
    if (!val.isValid) {
      alert(val.error);
      return false;
    }

    try {
      await NativeBridge.renameProjectFile(state.activeProjectId, oldPath, newPath);

      // Update tabs if affected
      set((s) => ({
        tabs: s.tabs.map((t) => {
          if (t.path === oldPath) {
            return { ...t, id: newPath, path: newPath, name: newName };
          }
          if (t.path.startsWith(`${oldPath}/`)) {
            const updated = t.path.replace(oldPath, newPath);
            return { ...t, id: updated, path: updated, name: updated.split('/').pop() || t.name };
          }
          return t;
        }),
        renameItemCandidate: null,
      }));

      await get().refreshFiles();
      get().addOutputLog(`Renamed "${oldPath}" to "${newPath}".`, 'info', 'FileExplorer');
      return true;
    } catch (err) {
      console.error('Failed to rename:', err);
      get().addOutputLog(`Failed to rename: ${(err as Error).message}`, 'error', 'FileExplorer');
      return false;
    }
  },

  setNewItemModal: (modal) => set({ newItemModal: modal }),

  confirmCreateItem: async (name: string) => {
    const state = get();
    if (!state.activeProjectId || !state.newItemModal || !name.trim()) return false;

    const parent = state.newItemModal.parentPath;
    const newPath = parent ? `${parent}/${name.trim()}` : name.trim();

    const val = validateProjectFilePath(newPath);
    if (!val.isValid) {
      alert(val.error);
      return false;
    }

    try {
      const isDir = state.newItemModal.isDirectory;
      let initialContent = '';
      if (!isDir && newPath.endsWith('.xml')) {
        initialContent = `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="vertical">\n\n</LinearLayout>\n`;
      } else if (!isDir && (newPath.endsWith('.kt') || newPath.endsWith('.kts'))) {
        initialContent = `package id.nusantara.app\n\nclass NewClass {\n}\n`;
      }

      await NativeBridge.createProjectFile(state.activeProjectId, newPath, isDir, initialContent);
      set({ newItemModal: null });
      await get().refreshFiles();

      if (!isDir) {
        await get().openFile(newPath);
      }

      get().addOutputLog(`Created "${newPath}".`, 'success', 'FileExplorer');
      return true;
    } catch (err) {
      console.error('Failed to create file:', err);
      get().addOutputLog(`Failed to create: ${(err as Error).message}`, 'error', 'FileExplorer');
      return false;
    }
  },

  setVisualSyncConflict: (conflict) => set({ visualSyncConflict: conflict }),
}));
