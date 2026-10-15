# Panduan Kontribusi / Contributing Guide

Terima kasih atas minat Anda untuk berkontribusi pada **Nusantara App Builder**!

## Pedoman Pengembangan

1. **Prinsip Transparansi**: Fitur yang belum diimplementasikan di backend/engine tidak boleh dipalsukan sebagai fitur selesai. Tampilkan keterangan *Coming Soon* bersama dengan kontrak antarmuka TypeScript yang jelas.
2. **Keamanan Filesystem & Eksekusi Perintah**:
   - Selalu validasi jalur direktori untuk mencegah serangan *directory traversal* (`..`).
   - Jangan pernah menghapus berkas fisik pengguna tanpa konfirmasi modal eksplisit.
   - Perintah terminal harus selalu divalidasi terhadap whitelist dan dieksekusi dengan array argumen terpisah (hindari shell string concatenation).
   - Jangan simpan kredensial, API key, atau keystore rahasia ke dalam repositori git.
3. **Editor Kode & Sinkronisasi Visual**:
   - Selalu pertahankan elemen XML yang belum didukung Visual Designer tanpa menghapusnya secara sepihak.
   - Monaco Editor harus menyertakan penanganan kursor, status penyimpanan (*dirty state*), dan penanganan encoding UTF-8.
4. **Standar Kode**:
   - TypeScript strict mode aktif (`tsc --noEmit` bebas galat).
   - Seluruh label UI wajib didukung oleh kamus bilingual (Bahasa Indonesia & English).
   - Jalankan `npm run lint` dan `npm run test` sebelum mengajukan Pull Request.

## Alur Kerja Git & Pull Request

1. Fork repositori ini.
2. Buat branch baru dari `main`: `git checkout -b feature/nama-fitur`.
3. Lakukan commit dengan pesan yang deskriptif: `git commit -m "feat(wizard): tambahkan validasi package ID"`.
4. Pastikan semua pengujian lulus: `npm run test`.
5. Buka Pull Request ke branch `main`.
