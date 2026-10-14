# Nusantara App Builder — Visual Designer (Phase 3)

Visual Designer adalah modul perancang antarmuka visual Android native pada Nusantara App Builder desktop IDE. Pengguna dapat merancang antarmuka aplikasi Android secara visual (WYSIWYG) dengan drag-and-drop, mengubah atribut komponen secara langsung, mengelola beberapa layar, dan menghasilkan file Android XML Layout yang siap dikompilasi dengan toolchain Gradle Wrapper 8.7.

---

## 1. Cara Membuka Visual Designer

1. **Dari Proyek Aktif**:
   - Di dasbor utama atau daftar **Proyek Saya**, buka proyek Android yang telah dibuat.
   - Pada halaman **Detail Proyek**, klik tombol hijau **Visual Designer** di bilah atas.
   - Alternatif lain: Klik menu navigasi **Visual Designer** pada bilah sisi (Sidebar) kiri.
2. **Tanpa Proyek Terbuka**:
   - Jika belum ada proyek aktif yang dibuka, Visual Designer akan menampilkan layar selamat datang dengan opsi **Buka Proyek Tersimpan** atau **Buat Proyek Android Baru**.

---

## 2. Struktur Tata Letak Visual Designer

Visual Designer dirancang dengan antarmuka desktop profesional 3 panel:

1. **Bilah Menu & Toolbar (Atas)**:
   - **Menu Bar**: Menu `Berkas (File)`, `Ubah (Edit)`, `Tampilan (View)`, `Sisipkan (Insert)`, `Proyek (Project)`, dan `Bantuan (Help)`.
   - **Tombol Simpan (Save)**: Menyimpan model desain ke penyimpanan proyek dengan indikator perubahan (*dirty indicator* `*`).
   - **Undo / Redo**: Membatalkan dan mengulangi perubahan hingga 30 riwayat aksi.
   - **Pemilih Layar (Screen Selector)**: Berpindah antar-layar dan tombol buka manajer layar (`+`).
   - **Preset Perangkat (Device Presets)**: Pilihan frame seperti Google Pixel 7 (412×915), Samsung Galaxy S23 (393×852), Pixel Tablet 11" (800×1280), dan Compact Phone.
   - **Orientasi Layar**: Beralih antara Potret (*Portrait*) dan Lanskap (*Landscape*).
   - **Kontrol Zoom**: Perbesar (+), Perkecil (-), dan Reset Zoom ke 100% (Ctrl+0).
   - **Uji Interaktif (Interactive Preview)**: Mengaktifkan mode simulator untuk menguji klik tombol, pengetikan form, dan toggle sakelar tanpa merusak seleksi kanvas.
   - **Generate Android XML**: Menghasilkan file layout Android XML dan menyimpannya langsung ke `app/src/main/res/layout/`.

2. **Panel Komponen (Kiri)**:
   - Kotak pencarian komponen (*live filter*).
   - Kategori terstruktur:
     - **Layouts & Containers**: Vertical Layout, Horizontal Layout, Card (MaterialCardView), Scroll View, FrameLayout Container.
     - **Typography**: Heading (H1), Text (TextView), Label (Subhead).
     - **Inputs & Controls**: Button (MaterialButton), Text Field (TextInputLayout + TextInputEditText), Password Field, Checkbox, Switch (MaterialSwitch), Radio Button.
     - **Media & Graphics**: Image (ImageView), Image Button.
     - **Utility & Structure**: Divider Line, Spacer, Progress Bar.

3. **Kanvas Ponsel (Tengah)**:
   - Bingkai ponsel realistis dengan bezel dan *notch* kamera.
   - Pratinjau *Android Status Bar* (jam, sinyal, Wi-Fi, baterai).
   - Pratinjau *App Bar / Action Bar* dengan judul layar aktif.
   - Seleksi komponen dengan garis tepi biru, label tag Android ID, dan tombol cepat (Pindah Atas, Pindah Bawah, Gandakan, Hapus).
   - Penanda area drop kontainer berwarna hijau zamrud (*emerald drop target*).
   - Menu klik kanan (*context menu*) untuk duplikasi, pemindahan urutan, dan penghapusan.

4. **Panel Properti (Kanan)**:
   - **Tab Spesifik**: Konten teks, ukuran font (sp), gaya teks (bold/italic/normal), warna teks (hex picker), aksi tombol (toast/navigasi/URL), placeholder hint, tipe input keyboard, sudut membulat kartu, elevasi bayangan, dll.
   - **Tab Tata Letak (Layout)**: Lebar (*match_parent*, *wrap_content*, atau *fixed dp*), Tinggi, Margin luar (Atas, Bawah, Kiri, Kanan), Padding dalam, Orientasi anak, Jarak antar-elemen (*spacing dp*).
   - **Tab Umum (General)**: ID Komponen Android (divalidasi keunikan dan konvensi penamaan Android), Nama label desain, Visibilitas Android (*visible*, *invisible*, *gone*), Opasitas (*Alpha* slider 0–100%).

---

## 3. Sistem Drag-and-Drop

- **Menambahkan dari Panel**: Tarik komponen dari panel kiri dan jatuhkan ke kanvas atau ke dalam kontainer (LinearLayout, Card, ScrollView).
- **Klik untuk Menambah**: Klik kartu komponen atau tombol `+` pada panel kiri untuk menambahkan komponen langsung ke dalam kontainer terpilih atau root layout.
- **Memindahkan Komponen**: Tarik komponen yang sudah ada pada kanvas dan lepaskan pada kontainer tujuan.
- **Pencegahan Error**: Sistem secara otomatis mencegah referensi melingkar (*circular references*) di mana sebuah induk tidak dapat dipindahkan ke dalam anaknya sendiri.

---

## 4. Pintasan Keyboard (Shortcuts)

| Tindakan | Windows / Linux | Mac |
|---|---|---|
| Simpan Desain | `Ctrl + S` | `Cmd + S` |
| Urungkan (Undo) | `Ctrl + Z` | `Cmd + Z` |
| Ulangi (Redo) | `Ctrl + Y` atau `Ctrl + Shift + Z` | `Cmd + Shift + Z` |
| Gandakan Komponen | `Ctrl + D` | `Cmd + D` |
| Hapus Komponen Terpilih | `Delete` / `Backspace` | `Backspace` |
| Reset Zoom (100%) | `Ctrl + 0` | `Cmd + 0` |
| Perbesar Zoom | `Ctrl + =` | `Cmd + =` |
| Perkecil Zoom | `Ctrl + -` | `Cmd + -` |

---

## 5. Mengatasi Masalah Umum

- **Komponen Tidak Muncul**: Periksa apakah visibilitas diatur ke `gone` atau `invisible` pada Tab Umum.
- **ID Komponen Merah**: ID Android harus diawali huruf atau garis bawah, hanya boleh berisi alfanumerik dan garis bawah, serta tidak boleh duplikat dalam satu layar.
- **Desain Tidak Tersimpan**: Pastikan folder proyek memiliki hak akses tulis. Indikator kuning pada tombol Simpan menandakan terdapat perubahan yang belum disimpan.
