# Nusantara App Builder — Windows Desktop IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.x](https://img.shields.io/badge/Tauri-2.x-24C8D8.svg)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)

---

### 🇮🇩 Bahasa Indonesia

**Nusantara App Builder** adalah Integrated Development Environment (IDE) desktop Windows sumber terbuka (open-source) yang dirancang untuk menyederhanakan perancangan dan pembangunan aplikasi Android. Fondasi IDE ini dibangun menggunakan arsitektur modern **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, dan **Zustand**.

#### Fitur Utama Phase 1 (Fondasi Terbuka):
- **Antarmuka Desktop Windows Lengkap**: Title bar kustom, menu bar fungsional (File, Edit, View, Project, Tools, Window, Help), toolbar aksi cepat, sidebar navigasi responsif, dan status bar detil.
- **Dukungan Bilingual Penuh**: Terjemahan lengkap Bahasa Indonesia dan English untuk setiap menu, label, deskripsi, pesan validasi, dan notifikasi.
- **Tema Terang & Gelap**: Pengalihan tema seketika dengan persistensi preferensi lokal.
- **Dasbor Manajemen Proyek**: Ringkasan metrik proyek, riwayat proyek terbaru, pencarian instan, dan panduan memulai awal.
- **Wizard Pembuatan Proyek Android Nyata**:
  - Validasi ketat nama proyek (termasuk deteksi nama terlarang sistem Windows seperti `CON`, `PRN`, `AUX`).
  - Validasi format Java/Android Package ID (reverse-domain notation, larangan kata kunci reserved Java).
  - Generator berkas Kotlin 2.0, Android Gradle Plugin 8.5 (`build.gradle.kts`), `AndroidManifest.xml`, dan layout XML nyata.
- **3 Template Android Bawaan**:
  1. *Empty Android Project*: Fondasi Gradle murni dengan Activity minimalis.
  2. *Basic Activity*: Material 3 TopAppBar, Floating Action Button, dan ViewModel.
  3. *WebView Starter*: WebView berakselerasi tinggi, offline caching, dan penanganan koneksi.
- **Penyimpanan Proyek Aman**:
  - Pemisahan tegas antara "Hapus dari Riwayat" (hanya menghapus catatan riwayat tanpa menyentuh berkas fisik) dan "Hapus Folder Fisik" (memerlukan konfirmasi nama proyek).
- **Inspeksi Status Lingkungan Toolchain**: Deteksi dan validasi jalur Android SDK (API 34), Java JDK (17/21), dan Gradle.
- **Kontrak Layanan Formal (Phase 2–7)**: Spesifikasi antarmuka TypeScript yang transparan untuk Visual Designer, Code Editor, Website to APK, Build Engine, dan Google AdMob.

---

### 🇬🇧 English

**Nusantara App Builder** is an open-source Windows desktop Integrated Development Environment (IDE) designed to streamline Android app development. Built on **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, and **Zustand**.

#### Phase 1 Key Features (Foundation):
- **Professional Windows Desktop Interface**: Custom title bar, comprehensive menu bar, action toolbar, collapsible sidebar, and bottom status bar.
- **Full Bilingual Support**: Complete Indonesian and English localization across all UI elements, validation errors, and messages.
- **Dark & Light Modes**: Instant theme toggle with local preference persistence.
- **Project Dashboard**: Quick action cards, project metrics, recent project list with instant search, and step-by-step onboarding guide.
- **Real Android Project Generator**: Generates actual buildable Gradle Kotlin DSL scripts, AndroidManifest.xml, strings, colors, themes, and MainActivity.kt.
- **3 Built-in Templates**: Empty Android Project, Basic Activity (Material 3), and WebView Starter.
- **Safe Project Storage**: Strict distinction between removing from recent history and permanent disk folder deletion.
- **Android Toolchain Detector**: Validates Android SDK 34, JDK 17/21, and Gradle wrapper.
- **Architectural Service Contracts**: Formal TypeScript interfaces prepared for Phases 2–7.

---

## Struktur Direktori / Directory Structure

```
├── src-tauri/                 # Tauri 2.x Rust Desktop Backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/          # Security capabilities configuration
│   └── src/
│       ├── main.rs            # Desktop application entry point
│       ├── lib.rs             # Plugin registration & IPC setup
│       └── commands.rs        # Safe Rust filesystem & env commands
├── src/                       # React 19 + TypeScript Frontend
│   ├── components/ui/         # TitleBar, MenuBar, Toolbar, Sidebar, StatusBar
│   ├── modules/
│   │   ├── dashboard/         # Project dashboard & onboarding guide
│   │   ├── project-manager/   # Wizard, Explorer, Template generator
│   │   ├── environment/       # Android SDK & Toolchain checker
│   │   ├── settings/          # General, Appearance, Language, Projects, About
│   │   ├── localization/      # Bilingual translations & hook
│   │   ├── filesystem/        # Native bridge & safe storage
│   │   └── contracts/         # TypeScript service contracts (Phases 2-7)
│   ├── validation/            # Strict project, package, and path validators
│   ├── store/                 # Zustand stores (project, settings, ui, env)
│   ├── types/                 # Type definitions & service interfaces
│   └── tests/                 # Vitest test suites
├── docs/                      # Windows setup, development, and installer guides
└── .github/workflows/ci.yml   # GitHub Actions CI workflow
```

## Memulai Cepat / Quick Start

### Kebutuhan Sistem / Prerequisites
- Node.js 18+ & npm
- Rust toolchain 1.77+ (untuk mode desktop native)
- Windows 10/11 x64 dengan Microsoft Edge WebView2

### Menjalankan Mode Development
```bash
# Pasang dependensi frontend
npm install

# Jalankan server frontend Vite (port 3000)
npm run dev

# Jalankan pengujian unit (Vitest)
npm run test

# Jalankan desktop Tauri (jika Rust terpasang)
npm run tauri dev
```

## Lisensi / License
Didistribusikan di bawah lisensi MIT. Lihat berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.
