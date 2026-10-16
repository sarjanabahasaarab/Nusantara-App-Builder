/**
 * Nusantara App Builder - AdMob Android Code & Configuration Generator
 * Phase 9: Idempotent AndroidManifest.xml updater, Gradle play-services-ads dependency injector,
 * AdMobService.kt Kotlin engine, and admob.json config exporter.
 */

import { AdMobConfig, AdUnitConfig } from '../types';
import { ProjectMetadata, ProjectFile } from '../../../types/project';

export interface GenerationResult {
  success: boolean;
  filesUpdated: string[];
  manifestUpdated: boolean;
  gradleUpdated: boolean;
  kotlinFileGenerated: boolean;
  error?: string;
  files: ProjectFile[];
}

export class AdMobGenerator {
  public static readonly GENERATED_START = '// NUSANTARA GENERATED ADMOB START';
  public static readonly GENERATED_END = '// NUSANTARA GENERATED ADMOB END';
  public static readonly DEFAULT_SDK_VERSION = '23.6.0';

  /**
   * Applies AdMob integration to project files idempotently
   */
  public static generateAdMobIntegration(
    config: AdMobConfig,
    project: ProjectMetadata,
    currentFiles: ProjectFile[]
  ): GenerationResult {
    try {
      const filesUpdated: string[] = [];
      const updatedFiles: ProjectFile[] = [...currentFiles];

      // 1. AndroidManifest.xml Update
      const manifestIndex = updatedFiles.findIndex((f) =>
        f.path.replace(/\\/g, '/').endsWith('AndroidManifest.xml')
      );

      let manifestUpdated = false;
      if (manifestIndex >= 0) {
        const manifest = updatedFiles[manifestIndex];
        const newManifestContent = this.updateManifestContent(manifest.content, config);
        if (newManifestContent !== manifest.content) {
          updatedFiles[manifestIndex] = {
            ...manifest,
            content: newManifestContent,
          };
          manifestUpdated = true;
          filesUpdated.push(manifest.path);
        }
      }

      // 2. Gradle Dependencies Update
      const gradleIndex = updatedFiles.findIndex(
        (f) =>
          f.path.replace(/\\/g, '/').endsWith('app/build.gradle.kts') ||
          f.path.replace(/\\/g, '/').endsWith('app/build.gradle')
      );

      let gradleUpdated = false;
      if (gradleIndex >= 0) {
        const gradle = updatedFiles[gradleIndex];
        const isKts = gradle.path.endsWith('.kts');
        const newGradleContent = this.updateGradleContent(gradle.content, config, isKts);
        if (newGradleContent !== gradle.content) {
          updatedFiles[gradleIndex] = {
            ...gradle,
            content: newGradleContent,
          };
          gradleUpdated = true;
          filesUpdated.push(gradle.path);
        }
      }

      // 3. Kotlin AdMobService.kt Generation
      const packagePath = project.packageId.replace(/\./g, '/');
      const kotlinPath = `app/src/main/java/${packagePath}/AdMobService.kt`;
      const kotlinIndex = updatedFiles.findIndex(
        (f) => f.path.replace(/\\/g, '/').endsWith('AdMobService.kt')
      );

      const kotlinContent = this.generateKotlinService(project.packageId, config);

      if (kotlinIndex >= 0) {
        updatedFiles[kotlinIndex] = {
          ...updatedFiles[kotlinIndex],
          content: kotlinContent,
        };
      } else {
        updatedFiles.push({
          path: kotlinPath,
          name: 'AdMobService.kt',
          content: kotlinContent,
          isDirectory: false,
          size: kotlinContent.length,
        });
      }
      filesUpdated.push(kotlinPath);

      // 4. admob.json Configuration File
      const configJsonPath = 'admob.json';
      const configJsonContent = JSON.stringify(config, null, 2);
      const jsonIndex = updatedFiles.findIndex((f) => f.path === configJsonPath);

      if (jsonIndex >= 0) {
        updatedFiles[jsonIndex] = {
          ...updatedFiles[jsonIndex],
          content: configJsonContent,
        };
      } else {
        updatedFiles.push({
          path: configJsonPath,
          name: 'admob.json',
          content: configJsonContent,
          isDirectory: false,
          size: configJsonContent.length,
        });
      }
      filesUpdated.push(configJsonPath);

      return {
        success: true,
        filesUpdated,
        manifestUpdated,
        gradleUpdated,
        kotlinFileGenerated: true,
        files: updatedFiles,
      };
    } catch (err: unknown) {
      return {
        success: false,
        filesUpdated: [],
        manifestUpdated: false,
        gradleUpdated: false,
        kotlinFileGenerated: false,
        error: err instanceof Error ? err.message : 'Failed to generate AdMob integration',
        files: currentFiles,
      };
    }
  }

