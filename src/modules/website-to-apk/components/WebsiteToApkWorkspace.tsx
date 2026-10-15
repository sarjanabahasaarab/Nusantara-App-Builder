/**
 * Nusantara App Builder - Website to APK & AAB Workspace
 * Phase 5: Complete 8-step wizard workspace for converting online and local websites into production Android projects.
 */

import React from 'react';
import {
  Globe2,
  FolderArchive,
  Activity,
  Smartphone,
  Layers,
  Settings,
  ShieldCheck,
  Layout,
  Play,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';
import { StepSource } from './StepSource';
import { StepAnalyzer } from './StepAnalyzer';
import { StepAppInfo } from './StepAppInfo';
import { StepIconSplash } from './StepIconSplash';
import { StepWebView } from './StepWebView';
import { StepSecurityDomain } from './StepSecurityDomain';
import { StepAppSettings } from './StepAppSettings';
import { StepPreviewGenerate } from './StepPreviewGenerate';

const WIZARD_STEPS = [
  { step: 1, id: 'source', label: '1. Sumber', enLabel: '1. Source', icon: Globe2 },
  { step: 2, id: 'analyzer', label: '2. Analyzer', enLabel: '2. Analyzer', icon: Activity },
  { step: 3, id: 'info', label: '3. Info Aplikasi', enLabel: '3. App Info', icon: Smartphone },
  { step: 4, id: 'icon', label: '4. Ikon & Splash', enLabel: '4. Icon & Splash', icon: Layers },
  { step: 5, id: 'webview', label: '5. WebView', enLabel: '5. WebView', icon: Settings },
  { step: 6, id: 'security', label: '6. Keamanan', enLabel: '6. Security', icon: ShieldCheck },
  { step: 7, id: 'settings', label: '7. Layar & Izin', enLabel: '7. Window & Perms', icon: Layout },
  { step: 8, id: 'generate', label: '8. Pratinjau & Buat', enLabel: '8. Preview & Build', icon: Sparkles },
];

export const WebsiteToApkWorkspace: React.FC = () => {
  const { lang } = useTranslation();

  const currentStep = useWebsiteToApkStore((s) => s.currentStep);
  const setStep = useWebsiteToApkStore((s) => s.setStep);
  const nextStep = useWebsiteToApkStore((s) => s.nextStep);
  const prevStep = useWebsiteToApkStore((s) => s.prevStep);
  const resetWizard = useWebsiteToApkStore((s) => s.resetWizard);
  const generatedProject = useWebsiteToApkStore((s) => s.generatedProject);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepSource />;
      case 2:
        return <StepAnalyzer />;
      case 3:
        return <StepAppInfo />;
      case 4:
        return <StepIconSplash />;
      case 5:
        return <StepWebView />;
      case 6:
        return <StepSecurityDomain />;
      case 7:
        return <StepAppSettings />;
      case 8:
        return <StepPreviewGenerate />;
      default:
        return <StepSource />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-neutral-800 bg-neutral-900/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <span>{lang === 'id' ? 'Website to Android App (APK & AAB)' : 'Website to Android App (APK & AAB)'}</span>
              <span className="text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
                Phase 5
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {lang === 'id'
                ? 'Konversi website online atau folder web lokal menjadi proyek Android Kotlin nyata'
                : 'Convert online or local website into a real native Android Kotlin project'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetWizard}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset Wizard"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Step Stepper Navigation Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-2 overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-1 min-w-max">
          {WIZARD_STEPS.map((s, idx) => {
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step || !!generatedProject;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.step)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>{lang === 'id' ? s.label : s.enLabel}</span>
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </button>

                {idx < WIZARD_STEPS.length - 1 && (
                  <div className="w-4 h-px bg-neutral-800 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Viewport (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto">
        {renderStepContent()}
      </div>

      {/* Footer Navigation Bar */}
      <div className="h-16 border-t border-neutral-800 bg-neutral-900/90 px-6 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'id' ? 'Sebelumnya' : 'Previous'}</span>
        </button>

        <div className="text-xs text-neutral-500 font-medium">
          {lang === 'id' ? `Langkah ${currentStep} dari 8` : `Step ${currentStep} of 8`}
        </div>

        {currentStep < 8 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>{lang === 'id' ? 'Lanjutkan' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs text-neutral-400 font-medium">
            {generatedProject
              ? lang === 'id'
                ? 'Proyek telah selesai dibuat'
                : 'Project created successfully'
              : lang === 'id'
              ? 'Tinjau dan buat proyek di atas'
              : 'Review and generate project above'}
          </div>
        )}
      </div>
    </div>
  );
};
