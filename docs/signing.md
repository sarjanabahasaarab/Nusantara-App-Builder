# Release Signing & Keystore Management

## Keamanan Kriptografi
- **Algoritma**: RSA 2048-bit dengan masa berlaku sertifikat minimal 25 tahun (rekomendasi 30-50 tahun).
- **Skema Signing**:
  - **V1 (JAR Signing)**: Kompatibilitas dengan Android versi lama (< 7.0).
  - **V2 (Full APK Signing)**: Melindungi integritas seluruh biner berekstensi `.apk`.
- **Perlindungan Kata Sandi**: Nusantara App Builder tidak pernah menyimpan password keystore dalam berkas proyek atau JSON penyimpanan lokal.
- **Pembuatan Baru**: Gunakan tombol **Buat Keystore Baru** di tab Signing untuk menghasilkan berkas `.jks` resmi menggunakan `keytool`.
