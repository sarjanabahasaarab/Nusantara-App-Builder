# Nusantara App Builder — Windows Desktop IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.x](https://img.shields.io/badge/Tauri-2.x-24C8D8.svg)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-175%20Passing-brightgreen.svg)](tests/)

---

### 🇮🇩 Bahasa Indonesia

**Nusantara App Builder** adalah Integrated Development Environment (IDE) desktop Windows sumber terbuka (open-source) tingkat profesional untuk merancang, memprogram, menguji, memonetisasi, dan merilis aplikasi Android native. Fondasi IDE ini dibangun dengan performa tinggi menggunakan **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, dan arsitektur modular tanpa ketergantungan rapuh.

#### Arsitektur & Sub-sistem Utama:
- **Phase 1: Open Source Foundation**: Antarmuka desktop Windows lengkap, custom TitleBar, MenuBar fungsional, Action Toolbar, Sidebar responsif, StatusBar, dukungan bilingual (ID/EN), tema Terang & Gelap, dan penyimpanan preferensi lokal.
- **Phase 2: Android Project Engine**: Generator struktur proyek Android native (Gradle Wrapper 8.7, Kotlin 2.0, AGP 8.5, Android SDK 34), detektor lingkungan toolchain (SDK, ADB, JDK, Gradle), dan runner tugas Gradle yang dibatasi.
- **Phase 3: Visual Designer (WYSIWYG Layout Engine)**:
  - **Component Palette**: 24 komponen Android (Text, Button, Image, Input, Scroll, AdMob, WebView, SQLite, API, Custom widgets).
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
- **Phase 8: Release Center & Production Signing**:
  - **Keystore & RSA 2048-bit Generator**: Pembuatan keystore resmi JKS/PKCS12 dengan validasi V1 (JAR) & V2 (Full APK) signing schemes.
  - **Google Play Store Checklist**: Audit 10 kriteria peluncuran (Target SDK 34+, 64-bit binaries, App Bundle AAB, privacy policy, icon 512x512).
  - **Metadata & Asset Packager**: Generator `play-store-metadata.json`, deskripsi multibahasa, dan export bundler.
- **Phase 9: AdMob & Monetization Manager**:
  - **AdMob Center**: Pusat konfigurasi AdMob App ID (`ca-app-pub-XXXX~YYYY`), Ad Units (Banner, Interstitial, Rewarded, Native), dan UMP Privacy Consent.
  - **Official Google Test IDs**: Satu klik beralih antara Mode Pengujian Google dan Mode Produksi tanpa risiko banned akun AdMob.
  - **Monetization Diagnostics**: Audit otomatis format ID, meta-data AndroidManifest, dependensi Google Play Services, dan interval frekuensi iklan.
- **Phase 10: Open Source Professional Release & Ecosystem**:
  - **Modular Tauri/Rust Subsystems**: Pembagian boundary jelas di `src-tauri/src/` (`commands/`, `build/`, `android/`, `release/`, `filesystem/`, `security/`, `plugins/`).
  - **Plugin Engine & Security Sandbox**: Arsitektur ekstensi dengan sistem perizinan eksplisit (Allow/Deny), isolasi kapabilitas OS, dan manifest validator.
  - **Component SDK & Visual Component Registry**: Pendaftaran komponen UI kustom tingkat pengembang (Basic, Advanced, dan Plugin-contributed).
  - **Theme Engine & Design Tokens**: Desain token terpusat untuk warna, tipografi, grid visual, dan import/export tema format JSON (`themes/`).
  - **10 Project Templates**: Blank App, Website App, Business App, School App, News App, Food App, Store App, Portfolio App, API App, dan SQLite App.
  - **Safe Project Import**: Impor proyek Nusantara JSON dan analisis aman berkas Android native (AndroidManifest.xml, build.gradle, path traversal check).

---

### 🇬🇧 English

**Nusantara App Builder** is a professional open-source Windows desktop Integrated Development Environment (IDE) built for designing, coding, testing, monetizing, and deploying native Android applications. Built with **Tauri 2.x (Rust)**, **React 19**, **TypeScript Strict Mode**, **Tailwind CSS**, and **Zustand**.

