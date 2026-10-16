/**
 * Nusantara App Builder - UI Store
 * Zustand store managing views, dialogs, modals, and window status.
 */

import { create } from 'zustand';
import { ProjectMetadata } from '../types/project';

export type ActiveView =
  | 'dashboard'
  | 'my-projects'
  | 'project-detail'
  | 'visual-designer'
  | 'logic-designer'
  | 'code-editor'
  | 'website-to-apk'
  | 'android-sdk'
  | 'build-run'
  | 'monetization'
  | 'extensions'
  | 'settings';

interface UiState {
  activeView: ActiveView;
  wizardOpen: boolean;
  openProjectModalOpen: boolean;
  deleteModalProject: ProjectMetadata | null;
  sidebarCollapsed: boolean;
  isWindowMaximized: boolean;
  toastMessage: string | null;

  setActiveView: (view: ActiveView) => void;
  openWizard: () => void;
  closeWizard: () => void;
  setOpenProjectModalOpen: (open: boolean) => void;
  setDeleteModalProject: (project: ProjectMetadata | null) => void;
  toggleSidebar: () => void;
  toggleMaximize: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeView: 'dashboard',
  wizardOpen: false,
  openProjectModalOpen: false,
  deleteModalProject: null,
  sidebarCollapsed: false,
  isWindowMaximized: false,
  toastMessage: null,

  setActiveView: (view: ActiveView) => set({ activeView: view }),
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () => set({ wizardOpen: false }),
  setOpenProjectModalOpen: (open) => set({ openProjectModalOpen: open }),
  setDeleteModalProject: (project) => set({ deleteModalProject: project }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMaximize: () => set((s) => ({ isWindowMaximized: !s.isWindowMaximized })),
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3500);
  },
  clearToast: () => set({ toastMessage: null }),
}));
