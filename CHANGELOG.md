# Catatan Rilis / Changelog

Seluruh perubahan penting pada proyek ini dicatat dalam berkas ini.

## [0.3.0-alpha] - 2026-10-14
### Phase 3: Visual Designer (WYSIWYG Android Layout Engine)

#### Ditambahkan / Added
- **Visual Designer Workspace**: Editor tata letak Android visual desktop 3-panel (Component Palette, Phone Canvas, Properties Panel).
- **Component Palette**: 18 komponen Android dalam 5 kategori (Layout, Typography, Inputs, Media, Utility) dengan ikon, deskripsi, pencarian instan, dan dukungan drag-and-drop.
- **Phone Canvas**: Kanvas ponsel interaktif dengan bezel realistis, Status Bar, App Bar, scroll konten, rotasi potret/lanskap, preset perangkat (Pixel 7, Galaxy S23, Tablet 11"), dan zoom 50%–200%.
- **Properties Panel**: Inspektur properti 3 tab (Spesifik, Tata Letak, Umum) dengan validasi ID Android unik, margin, padding, warna heksadesimal, ukuran teks sp, dan aksi tombol.
- **Sistem Drag-and-Drop**: Penempatan komponen bebas, penyusunan kontainer bertingkat (nested containers), dan pencegahan referensi melingkar (*circular reference protection*).
- **Undo & Redo State Machine**: Riwayat perubahan hingga 30 langkah untuk penambahan, penghapusan, pemindahan, pengubahan properti, dan penggantian nama layar.
- **Manajemen Banyak Layar (Multi-screen Management)**: Tambah layar baru, ganti nama, gandakan, hapus dengan konfirmasi, dan tentukan layar peluncur (*launcher/home screen*).
- **Android XML Layout Generator**: Pembangkitan layout Android XML standar (`xmlns:android`, `xmlns:app`, `xmlns:tools`) dengan sanitasi karakter XML (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `\'`) dan penyimpanan otomatis ke `app/src/main/res/layout/`.
- **Uji Interaktif (Interactive Mode)**: Pratinjau interaktif tombol, input form teks, sakelar, dan kotak centang tanpa keluar dari IDE.
- **Integrasi Penuh Phase 2**: Terhubung langsung dengan Android Project Engine dan tersinkronisasi dengan pohon berkas proyek.
- **Unit Testing Suite**: 54 pengujian unit Vitest mencakup validasi skema, generator XML, dan store state machine (100% lolos).

## [0.2.0-alpha] - 2026-10-13
### Phase 2: Android Project Engine & Generator

#### Ditambahkan / Added
- Mesin pembuat proyek Android nyata dengan Gradle Wrapper 8.7, AGP 8.5.2, Kotlin 2.0.0, dan target Android SDK 34 (Android 14).
- Pengecekan toolchain lingkungan: Android SDK, ADB, platform SDK, JDK 17 LTS, dan Gradle Wrapper.
- Runner perintah build Gradle yang dibatasi dan aman (*restricted argument vector runner*).
- Validasi integritas proyek dan struktur Gradle files.

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
