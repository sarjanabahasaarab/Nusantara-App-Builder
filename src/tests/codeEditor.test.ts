/**
 * Nusantara App Builder - Code Editor Unit & Integration Test Suite
 * Phase 4: Path validation, language detection, XML parsing, visual sync, formatting, and file operations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectLanguageByPath,
  validateProjectFilePath,
  buildFileTree,
  isBinaryFile,
} from '../modules/code-editor/services/fileSystemService';
import {
  parseAndroidXmlToVisualScreen,
  extractVisualMetadata,
  mapAndroidTagToComponentType,
  parseAndroidId,
} from '../modules/code-editor/services/xmlParser';
import { formatXmlDocument, formatDocument } from '../modules/code-editor/services/xmlFormatter';
import {
  validateAndroidXml,
  validateKotlinSource,
  validateFileContent,
} from '../modules/code-editor/services/syntaxValidator';
import { parseAndValidateCommand } from '../modules/code-editor/services/terminalService';
import { NativeBridge } from '../modules/filesystem/nativeBridge';
import { ProjectFile } from '../types/project';

// Simple in-memory localStorage polyfill for test runner environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  length: 0,
  key: () => null,
};

describe('Phase 4: File System & Language Detection', () => {
  it('detects correct language from file path extension', () => {
    expect(detectLanguageByPath('app/src/main/java/MainActivity.kt')).toBe('kotlin');
    expect(detectLanguageByPath('build.gradle.kts')).toBe('kotlin');
    expect(detectLanguageByPath('app/build.gradle')).toBe('groovy');
    expect(detectLanguageByPath('app/src/main/res/layout/activity_main.xml')).toBe('xml');
    expect(detectLanguageByPath('app/src/main/AndroidManifest.xml')).toBe('xml');
    expect(detectLanguageByPath('app/src/main/java/Utility.java')).toBe('java');
    expect(detectLanguageByPath('gradle.properties')).toBe('properties');
    expect(detectLanguageByPath('package.json')).toBe('json');
    expect(detectLanguageByPath('website/index.html')).toBe('html');
    expect(detectLanguageByPath('website/css/style.css')).toBe('css');
    expect(detectLanguageByPath('website/js/main.js')).toBe('javascript');
    expect(detectLanguageByPath('README.md')).toBe('markdown');
    expect(detectLanguageByPath('unknown.xyz')).toBe('plaintext');
  });

  it('detects binary files correctly', () => {
    expect(isBinaryFile('app/src/main/res/drawable/logo.png')).toBe(true);
    expect(isBinaryFile('app/src/main/res/mipmap/ic_launcher.webp')).toBe(true);
    expect(isBinaryFile('libs/library.jar')).toBe(true);
    expect(isBinaryFile('app/release.keystore')).toBe(true);
    expect(isBinaryFile('app/src/main/res/layout/activity_main.xml')).toBe(false);
    expect(isBinaryFile('MainActivity.kt')).toBe(false);
  });

  it('validates file paths and prevents directory traversal', () => {
    expect(validateProjectFilePath('app/src/main/res/layout/item.xml').isValid).toBe(true);
    expect(validateProjectFilePath('../secret.txt').isValid).toBe(false);
    expect(validateProjectFilePath('app/../../root.txt').isValid).toBe(false);
    expect(validateProjectFilePath('/absolute/path.txt').isValid).toBe(false);
    expect(validateProjectFilePath('C:\\Windows\\system32').isValid).toBe(false);
    expect(validateProjectFilePath('invalid*name?.xml').isValid).toBe(false);
    expect(validateProjectFilePath('').isValid).toBe(false);
  });

  it('builds a hierarchical file tree from flat project files', () => {
    const flatFiles: ProjectFile[] = [
      { path: 'build.gradle.kts', name: 'build.gradle.kts', content: '' },
      { path: 'app/build.gradle.kts', name: 'build.gradle.kts', content: '' },
      { path: 'app/src/main/AndroidManifest.xml', name: 'AndroidManifest.xml', content: '' },
      { path: 'app/src/main/res/layout/activity_main.xml', name: 'activity_main.xml', content: '' },
    ];

    const tree = buildFileTree(flatFiles);
    expect(tree.length).toBeGreaterThan(0);

    const appNode = tree.find((n) => n.name === 'app');
    expect(appNode).toBeDefined();
    expect(appNode?.isDirectory).toBe(true);
    expect(appNode?.children?.length).toBeGreaterThan(0);
  });
});

describe('Phase 4: Android XML Layout Parser & Visual Sync', () => {
  it('parses valid Android layout XML into VisualScreen design model', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/root_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <TextView
        android:id="@+id/tv_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Welcome to Nusantara" />

    <Button
        android:id="@+id/btn_action"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Proceed" />
</LinearLayout>`;

    const res = parseAndroidXmlToVisualScreen(xml, 'activity_main.xml');
    expect(res.success).toBe(true);
    expect(res.screen).toBeDefined();
    expect(res.screen?.root.id).toBe('root_layout');
    expect(res.screen?.root.children?.length).toBe(2);
    expect(res.screen?.root.children?.[0].properties.id).toBe('tv_title');
    expect(res.screen?.root.children?.[0].properties.text).toBe('Welcome to Nusantara');
    expect(res.screen?.root.children?.[1].properties.id).toBe('btn_action');
    expect(res.screen?.root.children?.[1].properties.text).toBe('Proceed');
  });

  it('extracts embedded visual designer metadata comments', () => {
    const xmlWithMeta = `<?xml version="1.0" encoding="utf-8"?>
<!-- nusantara-visual-metadata: designId=proj_123 screenId=screen_home schemaVersion=1.0 generatorVersion=1.0.0 -->
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
</FrameLayout>`;

    const meta = extractVisualMetadata(xmlWithMeta);
    expect(meta).not.toBeNull();
    expect(meta?.designId).toBe('proj_123');
    expect(meta?.screenId).toBe('screen_home');
    expect(meta?.schemaVersion).toBe('1.0');
  });

  it('preserves unsupported custom Android views without deleting them', () => {
    const xmlWithCustom = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rv_items"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</LinearLayout>`;

    const res = parseAndroidXmlToVisualScreen(xmlWithCustom);
    expect(res.success).toBe(true);
    expect(res.unsupportedTags).toContain('androidx.recyclerview.widget.RecyclerView');
    expect(res.screen?.root.children?.[0].type).toBe('unsupportedView');
    expect(res.screen?.root.children?.[0].properties.id).toBe('rv_items');
  });

  it('maps tags to ComponentType correctly', () => {
    expect(mapAndroidTagToComponentType('LinearLayout', 'vertical')).toBe('verticalLayout');
    expect(mapAndroidTagToComponentType('LinearLayout', 'horizontal')).toBe('horizontalLayout');
    expect(mapAndroidTagToComponentType('FrameLayout')).toBe('container');
    expect(mapAndroidTagToComponentType('ScrollView')).toBe('scrollView');
    expect(mapAndroidTagToComponentType('TextView')).toBe('text');
    expect(mapAndroidTagToComponentType('Button')).toBe('button');
    expect(mapAndroidTagToComponentType('EditText')).toBe('textField');
    expect(mapAndroidTagToComponentType('CheckBox')).toBe('checkbox');
    expect(mapAndroidTagToComponentType('Switch')).toBe('switch');
    expect(mapAndroidTagToComponentType('ProgressBar')).toBe('progressBar');
    expect(mapAndroidTagToComponentType('View')).toBe('divider');
    expect(mapAndroidTagToComponentType('Space')).toBe('spacer');
  });

  it('parses android:id strings cleanly', () => {
    expect(parseAndroidId('@+id/btn_save')).toBe('btn_save');
    expect(parseAndroidId('@id/btn_save')).toBe('btn_save');
    expect(parseAndroidId('plain_id')).toBe('plain_id');
  });
});

describe('Phase 4: XML and Code Formatter', () => {
  it('formats XML with consistent 4-space indentation', () => {
    const messyXml = `<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"><TextView android:text="Hello" /><Button android:text="Click" /></LinearLayout>`;
    const res = formatXmlDocument(messyXml, 4);
    expect(res.formatted).toBe(true);
    expect(res.content).toContain('    <TextView');
    expect(res.content).toContain('    <Button');
  });

  it('safely warns for Kotlin without corrupting code', () => {
    const ktCode = `class MainActivity : AppCompatActivity() { fun test() {} }`;
    const res = formatDocument('kotlin', ktCode);
    expect(res.formatted).toBe(false);
    expect(res.content).toBe(ktCode);
    expect(res.message).toContain('Kotlin/Java formatter is not configured yet');
  });
});

describe('Phase 4: Syntax and Android Resource Validator', () => {
  it('detects invalid XML structure and malformed tags', () => {
    const brokenXml = `<LinearLayout><TextView></LinearLayout>`;
    const problems = validateAndroidXml('activity_main.xml', brokenXml);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].severity).toBe('error');
  });

  it('detects duplicate android:id within the same layout', () => {
    const duplicateIdXml = `<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android">
    <TextView android:id="@+id/tv_label" android:layout_width="wrap_content" android:layout_height="wrap_content" />
    <Button android:id="@+id/tv_label" android:layout_width="wrap_content" android:layout_height="wrap_content" />
</LinearLayout>`;

    const problems = validateAndroidXml('activity_main.xml', duplicateIdXml);
    const hasDuplicateWarning = problems.some((p) => p.message.includes('Duplicate android:id'));
    expect(hasDuplicateWarning).toBe(true);
  });

  it('validates basic Kotlin syntax and unmatched braces', () => {
    const brokenKotlin = `package id.nusantara.app

class MainActivity {
    fun onCreate() {
        val message = "Hello
    }
`;
    const problems = validateKotlinSource('MainActivity.kt', brokenKotlin);
    expect(problems.length).toBeGreaterThan(0);
    const hasUnclosed = problems.some((p) => p.message.includes('Unclosed string literal') || p.message.includes('closing brace'));
    expect(hasUnclosed).toBe(true);
  });
});

describe('Phase 4: Native Sandboxed Terminal Engine', () => {
  it('validates and accepts whitelisted toolchain commands', () => {
    const valid1 = parseAndValidateCommand('./gradlew assembleDebug');
    expect(valid1.isAllowed).toBe(true);
    expect(valid1.executable).toBe('./gradlew');
    expect(valid1.args).toEqual(['assembleDebug']);

    const valid2 = parseAndValidateCommand('adb devices');
    expect(valid2.isAllowed).toBe(true);
    expect(valid2.executable).toBe('adb');
    expect(valid2.args).toEqual(['devices']);
  });

  it('rejects commands containing shell chaining or redirection', () => {
    const malicious1 = parseAndValidateCommand('gradlew assembleDebug && rm -rf /');
    expect(malicious1.isAllowed).toBe(false);
    expect(malicious1.rejectionReason).toContain('chaining');

    const malicious2 = parseAndValidateCommand('adb devices > secret.txt');
    expect(malicious2.isAllowed).toBe(false);
  });

  it('rejects unapproved executables', () => {
    const rejected = parseAndValidateCommand('powershell.exe -Command Get-Process');
    expect(rejected.isAllowed).toBe(false);
    expect(rejected.rejectionReason).toContain('whitelist');
  });
});

describe('Phase 4 Integration: Open Project -> Edit File -> Save -> Verify Content', () => {
  it('creates project, saves modified file content atomically, and verifies updates', async () => {
    const { project } = await NativeBridge.createProject({
      name: 'EditorTestApp',
      packageId: 'id.nusantara.editortest',
      location: 'C:\\NusantaraProjects',
      template: 'basic-activity',
      interfaceLanguage: 'id',
    });

    const targetFile = 'app/src/main/res/values/strings.xml';
    const modifiedContent = `<resources>\n    <string name="app_name">Editor Test App Updated</string>\n</resources>`;

    // Save file
    const saved = await NativeBridge.saveProjectFile(project.id, targetFile, modifiedContent);
    expect(saved).toBe(true);

    // Read back and verify content
    const files = await NativeBridge.getProjectFiles(project.id);
    const updatedFile = files.find((f) => f.path === targetFile);
    expect(updatedFile).toBeDefined();
    expect(updatedFile?.content).toBe(modifiedContent);

    // Search inside project
    const searchResults = await NativeBridge.searchInProject(project.id, 'Editor Test App Updated');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].filePath).toBe(targetFile);

    // Clean up test project
    await NativeBridge.deleteProjectPermanently(project.id);
  });
});
