# Panduan Kontribusi / Contributing Guide

Terima kasih atas minat Anda untuk berkontribusi pada **Nusantara App Builder**!

## Pedoman Pengembangan

1. **Prinsip Transparansi**: Fitur yang belum diimplementasikan di backend/engine tidak boleh dipalsukan sebagai fitur selesai. Tampilkan keterangan *Coming Soon* bersama dengan kontrak antarmuka TypeScript yang jelas.
2. **Keamanan Filesystem**:
   - Selalu validasi jalur direktori untuk mencegah serangan *directory traversal* (`..`).
   - Jangan pernah menghapus berkas fisik pengguna saat mereka hanya memilih untuk menghapus riwayat proyek dari antarmuka.
   - Jangan simpan kredensial, API key, atau keystore rahasia ke dalam repositori git.
3. **Standar Kode**:
   - TypeScript strict mode aktif.
   - Seluruh label UI wajib didukung oleh kamus bilingual (Bahasa Indonesia & English).
   - Jalankan `npm run lint` dan `npm run test` sebelum mengajukan Pull Request.

## Alur Kerja Git & Pull Request

1. Fork repositori ini.
2. Buat branch baru dari `main`: `git checkout -b feature/nama-fitur`.
3. Lakukan commit dengan pesan yang deskriptif: `git commit -m "feat(wizard): tambahkan validasi package ID"`.
4. Pastikan semua pengujian lulus: `npm run test`.
5. Buka Pull Request ke branch `main`.
