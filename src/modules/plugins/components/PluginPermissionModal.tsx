/**
 * Nusantara App Builder - Plugin Permission Request Modal
 * Phase 10: Explicit Allow/Deny capability prompt (defaults to Deny).
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X, Shield, Lock } from 'lucide-react';
import { usePluginStore } from '../store/pluginStore';
import { PERMISSION_METADATA } from '../services/pluginSecurity';
import { useTranslation } from '../../localization/useTranslation';

export const PluginPermissionModal: React.FC = () => {
  const { lang } = useTranslation();
  const request = usePluginStore((s) => s.pendingPermissionRequest);
  const respond = usePluginStore((s) => s.respondPermissionRequest);

  if (!request) return null;

  const isIndo = lang === 'id';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              {isIndo ? 'Permintaan Izin Plugin' : 'Plugin Permission Request'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isIndo
                ? `Plugin "${request.pluginName}" meminta izin akses berikut:`
                : `Plugin "${request.pluginName}" requests the following permissions:`}
            </p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {request.requestedPermissions.map((perm) => {
            const meta = PERMISSION_METADATA[perm];
            const isCritical = meta?.risk === 'critical';
            const isHigh = meta?.risk === 'high';

            return (
              <div
                key={perm}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  isCritical
                    ? 'bg-red-950/20 border-red-800/60 text-red-200'
                    : isHigh
                    ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-200'
                }`}
              >
                {isCritical || isHigh ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {isIndo ? meta?.nameId || perm : meta?.name || perm}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                    {isIndo ? meta?.descriptionId : meta?.description}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg text-[11px] text-neutral-400 leading-relaxed flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
            <span>
              {isIndo
                ? 'Secara default izin dinonaktifkan (Deny) demi keamanan sistem operasi dan berkas proyek Anda.'
                : 'Permissions are denied by default to protect your filesystem and project integrity.'}
            </span>
          </div>
        </div>

        {/* Footer Actions (Default Deny) */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-end gap-2.5">
          <button
            onClick={() => respond(false)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            {isIndo ? 'Tolak (Deny)' : 'Deny'}
          </button>
          <button
            onClick={() => respond(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-md shadow-blue-600/20"
          >
            {isIndo ? 'Izinkan (Allow)' : 'Allow'}
          </button>
        </div>
      </div>
    </div>
  );
};
