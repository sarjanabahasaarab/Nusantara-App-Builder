# Android App Bundle (AAB)

## Format Rilis Google Play
Android App Bundle (`.aab`) adalah format publikasi standar Google Play Store:
- **Tugas Gradle**: `bundleRelease`
- **Output Path**: `app/build/outputs/bundle/release/app-release.aab`
- **Keunggulan**: Google Play Dynamic Delivery menghasilkan APK yang dioptimalkan sesuai arsitektur CPU dan resolusi layar perangkat pengguna (ukuran unduhan lebih kecil hingga 35%).
- **Keamanan**: Wajib ditandatangani dengan Keystore rilis atau didaftarkan pada Google Play App Signing.
