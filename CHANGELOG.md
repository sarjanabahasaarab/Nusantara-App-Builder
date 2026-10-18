# Catatan Rilis / Changelog

Seluruh perubahan penting pada proyek ini dicatat dalam berkas ini.

## [1.0.0] - 2026-10-17
### Phase 10: Open Source Professional Release & Ecosystem

#### Ditambahkan / Added
- **Final Modular Architecture**: Pembagian subsistem mandiri di Tauri & Rust (`commands/`, `build/`, `android/`, `release/`, `filesystem/`, `security/`, `plugins/`).
- **Plugin Engine & Security Sandbox**: Sistem ekstensi modular dengan perizinan granular (*Allow/Deny*, default *Deny*), isolasi proses OS, dan `PluginAPIContext` yang stabil.
- **Component SDK & Visual Component Registry**: Pendaftaran komponen kustom pengembang (`Basic`, `Advanced`, `Plugin-contributed`) dengan properti reaktif dan generator XML Android.
- **Theme Engine & Design Tokens**: Manajer tema kustom (`Light`, `Dark`, `Emerald`) dengan token desain untuk warna, tipografi, grid perancang, serta fitur ekspor/impor berkas JSON tema.
- **10 Templat Produksi**: Blank App, Website App, Business App, School App, News App, Food App, Store App, Portfolio App, API App, dan SQLite App.
- **Layanan Impor Proyek Aman**: Impor berkas cadangan Nusantara JSON dan parser cerdas proyek Android native (validasi `AndroidManifest.xml`, namespace `build.gradle`, SDK level, pencegahan path traversal).
- **Test Suite Lengkap**: 14 test suite dengan 175 pengujian unit dan integrasi otomatis yang lulus 100%.

## [0.9.0-alpha] - 2026-10-16
### Phase 9: AdMob & Monetization Manager

#### Ditambahkan / Added
- **AdMob Center**: Halaman terpusat untuk konfigurasi App ID (`ca-app-pub-XXXX~YYYY`), Ad Units, penempatan visual, dan kebijakan privasi.
- **Dukungan 4 Jenis Iklan**: Banner (Top/Bottom/Adaptive), Interstitial (dengan pembatas frekuensi aman), Rewarded (berbasis callback keberhasilan SDK), dan Native Ads (Card/Grid template).
- **Mode Iklan Uji Resmi Google**: Satu klik beralih antara Test IDs Google dan Mode Produksi dengan simulator interaktif langsung di IDE.
- **Consent & UMP Privacy**: Konfigurasi User Messaging Platform (UMP) SDK untuk kepatuhan regulasi privasi Google Play.
- **Monetization Diagnostics**: Audit pra-rilis mendeteksi format ID salah, ketergantungan Google Play Services Gradle, dan meta-data Manifest.

## [0.8.0-alpha] - 2026-10-16
### Phase 8: Release Center & Google Play Store Ready

#### Ditambahkan / Added
- **Release Center Workspace**: Wisaya 8-langkah rilis aplikasi dari konfigurasi versi hingga ekspor biner bertanda tangan.
- **Keystore Manager Resmi**: Pembuatan sertifikat RSA 2048-bit JKS/PKCS12 dengan skema penandatanganan V1 (JAR) dan V2 (Full APK).
- **Google Play Store Checklist**: Audit otomatis 10 kriteria peluncuran (Target SDK 34+, 64-bit binaries, App Bundle AAB, privacy policy, icon 512x512).
- **Metadata & Asset Packager**: Generator berkas `play-store-metadata.json` dan pelacak riwayat rilis.
### Phase 7: Professional Android Build Engine & Toolchain

