/**
 * Nusantara App Builder - Environment Doctor & CLI Terminal Modal (Phase 10)
 * Interactive command prompt simulator and 1-click system diagnostics.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Stethoscope,
  RefreshCw,
  Copy,
  Check,
  Send,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { CliEngine } from '../cliEngine';
import { useProjectStore } from '../../../store/projectStore';
import { useTranslation } from '../../localization/useTranslation';
import { useUiStore } from '../../../store/uiStore';

interface TerminalDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommand?: string;
}

export const TerminalDoctorModal: React.FC<TerminalDoctorModalProps> = ({
  isOpen,
  onClose,
  initialCommand = 'doctor',
}) => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string[]; isError?: boolean }>>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const isIndo = lang === 'id';

  const runCommand = (cmdStr: string) => {
    const res = CliEngine.execute(cmdStr, activeProject, projectFiles);
    const combinedOutput = [...res.stdout, ...res.stderr];
    setHistory((prev) => [...prev, { cmd: cmdStr, output: combinedOutput, isError: res.isError }]);
  };

  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      runCommand(initialCommand);
    }
  }, [isOpen, initialCommand]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    runCommand(inputVal);
    setInputVal('');
  };

  const handleCopyHistory = () => {
    const text = history
      .map((h) => `$ nusantara ${h.cmd}\n${h.output.join('\n')}`)
      .join('\n\n');
    navigator.clipboard?.writeText(text);
    showToast(isIndo ? 'Output terminal disalin ke clipboard!' : 'Terminal output copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-neutral-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Terminal Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-white">Nusantara Terminal & Doctor</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                  CLI v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isIndo
                  ? 'Diagnostik toolchain Android dan antarmuka CLI interaktif'
                  : 'Android toolchain diagnostics and interactive CLI console'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runCommand('doctor')}
              className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isIndo ? 'Jalankan Doctor' : 'Run Doctor'}</span>
            </button>
            <button
              onClick={handleCopyHistory}
              className="p-1.5 rounded text-neutral-400 hover:text-white"
              title="Copy Output"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-neutral-200 space-y-4 bg-black/90 min-h-[300px]">
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-neutral-500">nusantara &gt;</span>
                <span className="font-bold">{item.cmd}</span>
              </div>
              <div
                className={`pl-4 leading-relaxed ${
                  item.isError ? 'text-red-400' : 'text-neutral-300'
                }`}
              >
                {item.output.map((line, lIdx) => (
                  <div key={lIdx} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Command Line */}
        <form onSubmit={handleFormSubmit} className="p-3 border-t border-neutral-800 bg-neutral-900/90 flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-cyan-400 pl-2">nusantara &gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isIndo ? 'Ketik perintah (contoh: doctor, template, help)...' : 'Type command (e.g. doctor, template, help)...'}
            className="flex-1 bg-transparent border-none text-xs text-white font-mono focus:outline-none placeholder-neutral-600"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
