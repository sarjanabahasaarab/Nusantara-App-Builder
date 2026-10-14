/**
 * Nusantara App Builder - Android Project Template Generator Orchestrator
 * Phase 2: Generates valid native Android Kotlin Gradle projects with complete toolchain compatibility.
 */

import { CreateProjectInput, ProjectFile, ProjectMetadata, ProjectTemplate } from '../../types/project';
import {
  COMPATIBLE_TOOLCHAIN,
  getRootBuildGradle,
  getSettingsGradle,
  getGradleProperties,
  getGradleWrapperProperties,
  getGradlewShell,
  getGradlewBat,
  getLibsVersionsToml,
  getAdaptiveIconForeground,
  getAdaptiveIconBackground,
  getAdaptiveLauncherXml,
  getColorsXml,
  getThemesXml,
  getProguardRules,
  getGitignore,
} from './templates/commonAndroidFiles';
import { generateEmptyAndroidProject } from './templates/emptyProjectTemplate';
import { generateBasicActivityProject } from './templates/basicActivityTemplate';
import { generateWebViewStarterProject } from './templates/webViewStarterTemplate';

export const AVAILABLE_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'empty-android',
    name: 'Empty Android Project',
    nameId: 'Empty Android Project (Dasar)',
    description: 'Clean minimal Android Gradle project with Kotlin, AndroidX, and a blank MainActivity.',
    descriptionId: 'Struktur Android Gradle murni dengan Kotlin, AndroidX, dan Activity kosong tanpa dependensi berlebih.',
    minSdk: 26,
    targetSdk: 34,
    compileSdk: 34,
    features: ['Kotlin 2.0', 'Android Gradle Plugin 8.5.2', 'Gradle 8.7', 'AndroidX Core', 'Material 3'],
    featuresId: ['Kotlin 2.0', 'Android Gradle Plugin 8.5.2', 'Gradle 8.7', 'AndroidX Core', 'Material 3'],
  },
  {
    id: 'basic-activity',
    name: 'Basic Activity (Material 3)',
    nameId: 'Basic Activity (Material 3 & Aksi Interaktif)',
    description: 'Complete with Material 3 TopAppBar, Floating Action Button, and ViewModel architecture pattern.',
    descriptionId: 'Dilengkapi Material 3 TopAppBar, Floating Action Button, tombol aksi responsif, dan arsitektur ViewModel.',
    minSdk: 26,
    targetSdk: 34,
    compileSdk: 34,
    features: ['Material 3 UI Components', 'Floating Action Button', 'Counter & Event Listeners', 'Lifecycle ViewModel'],
    featuresId: ['Komponen UI Material 3', 'Tombol Aksi Mengambang (FAB)', 'Penghitung & Event Listener', 'Lifecycle ViewModel'],
  },
  {
    id: 'webview-starter',
    name: 'Website WebView Starter (Web to App)',
    nameId: 'Website WebView Starter (Konversi Web ke App)',
    description: 'Secure Android WebView wrapper with HTTPS default, offline caching, and back dispatcher.',
    descriptionId: 'Wrapper WebView berkeamanan tinggi dengan HTTPS default, caching offline, dan penanganan navigasi Back.',
    minSdk: 26,
    targetSdk: 34,
    compileSdk: 34,
    features: ['HTTPS Enforced', 'Offline Caching', 'Back Dispatcher', 'External Intent Router', 'Error State Overlay'],
    featuresId: ['HTTPS Wajib', 'Caching Offline', 'Navigasi Back Cerdas', 'Router Intent Eksternal', 'Layar Error Koneksi'],
  },
];

export function generateProjectFiles(input: CreateProjectInput): ProjectFile[] {
  const {
    name,
    displayName = name,
    packageId,
    template,
    minSdk = COMPATIBLE_TOOLCHAIN.minSdk,
    targetSdk = COMPATIBLE_TOOLCHAIN.targetSdk,
    compileSdk = COMPATIBLE_TOOLCHAIN.compileSdk,
    versionCode = 1,
    versionName = '1.0.0',
    description = '',
    targetUrl,
  } = input;

  // 1. Root and Toolchain files
  const rootBuild = getRootBuildGradle();
  const settingsGradle = getSettingsGradle(name);
  const gradleProps = getGradleProperties();
  const gradlewSh = getGradlewShell();
  const gradlewBat = getGradlewBat();
  const wrapperProps = getGradleWrapperProperties();
  const versionCatalog = getLibsVersionsToml();

  // 2. Resources (Adaptive icons, colors, themes, proguard, gitignore)
  const iconFg = getAdaptiveIconForeground();
  const iconBg = getAdaptiveIconBackground();
  const adaptiveLauncher = getAdaptiveLauncherXml();
  const colors = getColorsXml();
  const themes = getThemesXml(name);
  const proguard = getProguardRules();
  const gitignore = getGitignore();

  // 3. Template-specific files
  let templateFiles: ProjectFile[] = [];
  if (template === 'empty-android') {
    templateFiles = generateEmptyAndroidProject(input);
  } else if (template === 'basic-activity') {
    templateFiles = generateBasicActivityProject(input);
  } else if (template === 'webview-starter') {
    templateFiles = generateWebViewStarterProject(input);
  } else {
    templateFiles = generateEmptyAndroidProject(input);
  }

  // 4. README.md
  const readme = `# ${displayName}

Proyek aplikasi Android native yang dibangun menggunakan **Nusantara App Builder** (Phase 2).

## Spesifikasi Toolchain
- **Nama Paket**: \`${packageId}\`
- **Template**: \`${template}\`
- **Versi**: \`${versionName}\` (Version Code: \`${versionCode}\`)
- **Android Gradle Plugin (AGP)**: \`${COMPATIBLE_TOOLCHAIN.agpVersion}\`
- **Gradle**: \`${COMPATIBLE_TOOLCHAIN.gradleVersion}\`
- **Kotlin**: \`${COMPATIBLE_TOOLCHAIN.kotlinVersion}\`
- **Java JDK**: \`${COMPATIBLE_TOOLCHAIN.jdkVersion} LTS\`
- **Compile SDK / Target SDK**: \`${compileSdk}\` (Android 14)
- **Minimum SDK**: \`${minSdk}\` (Android 8.0)
${targetUrl ? `- **Target URL**: \`${targetUrl}\`\n` : ''}

