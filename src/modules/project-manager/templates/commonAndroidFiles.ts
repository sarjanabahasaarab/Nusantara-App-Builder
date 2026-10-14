/**
 * Nusantara App Builder - Common Android Project Files
 * Phase 2 Toolchain:
 * - AGP: 8.5.2
 * - Gradle: 8.7
 * - Kotlin: 2.0.0
 * - JDK: 17 LTS
 * - Target SDK: 34 / Min SDK: 26
 */

import { CreateProjectInput, ProjectFile } from '../../../types/project';

export const COMPATIBLE_TOOLCHAIN = {
  agpVersion: '8.5.2',
  gradleVersion: '8.7',
  kotlinVersion: '2.0.0',
  jdkVersion: '17',
  compileSdk: 34,
  targetSdk: 34,
  minSdk: 26,
};

export function getRootBuildGradle(): string {
  return `// Nusantara App Builder - Root Gradle Build Script
// Android Gradle Plugin: ${COMPATIBLE_TOOLCHAIN.agpVersion} | Kotlin: ${COMPATIBLE_TOOLCHAIN.kotlinVersion}
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`;
}

export function getSettingsGradle(projectName: string): string {
  return `// Nusantara App Builder - Settings Gradle
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

rootProject.name = "${projectName}"
include(":app")
`;
}

export function getGradleProperties(): string {
  return `# Gradle Properties - Nusantara App Builder
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
kotlin.code.style=official
org.gradle.configuration-cache=true
`;
}

export function getGradleWrapperProperties(): string {
  return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${COMPATIBLE_TOOLCHAIN.gradleVersion}-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
}

export function getGradlewShell(): string {
  return `#!/bin/sh
# Nusantara App Builder - POSIX Gradle Wrapper script
# Gradle version: ${COMPATIBLE_TOOLCHAIN.gradleVersion}

APP_BASE_NAME=\`basename "$0"\`
APP_HOME="\`pwd -P\`"

# Attempt to locate JAVA_HOME
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
else
    JAVACMD="java"
fi

CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

if [ ! -f "$CLASSPATH" ]; then
    echo "Notice: gradle-wrapper.jar will be fetched automatically by gradle or gradle wrapper command." >&2
    if command -v gradle >/dev/null 2>&1; then
        exec gradle "$@"
    fi
fi

exec "$JAVACMD" -jar "$CLASSPATH" "$@"
`;
}

export function getGradlewBat(): string {
  return `@rem Nusantara App Builder - Windows Gradle Wrapper script
@rem Gradle version: ${COMPATIBLE_TOOLCHAIN.gradleVersion}
@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve Java executable
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:execute
set WRAPPER_JAR="%APP_HOME%gradle\\wrapper\\gradle-wrapper.jar"
if not exist %WRAPPER_JAR% (
    echo [Nusantara] Wrapper jar not found. Falling back to system gradle if available...
    where gradle >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        gradle %*
        goto end
    )
)

"%JAVA_EXE%" -jar %WRAPPER_JAR% %*
if %ERRORLEVEL% equ 0 goto end

:fail
exit /b 1

:end
exit /b 0
`;
}

export function getLibsVersionsToml(): string {
  return `[versions]
agp = "${COMPATIBLE_TOOLCHAIN.agpVersion}"
kotlin = "${COMPATIBLE_TOOLCHAIN.kotlinVersion}"
coreKtx = "1.13.1"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
appcompat = "1.7.0"
material = "1.12.0"
constraintlayout = "2.1.4"
lifecycleRuntimeKtx = "2.8.4"
lifecycleViewmodel = "2.8.4"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version.ref = "appcompat" }
material = { group = "com.google.android.material", name = "material", version.ref = "material" }
androidx-constraintlayout = { group = "androidx.constraintlayout", name = "constraintlayout", version.ref = "constraintlayout" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-ktx = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-ktx", version.ref = "lifecycleViewmodel" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`;
}

export function getAdaptiveIconForeground(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M31,31h46v46h-46z" />
    <path
        android:fillColor="#1E40AF"
        android:pathData="M38,42h8l16,24h-8z" />
</vector>
`;
}

export function getAdaptiveIconBackground(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#1E3A8A"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
}

export function getAdaptiveLauncherXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`;
}

export function getColorsXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#1E40AF</color>
    <color name="primary_dark">#1E3A8A</color>
    <color name="accent">#3B82F6</color>
    <color name="background_light">#F8FAFC</color>
    <color name="surface_light">#FFFFFF</color>
    <color name="text_primary">#0F172A</color>
    <color name="text_secondary">#475569</color>
    <color name="status_green">#16A34A</color>
</resources>
`;
}

export function getThemesXml(projectName: string): string {
  const sanitized = projectName.replace(/[^a-zA-Z0-9]/g, '');
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.${sanitized}" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorSecondary">@color/accent</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
        <item name="android:windowBackground">@color/background_light</item>
    </style>
</resources>
`;
}

export function getProguardRules(): string {
  return `# Nusantara App Builder Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
`;
}

export function getGitignore(): string {
  return `*.iml
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
`;
}
