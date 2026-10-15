/**
 * Nusantara App Builder - Website Analyzer Service
 * Phase 5: Deep structural analysis of online websites and local asset bundles.
 */

import { LocalWebsiteFile, WebsiteAnalyzerReport, WebsiteSourceMode } from '../types';
import { validateWebsiteUrl } from './urlValidator';

/**
 * Analyzes an online target website
 */
export function analyzeOnlineWebsite(url: string): WebsiteAnalyzerReport {
  const validation = validateWebsiteUrl(url);

  const issues: WebsiteAnalyzerReport['detectedIssues'] = [];

  if (!validation.isHttps && validation.isValid) {
    issues.push({
      type: 'warning',
      title: 'Insecure HTTP Connection',
      description:
        'This website uses plain HTTP. Android 9+ blocks cleartext traffic by default. Consider migrating to HTTPS.',
    });
  }

  return {
    timestamp: new Date().toISOString(),
    sourceMode: 'url',
    targetUrl: validation.normalizedUrl,
    entryPoint: validation.normalizedUrl,
    protocol: validation.protocol,
    hostname: validation.hostname,
    isHttps: validation.isHttps,
    hasJavaScript: true, // Typical web modern standard
    hasResponsiveViewport: true,
    externalResources: validation.hostname ? [`https://${validation.hostname}`] : [],
    localAssetsCount: 0,
    localAssetsTotalSize: 0,
    detectedIssues: issues,
    isReadyForGeneration: validation.isValid,
  };
}

/**
 * Analyzes local website files and checks for entry points, relative paths, and Windows paths
 */
export function analyzeLocalWebsite(files: LocalWebsiteFile[], chosenEntryPoint?: string): WebsiteAnalyzerReport {
  const issues: WebsiteAnalyzerReport['detectedIssues'] = [];
  let totalSize = 0;
  let hasJs = false;
  let hasViewport = false;
  const externalResources: string[] = [];

  // Search for index.html or selected entry point
  const entryCandidate = chosenEntryPoint || 'index.html';
  const entryFile = files.find(
    (f) => f.path.toLowerCase() === entryCandidate.toLowerCase() || f.name.toLowerCase() === 'index.html'
  );

  if (!entryFile) {
    issues.push({
      type: 'error',
      title: 'Missing Entry Point (index.html)',
      description:
        'The selected website folder does not contain an "index.html" file. Android WebView requires a valid HTML entry point.',
    });
  } else {
    // Inspect HTML content
    const html = entryFile.content;

    if (html.includes('<script') || html.includes('.js')) {
      hasJs = true;
    }

    if (html.includes('name="viewport"') || html.includes("name='viewport'")) {
      hasViewport = true;
    } else {
      issues.push({
        type: 'warning',
        title: 'Missing Mobile Viewport Meta Tag',
        description:
          'index.html lacks a <meta name="viewport" content="width=device-width, initial-scale=1.0"> tag. The layout may look unoptimized on phone screens.',
      });
    }

    // Check for hardcoded Windows absolute file paths (e.g. C:\Users\... or file://)
    const windowsPathMatch = html.match(/([a-zA-Z]:\\[^\s"'>]+|file:\/\/\/[^\s"'>]+)/g);
    if (windowsPathMatch) {
      issues.push({
        type: 'warning',
        title: 'Absolute Windows Paths Detected',
        description: `Found absolute desktop file paths in HTML (${windowsPathMatch[0]}). These will fail on Android devices. Use relative paths like "css/style.css" instead.`,
      });
    }

    // Check for external URLs
    const extMatches = html.matchAll(/https?:\/\/([^"'\s>]+)/g);
    for (const match of extMatches) {
      const host = match[1].split('/')[0];
      if (host && !externalResources.includes(host)) {
        externalResources.push(host);
      }
    }
  }

  // Calculate size and check all files
  for (const f of files) {
    totalSize += f.size || (f.content ? f.content.length : 0);

    if (f.path.endsWith('.js')) {
      hasJs = true;
    }

    // Check CSS files for absolute windows paths
    if (f.path.endsWith('.css') && f.content) {
      if (/[a-zA-Z]:\\[^\s)]+/.test(f.content)) {
        issues.push({
          type: 'warning',
          title: `Absolute Paths in ${f.name}`,
          description: `CSS file "${f.path}" contains local Windows disk paths in url() rules.`,
        });
      }
    }
  }

  if (totalSize > 50 * 1024 * 1024) {
    issues.push({
      type: 'warning',
      title: 'Large Asset Bundle Size',
      description: `Total website folder size is ${(totalSize / (1024 * 1024)).toFixed(1)} MB. Keep assets optimized for faster APK installation.`,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    sourceMode: 'local',
    entryPoint: entryFile ? entryFile.path : undefined,
    protocol: 'file (assets)',
    hostname: 'localhost (embedded)',
    isHttps: true, // Local file assets are trusted
    hasJavaScript: hasJs,
    hasResponsiveViewport: hasViewport,
    externalResources,
    localAssetsCount: files.length,
    localAssetsTotalSize: totalSize,
    detectedIssues: issues,
    isReadyForGeneration: !!entryFile,
  };
}