  /**
   * Idempotently updates AndroidManifest.xml with AdMob meta-data and permissions
   */
  public static updateManifestContent(content: string, config: AdMobConfig): string {
    let result = content;

    // Ensure Permissions
    if (!result.includes('android.permission.INTERNET')) {
      result = result.replace(
        '<manifest',
        '<manifest\n    xmlns:tools="http://schemas.android.com/tools"'
      );
      result = result.replace(
        /(<manifest[^>]*>)/i,
        `$1\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`
      );
    } else if (!result.includes('android.permission.ACCESS_NETWORK_STATE')) {
      result = result.replace(
        /(<uses-permission android:name="android.permission.INTERNET"[^>]*\/>)/i,
        `$1\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />`
      );
    }

    // Clean existing AdMob meta-data if present to prevent duplicates
    const metaDataRegex = /<!-- NUSANTARA ADMOB START -->[\s\S]*?<!-- NUSANTARA ADMOB END -->/g;
    result = result.replace(metaDataRegex, '');

    const oldTagRegex = /<meta-data\s+android:name="com\.google\.android\.gms\.ads\.APPLICATION_ID"[^>]*\/>/g;
    result = result.replace(oldTagRegex, '');

    if (config.enabled && config.appId) {
      const adMobBlock = `\n        <!-- NUSANTARA ADMOB START -->\n        <meta-data\n            android:name="com.google.android.gms.ads.APPLICATION_ID"\n            android:value="${config.appId.trim()}" />\n        <!-- NUSANTARA ADMOB END -->`;

      // Inject before closing </application>
      if (result.includes('</application>')) {
        result = result.replace('</application>', `${adMobBlock}\n    </application>`);
      }
    }

    return result;
  }

  /**
   * Idempotently updates build.gradle / build.gradle.kts with play-services-ads
   */
  public static updateGradleContent(content: string, config: AdMobConfig, isKts: boolean): string {
    let result = content;
    const version = config.globalSettings.sdkVersion || this.DEFAULT_SDK_VERSION;

    // Check if play-services-ads already present
    if (result.includes('play-services-ads')) {
      if (!config.enabled) {
        // If disabled, cleanly remove
        result = result.replace(/.*play-services-ads.*(\r?\n)?/g, '');
      }
      return result;
    }

    if (!config.enabled) {
      return result;
    }

    let depLines = isKts
      ? `    implementation("com.google.android.gms:play-services-ads:${version}")`
      : `    implementation 'com.google.android.gms:play-services-ads:${version}'`;

    if (config.consentConfig?.enabled) {
      const umpLine = isKts
        ? `\n    implementation("com.google.android.ump:user-messaging-platform:3.1.0")`
        : `\n    implementation 'com.google.android.ump:user-messaging-platform:3.1.0'`;
      depLines += umpLine;
    }

    if (result.includes('dependencies {')) {
      result = result.replace(
        'dependencies {',
        `dependencies {\n    // AdMob Google Mobile Ads SDK (Phase 9)\n${depLines}`
      );
    } else {
      result += `\ndependencies {\n${depLines}\n}\n`;
    }

    return result;
  }

