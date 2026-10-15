/**
 * Nusantara App Builder - Android XML Layout Parser & Visual Model Reverser
 * Phase 4: Bi-directional synchronization between Code Editor XML and Visual Designer.
 * Parses Android XML layout into VisualScreen hierarchy while safely preserving unsupported views.
 */

import { VisualComponent, VisualScreen, ComponentType } from '../../../types/visualDesigner';

export interface ParseXmlResult {
  success: boolean;
  screen?: VisualScreen;
  metadata?: {
    designId?: string;
    screenId?: string;
    schemaVersion?: string;
    generatorVersion?: string;
    generatedFile?: string;
  };
  errors: string[];
  warnings: string[];
  unsupportedTags: string[];
  totalComponents: number;
}

/**
 * Extracts metadata embedded in XML comments
 * Format: <!-- nusantara-visual-metadata: designId=... screenId=... schemaVersion=1.0 generatorVersion=1.0.0 -->
 */
export function extractVisualMetadata(xml: string) {
  const match = xml.match(/<!--\s*nusantara-visual-metadata:\s*([^>]+?)-->/);
  if (!match) return null;

  const rawPairs = match[1].trim().split(/\s+/);
  const metadata: Record<string, string> = {};

  for (const pair of rawPairs) {
    const [k, v] = pair.split('=');
    if (k && v) {
      metadata[k] = v;
    }
  }

  return metadata;
}

/**
 * Map Android XML tag name to Visual Designer ComponentType
 */
export function mapAndroidTagToComponentType(tag: string, orientation?: string): ComponentType | 'unsupportedView' {
  const cleanTag = tag.replace(/^[^:]+:/, '');

  switch (cleanTag) {
    case 'LinearLayout':
      if (orientation === 'horizontal') return 'horizontalLayout';
      if (orientation === 'vertical') return 'verticalLayout';
      return 'linearLayout';
    case 'FrameLayout':
      return 'container';
    case 'ScrollView':
    case 'androidx.core.widget.NestedScrollView':
      return 'scrollView';
    case 'com.google.android.material.card.MaterialCardView':
    case 'androidx.cardview.widget.CardView':
      return 'card';
    case 'TextView':
      return 'text';
    case 'Button':
    case 'com.google.android.material.button.MaterialButton':
      return 'button';
    case 'EditText':
    case 'com.google.android.material.textfield.TextInputEditText':
      return 'textField';
    case 'CheckBox':
      return 'checkbox';
    case 'Switch':
    case 'androidx.appcompat.widget.SwitchCompat':
    case 'com.google.android.material.switchmaterial.SwitchMaterial':
      return 'switch';
    case 'RadioButton':
      return 'radioButton';
    case 'ImageView':
      return 'image';
    case 'ImageButton':
      return 'imageButton';
    case 'ProgressBar':
      return 'progressBar';
    case 'View':
      return 'divider';
    case 'Space':
      return 'spacer';
    default:
      return 'unsupportedView';
  }
}

/**
 * Parse an Android ID attribute value (e.g. "@+id/btn_submit" or "@id/btn_submit") into clean id "btn_submit"
 */
export function parseAndroidId(rawId?: string): string | undefined {
  if (!rawId) return undefined;
  const match = rawId.match(/@\+?id\/(.+)$/);
  return match ? match[1] : rawId;
}

/**
 * Parses dimension value (e.g. "match_parent", "wrap_content", "16dp")
 */
function parseDimension(val?: string): 'match_parent' | 'wrap_content' | number {
  if (!val) return 'wrap_content';
  if (val === 'match_parent' || val === 'fill_parent') return 'match_parent';
  if (val === 'wrap_content') return 'wrap_content';

  const num = parseInt(val.replace(/[^\d.-]/g, ''), 10);
  return isNaN(num) ? 'wrap_content' : num;
}

interface GenericXmlElement {
  tagName: string;
  getAttribute: (name: string) => string | null;
  children: GenericXmlElement[];
}

/**
 * Universal XML tokenizer and tree builder (works in browser and Node/Vitest)
 */
function parseXmlStringToTree(xml: string): { root: GenericXmlElement | null; error?: string } {
  // Strip comments and declaration
  const cleanXml = xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\?[\s\S]*?\?>/g, '')
    .trim();

  if (!cleanXml) return { root: null, error: 'Empty XML content' };

  const tagRegex = /<(\/)?([a-zA-Z0-9_.:]+)([^>]*?)(\/)?>/g;
  const stack: GenericXmlElement[] = [];
  let root: GenericXmlElement | null = null;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleanXml)) !== null) {
    const isClosing = match[1] === '/';
    const tagName = match[2];
    const rawAttrs = match[3];
    const isSelfClosing = match[4] === '/';

    if (isClosing) {
      if (stack.length > 0 && stack[stack.length - 1].tagName === tagName) {
        stack.pop();
      }
      continue;
    }

    // Parse attributes
    const attrMap: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9_.:]+)=["']([^"']*)["']/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      attrMap[attrMatch[1]] = attrMatch[2];
    }

    const element: GenericXmlElement = {
      tagName,
      getAttribute: (name: string) => (name in attrMap ? attrMap[name] : null),
      children: [],
    };

    if (stack.length === 0) {
      root = element;
    } else {
      stack[stack.length - 1].children.push(element);
    }

    if (!isSelfClosing) {
      stack.push(element);
    }
  }

  return { root };
}

