# Panduan Troubleshooting & Perbaikan Build Android

## 1. Galat: "Android SDK Platform tidak ditemukan"
- **Penyebab**: Target SDK (misal: API 34 atau API 35) belum terpasang di komputer Anda.
- **Solusi**: Buka menu **Build Center** -> tab **Konfigurasi Build** -> klik **Instal Komponen SDK** untuk memasang platform yang diperlukan.

## 2. Galat: "Release signing is not configured"
- **Penyebab**: Mencoba membangun Release APK atau Release AAB tanpa konfigurasi sertifikat keystore.
- **Solusi**: Buka tab **Signing & Keystore**, lalu klik **Buat Keystore Baru** untuk menghasilkan berkas `.jks` resmi.

## 3. Galat: "Unresolved reference" pada Kotlin Compiler
- **Penyebab**: Kode sumber memanggil kelas, fungsi, atau pustaka yang belum diimpor.
- **Solusi**: Klik baris galat pada konsol Build Center untuk langsung diarahkan ke nomor baris yang bermasalah di **Editor Kode**.

## 4. Kehabisan Memori (Out of Memory / GC Overhead)
- **Penyebab**: Alokasi RAM daemon Gradle tidak mencukupi untuk proyek besar.
- **Solusi**: Tutup aplikasi latar belakang yang tidak digunakan pada Windows dan pastikan opsi Build Cache aktif.
