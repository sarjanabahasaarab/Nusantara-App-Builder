/**
 * Nusantara App Builder - Android Project Template Generator
 * Generates valid modern Android Kotlin Gradle project file structures.
 */

import { CreateProjectInput, ProjectFile, ProjectTemplate } from '../../types/project';

export const AVAILABLE_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'empty-android',
    name: 'Empty Android Project',
    nameId: 'Empty Android Project (Dasar)',
    description: 'Clean minimal Android Gradle project with Kotlin, AndroidX, and a blank MainActivity.',
    descriptionId: 'Struktur Android Gradle murni dengan Kotlin, AndroidX, dan Activity kosong tanpa dependensi berlebih.',
    minSdk: 26,
    targetSdk: 34,
    features: ['Kotlin 2.0', 'Android Gradle Plugin 8.5', 'AndroidX Core', 'Material 3'],
    featuresId: ['Kotlin 2.0', 'Android Gradle Plugin 8.5', 'AndroidX Core', 'Material 3'],
  },
  {
    id: 'basic-activity',
    name: 'Basic Activity (Material 3)',
    nameId: 'Basic Activity (Material 3 & FAB)',
    description: 'Complete with Material 3 TopAppBar, Floating Action Button, and ViewModel architecture pattern.',
    descriptionId: 'Dilengkapi Material 3 TopAppBar, Floating Action Button, dan arsitektur ViewModel siap pakai.',
    minSdk: 26,
    targetSdk: 34,
    features: ['Material 3 UI Components', 'Floating Action Button', 'Lifecycle ViewModel', 'Navigation ready'],
    featuresId: ['Komponen UI Material 3', 'Tombol Aksi Mengambang (FAB)', 'Lifecycle ViewModel', 'Siap Navigasi'],
  },
  {
    id: 'webview-starter',
    name: 'WebView Starter (Website to App)',
    nameId: 'WebView Starter (Konversi Web ke App)',
    description: 'Modern Android WebView wrapper with offline asset cache, WebChromeClient progress, and internet permissions.',
    descriptionId: 'Wrapper WebView modern dengan cache aset offline, progress bar WebChromeClient, dan penanganan koneksi.',
    minSdk: 26,
    targetSdk: 34,
    features: ['Accelerated WebView', 'Offline Caching', 'JavaScript Bridge ready', 'Network state listener'],
    featuresId: ['WebView Berakselerasi', 'Caching Offline', 'Bridge JavaScript Siap Pakai', 'Deteksi Status Jaringan'],
  },
];

export function generateProjectFiles(input: CreateProjectInput): ProjectFile[] {
  const { name, packageId, template, minSdk = 26, targetSdk = 34, compileSdk = 34 } = input;
  const packagePath = packageId.replace(/\./g, '/');

  // Root build.gradle.kts
  const rootBuildGradle = `// Nusantara App Builder - Root Gradle Build Script
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`;

  // settings.gradle.kts
  const settingsGradle = `// Nusantara App Builder - Settings Gradle
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${name}"
include(":app")
`;

  // gradle.properties
  const gradleProperties = `# Gradle Properties - Nusantara App Builder
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
kotlin.code.style=official
`;

  // app/build.gradle.kts
  const appBuildGradle = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "${packageId}"
    compileSdk = ${compileSdk}

    defaultConfig {
        applicationId = "${packageId}"
        minSdk = ${minSdk}
        targetSdk = ${targetSdk}
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
`;

  // gradle/libs.versions.toml
  const versionCatalog = `[versions]
agp = "8.5.0"
kotlin = "2.0.0"
coreKtx = "1.13.1"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.1.4"
lifecycleRuntimeKtx = "2.8.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`;

  // AndroidManifest.xml based on template
  const isWebView = template === 'webview-starter';
  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    ${isWebView ? '<uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />' : ''}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${name.replace(/[^a-zA-Z0-9]/g, '')}">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`;

  // strings.xml
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${name}</string>
    <string name="welcome_message">Selamat Datang di ${name}</string>
    <string name="description">${input.description || 'Aplikasi Android dibangun dengan Nusantara App Builder'}</string>
</resources>
`;

  // colors.xml
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#1E40AF</color>
    <color name="primary_dark">#1E3A8A</color>
    <color name="accent">#3B82F6</color>
    <color name="background_light">#F8FAFC</color>
    <color name="surface_light">#FFFFFF</color>
    <color name="text_primary">#0F172A</color>
    <color name="text_secondary">#475569</color>
</resources>
`;

  // themes.xml
  const themeName = `Theme.${name.replace(/[^a-zA-Z0-9]/g, '')}`;
  const themesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="${themeName}" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorSecondary">@color/accent</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
    </style>
</resources>
`;

  // activity_main.xml & MainActivity.kt depending on template
  let activityXml = '';
  let mainActivityKt = '';

  if (template === 'empty-android') {
    activityXml = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/tvWelcome"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/welcome_message"
        android:textSize="20sp"
        android:textStyle="bold"
        android:textColor="@color/text_primary"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`;

    mainActivityKt = `package ${packageId}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import ${packageId}.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Project initialized with Nusantara App Builder (Phase 1)
        binding.tvWelcome.text = getString(R.string.welcome_message)
    }
}
`;
  } else if (template === 'basic-activity') {
    activityXml = `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:theme="@style/ThemeOverlay.Material3.Dark.ActionBar">

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/toolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:title="@string/app_name"
            app:titleTextColor="@android:color/white" />

    </com.google.android.material.appbar.AppBarLayout>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior"
        android:padding="24dp">

        <TextView
            android:id="@+id/tvGreeting"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:text="@string/welcome_message"
            android:textSize="22sp"
            android:textStyle="bold"
            android:textColor="@color/text_primary"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintTop_toTopOf="parent" />

        <TextView
            android:id="@+id/tvSubtitle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="Dibangun dengan Material 3 di Nusantara App Builder"
            android:textSize="14sp"
            android:textColor="@color/text_secondary"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintTop_toBottomOf="@id/tvGreeting" />

    </androidx.constraintlayout.widget.ConstraintLayout>

    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabAction"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_margin="24dp"
        android:contentDescription="Action Button"
        app:srcCompat="@android:drawable/ic_input_add" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`;

    mainActivityKt = `package ${packageId}

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import ${packageId}.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        binding.fabAction.setOnClickListener {
            Toast.makeText(this, "Tombol ditekan di ${name}!", Toast.LENGTH_SHORT).show()
        }
    }
}
`;
  } else {
    // webview-starter
    activityXml = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:max="100"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <WebView
        android:id="@+id/webView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/progressBar"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`;

    mainActivityKt = `package ${packageId}

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import ${packageId}.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val defaultTargetUrl = "https://nusantara.dev"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
        setupBackNavigation()

        binding.webView.loadUrl(defaultTargetUrl)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            useWideViewPort = true
            loadWithOverviewMode = true
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                } else {
                    binding.progressBar.visibility = View.GONE
                }
            }
        }

        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                binding.progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                binding.progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                // Handle offline or connectivity error smoothly
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}
`;
  }

  // Proguard rules
  const proguardRules = `# Nusantara App Builder Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
