# Panduan Mode Pengembangan (Development Guide)

Panduan praktis bagi kontributor dan pengembang Nusantara App Builder.

---

## 1. Menjalankan Server Pengembangan

### Mode Web Frontend (Cepat & Ringan)
Untuk memodifikasi antarmuka pengguna, kamus bahasa, dan alur dasbor/wizard tanpa memerlukan kompilasi Rust:
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:3000`.

### Mode Desktop Native Tauri (Lengkap)
Untuk menguji integrasi native Windows, IPC commands, dan filesystem native:
```bash
npm run tauri dev
```

---

## 2. Pemeriksaan Kualitas Kode & Pengujian

### Pemeriksaan Tipe TypeScript
```bash
npm run lint
```

### Menjalankan Pengujian Unit Otomatis (Vitest)
```bash
npm run test
```
Untuk menjalankan pengujian dalam mode pantau (*watch mode*):
```bash
npx vitest
```

---

## 3. Menambahkan Terjemahan Baru
Seluruh terjemahan dikelola secara terpusat di `src/modules/localization/translations.ts`.
Saat menambahkan kunci baru, pastikan untuk mengisi pasangan terjemahan pada kedua kamus:
- `translations.id` (Bahasa Indonesia)
- `translations.en` (English)
