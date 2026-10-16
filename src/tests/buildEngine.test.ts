/**
 * Nusantara App Builder - Phase 7 Test Suite
 * Build Engine, Toolchain Detection, Argument Escaping, Error Parsing,
 * Artifact Validation, and Security Tests (Command Injection, Password Masking, Path Traversal)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolchainDetector } from '../modules/build-engine/services/toolchainDetector';
import { GradleRunner } from '../modules/build-engine/services/gradleRunner';
import { ErrorParser } from '../modules/build-engine/services/errorParser';
import { ProjectBuildValidator } from '../modules/build-engine/services/projectBuildValidator';
import { ArtifactManager } from '../modules/build-engine/services/artifactManager';
import { SigningService } from '../modules/build-engine/services/signingService';
import { DeviceManager } from '../modules/build-engine/services/deviceManager';
import { ProjectMetadata, ProjectFile } from '../types/project';

describe('ToolchainDetector', () => {
  it('detects Java JDK information without throwing errors', async () => {
    const java = await ToolchainDetector.detectJdk();
    expect(java).toBeDefined();
    expect(java.installed).toBe(true);
    expect(java.version).toContain('17');
    expect(java.javaHome).toBeDefined();
  });

  it('detects Android SDK and components (ADB, platforms, build-tools)', async () => {
    const sdk = await ToolchainDetector.detectAndroidSdk(34);
    expect(sdk).toBeDefined();
    expect(sdk.installed).toBe(true);
    expect(sdk.adbAvailable).toBe(true);
    expect(sdk.installedPlatforms).toContain(34);
    expect(sdk.installedBuildTools.length).toBeGreaterThan(0);
  });

  it('detects Gradle wrapper existence', async () => {
    const gradle = await ToolchainDetector.detectGradle();
    expect(gradle.wrapperAvailable).toBe(true);
    expect(gradle.wrapperVersion).toBe('8.7');
  });

  it('performs full system diagnosis with actionable advice', async () => {
    const diag = await ToolchainDetector.diagnoseSystem(34);
    expect(diag).toBeDefined();
    expect(diag.overallReady).toBe(true);
    expect(diag.java.installed).toBe(true);
    expect(diag.androidSdk.installed).toBe(true);
  });
});

describe('ProjectBuildValidator', () => {
  const sampleProject: ProjectMetadata = {
    id: 'proj_test',
    name: 'TestApp',
    displayName: 'Test App',
    packageId: 'id.nusantara.testapp',
    location: 'C:\\Projects',
    description: 'Test application',
    template: 'empty-android',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 1,
    versionName: '1.0.0',
    formatVersion: '2.0',
  };

  const sampleFiles: ProjectFile[] = [
    { path: 'settings.gradle.kts', name: 'settings.gradle.kts', content: 'rootProject.name = "TestApp"' },
    { path: 'build.gradle.kts', name: 'build.gradle.kts', content: '// Root build' },
    { path: 'app/build.gradle.kts', name: 'app/build.gradle.kts', content: 'plugins { id("com.android.application") }' },
    {
      path: 'app/src/main/AndroidManifest.xml',
      name: 'AndroidManifest.xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="TestApp">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    { path: 'app/src/main/java/id/nusantara/testapp/MainActivity.kt', name: 'MainActivity.kt', content: 'class MainActivity : AppCompatActivity()' },
    { path: 'gradlew.bat', name: 'gradlew.bat', content: '@echo off' },
  ];

  it('passes quick validation when project has all required descriptors', () => {
    const result = ProjectBuildValidator.validate(sampleProject, sampleFiles, 'quick');
    expect(result.isValid).toBe(true);
    expect(result.isBlocked).toBe(false);
    expect(result.summary.errorsCount).toBe(0);
  });

  it('blocks build if package ID is invalid', () => {
    const invalidProject = { ...sampleProject, packageId: 'invalid' };
    const result = ProjectBuildValidator.validate(invalidProject, sampleFiles, 'quick');
    expect(result.isValid).toBe(false);
    expect(result.isBlocked).toBe(true);
    expect(result.issues.some((i) => i.description.includes('Invalid Android Package Identifier'))).toBe(true);
  });

  it('blocks build if AndroidManifest.xml is missing android:exported on launcher', () => {
    const badManifestFiles = sampleFiles.map((f) =>
      f.name === 'AndroidManifest.xml'
        ? { ...f, content: '<manifest><application><activity android:name=".MainActivity"><intent-filter><action android:name="android.intent.action.MAIN" /></intent-filter></activity></application></manifest>' }
        : f
    );
    const result = ProjectBuildValidator.validate(sampleProject, badManifestFiles, 'quick');
    expect(result.isBlocked).toBe(true);
    expect(result.issues.some((i) => i.description.includes('android:exported'))).toBe(true);
  });
});

describe('ErrorParser', () => {
  it('parses Kotlin compiler errors and identifies file, line, and suggested fix', () => {
    const logs = [
      '> Task :app:compileDebugKotlin',
      'e: C:/Users/Dev/App/MainActivity.kt: (42, 18): Unresolved reference: calculateTotal',
      '> Task :app:compileDebugKotlin FAILED',
    ];
    const parsed = ErrorParser.parseGradleErrors(logs);
    expect(parsed).toBeDefined();
    expect(parsed?.task).toBe(':app:compileDebugKotlin');
    expect(parsed?.file).toContain('MainActivity.kt');
    expect(parsed?.line).toBe(42);
    expect(parsed?.column).toBe(18);
    expect(parsed?.message).toContain('Unresolved reference: calculateTotal');
    expect(parsed?.suggestedFix).toContain('calculateTotal');
  });

  it('parses AAPT2 XML resource errors accurately', () => {
    const logs = [
      '> Task :app:processDebugResources',
      'C:/App/res/layout/activity_main.xml:14: AAPT: error: resource color/primary_accent not found.',
      '> Task :app:processDebugResources FAILED',
    ];
    const parsed = ErrorParser.parseGradleErrors(logs);
    expect(parsed).toBeDefined();
    expect(parsed?.errorType).toBe('aapt2');
    expect(parsed?.file).toContain('activity_main.xml');
    expect(parsed?.line).toBe(14);
  });

  it('parses AndroidManifest merger errors accurately', () => {
    const logs = [
      '> Task :app:processDebugMainManifest FAILED',
      'Manifest merger failed with multiple errors, see logs',
      'AndroidManifest.xml:15: Element activity#MainActivity has duplicated attribute',
    ];
    const parsed = ErrorParser.parseGradleErrors(logs);
    expect(parsed).toBeDefined();
    expect(parsed?.errorType).toBe('manifest');
    expect(parsed?.file).toContain('AndroidManifest.xml');
  });
});

describe('ArtifactManager', () => {
  const sampleProject: ProjectMetadata = {
    id: 'proj_art_test',
    name: 'TokoApp',
    displayName: 'Toko App',
    packageId: 'id.nusantara.toko',
    location: 'C:\\Projects\\TokoApp',
    description: '',
    template: 'empty-android',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    minSdk: 24,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 3,
    versionName: '1.2.0',
    formatVersion: '2.0',
  };

  it('registers and formats APK and AAB build artifacts', async () => {
    const artifact = await ArtifactManager.registerArtifact(
      sampleProject,
      'C:\\Projects\\TokoApp\\app\\build\\outputs\\apk\\debug\\app-debug.apk',
      'debug',
      'apk'
    );

    expect(artifact).toBeDefined();
    expect(artifact.type).toBe('apk');
    expect(artifact.variant).toBe('debug');
    expect(artifact.name).toBe('TokoApp-debug.apk');
    expect(artifact.sizeBytes).toBeGreaterThan(1_000_000);
    expect(artifact.formattedSize).toContain('MB');
    expect(artifact.packageName).toBe('id.nusantara.toko');
    expect(artifact.versionCode).toBe(3);
  });

  it('formats byte sizes to readable units correctly', () => {
    expect(ArtifactManager.formatFileSize(500)).toBe('500 B');
    expect(ArtifactManager.formatFileSize(2048)).toBe('2.0 KB');
    expect(ArtifactManager.formatFileSize(15_728_640)).toBe('15.00 MB');
  });
});

describe('SigningService & Keystore', () => {
  it('validates keystore creation parameters strictly', () => {
    expect(
      SigningService.validateKeystoreInput({
        destinationPath: 'C:\\Keys',
        keystoreName: '',
        alias: 'release',
        storePassword: 'password123',
        validityYears: 30,
        commonName: 'Developer',
        countryCode: 'ID',
      }).isValid
    ).toBe(false);

    expect(
      SigningService.validateKeystoreInput({
        destinationPath: 'C:\\Keys',
        keystoreName: 'key.jks',
        alias: 'release',
        storePassword: '123', // Too short
        validityYears: 30,
        commonName: 'Developer',
        countryCode: 'ID',
      }).isValid
    ).toBe(false);

    expect(
      SigningService.validateKeystoreInput({
        destinationPath: 'C:\\Keys',
        keystoreName: 'key.jks',
        alias: 'release',
        storePassword: 'secretpassword123',
        validityYears: 30,
        commonName: 'Budi Santoso',
        countryCode: 'ID',
      }).isValid
    ).toBe(true);
  });

  it('creates default signing config with secure defaults (v1 & v2 enabled)', () => {
    const config = SigningService.createDefaultConfig('proj_1');
    expect(config.isConfigured).toBe(false);
    expect(config.v1SigningEnabled).toBe(true);
    expect(config.v2SigningEnabled).toBe(true);
  });
});

describe('Security Testing (Command Injection, Leaks, Path Traversal)', () => {
  it('strictly masks passwords and secret tokens in logs', () => {
    const rawLog = 'Running: gradlew.bat -Pandroid.injected.signing.store.password=SuperSecret123 apiKey=xyz987654 password=mypassword';
    const masked = GradleRunner.maskSecrets(rawLog);
    expect(masked).not.toContain('SuperSecret123');
    expect(masked).not.toContain('mypassword');
    expect(masked).toContain('password=********');
  });

  it('rejects command injection attempts in package IDs passed to ADB launch', async () => {
    const injectionAttempt = 'id.nusantara.app; rm -rf /;';
    const result = await DeviceManager.launchApp(injectionAttempt, 'device_1');
    expect(result.success).toBe(false);
    expect(result.message).toContain('rejected for safety');
  });

  it('prevents concurrent build race conditions on the same project', async () => {
    const sampleProject: ProjectMetadata = {
      id: 'proj_lock_test',
      name: 'LockApp',
      displayName: 'Lock App',
      packageId: 'id.nusantara.lock',
      location: 'C:\\Projects',
      description: '',
      template: 'empty-android',
      language: 'kotlin',
      interfaceLanguage: 'id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      versionCode: 1,
      versionName: '1.0.0',
      formatVersion: '2.0',
    };

    const config = {
      variant: 'debug' as const,
      target: 'apk' as const,
      validationLevel: 'quick' as const,
      offlineMode: false,
      parallelBuild: 'auto' as const,
      buildCache: true,
    };

    // Start first build
    const build1 = GradleRunner.executeTask(sampleProject, 'assembleDebug', config, {
      onLog: () => {},
      onStatusChange: () => {},
    });

    // Attempt concurrent second build on same project
    await expect(
      GradleRunner.executeTask(sampleProject, 'assembleDebug', config, {
        onLog: () => {},
        onStatusChange: () => {},
      })
    ).rejects.toThrow('A build is already running for project');

    // Clean up
    GradleRunner.cancelBuild('proj_lock_test');
    await build1;
  });
});
