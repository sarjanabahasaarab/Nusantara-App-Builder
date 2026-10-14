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
  - **Component Palette**: 18 komponen Android dalam 5 kategori (Layout, Typography, Inputs, Media, Utility) dengan pencarian instan dan drag-and-drop.
  - **Phone Canvas**: Kanvas ponsel interaktif dengan bezel realistis, Status Bar, App Bar, rotasi potret/lanskap, preset perangkat (Pixel 7, Galaxy S23, Tablet), dan zoom 50%–200%.
  - **Properties Panel**: Inspektur properti 3 tab (Spesifik, Tata Letak, Umum) dengan validasi ID unik Android.
  - **State Machine & Undo/Redo**: Riwayat hingga 30 aksi untuk penambahan, penghapusan, duplikasi, dan pergerakan komponen.
  - **Multi-Screen Manager**: Pengelolaan banyak layar, penggantian nama, duplikasi, penentuan layar awal (*launcher*).
  - **Android XML Generator**: Pembangkitan layout Android XML standar dan penyimpanan otomatis langsung ke `app/src/main/res/layout/`.
  - **Interactive Preview Simulator**: Uji coba interaktif tombol, input teks, dan toggle tanpa keluar dari editor.

---

### 🇬🇧 English

**Nusantara App Builder** is an open-source Windows desktop Integrated Development Environment (IDE) designed to streamline Android app development. Built on **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, and **Zustand**.

#### Completed Key Features:
- **Phase 1: Open Source Foundation**: Professional Windows desktop interface, custom title bar, comprehensive menu bar, action toolbar, collapsible sidebar, bilingual support, dark/light modes.
- **Phase 2: Android Project Engine**: Real Android project generator (Gradle Wrapper 8.7, Kotlin 2.0, AGP 8.5, Android SDK 34), toolchain diagnostics, and safe restricted Gradle process runner.
- **Phase 3: Visual Designer (WYSIWYG Layout Engine)**:
  - **Component Palette**: 18 Android components across 5 categories with drag-and-drop & instant search.
  - **Phone Canvas**: Realistic phone bezel, status bar, app bar, orientation toggle, device presets, and zoom.
  - **Properties Panel**: 3-tab inspector (Specific, Layout, General) with live Android ID validation.
  - **State Machine & Undo/Redo**: 30-step history stack for mutations.
  - **Multi-Screen Manager**: Manage multiple Android screens and designate launcher screens.
  - **Android XML Generator**: Production-ready Android XML layout generation synchronized with `app/src/main/res/layout/`.
  - **Interactive Preview Simulator**: Live interactive testing without leaving the IDE.

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
