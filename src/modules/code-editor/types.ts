/**
 * Nusantara App Builder - Code Editor Types
 * Phase 4: Professional Multi-Tab Code Editor & Android XML/Kotlin Tooling
 */

export type SupportedLanguage =
  | 'kotlin'
  | 'xml'
  | 'java'
  | 'groovy'
  | 'properties'
  | 'json'
  | 'html'
  | 'css'
  | 'javascript'
  | 'markdown'
  | 'plaintext';

export interface EditorTab {
  id: string; // unique identifier, usually equal to path
  path: string; // relative path within project, e.g. "app/src/main/AndroidManifest.xml"
  name: string; // file name, e.g. "AndroidManifest.xml"
  language: SupportedLanguage;
  content: string;
  savedContent: string;
  isDirty: boolean;
  cursorLine: number;
  cursorColumn: number;
  scrollPosition?: number;
}

export type ProblemSeverity = 'error' | 'warning' | 'info';

export interface EditorProblem {
  id: string;
  filePath: string;
  fileName: string;
  line: number;
  column: number;
  message: string;
  messageId: string;
  severity: ProblemSeverity;
  source: 'xml-validator' | 'kotlin-syntax' | 'manifest-checker' | 'gradle-linter' | 'filesystem';
}

export interface OutputLogItem {
  id: string;
  timestamp: string;
  text: string;
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'warning' | 'error';
  source?: string;
}

export interface TerminalTask {
  id: string;
  command: string;
  args: string[];
  workingDirectory: string;
  startTime: string;
  endTime?: string;
  exitCode?: number;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  output: string[];
}

export type AutoSaveMode = 'off' | 'afterDelay' | 'onFocusChange';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
export type BottomPanelTab = 'problems' | 'output' | 'build' | 'terminal';

export interface FileTreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  size?: number;
  isBinary?: boolean;
  extension?: string;
}

export interface SearchMatch {
  id: string;
  filePath: string;
  line: number;
  column: number;
  lineText: string;
  matchLength: number;
}

export interface VisualSyncConflict {
  filePath: string;
  screenId?: string;
  designId?: string;
  hasManualChanges: boolean;
  xmlContent: string;
  lastGeneratedXml?: string;
  detectedComponentsCount: number;
  unsupportedTags: string[];
}
