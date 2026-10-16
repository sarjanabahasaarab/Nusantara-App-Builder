/**
 * Nusantara App Builder - Professional Release Signing Manager Modal
 * Phase 8: Existing Keystore configuration, New Keystore creation via keytool,
 * memory-only password security, and APK Signature Scheme v1/v2 enforcement.
 */

import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  X,
  Check,
  Lock,
  AlertCircle,
  FileKey,
  FolderOpen,
  Sparkles,
  Info,
} from 'lucide-react';
import { useReleaseCenterStore } from '../store/releaseCenterStore';
import { SigningService } from '../../build-engine/services/signingService';
import { useTranslation } from '../../localization/useTranslation';
import { useProjectStore } from '../../../store/projectStore';

export const SigningManagerModal: React.FC = () => {
  const { lang, t } = useTranslation();
  const isOpen = useReleaseCenterStore((s) => s.isSigningModalOpen);
  const setIsOpen = useReleaseCenterStore((s) => s.setIsSigningModalOpen);
  const signingProfile = useReleaseCenterStore((s) => s.signingProfile);
  const setSigningProfile = useReleaseCenterStore((s) => s.setSigningProfile);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');

  // Existing Keystore form
  const [existingPath, setExistingPath] = useState(signingProfile.keystorePath || '');
  const [existingAlias, setExistingAlias] = useState(signingProfile.keyAlias || '');
  const [existingStorePass, setExistingStorePass] = useState('');
  const [existingKeyPass, setExistingKeyPass] = useState('');
  const [v1Signing, setV1Signing] = useState(signingProfile.v1Signing);
  const [v2Signing, setV2Signing] = useState(signingProfile.v2Signing);

  // Create Keystore form
  const [newKeystoreName, setNewKeystoreName] = useState(
    activeProject ? `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-release.jks` : 'release-key.jks'
  );
  const [newDestPath, setNewDestPath] = useState(
    activeProject?.location ? `${activeProject.location}\\keystore` : 'C:\\Users\\Developer\\keystores'
  );
  const [newAlias, setNewAlias] = useState('release');
  const [newStorePass, setNewStorePass] = useState('');
  const [newConfirmStorePass, setNewConfirmStorePass] = useState('');
  const [newKeyPass, setNewKeyPass] = useState('');
  const [commonName, setCommonName] = useState(activeProject?.name || 'Developer');
  const [organization, setOrganization] = useState('Nusantara Studio');
  const [countryCode, setCountryCode] = useState('ID');
  const [validityYears, setValidityYears] = useState(30);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveExisting = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!existingPath.trim()) {
      setError(lang === 'id' ? 'Path keystore tidak boleh kosong.' : 'Keystore path cannot be empty.');
      return;
    }
    if (!existingAlias.trim()) {
      setError(lang === 'id' ? 'Alias kunci tidak boleh kosong.' : 'Key alias cannot be empty.');
      return;
    }
    if (!existingStorePass && !signingProfile.storePasswordSet) {
      setError(lang === 'id' ? 'Kata sandi keystore diperlukan.' : 'Keystore password is required.');
      return;
    }

    setSigningProfile({
      ...signingProfile,
      keystorePath: existingPath.trim(),
      keyAlias: existingAlias.trim(),
      v1Signing,
      v2Signing,
      storePasswordSet: Boolean(existingStorePass || signingProfile.storePasswordSet),
      keyPasswordSet: Boolean(existingKeyPass || signingProfile.keyPasswordSet),
      isConfigured: true,
      validUntil: signingProfile.validUntil || '2054-12-31',
    });

    if (activeProject) {
      SigningService.saveSigningConfig(activeProject.id, {
        id: signingProfile.id,
        name: signingProfile.name,
        keystorePath: existingPath.trim(),
        keyAlias: existingAlias.trim(),
        v1SigningEnabled: v1Signing,
        v2SigningEnabled: v2Signing,
        storePasswordSet: true,
        keyPasswordSet: true,
        isConfigured: true,
        validUntil: '2054-12-31',
      });
    }

    setSuccessMsg(
      lang === 'id'
        ? 'Konfigurasi penandatanganan rilis berhasil disimpan!'
        : 'Release signing configuration saved successfully!'
    );
    setTimeout(() => {
      setSuccessMsg(null);
      setIsOpen(false);
    }, 900);
  };

  const handleCreateKeystore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newStorePass.length < 6) {
      setError(
        lang === 'id'
          ? 'Kata sandi keystore minimal 6 karakter.'
          : 'Keystore password must be at least 6 characters.'
      );
      return;
    }

    if (newStorePass !== newConfirmStorePass) {
      setError(
        lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Store passwords do not match.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const result = await SigningService.createKeystore({
        destinationPath: newDestPath,
        keystoreName: newKeystoreName,
        alias: newAlias,
        storePassword: newStorePass,
        keyPassword: newKeyPass || newStorePass,
        validityYears,
        commonName,
        organization,
        countryCode,
      });

      if (result.success) {
        setSigningProfile({
          id: `sign_${Date.now()}`,
          name: `Release Key (${newAlias})`,
          keystorePath: result.keystorePath,
          keyAlias: result.alias,
          v1Signing: true,
          v2Signing: true,
          storePasswordSet: true,
          keyPasswordSet: true,
          isConfigured: true,
          validUntil: `${new Date().getFullYear() + validityYears}-12-31`,
        });

        if (activeProject) {
          SigningService.saveSigningConfig(activeProject.id, {
            id: `sign_${activeProject.id}`,
            name: `Release Key (${newAlias})`,
            keystorePath: result.keystorePath,
            keyAlias: result.alias,
            v1SigningEnabled: true,
            v2SigningEnabled: true,
            storePasswordSet: true,
            keyPasswordSet: true,
            isConfigured: true,
            validUntil: `${new Date().getFullYear() + validityYears}-12-31`,
          });
        }

        setSuccessMsg(
          lang === 'id'
            ? `Keystore baru berhasil dibuat di: ${result.keystorePath}`
            : `New keystore successfully created at: ${result.keystorePath}`
        );

        setTimeout(() => {
          setSuccessMsg(null);
          setIsProcessing(false);
          setIsOpen(false);
        }, 1200);
      } else {
        setError(result.error || 'Failed to create keystore.');
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating keystore.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {lang === 'id' ? 'Manajer Penandatanganan Rilis (Signing Manager)' : 'Release Signing Manager'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'id'
                  ? 'Konfigurasikan kunci penandatanganan RSA-2048 resmi untuk Google Play & distribusi APK'
                  : 'Configure official RSA-2048 signing keys for Google Play and standalone APKs'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Banner */}
        <div className="px-5 py-2.5 bg-blue-950/40 border-b border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-300">
          <Lock className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="font-semibold">
              {lang === 'id' ? 'Keamanan Kata Sandi Terjamin:' : 'Secure Password Guarantee:'}
            </span>{' '}
            {lang === 'id'
              ? 'Kata sandi keystore tidak pernah disimpan dalam berkas proyek JSON atau committed ke Git. Kata sandi dipertahankan hanya di memori sesi aktif.'
              : 'Keystore passwords are never saved in plain text in project JSON or committed to Git. Passwords reside only in active session memory.'}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('existing');
              setError(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'existing'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileKey className="w-4 h-4" />
            {lang === 'id' ? 'Gunakan Keystore yang Ada' : 'Existing Keystore'}
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setError(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {lang === 'id' ? 'Buat Keystore Baru (keytool)' : 'Create New Keystore (keytool)'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg flex items-center gap-2.5 text-emerald-200 text-xs">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'existing' ? (
            <form onSubmit={handleSaveExisting} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  {lang === 'id' ? 'Path Berkas Keystore (.jks / .keystore)' : 'Keystore File Path (.jks / .keystore)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={existingPath}
                    onChange={(e) => setExistingPath(e.target.value)}
                    placeholder="C:\Users\Developer\keystores\release-key.jks"
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeProject?.location) {
                        setExistingPath(`${activeProject.location}\\release-key.jks`);
                      } else {
                        setExistingPath('C:\\Users\\Developer\\keystores\\release-key.jks');
                      }
                    }}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Gunakan Standar' : 'Use Default'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Alias Kunci (Key Alias)' : 'Key Alias'}
                  </label>
                  <input
                    type="text"
                    value={existingAlias}
                    onChange={(e) => setExistingAlias(e.target.value)}
                    placeholder="release"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Kata Sandi Keystore' : 'Keystore Password'}
                  </label>
                  <input
                    type="password"
                    value={existingStorePass}
                    onChange={(e) => setExistingStorePass(e.target.value)}
                    placeholder={signingProfile.storePasswordSet ? '•••••••• (Tersimpan di Sesi)' : 'Masukkan kata sandi'}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  {lang === 'id' ? 'Kata Sandi Kunci (Opsional jika sama dengan Keystore)' : 'Key Password (Optional if same as store)'}
                </label>
                <input
                  type="password"
                  value={existingKeyPass}
                  onChange={(e) => setExistingKeyPass(e.target.value)}
                  placeholder={signingProfile.keyPasswordSet ? '•••••••• (Sama dengan Keystore)' : 'Kosongkan jika sama'}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Signature Schemes Checkbox */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-2">
                <span className="text-xs font-medium text-neutral-300 block">
                  {lang === 'id' ? 'Skema Penandatanganan Android:' : 'Android Signature Schemes:'}
                </span>
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v1Signing}
                    onChange={(e) => setV1Signing(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    <strong className="text-white">V1 (JAR Signature)</strong> —{' '}
                    {lang === 'id' ? 'Kompatibilitas Android versi lama (< 7.0)' : 'Backward compatibility for Android < 7.0'}
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v2Signing}
                    onChange={(e) => setV2Signing(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>
                    <strong className="text-white">V2 (Full APK Signature)</strong> —{' '}
                    {lang === 'id' ? 'Wajib untuk Android 7.0+ dan Google Play Store' : 'Required for Android 7.0+ and Google Play'}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'id' ? 'Terapkan Konfigurasi' : 'Apply Configuration'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateKeystore} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Nama Berkas (.jks)' : 'Keystore File Name'}
                  </label>
                  <input
                    type="text"
                    value={newKeystoreName}
                    onChange={(e) => setNewKeystoreName(e.target.value)}
                    placeholder="my-release-key.jks"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Alias Kunci' : 'Key Alias'}
                  </label>
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="release"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  {lang === 'id' ? 'Direktori Penyimpanan' : 'Destination Folder'}
                </label>
                <input
                  type="text"
                  value={newDestPath}
                  onChange={(e) => setNewDestPath(e.target.value)}
                  placeholder="C:\Users\Developer\keystores"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Kata Sandi (Min 6 Karakter)' : 'Password (Min 6 Chars)'}
                  </label>
                  <input
                    type="password"
                    value={newStorePass}
                    onChange={(e) => setNewStorePass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {lang === 'id' ? 'Konfirmasi Kata Sandi' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    value={newConfirmStorePass}
                    onChange={(e) => setNewConfirmStorePass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Certificate Distinguished Name (DN) */}
              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'id' ? 'Identitas Sertifikat (X.509 RSA-2048)' : 'Certificate Identity (X.509 RSA-2048)'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-neutral-400 mb-0.5">
                      {lang === 'id' ? 'Nama Pengembang / Organisasi (CN)' : 'Common Name / Developer (CN)'}
                    </label>
                    <input
                      type="text"
                      value={commonName}
                      onChange={(e) => setCommonName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">
                      {lang === 'id' ? 'Kode Negara (C)' : 'Country Code (C)'}
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">
                      {lang === 'id' ? 'Perusahaan / Organisasi (O)' : 'Organization (O)'}
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-0.5">
                      {lang === 'id' ? 'Masa Berlaku (Tahun)' : 'Validity (Years)'}
                    </label>
                    <input
                      type="number"
                      min={25}
                      max={50}
                      value={validityYears}
                      onChange={(e) => setValidityYears(parseInt(e.target.value) || 25)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? lang === 'id'
                        ? 'Menjalankan keytool...'
                        : 'Generating keystore...'
                      : lang === 'id'
                      ? 'Buat Keystore RSA-2048'
                      : 'Generate RSA-2048 Keystore'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