## Menjalankan Build Debug
Gunakan Gradle Wrapper yang telah disediakan:
\`\`\`bash
# Di Windows (CMD / PowerShell)
.\\gradlew.bat assembleDebug

# Di Linux / macOS
chmod +x gradlew
./gradlew assembleDebug
\`\`\`

File APK hasil build akan berlokasi di:
\`app/build/outputs/apk/debug/app-debug.apk\`
`;

  // 5. nusantara.project.json (Metadata schema format "2.0")
  const metadata: ProjectMetadata = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    displayName: displayName.trim(),
    packageId: packageId.trim(),
    location: input.location.trim(),
    description: description.trim(),
    template,
    language: 'kotlin',
    interfaceLanguage: input.interfaceLanguage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk,
    targetSdk,
    compileSdk,
    versionCode,
    versionName,
    targetUrl: template === 'webview-starter' ? targetUrl : undefined,
    formatVersion: '2.0',
    filesCount: 0, // Will be calculated
    toolchainVersion: {
      agp: COMPATIBLE_TOOLCHAIN.agpVersion,
      gradle: COMPATIBLE_TOOLCHAIN.gradleVersion,
      kotlin: COMPATIBLE_TOOLCHAIN.kotlinVersion,
      jdk: COMPATIBLE_TOOLCHAIN.jdkVersion,
    },
  };

  const commonFiles: ProjectFile[] = [
    { path: 'build.gradle.kts', name: 'build.gradle.kts', content: rootBuild, size: rootBuild.length },
    { path: 'settings.gradle.kts', name: 'settings.gradle.kts', content: settingsGradle, size: settingsGradle.length },
    { path: 'gradle.properties', name: 'gradle.properties', content: gradleProps, size: gradleProps.length },
    { path: 'gradlew', name: 'gradlew', content: gradlewSh, size: gradlewSh.length, isExecutable: true },
    { path: 'gradlew.bat', name: 'gradlew.bat', content: gradlewBat, size: gradlewBat.length, isExecutable: true },
    { path: 'gradle/wrapper/gradle-wrapper.properties', name: 'gradle-wrapper.properties', content: wrapperProps, size: wrapperProps.length },
    { path: 'gradle/libs.versions.toml', name: 'libs.versions.toml', content: versionCatalog, size: versionCatalog.length },
    { path: 'app/proguard-rules.pro', name: 'proguard-rules.pro', content: proguard, size: proguard.length },
    { path: 'app/src/main/res/drawable/ic_launcher_foreground.xml', name: 'ic_launcher_foreground.xml', content: iconFg, size: iconFg.length },
    { path: 'app/src/main/res/drawable/ic_launcher_background.xml', name: 'ic_launcher_background.xml', content: iconBg, size: iconBg.length },
    { path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', name: 'ic_launcher.xml', content: adaptiveLauncher, size: adaptiveLauncher.length },
    { path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', name: 'ic_launcher_round.xml', content: adaptiveLauncher, size: adaptiveLauncher.length },
    { path: 'app/src/main/res/values/colors.xml', name: 'colors.xml', content: colors, size: colors.length },
    { path: 'app/src/main/res/values/themes.xml', name: 'themes.xml', content: themes, size: themes.length },
    { path: '.gitignore', name: '.gitignore', content: gitignore, size: gitignore.length },
    { path: 'README.md', name: 'README.md', content: readme, size: readme.length },
  ];

  const allFiles = [...commonFiles, ...templateFiles];
  metadata.filesCount = allFiles.length + 1; // including nusantara.project.json

  const metadataJson = JSON.stringify(metadata, null, 2);
  allFiles.push({
    path: 'nusantara.project.json',
    name: 'nusantara.project.json',
    content: metadataJson,
    size: metadataJson.length,
  });

  return allFiles;
}