/**
 * Lightweight and safe Android XML Layout Parser
 */
export function parseAndroidXmlToVisualScreen(
  xmlContent: string,
  layoutFileName: string = 'activity_main.xml'
): ParseXmlResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsupportedTags: string[] = [];
  let totalComponents = 0;

  if (!xmlContent || !xmlContent.trim()) {
    return {
      success: false,
      errors: ['Konten XML kosong.'],
      warnings: [],
      unsupportedTags: [],
      totalComponents: 0,
    };
  }

  // Extract embedded visual metadata if present
  const metadata = extractVisualMetadata(xmlContent);

  const { root: rootElement, error } = parseXmlStringToTree(xmlContent);

  if (error || !rootElement) {
    return {
      success: false,
      errors: [error || 'Tidak ada elemen root dalam berkas layout XML.'],
      warnings: [],
      unsupportedTags: [],
      totalComponents: 0,
    };
  }

  let autoIdCounter = 1;

  function elementToVisualComponent(element: GenericXmlElement): VisualComponent {
    totalComponents++;
    const tagName = element.tagName;
    const rawId = element.getAttribute('android:id') || element.getAttribute('id') || undefined;
    const cleanId = parseAndroidId(rawId) || `comp_${autoIdCounter++}`;
    const orientation = element.getAttribute('android:orientation') || undefined;

    const mappedType = mapAndroidTagToComponentType(tagName, orientation);

    if (mappedType === 'unsupportedView') {
      if (!unsupportedTags.includes(tagName)) {
        unsupportedTags.push(tagName);
      }
      warnings.push(`Komponen <${tagName}> belum didukung penuh oleh Visual Designer dan dipertahankan sebagai elemen kustom.`);
    }

    const width = parseDimension(element.getAttribute('android:layout_width') || undefined);
    const height = parseDimension(element.getAttribute('android:layout_height') || undefined);
    const text = element.getAttribute('android:text') || undefined;
    const hint = element.getAttribute('android:hint') || undefined;
    const bg = element.getAttribute('android:background') || undefined;
    const textColor = element.getAttribute('android:textColor') || undefined;
    const gravity = element.getAttribute('android:gravity') || undefined;

    // Check padding / margin
    const padding = parseDimension(element.getAttribute('android:padding') || undefined);
    const margin = parseDimension(element.getAttribute('android:layout_margin') || undefined);

    const properties: Record<string, unknown> = {
      id: cleanId,
      name: cleanId,
      width,
      height,
    };

    if (text !== undefined) properties.text = text;
    if (hint !== undefined) properties.hint = hint;
    if (bg !== undefined) properties.backgroundColor = bg;
    if (textColor !== undefined) properties.textColor = textColor;
    if (gravity !== undefined) properties.gravity = gravity;
    if (orientation !== undefined) properties.orientation = orientation as 'vertical' | 'horizontal';
    if (typeof padding === 'number') properties.padding = padding;
    if (typeof margin === 'number') properties.margin = margin;

    // Type-specific properties
    if (tagName === 'ProgressBar') {
      const isHorizontal = element.getAttribute('style')?.includes('Widget.MaterialComponents.LinearProgressIndicator') ||
        element.getAttribute('android:progress') !== null;
      properties.progressStyle = isHorizontal ? 'horizontal' : 'circular';
      const progressVal = parseInt(element.getAttribute('android:progress') || '50', 10);
      properties.progress = isNaN(progressVal) ? 50 : progressVal;
    }

    if (element.getAttribute('android:inputType') === 'textPassword') {
      properties.isPassword = true;
    }

    if (element.getAttribute('android:checked') === 'true') {
      properties.isChecked = true;
    }

    // Process child elements
    const childComponents: VisualComponent[] = [];
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      childComponents.push(elementToVisualComponent(child));
    }

    return {
      id: cleanId,
      type: mappedType as ComponentType,
      name: cleanId,
      properties: properties as unknown as VisualComponent['properties'],
      children: childComponents.length > 0 ? childComponents : undefined,
    };
  }

  const rootComponent = elementToVisualComponent(rootElement);

  // If root component has background, use it as screen background
  const screenBg = (rootComponent.properties.backgroundColor as string) || '#FFFFFF';

  const screenName = layoutFileName
    .replace(/^activity_/, '')
    .replace(/\.xml$/, '')
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  const screen: VisualScreen = {
    id: metadata?.screenId || `screen_${Date.now()}`,
    name: screenName || 'Screen',
    layoutFileName,
    orientation: 'portrait',
    devicePreset: 'pixel_7',
    backgroundColor: screenBg,
    root: rootComponent,
  };

  return {
    success: true,
    screen,
    metadata: metadata || undefined,
    errors,
    warnings,
    unsupportedTags,
    totalComponents,
  };
}
