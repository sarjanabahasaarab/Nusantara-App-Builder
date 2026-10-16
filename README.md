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
  - **Phase 5: Website to APK & AAB**:
  - Konversi website online (HTTPS) atau folder HTML lokal menjadi proyek Android WebView native siap kompilasi.
  - Wizard 8-langkah: Source Selector, Structural Analyzer, App Info & Package Normalizer, Icon/Splash Screen Android 12+, WebView Settings, Domain Security Allowlist, System Permissions, dan Interactive Simulator.
- **Phase 6: App Logic, Events, Database & API**:
  - **Logic Designer**: Visual flow node-based logic builder dengan event handler (`onClick`, `onLongPress`, `onChange`, lifecycle).
  - **Zero-eval SafeExpressionEngine**: Sandboxed AST expression evaluator (`username != ""`, `totalHarga > 100000`, `isLoggedIn == true`).
  - **SQLite Database Service**: Perancangan skema tabel, validasi tipe kolom SQLite, dan generator query berparameter (`?`) aman terhadap SQL injection.
  - **REST API Client**: Konfigurasi endpoint HTTP (GET, POST, PUT, PATCH, DELETE) dengan JSON mapping dan generator native Kotlin Coroutine `ApiClient.kt`.
- **Phase 7: Professional Android Build Engine**:
  - **Build Center**: Antarmuka terpadu untuk validasi proyek, kompilasi Debug APK, Release APK bertanda tangan, dan Release AAB (Android App Bundle).
  - **Real Android Toolchain Execution**: Eksekusi `gradlew.bat` berbasis array argumen aman dan working directory proyek Android, tanpa eksekusi shell string arbitrer.
  - **Toolchain & Windows Path Detection**: Deteksi otomatis `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `JAVA_HOME`, platform SDK 34/35, build-tools, `adb.exe`, dan Java 17+.
  - **Pre-Build Validator**: Tiga tingkatan validasi (Quick, Full, Build) untuk mendeteksi galat sebelum kompilasi dimulai.
  - **Live Terminal & Error Parser**: Output terminal real-time dengan penyamaran password otomatis (`password=********`) dan navigasi klik langsung ke nomor baris editor.
  - **Signing & Keystore Manager**: Generator sertifikat RSA 2048-bit resmi untuk release build dengan skema V1 dan V2.
  - **Artifact & Device Manager**: Pelacakan biner output (`.apk` / `.aab`), instalasi langsung ke perangkat HP via ADB (`adb install`), peluncuran aplikasi, dan live Logcat viewer.

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
- **Phase 5: Website to APK & AAB**:
  - Convert online HTTPS websites or local web folders into complete, buildable native Android WebView projects.
  - 8-step wizard: Source Selection, Structural Analyzer, Package ID Normalization, Icon/Splash Screen, WebView Engine configuration, Domain Security Allowlist, App Permissions, and Live Device Preview.
- **Phase 6: App Logic, Events, Database & API**:
  - **Logic Designer**: Visual flow node-based logic builder with event handlers (`onClick`, `onLongPress`, `onChange`, lifecycle).
  - **Zero-eval SafeExpressionEngine**: Sandboxed AST expression evaluator (`username != ""`, `totalHarga > 100000`, `isLoggedIn == true`).
  - **SQLite Database Service**: Visual schema design, parameterized query generator (`?`) preventing SQL injection.
  - **REST API Client**: HTTP endpoint configuration (GET, POST, PUT, DELETE) with native Kotlin Coroutines `ApiClient.kt`.
- **Phase 7: Professional Android Build Engine**:
  - **Build Center**: Unified dashboard for pre-build validation, Debug APK build, signed Release APK, and Release AAB.
  - **Real Android Toolchain Execution**: Safe argument array execution of `gradlew.bat` with enforced working directory and zero shell string concatenation.
  - **Windows & Toolchain Detection**: Auto-detection of `ANDROID_HOME`, `JAVA_HOME`, platforms, build tools, and Java 17+.
  - **Pre-Build Validator**: 3-level project validation (Quick, Full, Build) preventing compilation failures before execution.
  - **Terminal Output & Error Parser**: Real-time streaming log with automatic secret masking (`password=********`) and direct click-to-editor navigation.
  - **Signing & Keystore Manager**: Official RSA 2048-bit keystore generation with V1/V2 signing schemes.
  - **Artifact & Device Manager**: Binary artifact discovery (`.apk`/`.aab`), ADB deployment (`adb install`), app launcher, and live Logcat viewer.

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
