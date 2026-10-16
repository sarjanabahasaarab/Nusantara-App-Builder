/**
 * Nusantara App Builder - Desktop Navigation Sidebar
 * Navigation items for Phase 1 modules and roadmap service previews.
 */

import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Palette,
  Zap,
  Code2,
  Globe2,
  Cpu,
  PlaySquare,
  PackageCheck,
  DollarSign,
  Blocks,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../../modules/localization/useTranslation';
import { useUiStore, ActiveView } from '../../store/uiStore';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isComingSoon?: boolean;
  phase?: number;
}

export const Sidebar: React.FC = () => {
  const { t, lang } = useTranslation();
  const activeView = useUiStore((s) => s.activeView);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t.sidebar.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'my-projects',
      label: t.sidebar.myProjects,
      icon: FolderKanban,
    },
    {
      id: 'visual-designer',
      label: t.sidebar.visualDesigner,
      icon: Palette,
    },
    {
      id: 'logic-designer',
      label: lang === 'id' ? 'Logic Designer' : 'Logic Designer',
      icon: Zap,
    },
    {
      id: 'code-editor',
      label: t.sidebar.codeEditor,
      icon: Code2,
    },
    {
      id: 'website-to-apk',
      label: t.sidebar.websiteToApk,
      icon: Globe2,
    },
    {
      id: 'android-sdk',
      label: t.sidebar.androidSdk,
      icon: Cpu,
    },
    {
      id: 'build-run',
      label: lang === 'id' ? 'Build Center (APK/AAB)' : 'Build Center (APK/AAB)',
      icon: PlaySquare,
    },
    {
      id: 'release-center',
      label: lang === 'id' ? 'Release Center (APK/AAB)' : 'Release Center (APK/AAB)',
      icon: PackageCheck,
    },
    {
      id: 'monetization',
      label: t.sidebar.monetization,
      icon: DollarSign,
    },
    {
      id: 'extensions',
      label: t.sidebar.extensions,
      icon: Blocks,
      isComingSoon: true,
      phase: 7,
    },
    {
      id: 'settings',
      label: t.sidebar.settings,
      icon: SettingsIcon,
    },
  ];

  return (
    <aside
      className={`h-full bg-neutral-900 border-r border-neutral-800 text-neutral-300 flex flex-col justify-between shrink-0 transition-all duration-200 select-none ${
        sidebarCollapsed ? 'w-14' : 'w-60'
      } dark:bg-neutral-900 dark:border-neutral-800`}
    >
      {/* Top navigation items */}
      <div className="py-2 flex flex-col gap-0.5 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.isComingSoon && (
                    <span className="text-[10px] text-neutral-400 font-mono tracking-tight shrink-0 ml-1">
                      P{item.phase}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom toggle bar */}
      <div className="p-2 border-t border-neutral-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Sembunyikan Bilah Sisi</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
