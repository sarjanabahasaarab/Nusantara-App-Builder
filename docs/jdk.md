# Java Development Kit (JDK) Setup

## Persyaratan Versi
- **Direkomendasikan**: OpenJDK 17 LTS (Eclipse Adoptium Temurin 17) atau OpenJDK 21 LTS.
- **Kompatibilitas**: Kotlin 2.0 dan Android Gradle Plugin 8.4 mensyaratkan minimal Java 17.

## Deteksi & Pemeriksaan
Nusantara App Builder memverifikasi ketersediaan Java dengan menjalankan probe:
```cmd
java -version
```
Informasi yang diekstrak:
- Versi Java (misal: `17.0.10`)
- Vendor (misal: `Eclipse Adoptium`, `Oracle Corporation`)
- Lokasi `JAVA_HOME`
- Arsitektur (`x64` / `aarch64`)