#### Ditambahkan / Added
- **Build Center**: Halaman terpusat untuk membangun aplikasi Android dengan dukungan Debug APK, Release APK bertanda tangan, dan Release AAB (Android App Bundle).
- **Toolchain & Windows Path Detection**: Deteksi otomatis `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `JAVA_HOME`, `PATH`, lokasi SDK umum Windows (`%LOCALAPPDATA%\Android\Sdk`), Java JDK 17/21 LTS, dan Gradle Wrapper tanpa memodifikasi registry secara otomatis.
- **Pre-Build Project Validator**: Tiga tingkatan validasi (Quick, Full, Build) untuk memeriksa package ID, struktur Gradle, `AndroidManifest.xml` (`android:exported`), SDK levels, dan sumber daya sebelum kompilasi dimulai.
- **Gradle Runner Aman**: Eksekusi `gradlew.bat` berbasis array argumen (`["assembleDebug", "--stacktrace"]`) tanpa penggabungan shell string untuk mencegah command injection.
- **Masking Kredensial**: Penyamaran otomatis kata sandi, token API, dan private key pada log terminal (`password=********`).
- **Error Parser Cerdas**: Pemetaan otomatis pesan galat kompilasi Kotlin, Java, AAPT2, dan Manifest dengan navigasi klik langsung ke nomor baris pada Editor Kode.
- **Signing & Keystore Manager**: Generator sertifikat RSA 2048-bit resmi untuk release build dengan skema penandatanganan V1 dan V2.
- **Artifact Manager**: Pelacakan berkas biner output (`.apk` / `.aab`), verifikasi ukuran berkas, salin path, dan pembuka folder Windows Explorer.
- **Device Manager & ADB**: Pemindaian perangkat fisik dan emulator yang terhubung (`adb devices`), pemasangan APK (`adb install`), peluncuran aplikasi, dan viewer streaming Logcat lokal.
- **Build Settings & RAM Warning**: Konfigurasi Gradle build cache, parallel build, offline mode, dan peringatan alokasi memori RAM.
- **Wisaya First Run Setup**: Panduan konfigurasi awal sistem untuk memastikan kesiapan toolchain.
- **Test Suite**: 17 pengujian unit dan keamanan baru (Command injection, Secret masking, Path traversal, Error parsing).

## [0.6.0-alpha] - 2026-10-15
### Phase 6: App Logic, Events, Database & API

#### Ditambahkan / Added
- **Logic Designer**: Visual flow builder berbasis node untuk merancang event (`onClick`, `onLongPress`, `onChange`, lifecycle).
- **SafeExpressionEngine**: Evaluator ekspresi AST sandboxed zero-eval (`username != ""`, `totalHarga > 100000`, `isLoggedIn == true`).
- **SQLite Database Service**: Perancang skema tabel SQLite, query builder berparameter (`?`) aman terhadap SQL injection, dan generator layar CRUD otomatis.
- **REST & JSON API Client**: Konfigurasi endpoint HTTP dengan response mapping dan generator native Kotlin Coroutines `ApiClient.kt`.
- **KotlinLogicGenerator**: Generator controller native Android (`DatabaseHelper.kt`, `ApiClient.kt`, `AppLogicController.kt`).

## [0.5.0-alpha] - 2026-10-15
### Phase 5: Website to APK & AAB (Native WebView Engine)

#### Ditambahkan / Added
- **Website to App Wizard**: 8 langkah konversi website online (HTTPS) atau folder web lokal menjadi proyek Android native.
- **Website Structural Analyzer**: Analisis mendalam protokol, hostname, entry point, dukungan JavaScript, sumber daya eksternal, dan ukuran aset lokal.
- **App Icon & Android 12+ Splash Screen**: Konfigurasi ikon adaptif dengan safe-area guide dan SplashScreen API native tanpa delay buatan.
- **WebView Engine Settings**: Konfigurasi JavaScript, DOM storage, zoom, custom user-agent, pull-to-refresh, dan halaman offline terintegrasi.
- **Domain Security Allowlist**: Pengelolaan daftar domain yang diizinkan dan perutean tautan eksternal ke browser Chrome.
- **Interactive Simulator**: Frame pratinjau ponsel (Pixel 7, Galaxy S23, Tablet) dengan pengujian splash screen, offline page, dan simulasi tombol kembali Android (`webView.goBack()`).

#### Ditambahkan / Added
- **Monaco Code Editor**: Editor kode profesional berbasis Monaco dengan dukungan syntax highlighting untuk Kotlin, Java, XML, Gradle, Groovy, Properties, JSON, HTML, CSS, JavaScript, dan Markdown.
- **Dukungan Khusus Kotlin 2.0**: Pemeta token Monarch kustom untuk kata kunci, tipe, operator, kurung kurawal, dan auto-closing pairs.
- **Dukungan Android XML Layout**: Autocomplete snippets untuk komponen Android (`LinearLayout`, `TextView`, `MaterialButton`, `TextInputEditText`), XML indentation, dan validasi atribut.
- **Sistem Tab Multi-Berkas**: Pengelolaan banyak tab berkas terbuka dengan indikator perubahan (*dirty state*), penutupan mouse klik tengah, dan dialog konfirmasi penutupan aman (*Save, Don't Save, Cancel*).
- **File Explorer Realistis**: Pohon direktori hierarkis dari proyek Android dengan ikon khusus per ekstensi berkas, pencarian filter nama berkas, dan menu konteks klik kanan.
- **Operasi Berkas Aman (CRUD)**: Pembuatan berkas baru, pembuatan folder baru, pengubahan nama berkas (*rename*), dan penghapusan berkas dengan konfirmasi modal aman.
- **Sinkronisasi Dua Arah Visual Designer ↔ Code Editor**:
  - Deteksi modifikasi manual pada berkas layout XML Android.
  - Dialog pemilihan aksi (*Open in Visual Designer*, *Keep XML changes*, *Compare changes*, *Cancel*).
  - Parser layout XML Android universal (`xmlParser.ts`) yang memetakan elemen XML ke model visual dan mempreservasi elemen kustom yang belum didukung (`unsupportedView`).
- **Formatter Dokumen**: Pemformatan dokumen XML standar dengan indentasi 4-spasi dan umpan balik aman untuk Kotlin.
- **Pencarian & Penggantian (Search & Replace)**:
  - Pencarian in-file (Ctrl+F) dan penggantian teks (Ctrl+H) dengan opsi Case-sensitive, Whole word, dan Regex.
  - Pencarian lintas seluruh berkas proyek melalui `NativeBridge.searchInProject`.
- **Panel Masalah (Problems Panel)**: Deteksi kesalahan sintaks XML real-time, validasi format `@+id/`, peringatan ID duplikat, dan kesalahan tanda kurung Kotlin dengan navigasi klik langsung ke nomor baris.
- **Terminal Terintegrasi yang Aman (Sandboxed Terminal)**:
  - Eksekusi tugas Gradle (`./gradlew assembleDebug`, `clean`, `check`, `--version`) dan ADB (`adb devices`) menggunakan whitelist dan vektor argumen tanpa shell string concatenation.
  - Riwayat perintah (Up/Down arrow), tombol preset cepat, pembatalan proses (*cancellation token*), dan streaming stdout/stderr.
- **Status Bar IDE Lengkap**: Koordinat kursor (*Ln X, Col Y*), ukuran tab spasi, encoding UTF-8, line endings LF, bahasa aktif, cabang Git, dan badge status penyimpanan atomik.
- **Navigasi Cepat (Quick Open & Go to Line)**: Modal pencarian berkas cepat (Ctrl+P) dan lompat ke nomor baris (Ctrl+G).
- **Testing Suite**: 18 pengujian unit dan integrasi baru (total 73 pengujian unit 100% lolos).

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
