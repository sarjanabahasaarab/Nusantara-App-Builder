# Nusantara App Builder — Professional Code Editor (Phase 4)

Panduan teknis dan arsitektur untuk modul **Code Editor** profesional Nusantara App Builder.

---

## 1. Ikhtisar / Overview

Code Editor pada Nusantara App Builder didesain dengan teknologi **Monaco Editor** (`@monaco-editor/react`), editor yang sama yang menggerakkan Visual Studio Code, untuk memberikan pengalaman coding kelas industri dalam pengembangan aplikasi Android.

### Fitur Utama
- **Multi-Tab System**: Buka banyak berkas sekaligus dengan indikator perubahan (*dirty indicator*), pintasan mouse (klik tengah untuk menutup), dan konfirmasi penutupan aman (*Save / Don't Save / Cancel*).
- **Dukungan Bahasa Lengkap**:
  - Android: `.kt`, `.kts` (Kotlin), `.java`, `.xml` (Android Layout & Manifest), `.gradle`, `.properties`.
  - Web (Persiapan Phase 5 Website to APK): `.html`, `.css`, `.js`, `.json`.
  - Dokumentasi: `.md`, `.txt`.
- **Kotlin Language Support**:
  - Syntax highlighting dengan kata kunci standar Kotlin 2.0 (class, fun, val, var, data, sealed, override, suspend, inline, dll.).
  - Auto-closing pairs dan bracket matching.
  - Folding baris dan komentar.
  - *Catatan*: Kotlin Language Server (LSP) penuh akan ditambahkan pada integrasi daemon background lanjutan. Formatter dokumen menampilkan konfirmasi ramah tanpa merusak kode pengguna.
- **Android XML Layout Support**:
  - XML indentation dan syntax highlighting.
  - Code completion snippets untuk `LinearLayout`, `TextView`, `MaterialButton`, `TextInputEditText`.
  - Validasi ketat format `android:id="@+id/..."`, deteksi ID duplikat, dan pemeriksaan namespace `xmlns:android`.
- **Search & Replace**:
  - In-file find (Ctrl+F) dan replace (Ctrl+H).
  - Project-wide search melalui `NativeBridge.searchInProject`.
  - Opsi: Match Case (Aa), Whole Word (\b), Regular Expressions (.*).

---

## 2. Pintasan Keyboard / Keyboard Shortcuts

| Shortcut | Fungsi (ID) | Function (EN) |
|---|---|---|
| **Ctrl + S** | Simpan berkas aktif | Save active file |
| **Ctrl + Shift + S** | Simpan semua berkas terbuka | Save all open files |
| **Ctrl + P** | Cari & lompat cepat ke berkas | Quick open / Go to file |
| **Ctrl + G** | Lompat ke baris | Go to line |
| **Ctrl + F** | Cari teks dalam editor | Find in file |
| **Ctrl + H** | Ganti teks dalam editor | Replace in file |
| **Ctrl + B** | Tampilkan/sembunyikan File Explorer | Toggle File Explorer |
| **Ctrl + `** | Tampilkan/sembunyikan Terminal | Toggle Terminal panel |
| **Ctrl + W** | Tutup tab aktif | Close active tab |
| **Shift + Alt + F** | Format dokumen XML | Format XML document |
| **Alt + Z** | Toggle Word Wrap | Toggle Word Wrap |

---

## 3. Sistem Diagnostik & Problems Panel

Panel Masalah (*Problems*) menyajikan galat dan peringatan nyata:
- **ERROR**: Kesalahan parsing XML, tag tidak seimbang, format ID ilegal, tanda kurung kurawal tidak berpasangan pada Kotlin.
- **WARNING**: ID duplikat dalam satu layout, namespace Android yang hilang.
- **INFO**: Panduan struktural berkas.

Mengklik baris masalah akan langsung membawa kursor ke baris terkait dalam berkas yang sedang dibuka.

---

## 4. Sandboxed Terminal Engine

Terminal terintegrasi dirancang khusus untuk eksekusi aman toolchain Android:
- **Whitelist Perintah**:
  - `./gradlew assembleDebug`, `./gradlew assembleRelease`, `./gradlew clean`, `./gradlew check`, `./gradlew --version`
  - `adb devices`, `adb version`
  - `git status`
- **Keamanan Argumen**: Perintah diurai menjadi array argumen terpisah tanpa perangkaian shell (`&&`, `;`, `|`, `>`) untuk mencegah injeksi proses.
- **Kontrol Eksekusi**: Mendukung pembatalan proses (*cancellation token*) dan streaming keluaran stdout/stderr.
