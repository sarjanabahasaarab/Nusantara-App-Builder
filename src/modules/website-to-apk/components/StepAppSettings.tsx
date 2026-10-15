/**
 * Nusantara App Builder - Website to APK
 * Step 7: App Window & Android System Permissions
 */

import React from 'react';
import {
  Smartphone,
  Maximize,
  Shield,
  Camera,
  Mic,
  MapPin,
  Image as ImageIcon,
  Bell,
  Wifi,
  Sun,
  Layout,
  Lock,
} from 'lucide-react';
import { useWebsiteToApkStore } from '../store/websiteToApkStore';
import { useTranslation } from '../../localization/useTranslation';

export const StepAppSettings: React.FC = () => {
  const { lang } = useTranslation();

  const appSettings = useWebsiteToApkStore((s) => s.appSettings);
  const updateAppSettings = useWebsiteToApkStore((s) => s.updateAppSettings);
  const permissions = useWebsiteToApkStore((s) => s.permissions);
  const updatePermissions = useWebsiteToApkStore((s) => s.updatePermissions);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Window & Display Settings */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Layout className="w-4 h-4 text-blue-400" />
            <span>{lang === 'id' ? 'Tampilan Jendela & Orientasi' : 'Window & Orientation Settings'}</span>
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              {lang === 'id' ? 'Orientasi Layar (Screen Orientation)' : 'Screen Orientation'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'auto', label: lang === 'id' ? 'Otomatis' : 'Sensor / Auto' },
                  { id: 'portrait', label: 'Portrait' },
                  { id: 'landscape', label: 'Landscape' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateAppSettings({ orientation: opt.id })}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                    appSettings.orientation === opt.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edge to Edge */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Edge-to-Edge Display' : 'Edge-to-Edge Display'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Status bar & Navigation bar transparan modern' : 'Transparent status & navigation bars'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={appSettings.edgeToEdge}
              onChange={(e) => updateAppSettings({ edgeToEdge: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Fullscreen */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Mode Layar Penuh (Fullscreen)' : 'Fullscreen Immersive Mode'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Sembunyikan bilah status untuk pengalaman game/media' : 'Hide status bar for media/games'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={appSettings.fullScreen}
              onChange={(e) => updateAppSettings({ fullScreen: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Keep Screen On */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-neutral-200">
                {lang === 'id' ? 'Pertahankan Layar Tetap Menyala' : 'Keep Screen On'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {lang === 'id' ? 'Mencegah ponsel tidur saat aplikasi aktif' : 'Prevents phone from sleeping'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={appSettings.keepScreenOn}
              onChange={(e) => updateAppSettings({ keepScreenOn: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Native Top App Bar */}
          <div className="pt-3 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-neutral-200">
                  {lang === 'id' ? 'Bilah Header Android (Top App Bar)' : 'Native Top App Bar Toolbar'}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Toolbar bawaan Material Toolbar di atas WebView' : 'Native MaterialToolbar above WebView'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={appSettings.enableTopAppBar}
                onChange={(e) => updateAppSettings({ enableTopAppBar: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {appSettings.enableTopAppBar && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {lang === 'id' ? 'Judul Header' : 'Header Title'}
                  </label>
                  <input
                    type="text"
                    value={appSettings.topAppBarTitle || ''}
                    onChange={(e) => updateAppSettings({ topAppBarTitle: e.target.value })}
                    placeholder="Judul aplikasi..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1 text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {lang === 'id' ? 'Warna Toolbar' : 'Toolbar Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appSettings.topAppBarBgColor}
                      onChange={(e) => updateAppSettings({ topAppBarBgColor: e.target.value })}
                      className="w-7 h-7 rounded border border-neutral-700 bg-neutral-950 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-neutral-300">
                      {appSettings.topAppBarBgColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Android Manifest Permissions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-2 pb-2 border-b border-neutral-800">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'id' ? 'Izin Sistem Android (Permissions)' : 'Android Permissions'}</span>
          </div>

          {/* Internet (Mandatory) */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">INTERNET & ACCESS_NETWORK_STATE</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Wajib untuk koneksi web & status offline' : 'Required for network connection'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Wajib (Active)
            </span>
          </div>

          {/* Camera */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">CAMERA</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Dibutuhkan jika website mengambil foto langsung via WebRTC/kamera' : 'Photo capture & WebRTC camera'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.camera}
              onChange={(e) => updatePermissions({ camera: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Microphone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">RECORD_AUDIO</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Dibutuhkan untuk voice search / WebRTC video call' : 'Audio recording & WebRTC'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.recordAudio}
              onChange={(e) => updatePermissions({ recordAudio: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">ACCESS_FINE_LOCATION</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Dibutuhkan untuk Geolocation API / peta' : 'HTML5 Geolocation API & GPS'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.fineLocation}
              onChange={(e) => updatePermissions({ fineLocation: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Media Images */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">READ_MEDIA_IMAGES</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Pemilih galeri untuk Android 13+' : 'Gallery image picker (Android 13+)'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.readMediaImages}
              onChange={(e) => updatePermissions({ readMediaImages: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="text-xs font-medium text-neutral-200">POST_NOTIFICATIONS</div>
                <div className="text-[11px] text-neutral-400">
                  {lang === 'id' ? 'Push notifikasi untuk Android 13+' : 'Push notifications (Android 13+)'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={permissions.postNotifications}
              onChange={(e) => updatePermissions({ postNotifications: e.target.checked })}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
