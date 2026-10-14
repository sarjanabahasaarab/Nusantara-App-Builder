# Nusantara App Builder — Visual Design Data Schema (Phase 3)

Dokumen ini mendefinisikan skema JSON yang menjadi *single source of truth* untuk antarmuka visual yang dibuat menggunakan Visual Designer Nusantara App Builder.

---

## 1. Skema Tingkat Atas: `VisualProjectDesign`

Setiap proyek memiliki satu berkas model desain visual (`visual_design.json` atau penyimpanan atomik proyek).

```typescript
export interface VisualProjectDesign {
  schemaVersion: 1;                 // Versi skema formal (integer)
  projectId: string;                // ID unik proyek internal
  projectName: string;              // Nama proyek
  packageId: string;                // ID paket Android (misal: com.app.myapp)
  screens: VisualScreen[];          // Daftar seluruh layar aplikasi
  activeScreenId: string;           // ID layar yang saat ini sedang diedit
  startScreenId: string;            // ID layar utama (Launcher / Home)
  createdAt: string;                // Stempel waktu pembuatan ISO 8601
  updatedAt: string;                // Stempel waktu pembaruan terakhir
  formatVersion: '3.0';             // Penanda format versi Phase 3
}
```

---

## 2. Skema Layar: `VisualScreen`

Setiap layar merepresentasikan satu file antarmuka Android XML Layout (misal `activity_main.xml`).

```typescript
export interface VisualScreen {
  id: string;                       // ID unik layar (misal: screen_main)
  name: string;                     // Nama tampilan pengguna (misal: Beranda)
  layoutFileName: string;           // Nama file target XML (misal: activity_main.xml)
  orientation: 'portrait' | 'landscape'; // Orientasi kanvas
  devicePreset: string;             // ID preset perangkat (misal: pixel_7)
  backgroundColor: string;          // Kode warna heksadesimal latar belakang
  root: VisualComponent;            // Komponen akar (biasanya LinearLayout)
}
```

---

## 3. Skema Komponen: `VisualComponent`

Pohon komponen hierarkis yang dapat memiliki anak jika bertipe kontainer.

```typescript
export interface VisualComponent {
  id: string;                       // ID Android yang sah (misal: btn_login)
  type: ComponentType;              // Tipe komponen Android
  name: string;                     // Nama label komponen di pohon desain
  properties: ComponentProperties;  // Kumpulan nilai atribut XML
  children?: VisualComponent[];     // Komponen anak (opsional untuk kontainer)
}
```

---

## 4. Tipe Komponen yang Didukung

| Kategori | Tipe Komponen | Android View Setara |
|---|---|---|
| **Layout** | `verticalLayout` | `LinearLayout (android:orientation="vertical")` |
| | `horizontalLayout` | `LinearLayout (android:orientation="horizontal")` |
| | `card` | `com.google.android.material.card.MaterialCardView` |
| | `scrollView` | `ScrollView` |
| | `container` | `FrameLayout` |
| **Typography** | `heading` | `TextView (bold, besar)` |
| | `text` | `TextView (standar)` |
| | `label` | `TextView (subjudul/keterangan)` |
| **Inputs** | `button` | `com.google.android.material.button.MaterialButton` |
| | `textField` | `com.google.android.material.textfield.TextInputLayout` + `TextInputEditText` |
| | `passwordField` | `TextInputLayout` dengan password toggle |
| | `checkbox` | `CheckBox` |
| | `switch` | `com.google.android.material.materialswitch.MaterialSwitch` |
| | `radioButton` | `RadioButton` |
| **Media** | `image` | `ImageView` |
| | `imageButton` | `ImageButton` |
| **Utility** | `divider` | `View (tinggi 1dp)` |
| | `spacer` | `Space` |
| | `progressBar` | `ProgressBar` |

---

## 5. Contoh JSON Model Desain Nyata

```json
{
  "schemaVersion": 1,
  "projectId": "proj_1728912345",
  "projectName": "MyAndroidApp",
  "packageId": "com.nusantara.myapp",
  "activeScreenId": "screen_main",
  "startScreenId": "screen_main",
  "createdAt": "2026-10-14T10:00:00.000Z",
  "updatedAt": "2026-10-14T10:05:00.000Z",
  "formatVersion": "3.0",
  "screens": [
    {
      "id": "screen_main",
      "name": "Beranda",
      "layoutFileName": "activity_main.xml",
      "orientation": "portrait",
      "devicePreset": "pixel_7",
      "backgroundColor": "#0F172A",
      "root": {
        "id": "root_layout",
        "type": "verticalLayout",
        "name": "Root Layout",
        "properties": {
          "id": "root_layout",
          "name": "Root Layout",
          "width": "match_parent",
          "height": "match_parent",
          "orientation": "vertical",
          "paddingTop": 24,
          "paddingBottom": 24,
          "paddingStart": 20,
          "paddingEnd": 20,
          "backgroundColor": "#0F172A"
        },
        "children": [
          {
            "id": "tv_title",
            "type": "heading",
            "name": "Judul Halaman",
            "properties": {
              "id": "tv_title",
              "name": "Judul Halaman",
              "width": "match_parent",
              "height": "wrap_content",
              "text": "Selamat Datang di Nusantara",
              "textSize": 24,
              "textColor": "#FFFFFF",
              "textStyle": "bold",
              "marginBottom": 12
            }
          },
          {
            "id": "btn_continue",
            "type": "button",
            "name": "Tombol Lanjutkan",
            "properties": {
              "id": "btn_continue",
              "name": "Tombol Lanjutkan",
              "width": "match_parent",
              "height": "wrap_content",
              "buttonLabel": "Mulai Sekarang",
              "buttonBackgroundColor": "#2563EB",
              "buttonTextColor": "#FFFFFF",
              "cornerRadius": 10,
              "actionType": "toast",
              "actionPayload": "Memulai aplikasi..."
            }
          }
        ]
      }
    }
  ]
}
```
