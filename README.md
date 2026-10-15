# Nusantara App Builder — Windows Desktop IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.x](https://img.shields.io/badge/Tauri-2.x-24C8D8.svg)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)

---

### 🇮🇩 Bahasa Indonesia

**Nusantara App Builder** adalah Integrated Development Environment (IDE) desktop Windows sumber terbuka (open-source) yang dirancang untuk menyederhanakan perancangan dan pembangunan aplikasi Android. Fondasi IDE ini dibangun menggunakan arsitektur modern **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, dan **Zustand**.

#### Fitur Utama yang Telah Selesai:
- **Phase 1: Open Source Foundation**: Antarmuka desktop Windows lengkap, custom TitleBar, MenuBar fungsional, Action Toolbar, Sidebar responsif, StatusBar, dukungan bilingual (ID/EN), tema Terang & Gelap, dan penyimpanan preferensi lokal.
- **Phase 2: Android Project Engine**: Generator struktur proyek Android native (Gradle Wrapper 8.7, Kotlin 2.0, AGP 8.5, Android SDK 34), detektor lingkungan toolchain (SDK, ADB, JDK, Gradle), dan runner tugas Gradle yang dibatasi.
- **Phase 3: Visual Designer (WYSIWYG Layout Engine)**:
  - **Component Palette**: 18 komponen Android dalam 5 kategori dengan pencarian instan dan drag-and-drop.
  - **Phone Canvas**: Kanvas ponsel interaktif dengan bezel realistis, Status Bar, App Bar, rotasi potret/lanskap, preset perangkat, dan zoom 50%–200%.
  - **Multi-Screen Manager**: Pengelolaan banyak layar dan generator XML Android.
- **Phase 4: Professional Code Editor**:
  - **Monaco Editor Integration**: Editor kode multi-tab bertenaga Monaco dengan konfigurasi bahasa Kotlin, XML completion snippets, line numbers, folding, bracket matching, dan tema Gelap/Terang.
  - **File Explorer**: Penjelajah pohon file Android dengan ikon per ekstensi, pencarian filter, aksi CRUD berkas/folder dengan konfirmasi aman, dan menu konteks.
  - **Bi-directional Visual ↔ Code Sync**: Sinkronisasi dua arah antara file layout Android XML dan model Visual Designer dengan deteksi modifikasi manual dan preservasi aman elemen kustom.
  - **Diagnostics & Problems Panel**: Deteksi kesalahan sintaks XML real-time, validasi `@+id/`, deteksi ID duplikat, dan pemeriksaan dasar kode Kotlin dengan navigasi klik langsung ke nomor baris.
  - **Sandboxed Terminal**: Eksekusi perintah Gradle (`./gradlew assembleDebug`, `clean`, `check`) dan ADB menggunakan whitelist aman berbasis array argumen, pembatalan proses, dan streaming output.
  - **Safe Atomic Save & Auto-Save**: Penyimpanan berkas terjamin UTF-8 dengan status Saved/Saving/Unsaved dan opsi auto-save (Off, After Delay, On Focus).

---

### 🇬🇧 English

**Nusantara App Builder** is an open-source Windows desktop Integrated Development Environment (IDE) designed to streamline Android app development. Built on **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, and **Zustand**.

#### Completed Key Features:
- **Phase 1: Open Source Foundation**: Professional Windows desktop interface, custom title bar, comprehensive menu bar, action toolbar, collapsible sidebar, bilingual support, dark/light modes.
- **Phase 2: Android Project Engine**: Real Android project generator (Gradle Wrapper 8.7, Kotlin 2.0, AGP 8.5, Android SDK 34), toolchain diagnostics, and safe restricted Gradle process runner.
- **Phase 3: Visual Designer (WYSIWYG Layout Engine)**:
  - **Component Palette**: 18 Android components across 5 categories with drag-and-drop & instant search.
  - **Phone Canvas**: Realistic phone bezel, status bar, app bar, orientation toggle, device presets, and zoom.
  - **Multi-Screen Manager & XML Generator**: Production-ready Android XML layout generation.
- **Phase 4: Professional Code Editor**:
  - **Monaco Editor Integration**: Full-featured multi-tab code editor with custom Kotlin syntax highlighting, Android XML autocomplete snippets, line numbers, folding, and dark/light themes.
  - **File Explorer**: Android project tree view with extension icons, filter search, safe file/folder CRUD, and right-click context menu.
  - **Bi-directional Visual ↔ Code Sync**: Seamless synchronization between Android layout XML and Visual Designer, detecting manual edits while safely preserving custom views.
  - **Diagnostics & Problems Panel**: Real-time XML structural validation, duplicate ID warnings, and Kotlin syntax checking with click-to-line navigation.
  - **Sandboxed Terminal**: Secure whitelisted process runner for Gradle tasks and ADB with argument array security and cancellation support.
  - **Safe Atomic Save & Auto-Save**: Resilient UTF-8 file saving with status indicators and flexible auto-save modes.

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