`;

  // .gitignore
  const gitignore = `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`;

  // README.md for the generated project
  const readme = `# ${name}

Aplikasi Android ini dibuat dengan **Nusantara App Builder** (Phase 1).

## Spesifikasi
- **Package ID**: \`${packageId}\`
- **Template**: \`${template}\`
- **Compile SDK**: ${compileSdk}
- **Min SDK**: ${minSdk}
- **Target SDK**: ${targetSdk}
- **Bahasa Sumber**: Kotlin 2.0

## Cara Menjalankan dengan Android Studio atau Gradle
\`\`\`bash
# Build APK Debug
./gradlew assembleDebug

# Install ke perangkat yang terhubung (ADB)
./gradlew installDebug
\`\`\`
`;

  // nusantara.project.json (Project Metadata Descriptor)
  const metadataJson = JSON.stringify(
    {
      formatVersion: '1.0',
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      packageId,
      location: input.location,
      description: input.description || '',
      template,
      language: 'kotlin',
      interfaceLanguage: input.interfaceLanguage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      compileSdk,
      minSdk,
      targetSdk,
      versionCode: 1,
      versionName: '1.0.0',
      generator: 'Nusantara App Builder v0.1.0-alpha',
    },
    null,
    2
  );

  return [
    { path: 'build.gradle.kts', name: 'build.gradle.kts', content: rootBuildGradle, size: rootBuildGradle.length },
    { path: 'settings.gradle.kts', name: 'settings.gradle.kts', content: settingsGradle, size: settingsGradle.length },
    { path: 'gradle.properties', name: 'gradle.properties', content: gradleProperties, size: gradleProperties.length },
    { path: 'gradle/libs.versions.toml', name: 'libs.versions.toml', content: versionCatalog, size: versionCatalog.length },
    { path: 'app/build.gradle.kts', name: 'build.gradle.kts', content: appBuildGradle, size: appBuildGradle.length },
    { path: 'app/proguard-rules.pro', name: 'proguard-rules.pro', content: proguardRules, size: proguardRules.length },
    { path: 'app/src/main/AndroidManifest.xml', name: 'AndroidManifest.xml', content: manifest, size: manifest.length },
    { path: `app/src/main/java/${packagePath}/MainActivity.kt`, name: 'MainActivity.kt', content: mainActivityKt, size: mainActivityKt.length },
    { path: 'app/src/main/res/layout/activity_main.xml', name: 'activity_main.xml', content: activityXml, size: activityXml.length },
    { path: 'app/src/main/res/values/strings.xml', name: 'strings.xml', content: stringsXml, size: stringsXml.length },
    { path: 'app/src/main/res/values/colors.xml', name: 'colors.xml', content: colorsXml, size: colorsXml.length },
    { path: 'app/src/main/res/values/themes.xml', name: 'themes.xml', content: themesXml, size: themesXml.length },
    { path: '.gitignore', name: '.gitignore', content: gitignore, size: gitignore.length },
    { path: 'README.md', name: 'README.md', content: readme, size: readme.length },
    { path: 'nusantara.project.json', name: 'nusantara.project.json', content: metadataJson, size: metadataJson.length },
  ];
}
