/**
 * Nusantara App Builder - Project Store
 * Zustand store managing current project, recent projects list, search, and operations.
 */

import { create } from 'zustand';
import { CreateProjectInput, ProjectFile, ProjectMetadata, ValidationResult } from '../types/project';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import { validateProjectCreation } from '../validation/projectValidator';

interface ProjectState {
  projects: ProjectMetadata[];
  activeProject: ProjectMetadata | null;
  activeFiles: ProjectFile[];
  activeFile: ProjectFile | null;
  searchQuery: string;
  isLoading: boolean;
  isCreating: boolean;
  errorMessage: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<{ success: boolean; validation?: ValidationResult; error?: string }>;
  openProject: (projectId: string) => Promise<boolean>;
  closeActiveProject: () => void;
  setActiveFile: (file: ProjectFile | null) => void;
  setSearchQuery: (query: string) => void;
  removeProjectFromRecent: (projectId: string) => Promise<void>;
  deleteProjectPermanently: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  activeFiles: [],
  activeFile: null,
  searchQuery: '',
  isLoading: false,
  isCreating: false,
  errorMessage: null,

  loadProjects: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const list = await NativeBridge.listProjects();
      set({ projects: list, isLoading: false });
    } catch (err: unknown) {
      set({
        isLoading: false,
        errorMessage: err instanceof Error ? err.message : 'Gagal memuat daftar proyek',
      });
    }
  },

  createProject: async (input: CreateProjectInput) => {
    set({ isCreating: true, errorMessage: null });
    const existingProjects = get().projects;
    const validation = validateProjectCreation(input, existingProjects);

    if (!validation.isValid) {
      set({ isCreating: false });
      return { success: false, validation };
    }

    try {
      const { project, files } = await NativeBridge.createProject(input);
      const updatedList = [project, ...existingProjects.filter((p) => p.id !== project.id)];

      set({
        projects: updatedList,
        activeProject: project,
        activeFiles: files,
        activeFile: files[0] || null,
        isCreating: false,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat proyek baru';
      set({ isCreating: false, errorMessage: msg });
      return { success: false, error: msg };
    }
  },

  openProject: async (projectId: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { project, files } = await NativeBridge.openProject(projectId);
      if (!project) {
        set({ isLoading: false, errorMessage: 'Proyek tidak ditemukan' });
        return false;
      }
      const updatedList = await NativeBridge.listProjects();
      set({
        projects: updatedList,
        activeProject: project,
        activeFiles: files,
        activeFile: files.find((f) => f.name === 'MainActivity.kt') || files[0] || null,
        isLoading: false,
      });
      return true;
    } catch (err: unknown) {
      set({
        isLoading: false,
        errorMessage: err instanceof Error ? err.message : 'Gagal membuka proyek',
      });
      return false;
    }
  },

  closeActiveProject: () => {
    set({
      activeProject: null,
      activeFiles: [],
      activeFile: null,
    });
  },

  setActiveFile: (file: ProjectFile | null) => {
    set({ activeFile: file });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  removeProjectFromRecent: async (projectId: string) => {
    await NativeBridge.removeRecentProject(projectId);
    const updated = get().projects.filter((p) => p.id !== projectId);
    const isActive = get().activeProject?.id === projectId;
    set({
      projects: updated,
      activeProject: isActive ? null : get().activeProject,
      activeFiles: isActive ? [] : get().activeFiles,
      activeFile: isActive ? null : get().activeFile,
    });
  },

  deleteProjectPermanently: async (projectId: string) => {
    await NativeBridge.deleteProjectPermanently(projectId);
    const updated = get().projects.filter((p) => p.id !== projectId);
    const isActive = get().activeProject?.id === projectId;
    set({
      projects: updated,
      activeProject: isActive ? null : get().activeProject,
      activeFiles: isActive ? [] : get().activeFiles,
      activeFile: isActive ? null : get().activeFile,
    });
  },

  clearError: () => {
    set({ errorMessage: null });
  },
}));
