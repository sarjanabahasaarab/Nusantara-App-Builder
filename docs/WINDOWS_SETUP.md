# Panduan Penyiapan Lingkungan Windows (Windows Setup Guide)

Panduan ini menjelaskan langkah-langkah menyiapkan workstation Windows 10/11 untuk mengembangkan dan menjalankan **Nusantara App Builder**.

---

## 1. Kebutuhan Perangkat Lunak Utama

### A. Node.js
1. Unduh **Node.js 18 LTS** atau lebih baru dari [nodejs.org](https://nodejs.org/).
2. Verifikasi instalasi melalui PowerShell atau Command Prompt:
   ```powershell
   node -v
   npm -v
   ```

### B. Rust Toolchain (Untuk Desktop Native Tauri)
1. Unduh dan jalankan installer `rustup-init.exe` dari [rustup.rs](https://rustup.rs/).
2. Pilih instalasi default (`1) Proceed with default installation`).
3. Pastikan C++ Build Tools terpasang via Visual Studio Build Tools (komponen: *Desktop development with C++*).
4. Verifikasi instalasi:
   ```powershell
   rustc --version
   cargo --version
   ```

### C. Microsoft Edge WebView2
- Pada Windows 10 (versi terbaru) dan Windows 11, WebView2 Runtime sudah terpasang secara bawaan oleh sistem operasi.
- Jika belum tersedia, unduh *Evergreen Bootstrapper* dari situs resmi Microsoft.

---

## 2. Kebutuhan Toolchain Android

### A. Java Development Kit (JDK 17 LTS)
1. Unduh **Eclipse Temurin JDK 17** dari [adoptium.net](https://adoptium.net/).
2. Konfigurasi variabel sistem Windows:
   - Variabel: `JAVA_HOME`
   - Nilai: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\`
   - Tambahkan `%JAVA_HOME%\bin` ke variabel sistem `PATH`.

### B. Android Command Line Tools / Android SDK
1. Letakkan SDK pada direktori standar Windows:
   `%LOCALAPPDATA%\Android\Sdk`
2. Atur variabel lingkungan:
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
   - Tambahkan `%ANDROID_HOME%\cmdline-tools\latest\bin` dan `%ANDROID_HOME%\platform-tools` ke `PATH`.

---

## 3. Menjalankan Aplikasi

Setelah semua prasyarat di atas siap:
```powershell
# Masuk ke direktori proyek
git clone https://github.com/nusantara-app-builder/ide.git
cd ide

# Pasang dependensi
npm install

# Jalankan dalam mode web preview
npm run dev

# Jalankan dalam mode desktop Windows native
npm run tauri dev
```
