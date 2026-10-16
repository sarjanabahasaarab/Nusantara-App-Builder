# Gradle Build Automation

## Gradle Wrapper Mandiri
Setiap proyek yang dibuat oleh Nusantara App Builder menyertakan Gradle Wrapper:
- `gradlew.bat` (Skrip batch Windows)
- `gradlew` (Skrip shell Unix/macOS)
- `gradle/wrapper/gradle-wrapper.properties` (Distribusi Gradle v8.7)

## Tugas Utama (Build Tasks)
- `assembleDebug`: Membangun APK varian debug untuk pengujian langsung.
- `assembleRelease`: Membangun APK rilis bertanda tangan.
- `bundleRelease`: Membangun Android App Bundle (`.aab`) resmi untuk Google Play Store.
- `clean`: Menghapus direktori `build/` untuk kompilasi bersih.
