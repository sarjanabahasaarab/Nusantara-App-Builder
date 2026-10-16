# Android Application Package (APK)

## Perbedaan Debug APK vs Release APK
| Karakteristik | Debug APK | Release APK |
| :--- | :--- | :--- |
| **Gradle Task** | `assembleDebug` | `assembleRelease` |
| **Signing** | Otomatis dengan Debug Key Android | Wajib Keystore Rilis Resmi (`.jks`) |
| **Optimasi R8/ProGuard** | Nonaktif (Kompilasi Cepat) | Aktif (Shrinking & Obfuscation) |
| **Output Path** | `app/build/outputs/apk/debug/app-debug.apk` | `app/build/outputs/apk/release/app-release.apk` |
| **Penggunaan** | Pengujian di HP pengembang & emulator | Distribusi internal, direct download |
