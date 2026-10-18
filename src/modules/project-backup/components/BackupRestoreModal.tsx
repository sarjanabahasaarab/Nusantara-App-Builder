/**
 * Nusantara App Builder - Backup & Restore Modal (Phase 10)
 * Visual management for .nabbackup snapshots, pre-restore safety confirmations, and Auto Backup intervals.
 */

import React, { useState, useEffect } from 'react';
import {
  Archive,
  X,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Download,
  Upload,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { BackupEngine } from '../backupEngine';
import { NabBackupRecord, AutoBackupInterval } from '../types';
import { useProjectStore } from '../../../store/projectStore';
import { useUiStore } from '../../../store/uiStore';
import { useTranslation } from '../../localization/useTranslation';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useTranslation();
  const showToast = useUiStore((s) => s.showToast);
  const activeProject = useProjectStore((s) => s.activeProject);
  const projectFiles = useProjectStore((s) => s.files);
  const updateProjectMetadata = useProjectStore((s) => s.updateProjectMetadata);

  const [backups, setBackups] = useState<NabBackupRecord[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<NabBackupRecord | null>(null);
  const [autoInterval, setAutoInterval] = useState<AutoBackupInterval>('30min');
  const [confirmRestoreState, setConfirmRestoreState] = useState<{
    targetBackup: NabBackupRecord;
    shouldBackupFirst: boolean;
  } | null>(null);

  const isIndo = lang === 'id';

  useEffect(() => {
    if (isOpen) {
      setBackups(BackupEngine.getBackups());
      setSelectedBackup(null);
      setConfirmRestoreState(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateManualBackup = () => {
    if (!activeProject) {
      showToast(isIndo ? 'Tidak ada proyek aktif untuk dicadangkan.' : 'No active project to backup.');
      return;
    }

    const newRecord = BackupEngine.createBackup(activeProject, projectFiles, 'manual');
    setBackups(BackupEngine.getBackups());
    setSelectedBackup(newRecord);
    showToast(
      isIndo
        ? `Cadangan "${newRecord.backupName}" berhasil dibuat!`
        : `Backup "${newRecord.backupName}" created successfully!`
    );
  };

  const handleDownloadBackup = (backup: NabBackupRecord) => {
    const jsonStr = BackupEngine.serializeBackup(backup);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backup.projectName.replace(/\s+/g, '_')}_backup_${Date.now()}.nabbackup`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isIndo ? 'Berkas .nabbackup berhasil diunduh!' : '.nabbackup file downloaded!');
  };

  const handleDeleteBackup = (id: string) => {
    BackupEngine.deleteBackup(id);
    setBackups(BackupEngine.getBackups());
    if (selectedBackup?.id === id) setSelectedBackup(null);
  };

  const executeRestore = (target: NabBackupRecord, backupFirst: boolean) => {
    if (backupFirst && activeProject) {
      BackupEngine.createBackup(activeProject, projectFiles, 'manual');
    }

    // Apply restored project state
    updateProjectMetadata(target.archive.manifest.project);
    showToast(
      isIndo
        ? `Proyek berhasil dipulihkan dari cadangan "${target.backupName}"!`
        : `Project restored successfully from "${target.backupName}"!`
    );
    setConfirmRestoreState(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                {isIndo ? 'Pencadangan & Pemulihan Proyek' : 'Project Backup & Restore (.nabbackup)'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isIndo
                  ? 'Cadangkan snapshot lokal secara otomatis atau manual sebelum melakukan perubahan besar'
                  : 'Capture local snapshots automatically or manually before applying major updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateManualBackup}
              disabled={!activeProject}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeProject
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isIndo ? 'Buat Cadangan Baru' : 'Create Backup'}</span>
            </button>
            <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auto Backup Configuration Bar */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">{isIndo ? 'Jadwal Pencadangan Otomatis:' : 'Auto Backup Schedule:'}</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={autoInterval}
              onChange={(e) => setAutoInterval(e.target.value as AutoBackupInterval)}
              className="bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="off">{isIndo ? 'Nonaktif (Off)' : 'Off'}</option>
              <option value="10min">{isIndo ? 'Setiap 10 Menit' : 'Every 10 Minutes'}</option>
              <option value="30min">{isIndo ? 'Setiap 30 Menit (Disarankan)' : 'Every 30 Minutes (Recommended)'}</option>
              <option value="on_close">{isIndo ? 'Saat Proyek Ditutup' : 'On Project Close'}</option>
            </select>
            <span className="text-[11px] text-neutral-400">
              {isIndo ? 'Tersimpan lokal di komputer Anda' : 'Stored locally on your machine'}
            </span>
          </div>
        </div>

        {/* Pre-Restore Guard Warning Dialog */}
        {confirmRestoreState && (
          <div className="p-4 bg-amber-950/40 border-b border-amber-800 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs flex-1">
              <span className="font-bold text-amber-200 block">
                {isIndo ? 'Konfirmasi Pemulihan Cadangan' : 'Confirm Project Restoration'}
              </span>
              <p className="text-neutral-300">
                {isIndo
                  ? 'Proyek yang sedang aktif saat ini akan ditimpa dengan data cadangan ini. Buat cadangan pengaman terlebih dahulu?'
                  : 'Current project will be replaced. Create backup first?'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => executeRestore(confirmRestoreState.targetBackup, true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  {isIndo ? 'Ya, Buat Cadangan & Pulihkan' : 'Yes, Create Backup & Restore'}
                </button>
                <button
                  onClick={() => executeRestore(confirmRestoreState.targetBackup, false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold"
                >
                  {isIndo ? 'Pulihkan Tanpa Cadangan' : 'Restore Without Backup'}
                </button>
                <button
                  onClick={() => setConfirmRestoreState(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white"
                >
                  {isIndo ? 'Batal' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backups List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {isIndo ? 'Daftar Snapshot Cadangan Lokal' : 'Local Backup Snapshots'} ({backups.length})
            </h4>

            {backups.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-500">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>{isIndo ? 'Belum ada cadangan lokal.' : 'No local backups found.'}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((b) => {
                  const isSelected = selectedBackup?.id === b.id;
                  const verify = BackupEngine.verifyBackup(b);

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBackup(b)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-800 border-cyan-500 ring-1 ring-cyan-500'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white truncate max-w-[220px]">
                          {b.backupName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-neutral-800 text-neutral-400 uppercase">
                          {b.trigger}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                        <span>{new Date(b.createdAt).toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          {verify.isValid ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 text-[10px]">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Corrupted</span>
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadBackup(b);
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                            title="Download .nabbackup"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBackup(b.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Backup Details & Restore Panel */}
          <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-4 flex flex-col justify-between">
            {selectedBackup ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-800">
                  <h3 className="font-bold text-sm text-white">{selectedBackup.backupName}</h3>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    ID Proyek: <span className="font-mono text-neutral-200">{selectedBackup.projectId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px] uppercase">Jumlah Berkas</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedBackup.archive.files.length} berkas
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px] uppercase">Ukuran Data</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {(selectedBackup.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs space-y-1">
                  <div className="font-semibold text-neutral-300">Target Manifest:</div>
                  <div className="text-neutral-400 text-[11px]">
                    Nama: {selectedBackup.archive.manifest.project.name}
                  </div>
                  <div className="text-neutral-400 text-[11px] font-mono">
                    Paket: {selectedBackup.archive.manifest.project.packageId}
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    Versi: {selectedBackup.archive.manifest.project.versionName} (Build {selectedBackup.archive.manifest.project.versionCode})
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-neutral-500 text-xs my-auto">
                {isIndo
                  ? 'Pilih salah satu cadangan di samping untuk melihat detail dan opsi pemulihan.'
                  : 'Select a backup snapshot from the list to view details and restore.'}
              </div>
            )}

            {selectedBackup && (
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleDownloadBackup(selectedBackup)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIndo ? 'Unduh Berkas .nabbackup' : 'Download .nabbackup'}</span>
                </button>

                <button
                  onClick={() =>
                    setConfirmRestoreState({
                      targetBackup: selectedBackup,
                      shouldBackupFirst: true,
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-600/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isIndo ? 'Pulihkan Proyek Ini' : 'Restore This Project'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
