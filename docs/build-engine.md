# Android Build Engine — Nusantara App Builder

## Ringkasan Arsitektur (Phase 7)
Mesin Build Nusantara App Builder dirancang khusus untuk desktop Windows dengan eksekusi toolchain Android nyata:
- **Tauri / Rust Process Manager**: Eksekusi perintah aman menggunakan array argumen (`["assembleDebug", "--stacktrace"]`) tanpa penggabungan string shell untuk mencegah command injection.
- **Working Directory Enforced**: Setiap tugas Gradle dijalankan langsung pada direktori root proyek Android (`Working Directory = Project Root`).
- **Secret Masking**: Token API, password keystore, dan sertifikat disaring dan disamarkan secara otomatis (`password=********`) pada stream log.
- **Queue Prevention**: Mencegah eksekusi build ganda secara bersamaan pada proyek yang sama.

## Alur Eksekusi
1. **Pre-Build Validation**: Pemeriksaan Package ID, struktur berkas Gradle, `AndroidManifest.xml` (`android:exported`), SDK levels, dan sumber daya.
2. **Toolchain Check**: Deteksi Java JDK 17/21, Android SDK (platforms, build-tools, platform-tools), dan Gradle wrapper.
3. **Gradle Task Dispatch**: Menjalankan `gradlew.bat assembleDebug`, `assembleRelease`, `bundleRelease`, atau `clean`.
4. **Output Verification**: Memverifikasi keberadaan berkas biner (`.apk` / `.aab`), ukuran berkas > 0, dan mencatat metadata artefak.
5. **Error Parsing**: Memetakan baris galat compiler (Kotlin/Java/AAPT2) agar dapat langsung dibuka pada Editor Kode.
