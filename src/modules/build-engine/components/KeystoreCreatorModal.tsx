/**
 * Nusantara App Builder - Keystore Creator Modal
 * Phase 7: Secure Android Release Keystore Generator (RSA 2048-bit, 25+ years validity).
 */

import React, { useState } from 'react';
import { KeyRound, ShieldAlert, X, Check, Lock, AlertCircle, FileKey } from 'lucide-react';
import { useBuildEngineStore } from '../store/buildEngineStore';
import { SigningService } from '../services/signingService';
import { useTranslation } from '../../localization/useTranslation';
import { useProjectStore } from '../../../store/projectStore';

export const KeystoreCreatorModal: React.FC = () => {
  const { lang } = useTranslation();
  const isOpen = useBuildEngineStore((s) => s.isKeystoreModalOpen);
  const setIsOpen = useBuildEngineStore((s) => s.setIsKeystoreModalOpen);
  const activeProject = useProjectStore((s) => s.activeProject);
  const setSigningConfig = useBuildEngineStore((s) => s.setSigningConfig);

  const [keystoreName, setKeystoreName] = useState(activeProject ? `${activeProject.name}-release.jks` : 'release-key.jks');
  const [alias, setAlias] = useState('release');
  const [storePassword, setStorePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [commonName, setCommonName] = useState(activeProject?.name || 'Developer');
  const [organization, setOrganization] = useState('Nusantara App Builder');
  const [countryCode, setCountryCode] = useState('ID');
  const [validityYears, setValidityYears] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (storePassword.length < 6) {
      setError(lang === 'id' ? 'Kata sandi minimal 6 karakter.' : 'Password must be at least 6 characters.');
      return;
    }

    if (storePassword !== confirmPassword) {
      setError(lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Passwords do not match.');
      return;
    }

    setIsGenerating(true);

    const destDir = activeProject?.location || 'C:\\Users\\Developer\\AndroidStudioProjects';
    const result = await SigningService.createKeystore({
      destinationPath: destDir,
      keystoreName,
      alias,
      storePassword,
      validityYears,
      commonName,
      organization,
      countryCode,
    });

    setIsGenerating(false);

    if (result.success) {
      const newConfig = {
        id: `sign_${activeProject?.id || 'default'}`,
        name: keystoreName,
        keystorePath: result.keystorePath,
        keyAlias: result.alias,
        isConfigured: true,
        v1SigningEnabled: true,
        v2SigningEnabled: true,
        storePasswordSet: true,
        keyPasswordSet: true,
        validUntil: `${new Date().getFullYear() + validityYears}-12-31`,
      };

      if (activeProject) {
        SigningService.saveSigningConfig(activeProject.id, newConfig);
      }
      setSigningConfig(newConfig);
      setIsOpen(false);
    } else {
      setError(result.error || 'Failed generating keystore.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-neutral-100 text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileKey className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {lang === 'id' ? 'Buat Keystore Rilis Baru' : 'Create New Release Keystore'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Kredensial kriptografi RSA-2048 untuk menandatangani APK/AAB' : 'RSA-2048 cryptographic credential to sign APK/AAB'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-800/50 flex items-start gap-2.5 text-[11px] text-amber-200">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">
              {lang === 'id' ? 'Peringatan Keamanan Kredensial:' : 'Security Warning:'}
            </span>{' '}
            {lang === 'id'
              ? 'Keystore adalah sertifikat resmi aplikasi Anda. Simpan salinan cadangan di lokasi yang aman. Jika hilang, Anda tidak dapat memperbarui aplikasi di Google Play.'
              : 'The keystore is your app official identity certificate. Keep backups in a secure location. If lost, you cannot update your app on Google Play.'}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-5 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-2.5 bg-red-950/40 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                {lang === 'id' ? 'Nama Berkas Keystore' : 'Keystore File Name'}
              </label>
              <input
                type="text"
                value={keystoreName}
                onChange={(e) => setKeystoreName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                placeholder="release.jks"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                {lang === 'id' ? 'Key Alias' : 'Key Alias'}
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                placeholder="release"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>{lang === 'id' ? 'Kata Sandi Keystore' : 'Keystore Password'}</span>
              </label>
              <input
                type="password"
                value={storePassword}
                onChange={(e) => setStorePassword(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:border-blue-500 focus:outline-hidden"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                {lang === 'id' ? 'Ulangi Kata Sandi' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:border-blue-500 focus:outline-hidden"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-3">
            <h4 className="font-semibold text-neutral-200 mb-2">
              {lang === 'id' ? 'Sertifikat X.509 (Identitas Penerbit)' : 'X.509 Certificate (Publisher Identity)'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">
                  {lang === 'id' ? 'Nama Pengembang (CN)' : 'Full Name (CN)'}
                </label>
                <input
                  type="text"
                  value={commonName}
                  onChange={(e) => setCommonName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:border-blue-500 focus:outline-hidden"
                  placeholder="Budi Santoso"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">
                  {lang === 'id' ? 'Organisasi / Perusahaan (O)' : 'Organization (O)'}
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 text-xs focus:border-blue-500 focus:outline-hidden"
                  placeholder="Nusantara Studio"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <div>
                <label className="block text-neutral-400 mb-1">
                  {lang === 'id' ? 'Kode Negara (2 Huruf)' : 'Country Code (2 Letters)'}
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 uppercase font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                  placeholder="ID"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">
                  {lang === 'id' ? 'Masa Berlaku (Tahun)' : 'Validity (Years)'}
                </label>
                <input
                  type="number"
                  min={25}
                  max={50}
                  value={validityYears}
                  onChange={(e) => setValidityYears(parseInt(e.target.value, 10) || 30)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-700 rounded text-neutral-100 font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-neutral-800 pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <span>{lang === 'id' ? 'Membuat Keystore...' : 'Generating...'}</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Buat & Gunakan Keystore' : 'Generate & Use Keystore'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
