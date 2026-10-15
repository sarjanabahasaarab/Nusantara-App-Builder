# Nusantara App Builder — Visual Designer ↔ Code Editor Synchronization

Dokumentasi mekanisme sinkronisasi dua arah (*bi-directional sync*) antara **Visual Designer (Phase 3)** dan **Code Editor (Phase 4)**.

---

## 1. Alur Sinkronisasi / Synchronization Workflow

### Alur 1: Visual Designer ➔ Code Editor
```
Visual Designer (Kanvas WYSIWYG)
       ↓
Model Desain (VisualProjectDesign & VisualScreen)
       ↓
Android XML Generator
       ↓
Berkas XML Layout (app/src/main/res/layout/*.xml)
       ↓
Code Editor (Monaco Editor)
```
- Setiap berkas layout yang dihasilkan menyimpan metadata internal dalam komentar:
  ```xml
  <!-- nusantara-visual-metadata: designId=proj_123 screenId=screen_home schemaVersion=1.0 generatorVersion=1.0.0 -->
  ```
- Metadata ini mengidentifikasi bahwa berkas layout tersebut terkait dengan layar tertentu di Visual Designer.

---

### Alur 2: Code Editor ➔ Visual Designer
```
Code Editor (Pengguna mengedit XML secara manual)
       ↓
Deteksi Modifikasi Manual
       ↓
Android XML Parser (xmlParser.ts)
       ↓
Model Desain (VisualScreen & VisualComponent Tree)
       ↓
Visual Designer Canvas
```

---

## 2. Penanganan Konflik & Modifikasi Manual

Jika pengguna membuka berkas XML layout di Code Editor lalu berpindah ke Visual Designer:
1. Dialog **Visual Designer & XML Synchronization Modal** ditampilkan.
2. Pengguna disajikan ringkasan:
   - Jumlah komponen yang berhasil dideteksi.
   - Daftar tag atau custom view yang belum didukung Visual Designer (misalnya `androidx.recyclerview.widget.RecyclerView`, `com.google.android.material.bottomnavigation.BottomNavigationView`).
3. Opsi tindakan:
   - **Buka di Visual Designer (*Open in Visual Designer*)**: Mengonversi XML termodifikasi menjadi model kanvas aktif.
   - **Pertahankan Perubahan XML (*Keep XML Changes*)**: Membiarkan kode XML tetap pada versi manual pengguna.
   - **Bandingkan Perubahan (*Compare Changes*)**: Membuka preview perbandingan XML.
   - **Batal (*Cancel*)**: Membatalkan peralihan.

---

## 3. Preservasi Komponen Kustom (*Safe Preservation*)

Sistem tidak pernah membuang view yang belum didukung oleh Visual Designer secara diam-diam.
- Komponen di luar 18 komponen inti dipetakan menjadi tipe `unsupportedView`.
- Seluruh atribut (`android:id`, dimensi, padding, namespace kustom) dipertahankan utuh di dalam properti komponen sehingga ketika layout diekspor kembali menjadi XML, kode kustom pengguna tidak hilang.
