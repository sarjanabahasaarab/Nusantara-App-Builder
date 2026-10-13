# Catatan Rilis / Changelog

Seluruh perubahan penting pada proyek ini dicatat dalam berkas ini.

## [0.1.0-alpha] - 2026-10-12
### Phase 1: Open Source Foundation (Windows Desktop IDE)

#### Ditambahkan / Added
- Arsitektur desktop berbasis **Tauri 2.x (Rust)**, **React 19**, **TypeScript strict mode**, dan **Vite**.
- Antarmuka desktop Windows profesional: Title bar kustom, Menu bar (File, Edit, View, Project, Tools, Window, Help), Action Toolbar, Sidebar navigasi, dan Status Bar.
- Dasbor manajemen proyek: Ringkasan metrik, pencarian instan, riwayat proyek terbaru, dan panduan memulai cepat.
- Project Wizard dengan generator struktur source code Android nyata (Kotlin 2.0, Android Gradle Plugin 8.5 `build.gradle.kts`, `AndroidManifest.xml`, strings, themes, layout XML).
- 3 Template Android: *Empty Android Project*, *Basic Activity (Material 3)*, dan *WebView Starter*.
- Validasi nama proyek, Java/Android package ID, jalur direktori, dan pencegahan bentrok duplikasi.
- Dukungan bilingual penuh (Bahasa Indonesia & English) dengan pengalihan seketika.
- Mode tema Terang dan Gelap dengan penyimpanan preferensi lokal.
- Pengaturan umum, tampilan, bahasa, konfigurasi Android SDK/JDK, dan halaman Tentang.
- Pemisahan aman antara penghapusan riwayat dan penghapusan folder fisik.
- Kontrak layanan formal TypeScript untuk modul Phase 2–7 (Visual Designer, Code Editor, Website to APK, Build Engine, AdMob, Ekstensi).
- Pengujian unit otomatis (Vitest) dan workflow GitHub Actions CI.
