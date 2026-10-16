/**
 * Nusantara App Builder - Build Engine Store
 * Phase 7: State management for Build Center, Gradle execution, Real-time logs,
 * Validation levels, Keystore Signing, Artifacts, ADB Devices, and History.
 */

import { create } from 'zustand';
import {
  BuildStatus,
  BuildTaskType,
  BuildVariant,
  BuildTarget,
  ValidationLevel,
  BuildLogEntry,
  ParsedGradleError,
  BuildArtifact,
  BuildHistoryRecord,
  BuildConfiguration,
  SigningConfiguration,
  ConnectedDevice,
  LogcatEntry,
  ToolchainDiagnosis,
} from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';
import { GradleRunner } from '../services/gradleRunner';
import { ErrorParser } from '../services/errorParser';
import { ProjectBuildValidator, PreBuildValidationResult } from '../services/projectBuildValidator';
import { ArtifactManager } from '../services/artifactManager';
import { DeviceManager } from '../services/deviceManager';
import { SigningService } from '../services/signingService';
import { ToolchainDetector } from '../services/toolchainDetector';

export type BuildCenterTab = 'console' | 'artifacts' | 'devices' | 'signing' | 'history' | 'settings';

interface BuildEngineState {
  // Navigation & Active View
  activeTab: BuildCenterTab;
  setActiveTab: (tab: BuildCenterTab) => void;

  // Build Execution State
  buildStatus: BuildStatus;
  currentTask: BuildTaskType;
  config: BuildConfiguration;
  setConfig: (updates: Partial<BuildConfiguration>) => void;

  // Logs & Parsing
  logs: BuildLogEntry[];
  lastError: ParsedGradleError | null;
  validationResult: PreBuildValidationResult | null;

  // Artifacts & History
  artifacts: BuildArtifact[];
  history: BuildHistoryRecord[];

  // Signing & Keystore
  signingConfig: SigningConfiguration;
  setSigningConfig: (config: SigningConfiguration) => void;

  // Connected Devices & ADB
  connectedDevices: ConnectedDevice[];
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  isScanningDevices: boolean;

  // Logcat
  logcatEntries: LogcatEntry[];
  isLogcatStreaming: boolean;
  logcatFilter: string;
  setLogcatFilter: (filter: string) => void;
  toggleLogcatStreaming: () => void;
  clearLogcat: () => void;

  // Toolchain Diagnosis
  toolchain: ToolchainDiagnosis | null;
  isDiagnosing: boolean;
  diagnoseToolchain: (targetSdk?: number) => Promise<void>;

  // Modals
  isFirstRunModalOpen: boolean;
  setIsFirstRunModalOpen: (open: boolean) => void;
  isKeystoreModalOpen: boolean;
  setIsKeystoreModalOpen: (open: boolean) => void;
  isSdkInstallerModalOpen: boolean;
  setIsSdkInstallerModalOpen: (open: boolean) => void;

  // Actions
  loadProjectData: (project: ProjectMetadata) => Promise<void>;
  validateProject: (project: ProjectMetadata, files: ProjectFile[], level?: ValidationLevel) => PreBuildValidationResult;
  startBuild: (project: ProjectMetadata, files: ProjectFile[], task?: BuildTaskType) => Promise<boolean>;
  cancelBuild: (projectId: string) => void;
  cleanProject: (project: ProjectMetadata) => Promise<boolean>;
  rebuildProject: (project: ProjectMetadata, files: ProjectFile[]) => Promise<boolean>;
  scanDevices: () => Promise<void>;
  installApk: (artifactPath: string, deviceId: string) => Promise<boolean>;
  launchApp: (packageId: string, deviceId: string) => Promise<boolean>;
  clearLogs: () => void;
  clearHistory: () => void;
}

const STORAGE_HISTORY_KEY = 'nusantara_build_history';

