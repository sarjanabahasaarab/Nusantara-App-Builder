/**
 * Nusantara App Builder - Windows Desktop IDE Foundation (Phase 1)
 * Open Source Foundation
 */

import React, { useEffect } from 'react';
import { TitleBar } from './components/ui/TitleBar';
import { MenuBar } from './components/ui/MenuBar';
import { Toolbar } from './components/ui/Toolbar';
import { Sidebar } from './components/ui/Sidebar';
import { StatusBar } from './components/ui/StatusBar';
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal';
import { OpenProjectModal } from './components/ui/OpenProjectModal';
import { ProjectWizardModal } from './modules/project-manager/ProjectWizardModal';

// Views
import { DashboardView } from './modules/dashboard/DashboardView';
import { MyProjectsView } from './modules/project-manager/MyProjectsView';
import { ProjectDetailView } from './modules/project-manager/ProjectDetailView';
import { AndroidSdkView } from './modules/environment/AndroidSdkView';
import { SettingsView } from './modules/settings/SettingsView';
import { VisualDesignerWorkspace } from './modules/visual-designer/VisualDesignerWorkspace';
import { CodeEditorWorkspace } from './modules/code-editor/CodeEditorWorkspace';
import { WebsiteToApkWorkspace } from './modules/website-to-apk/components/WebsiteToApkWorkspace';
import { ComingSoonView } from './modules/contracts/ComingSoonView';

// Stores
import { useUiStore } from './store/uiStore';
import { useProjectStore } from './store/projectStore';
import { useEnvStore } from './store/envStore';

export default function App() {
  const activeView = useUiStore((s) => s.activeView);
  const toastMessage = useUiStore((s) => s.toastMessage);
  const loadProjects = useProjectStore((s) => s.loadProjects);
  const checkEnvironment = useEnvStore((s) => s.checkEnvironment);

  useEffect(() => {
    // Initial load of registered projects and environment scan
    loadProjects();
    checkEnvironment();
  }, [loadProjects, checkEnvironment]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'my-projects':
        return <MyProjectsView />;
      case 'project-detail':
        return <ProjectDetailView />;
      case 'android-sdk':
        return <AndroidSdkView />;
      case 'settings':
        return <SettingsView />;
      case 'visual-designer':
        return <VisualDesignerWorkspace />;
      case 'code-editor':
        return <CodeEditorWorkspace />;
      case 'website-to-apk':
        return <WebsiteToApkWorkspace />;
      case 'build-run':
      case 'monetization':
      case 'extensions':
        return <ComingSoonView view={activeView} />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* 1. Custom Windows Title Bar */}
      <TitleBar />

      {/* 2. Menu Bar (File, Edit, View, Project, Tools, Window, Help) */}
      <MenuBar />

      {/* 3. Action Toolbar */}
      <Toolbar />

      {/* 4. Main Workspace (Sidebar + Dynamic Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          {renderActiveView()}
        </main>
      </div>

      {/* 5. Desktop Status Bar */}
      <StatusBar />

      {/* Modals & Dialogs */}
      <ProjectWizardModal />
      <OpenProjectModal />
      <DeleteConfirmModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 bg-neutral-900 border border-neutral-700 text-neutral-100 px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
