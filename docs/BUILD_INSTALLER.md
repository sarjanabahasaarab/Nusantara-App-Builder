# Panduan Build Installer Windows (MSI & NSIS .exe)

Panduan ini menjelaskan cara memproduksi file installer desktop Windows untuk rilis resmi Nusantara App Builder.

---

## 1. Prasyarat Build Installer Windows
- Sistem Operasi: Windows 10/11 x64
- Rust toolchain (`stable-x86_64-pc-windows-msvc`)
- Visual Studio C++ Build Tools
- WiX Toolset v3.11+ (untuk target format `.msi`)
- NSIS v3+ (untuk target format `.exe` installer mandiri)

---

## 2. Langkah Kompilasi & Pembuatan Paket

### Langkah 1: Build Aset Frontend
```bash
npm run build
```
Perintah ini akan mengkompilasi file HTML, CSS, dan JavaScript ke direktori `dist/`.

### Langkah 2: Eksekusi Build Tauri Bundle
```bash
npm run tauri build
```
Tauri akan secara otomatis:
1. Mengompilasi binary Rust dengan optimasi release (`opt-level = "s"`, `lto = true`).
2. Menghubungkan aset frontend ke dalam binary aplikasi.
3. Menghasilkan installer Windows di direktori:
   - **NSIS Installer**: `src-tauri/target/release/bundle/nsis/Nusantara App Builder_0.1.0_x64-setup.exe`
   - **MSI Installer**: `src-tauri/target/release/bundle/msi/Nusantara App Builder_0.1.0_x64_en-US.msi`

---

## 3. Verifikasi Keamanan Paket
- Selalu pastikan checksum SHA-256 dibuat untuk setiap file installer rilis publik:
  ```powershell
  Get-FileHash -Algorithm SHA256 "src-tauri/target/release/bundle/nsis/*.exe"
  ```
- Hindari menyertakan kredensial pengembang atau sertifikat penandatanganan di dalam repositori publik.
