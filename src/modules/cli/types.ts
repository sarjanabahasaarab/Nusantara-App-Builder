/**
 * Nusantara App Builder - CLI Engine Types
 * Phase 10: Command line interface argument parser and Environment Doctor diagnostics.
 */

export interface CliCommandDef {
  command: string;
  args?: string[];
  options?: Record<string, string | boolean>;
  rawInput: string;
}

export interface CliExecutionResult {
  exitCode: number;
  stdout: string[];
  stderr: string[];
  isError: boolean;
}

export interface DoctorCheckItem {
  id: string;
  name: string;
  nameId: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  detailsId: string;
  suggestedAction?: string;
  suggestedActionId?: string;
}

export interface DoctorReport {
  isReady: boolean;
  checks: DoctorCheckItem[];
  timestamp: string;
}