  /**
   * Generates clean, production-grade AdMobService.kt Kotlin helper
   */
  public static generateKotlinService(packageId: string, config: AdMobConfig): string {
    const isTest = config.environment === 'test';

    return `package ${packageId}

${this.GENERATED_START}
/**
 * Nusantara App Builder — AdMob Android Engine (Phase 9)
 * Official Google Mobile Ads SDK Integration.
 * Mode: ${config.environment.toUpperCase()}
 * App ID: ${config.appId}
 */

import android.app.Activity
import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

object AdMobService {
    private const val TAG = "NusantaraAdMob"
    
    var isInitialized: Boolean = false
        private set

    // Interstitial Cache
    private var interstitialAd: InterstitialAd? = null
    private var isInterstitialLoading: Boolean = false
    private var lastInterstitialShowTime: Long = 0

    // Rewarded Cache
    private var rewardedAd: RewardedAd? = null
    private var isRewardedLoading: Boolean = false

    /**
     * Initializes Google Mobile Ads SDK
     */
    fun initialize(context: Context, onComplete: (() -> Unit)? = null) {
        if (isInitialized) {
            onComplete?.invoke()
            return
        }

        try {
            MobileAds.initialize(context) { status ->
                isInitialized = true
                Log.d(TAG, "Google Mobile Ads SDK Initialized. Status: $status")
                onComplete?.invoke()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize MobileAds: \${e.message}", e)
        }
    }

    /**
     * Loads and mounts a Banner Ad into an Android ViewGroup container
     */
    fun showBanner(
        context: Context,
        container: ViewGroup,
        adUnitId: String,
        adSize: AdSize = AdSize.BANNER,
        onLoaded: (() -> Unit)? = null,
        onFailed: ((error: String) -> Unit)? = null
    ) {
        try {
            val adView = AdView(context).apply {
                this.adUnitId = adUnitId
                setAdSize(adSize)
            }

            container.removeAllViews()
            container.addView(adView)
            container.visibility = View.VISIBLE

            val adRequest = AdRequest.Builder().build()
            adView.adListener = object : AdListener() {
                override fun onAdLoaded() {
                    Log.d(TAG, "Banner Ad Loaded successfully: $adUnitId")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    Log.w(TAG, "Banner Ad Failed to Load: \${error.message}")
                    onFailed?.invoke(error.message)
                }
            }

            adView.loadAd(adRequest)
        } catch (e: Exception) {
            Log.e(TAG, "Error displaying banner ad: \${e.message}", e)
            onFailed?.invoke(e.message ?: "Unknown banner error")
        }
    }

    /**
     * Pre-loads an Interstitial Ad into cache
     */
    fun loadInterstitial(context: Context, adUnitId: String, onLoaded: (() -> Unit)? = null) {
        if (interstitialAd != null || isInterstitialLoading) return

        isInterstitialLoading = true
        val adRequest = AdRequest.Builder().build()

        InterstitialAd.load(
            context,
            adUnitId,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    isInterstitialLoading = false
                    Log.d(TAG, "Interstitial Ad Loaded: $adUnitId")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                    isInterstitialLoading = false
                    Log.w(TAG, "Interstitial Failed to Load: \${error.message}")
                }
            }
        )
    }

    /**
     * Displays Interstitial Ad with frequency interval capping
     */
    fun showInterstitial(
        activity: Activity,
        minIntervalSec: Long = 60,
        onClosed: () -> Unit
    ) {
        val now = System.currentTimeMillis()
        val elapsedSec = (now - lastInterstitialShowTime) / 1000

        if (elapsedSec < minIntervalSec) {
            Log.d(TAG, "Interstitial skipped due to frequency cap ($elapsedSec < $minIntervalSec s)")
            onClosed()
            return
        }

        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    lastInterstitialShowTime = System.currentTimeMillis()
                    onClosed()
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    interstitialAd = null
                    onClosed()
                }
            }
            ad.show(activity)
        } else {
            // Safe fallback if ad not ready: do not block navigation!
            onClosed()
        }
    }

    /**
     * Pre-loads a Rewarded Video Ad
     */
    fun loadRewarded(context: Context, adUnitId: String, onLoaded: (() -> Unit)? = null) {
        if (rewardedAd != null || isRewardedLoading) return

        isRewardedLoading = true
        val adRequest = AdRequest.Builder().build()

        RewardedAd.load(
            context,
            adUnitId,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    isRewardedLoading = false
                    Log.d(TAG, "Rewarded Ad Loaded: $adUnitId")
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewardedAd = null
                    isRewardedLoading = false
                    Log.w(TAG, "Rewarded Ad Failed to Load: \${error.message}")
                }
            }
        )
    }

    /**
     * Displays Rewarded Ad and executes reward callback only upon verified completion
     */
    fun showRewarded(
        activity: Activity,
        onRewardEarned: (type: String, amount: Int) -> Unit,
        onClosed: (() -> Unit)? = null
    ) {
        val ad = rewardedAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    rewardedAd = null
                    onClosed?.invoke()
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    rewardedAd = null
                    onClosed?.invoke()
                }
            }

            ad.show(activity) { rewardItem ->
                Log.d(TAG, "User earned reward: \${rewardItem.amount} \${rewardItem.type}")
                onRewardEarned(rewardItem.type, rewardItem.amount)
            }
        } else {
            onClosed?.invoke()
        }
    }
}

/**
 * Nusantara Indonesian-Friendly Wrapper API
 */
object Iklan {
    fun inisialisasi(context: Context) = AdMobService.initialize(context)

    fun tampilkanBanner(context: Context, container: ViewGroup, idUnit: String) {
        AdMobService.showBanner(context, container, idUnit)
    }

    fun tampilkanInterstisial(activity: Activity, jedaDetik: Long = 60, lanjutAksi: () -> Unit) {
        AdMobService.showInterstitial(activity, jedaDetik, lanjutAksi)
    }

    fun tampilkanBerhadiah(
        activity: Activity,
        hadiahDiterima: (namaHadiah: String, jumlah: Int) -> Unit
    ) {
        AdMobService.showRewarded(activity, hadiahDiterima)
    }
}
${this.GENERATED_END}
`;
  }
}
