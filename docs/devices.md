# Device Manager & ADB Deployment

## Deteksi Perangkat
Nusantara App Builder menggunakan `adb devices -l` untuk mendeteksi:
- HP fisik Android yang terhubung via kabel data USB (USB Debugging aktif).
- Emulator Android (seperti Android Studio AVD).
- Perangkat nirkabel via ADB Wi-Fi (`adb connect <ip>:<port>`).

## Alur Pemasangan (Deploy)
1. Pilih artefak APK debug atau rilis.
2. Pilih perangkat target dari daftar **Perangkat Terhubung**.
3. Klik **Pasang ke HP** untuk menjalankan instalasi biner via ADB.
4. Klik **Jalankan** untuk membuka aplikasi langsung di layar perangkat menggunakan Activity Manager intent launcher.
