# Android SDK & Toolchain Configuration

## Deteksi Otomatis pada Windows
Nusantara App Builder secara otomatis memindai lokasi SDK berikut tanpa mengubah environment variable Windows:
1. Variabel lingkungan `ANDROID_HOME` & `ANDROID_SDK_ROOT`
2. `%LOCALAPPDATA%\Android\Sdk` (lokasi standar Android Studio di Windows)
3. `C:\Android\Sdk` dan `C:\Program Files (x86)\Android\android-sdk`

## Komponen yang Diperiksa
- **Platform**: Android SDK Platform (API 34 / Android 14, API 35 / Android 15).
- **Build Tools**: Versi `34.0.0` dan `35.0.0` (`aapt2.exe`, `d8.bat`).
- **Platform Tools**: `adb.exe` untuk manajemen koneksi perangkat.
- **Command-line Tools**: `sdkmanager.bat`.

## Pemasangan Komponen
Gunakan tombol **Instal Komponen SDK** pada Build Center untuk mengunduh paket resmi dari repositori Google (`dl.google.com/android`).