export const useBuildEngineStore = create<BuildEngineState>((set, get) => ({
  activeTab: 'console',
  setActiveTab: (tab) => set({ activeTab: tab }),

  buildStatus: 'idle',
  currentTask: 'assembleDebug',
  config: {
    variant: 'debug',
    target: 'apk',
    validationLevel: 'quick',
    offlineMode: false,
    parallelBuild: 'auto',
    buildCache: true,
  },
  setConfig: (updates) => set((s) => ({ config: { ...s.config, ...updates } })),

  logs: [],
  lastError: null,
  validationResult: null,

  artifacts: [],
  history: [],

  signingConfig: SigningService.createDefaultConfig('default'),
  setSigningConfig: (signingConfig) => set({ signingConfig }),

  connectedDevices: [],
  selectedDeviceId: null,
  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
  isScanningDevices: false,

  logcatEntries: [],
  isLogcatStreaming: false,
  logcatFilter: '',
  setLogcatFilter: (logcatFilter) => set({ logcatFilter }),
  toggleLogcatStreaming: () => set((s) => ({ isLogcatStreaming: !s.isLogcatStreaming })),
  clearLogcat: () => set({ logcatEntries: [] }),

  toolchain: null,
  isDiagnosing: false,

  isFirstRunModalOpen: false,
  setIsFirstRunModalOpen: (open) => set({ isFirstRunModalOpen: open }),
  isKeystoreModalOpen: false,
  setIsKeystoreModalOpen: (open) => set({ isKeystoreModalOpen: open }),
  isSdkInstallerModalOpen: false,
  setIsSdkInstallerModalOpen: (open) => set({ isSdkInstallerModalOpen: open }),

  diagnoseToolchain: async (targetSdk = 34) => {
    set({ isDiagnosing: true });
    try {
      const diag = await ToolchainDetector.diagnoseSystem(targetSdk);
      set({ toolchain: diag, isDiagnosing: false });
    } catch (err) {
      console.error('Diagnosis error:', err);
      set({ isDiagnosing: false });
    }
  },

  loadProjectData: async (project: ProjectMetadata) => {
    // Load artifacts for this project
    const artifacts = ArtifactManager.getArtifacts(project.id);

    // Load signing config
    const signing = SigningService.getSigningConfig(project.id);

    // Load history
    let history: BuildHistoryRecord[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_HISTORY_KEY}_${project.id}`);
        if (raw) history = JSON.parse(raw);
      } catch {}
    }

    // Set initial logcat entries
    const logcat = DeviceManager.generateInitialLogcat(project.packageId);

    set({
      artifacts,
      signingConfig: signing,
      history,
      logcatEntries: logcat,
    });

    // Run background device scan
    get().scanDevices();
    get().diagnoseToolchain(project.targetSdk);
  },

  validateProject: (project, files, level) => {
    const valLevel = level || get().config.validationLevel;
    const result = ProjectBuildValidator.validate(project, files, valLevel);
    set({ validationResult: result });
    return result;
  },

  startBuild: async (project, files, overrideTask) => {
    const { config, signingConfig } = get();
    const task = overrideTask || (
      config.target === 'aab'
        ? 'bundleRelease'
        : (config.variant === 'release' ? 'assembleRelease' : 'assembleDebug')
    );

    // 1. Release Security Check: If release build requested without signing, block build
    if (config.variant === 'release' && !signingConfig.isConfigured) {
      set({
        lastError: {
          task: ':app:validateSigningRelease',
          message: 'Release signing is not configured. Release APK and AAB require a configured keystore.',
          errorType: 'signing',
          suggestedFix: 'Open the Signing tab to configure or generate a release keystore.',
          suggestedFixId: 'Buka tab Signing untuk mengonfigurasi atau membuat keystore rilis baru.',
        },
        buildStatus: 'failed',
      });
      return false;
    }

    // 2. Pre-Build Validation Check
    const val = get().validateProject(project, files, config.validationLevel);
    if (val.isBlocked) {
      set({
        buildStatus: 'failed',
        lastError: {
          task: 'Pre-Build Validation',
          message: `BUILD BLOCKED: Found ${val.summary.errorsCount} critical project configuration errors.`,
          errorType: 'manifest',
          file: val.issues[0]?.file,
          line: val.issues[0]?.line,
          suggestedFix: val.issues[0]?.suggestedFix,
          suggestedFixId: val.issues[0]?.suggestedFixId,
        },
      });
      return false;
    }

    // 3. Reset state & Start execution
    set({
      buildStatus: 'running',
      currentTask: task,
      lastError: null,
      logs: [],
    });

    const executionResult = await GradleRunner.executeTask(
      project,
      task,
      config,
      {
        onLog: (entry) => {
          set((s) => ({ logs: [...s.logs, entry] }));
        },
        onStatusChange: (status) => {
          set({ buildStatus: status });
        },
      }
    );

    // 4. Handle Results
    if (executionResult.success && executionResult.artifactPath) {
      const artifact = await ArtifactManager.registerArtifact(
        project,
        executionResult.artifactPath,
        config.variant,
        config.target
      );
      set((s) => ({ artifacts: [artifact, ...s.artifacts.filter((a) => a.id !== artifact.id)] }));
    } else if (!executionResult.success && executionResult.exitCode !== 130) {
      // Parse errors from logs
      const parsedError = ErrorParser.parseGradleErrors(executionResult.logs);
      set({ lastError: parsedError });
    }

    // 5. Append to Build History (Retention: max 25 records per project)
    const historyItem: BuildHistoryRecord = {
      id: `hist_${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      variant: config.variant,
      target: config.target,
      status: executionResult.success ? 'success' : (executionResult.exitCode === 130 ? 'cancelled' : 'failed'),
      startTime: new Date(Date.now() - executionResult.durationMs).toISOString(),
      endTime: new Date().toISOString(),
      durationMs: executionResult.durationMs,
      artifactPath: executionResult.artifactPath,
      exitCode: executionResult.exitCode,
      logSummary: executionResult.logs.slice(-10),
      error: get().lastError || undefined,
    };

    const currentHistory = [historyItem, ...get().history.slice(0, 24)];
    set({ history: currentHistory });

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_HISTORY_KEY}_${project.id}`, JSON.stringify(currentHistory));
      } catch {}
    }

    return executionResult.success;
  },

  cancelBuild: (projectId: string) => {
    GradleRunner.cancelBuild(projectId);
    set({ buildStatus: 'cancelled' });
  },

  cleanProject: async (project: ProjectMetadata) => {
    set({ buildStatus: 'running', currentTask: 'clean', logs: [], lastError: null });
    const result = await GradleRunner.executeTask(
      project,
      'clean',
      get().config,
      {
        onLog: (entry) => set((s) => ({ logs: [...s.logs, entry] })),
        onStatusChange: (status) => set({ buildStatus: status }),
      }
    );
    return result.success;
  },

  rebuildProject: async (project: ProjectMetadata, files: ProjectFile[]) => {
    await get().cleanProject(project);
    return await get().startBuild(project, files);
  },

  scanDevices: async () => {
    set({ isScanningDevices: true });
    try {
      const devices = await DeviceManager.scanDevices();
      set({
        connectedDevices: devices,
        selectedDeviceId: devices.length > 0 ? (get().selectedDeviceId || devices[0].id) : null,
        isScanningDevices: false,
      });
    } catch {
      set({ isScanningDevices: false });
    }
  },

  installApk: async (artifactPath: string, deviceId: string) => {
    const res = await DeviceManager.installApk(artifactPath, deviceId);
    return res.success;
  },

  launchApp: async (packageId: string, deviceId: string) => {
    const res = await DeviceManager.launchApp(packageId, deviceId);
    return res.success;
  },

  clearLogs: () => set({ logs: [] }),
  clearHistory: () => {
    set({ history: [] });
  },
}));
