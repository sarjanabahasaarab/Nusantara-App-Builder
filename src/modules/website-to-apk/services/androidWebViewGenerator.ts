/**
 * Nusantara App Builder - Android WebView Project Generator
 * Phase 5: Generates production-ready Kotlin WebView code, Manifest, Network Security, Layout, and Local Assets.
 */

import { ProjectFile } from '../../../types/project';
import { WebsiteProjectConfig, LocalWebsiteFile } from '../types';
import { COMPATIBLE_TOOLCHAIN } from '../../project-manager/templates/commonAndroidFiles';

/**
 * Generates all Android project files for a Website-to-App project
 */
export function generateAndroidWebViewProject(
  config: WebsiteProjectConfig,
  localFiles: LocalWebsiteFile[] = []
): ProjectFile[] {
  const files: ProjectFile[] = [];
  const packagePath = config.android.applicationId.replace(/\./g, '/');

  // 1. Root build.gradle.kts
  files.push({
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    content: `// Top-level build file for Nusantara Website-to-App Project
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`,
  });

  // 2. settings.gradle.kts
  files.push({
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    content: `pluginManagement {
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

rootProject.name = "${config.android.appName.replace(/[^a-zA-Z0-9_-]/g, '')}"
include(":app")
`,
  });

  // 3. gradle.properties
  files.push({
    path: 'gradle.properties',
    name: 'gradle.properties',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
  });

  // 4. gradle/libs.versions.toml
  files.push({
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    content: `[versions]
agp = "${COMPATIBLE_TOOLCHAIN.agpVersion}"
kotlin = "${COMPATIBLE_TOOLCHAIN.kotlinVersion}"
coreKtx = "1.13.1"
appcompat = "1.7.0"
material = "1.12.0"
swiperefresh = "1.1.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-swiperefresh = { group = "androidx.swiperefreshlayout", name = "swiperefreshlayout", version.ref = "swiperefresh" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`,
  });

  // 5. gradle-wrapper.properties
  files.push({
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${COMPATIBLE_TOOLCHAIN.gradleVersion}-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  });

  // 6. gradlew and gradlew.bat
  files.push({
    path: 'gradlew',
    name: 'gradlew',
    content: '#!/usr/bin/env sh\nexec gradle "$@"\n',
    isExecutable: true,
  });
  files.push({
    path: 'gradlew.bat',
    name: 'gradlew.bat',
    content: '@rem Gradle wrapper batch script for Windows\n@gradle %*\n',
  });

  // 7. app/build.gradle.kts
  files.push({
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "${config.android.applicationId}"
    compileSdk = ${config.android.compileSdk}

    defaultConfig {
        applicationId = "${config.android.applicationId}"
        minSdk = ${config.android.minSdk}
        targetSdk = ${config.android.targetSdk}
        versionCode = ${config.android.versionCode}
        versionName = "${config.android.versionName}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
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
    implementation(libs.androidx.swiperefresh)
}
`,
  });

  // 8. Network Security Config (app/src/main/res/xml/network_security_config.xml)
  const allowedDomainEntries = config.security.domainAllowlist
    .map(
      (rule) =>
        `        <domain includeSubdomains="${rule.includeSubdomains}">${rule.domain}</domain>`
    )
    .join('\n');

  files.push({
    path: 'app/src/main/res/xml/network_security_config.xml',
    name: 'network_security_config.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Default security: cleartext traffic is disabled unless explicitly permitted -->
    <base-config cleartextTrafficPermitted="${config.webview.cleartextTraffic}">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
${
  allowedDomainEntries
    ? `    <domain-config cleartextTrafficPermitted="${config.webview.cleartextTraffic}">\n${allowedDomainEntries}\n    </domain-config>`
    : ''
}
</network-security-config>
`,
  });

  // 9. AndroidManifest.xml
  const permElements: string[] = [
    '    <uses-permission android:name="android.permission.INTERNET" />',
    '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />',
  ];

  if (config.permissions.camera) {
    permElements.push('    <uses-permission android:name="android.permission.CAMERA" />');
  }
  if (config.permissions.recordAudio) {
    permElements.push('    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
  }
  if (config.permissions.fineLocation) {
    permElements.push('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />');
  }

  const orientationAttr =
    config.ui.orientation === 'portrait'
      ? 'android:screenOrientation="portrait"'
      : config.ui.orientation === 'landscape'
      ? 'android:screenOrientation="landscape"'
      : 'android:screenOrientation="unspecified"';

  files.push({
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

${permElements.join('\n')}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.NusantaraApp"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            ${orientationAttr}
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|uiMode|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`,
  });

  // 10. Layout XML (app/src/main/res/layout/activity_main.xml)
  files.push({
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- nusantara-visual-metadata: designId=website_to_app screenId=screen_main schemaVersion=1.0 generatorVersion=5.0.0 -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/root_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

${
  config.ui.topAppBar.enabled
    ? `    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/top_app_bar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        android:background="${config.ui.topAppBar.backgroundColor}"
        app:title="${config.ui.topAppBar.title || config.android.appName}"
        app:titleTextColor="#FFFFFF" />
`
    : ''
}
${
  config.webview.progressIndicator
    ? `    <ProgressBar
        android:id="@+id/progress_bar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="3dp"
        android:indeterminate="false"
        android:max="100"
        android:progress="0"
        android:visibility="gone" />
`
    : ''
}
${
  config.webview.pullToRefresh
    ? `    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipe_refresh"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1">

        <WebView
            android:id="@+id/web_view"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>`
    : `    <WebView
        android:id="@+id/web_view"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />`
}

</LinearLayout>
`,
  });

  // 11. Offline Fallback HTML (app/src/main/assets/offline.html)
  files.push({
    path: 'app/src/main/assets/offline.html',
    name: 'offline.html',
    content: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Koneksi Terputus</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0; padding: 24px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 80vh; text-align: center;
            background-color: #0F172A; color: #F8FAFC;
        }
        .icon { font-size: 56px; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; }
        p { font-size: 14px; color: #94A3B8; max-width: 320px; margin: 0 0 24px 0; line-height: 1.5; }
        .btn {
            background-color: #2563EB; color: #FFFFFF; border: none;
            padding: 12px 28px; font-size: 14px; font-weight: 600;
            border-radius: 8px; cursor: pointer; text-decoration: none;
        }
        .btn:active { background-color: #1D4ED8; }
    </style>
</head>
<body>
    <div class="icon">📡</div>
    <h1>Tidak Dapat Terhubung</h1>
    <p>Periksa koneksi internet Anda atau coba muat ulang halaman aplikasi.</p>
    <button class="btn" onclick="window.location.reload()">Coba Lagi (Retry)</button>
</body>
</html>
`,
  });

  // 12. If local website mode, copy all local assets to app/src/main/assets/website/...
  if (config.source.mode === 'local' && localFiles.length > 0) {
    for (const f of localFiles) {
      files.push({
        path: `app/src/main/assets/website/${f.path}`,
        name: f.name,
        content: f.content,
        size: f.size,
      });
    }
  }

  // 13. Production Kotlin MainActivity.kt
  const targetLoadUrl =
    config.source.mode === 'local'
      ? `file:///android_asset/website/${config.source.entryPoint || 'index.html'}`
      : config.source.url || 'https://example.com';

  const domainRulesKotlin = config.security.domainAllowlist
    .map(
      (r) =>
        `            if (host != null && (host == "${r.domain}" || (host.endsWith(".${r.domain}")))) { return false }`
    )
    .join('\n');

  files.push({
    path: `app/src/main/java/${packagePath}/MainActivity.kt`,
    name: 'MainActivity.kt',
    content: `package ${config.android.applicationId}

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var progressBar: ProgressBar? = null
    private var swipeRefresh: SwipeRefreshLayout? = null
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult
        val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
        fileUploadCallback?.onReceiveValue(uris)
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.web_view)
        progressBar = findViewById(R.id.progress_bar)
        swipeRefresh = findViewById(R.id.swipe_refresh)

        setupWebViewSettings()
        setupWebViewClients()
        setupBackNavigation()
        setupDownloadListener()

        // Pull to refresh support
        swipeRefresh?.setOnRefreshListener {
            webView.reload()
        }

        // Load entry point
        webView.loadUrl("${targetLoadUrl}")
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebViewSettings() {
        val settings = webView.settings
        settings.javaScriptEnabled = ${config.webview.javascript}
        settings.domStorageEnabled = ${config.webview.domStorage}
        settings.databaseEnabled = ${config.webview.database}
        settings.setSupportZoom(${config.webview.zoom})
        settings.builtInZoomControls = ${config.webview.zoom}
        settings.displayZoomControls = false

        // Security best practice: restrict file access across domains
        settings.allowFileAccess = ${config.source.mode === 'local'}
        settings.allowContentAccess = true

        ${
          config.webview.userAgent
            ? `settings.userAgentString = "${config.webview.userAgent}"`
            : ''
        }
    }

    private fun setupWebViewClients() {
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url ?: return false
                val host = url.host?.lowercase()

                // Internal app schemes
                if (url.scheme == "file") return false

                // Domain allowlist check
${domainRulesKotlin}

                // If external links policy is browser, launch external intent
                ${
                  config.webview.externalLinksPolicy === 'browser'
                    ? `return try {
                    val intent = Intent(Intent.ACTION_VIEW, url)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }`
                    : 'return false'
                }
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar?.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar?.visibility = View.GONE
                swipeRefresh?.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    webView.loadUrl("file:///android_asset/offline.html")
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                progressBar?.progress = newProgress
                if (newProgress >= 100) {
                    progressBar?.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    filePickerLauncher.launch(intent)
                } catch (e: Exception) {
                    fileUploadCallback = null
                    return false
                }
                return true
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupDownloadListener() {
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("Downloading file...")
                    setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    )
                }
                val manager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                manager.enqueue(request)
                Toast.makeText(this, "Download started...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this, "Failed to initiate download.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
`,
  });

  // 14. strings.xml
  files.push({
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    content: `<resources>
    <string name="app_name">${config.android.appName}</string>
    <string name="website_target_url">${targetLoadUrl}</string>
</resources>
`,
  });

  // 15. colors.xml
  files.push({
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#2563EB</color>
    <color name="primary_dark">#1D4ED8</color>
    <color name="accent">#10B981</color>
    <color name="background">#0F172A</color>
</resources>
`,
  });

  // 16. themes.xml
  files.push({
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    content: `<resources>
    <style name="Theme.NusantaraApp" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="android:statusBarColor">@color/background</item>
        <item name="android:navigationBarColor">@color/background</item>
    </style>
</resources>
`,
  });

  // 17. website-project-config.json stored in project root
  files.push({
    path: 'website-project-config.json',
    name: 'website-project-config.json',
    content: JSON.stringify(config, null, 2) + '\n',
  });

  return files;
}