#### Key Architectural Subsystems:
- **Phase 1: Open Source Foundation**: Complete desktop IDE frame, custom TitleBar, MenuBar, Toolbar, collapsible Sidebar, StatusBar, bilingual system, Dark & Light modes.
- **Phase 2: Android Project Engine**: Real Android project generation (Gradle Wrapper 8.7, Kotlin 2.0, AGP 8.5, Android SDK 34), toolchain detection, and safe restricted Gradle task runner.
- **Phase 3: Visual Designer**: 24 Android UI widgets, realistic interactive phone canvas, multi-screen manager, and Android XML generator.
- **Phase 4: Monaco Code Editor**: Multi-tab Monaco editor with Kotlin syntax highlighting, Android layout XML snippets, File Explorer tree, bi-directional visual-code sync, diagnostics panel, and sandboxed terminal.
- **Phase 5: Website to APK & AAB**: 8-step wizard converting websites or local HTML folders into native Android WebView apps with splash screen and offline fallback.
- **Phase 6: App Logic, Events, Database & API**: Visual node-based logic designer, zero-eval SafeExpressionEngine, SQLite database builder with parameterized queries, and REST API client with Kotlin Coroutine generator.
- **Phase 7: Professional Build Engine**: Unified build dashboard, pre-build project audit, real Gradle execution with argument vectors, secret masking, and Logcat streaming.
- **Phase 8: Release Center**: Keystore generation, V1/V2 signature schemes, Google Play submission audit, and artifact packager.
- **Phase 9: AdMob & Monetization Manager**: AdMob App ID & Ad Unit management, Official Google Test IDs, UMP privacy consent, and pre-release monetization diagnostics.
- **Phase 10: Open Source Ecosystem**: Sandboxed Plugin Engine, Component SDK, Visual Registry, Theme Engine with JSON design tokens, 10 Production Templates, and Safe Native Android Project Importer.

---

## Struktur Direktori / Directory Structure

```
├── src-tauri/                 # Tauri 2.x Rust Desktop Backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/          # Security capabilities configuration
│   └── src/
│       ├── main.rs            # Desktop application entry point
│       ├── lib.rs             # Subsystem registration & IPC setup
│       ├── commands/          # Tauri IPC Command Gateway
│       ├── filesystem/        # Safe atomic writes & file deletion
│       ├── security/          # Path traversal checks & secret masking
│       ├── android/           # SDK, JDK & ADB toolchain scanner
│       ├── build/             # Safe Gradle process runner
│       ├── release/           # Artifact inspector & signing validation
│       └── plugins/           # Native plugin capability sandbox
├── src/                       # React 19 + TypeScript Frontend
│   ├── components/ui/         # TitleBar, MenuBar, Toolbar, Sidebar, StatusBar, Modals
│   ├── modules/
│   │   ├── dashboard/         # Project dashboard & onboarding guide
│   │   ├── project-manager/   # Wizard, Explorer, 10 Templates, Import Service
│   │   ├── environment/       # Android SDK & Toolchain checker
│   │   ├── visual-designer/   # WYSIWYG canvas, palette, and XML generator
│   │   ├── code-editor/       # Monaco Editor, problems panel, terminal
│   │   ├── website-to-apk/    # Web to native Android converter
│   │   ├── logic-designer/    # Node-based logic flow, SQLite & REST API
│   │   ├── build-engine/      # Build Center (Debug/Release APK & AAB)
│   │   ├── release-center/    # Keystore manager, Play Store checklist, export
│   │   ├── monetization/      # AdMob Center, Ad Units, Consent & Diagnostics
│   │   ├── plugins/           # Plugin Manager, security prompts & Plugin API
│   │   ├── themes/            # Theme Manager & design tokens
│   │   ├── component-sdk/     # Extensible Visual Component Registry
│   │   └── localization/      # Bilingual Indonesian & English dictionaries
│   ├── validation/            # Strict project, package, and path validators
│   ├── store/                 # Zustand stores (project, settings, ui, plugins, themes, etc.)
│   ├── types/                 # TypeScript interfaces and contracts
│   └── tests/                 # Vitest test suites (14 suites, 175 tests)
├── templates/                 # Production project templates (Blank, Website, Business, etc.)
├── plugins/                   # Example plugin manifests and reference sources
├── themes/                    # Standard JSON design themes (Dark, Light, Emerald)
├── docs/                      # Windows setup, architecture, and developer guides
├── scripts/                   # CLI utilities and automation scripts
└── .github/workflows/ci.yml   # GitHub Actions CI workflow
```

## Menjalankan Pengujian / Running Tests

```bash
# Menjalankan seluruh 14 test suite (175 pengujian)
npm test

# Menjalankan linter
npm run lint

# Membangun bundle frontend produksi
npm run build
```

## Lisensi / License
Didistribusikan di bawah lisensi MIT. Lihat berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.
