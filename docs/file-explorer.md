# Nusantara App Builder — File Explorer (Phase 4)

Panduan fungsional dan arsitektur untuk **File Explorer** pada Nusantara App Builder.

---

## 1. Arsitektur Pohon Berkas / File Tree Architecture

File Explorer membaca struktur berkas sebenarnya dari proyek Android yang dikelola melalui `NativeBridge`:
- Menggunakan transformasi pohon rekursif `buildFileTree(files: ProjectFile[])`.
- Folder diurutkan di bagian atas secara alfabetis, diikuti berkas.
- Mencegah pembacaan berkas biner ke dalam memori teks (misalnya `.png`, `.jar`, `.keystore`, `.apk`).

### Ikon Khas Android
- 💜 **Kotlin** (`.kt`, `.kts`): Ikon ungu untuk Activity, ViewModel, dan script Gradle kts.
- 🧡 **XML Layout & Values** (`.xml`): Ikon oranye untuk layout, warna, dan string.
- 💚 **Android Manifest** (`AndroidManifest.xml`): Ikon hijau khusus manifest.
- 💙 **Gradle** (`build.gradle`, `settings.gradle`): Ikon biru untuk konfigurasi dependensi.
- 🩵 **Web Files** (`.html`, `.css`, `.js`): Ikon cerah untuk proyek Website-to-APK (Phase 5).

---

## 2. Operasi CRUD yang Aman / Safe CRUD Operations

Setiap tindakan destruktif diatur oleh dialog konfirmasi:
1. **Buat Berkas Baru (*New File*)**: Memvalidasi nama berkas terhadap karakter ilegal dan traversal direktori (`..`). Memberikan template dasar otomatis untuk XML dan Kotlin.
2. **Buat Folder Baru (*New Folder*)**: Menghasilkan node direktori baru di dalam hierarki target.
3. **Ubah Nama (*Rename*)**: Memperbarui jalur berkas di seluruh tab editor yang sedang aktif secara otomatis.
4. **Hapus Berkas / Folder (*Delete*)**: Memerlukan konfirmasi modal eksplisit. Tab terbuka yang terhapus akan ditutup secara otomatis tanpa meninggalkan state yatim.

---

## 3. Menu Konteks / Context Menu

Klik kanan pada elemen File Explorer membuka opsi:
- **Buka (*Open*)**: Membuka berkas ke tab Monaco.
- **Buka di Visual Designer (*Open with Visual Designer*)**: Hanya muncul pada berkas layout XML (`app/src/main/res/layout/*.xml`).
- **Berkas Baru... (*New File...*)**: Membuat berkas langsung di dalam folder terpilih.
- **Folder Baru... (*New Folder...*)**: Membuat folder langsung di dalam folder terpilih.
- **Ubah Nama... (*Rename...*)**: Dialog pengubahan nama aman.
- **Salin Jalur (*Copy Path*)**: Menyalin jalur relatif berkas ke clipboard.
- **Hapus... (*Delete...*)**: Konfirmasi penghapusan permanen.
