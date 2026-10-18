/**
 * Nusantara App Builder - Component SDK & Visual Component Registry
 * Phase 10: Extensible registry for standard and plugin-contributed Android components.
 */

export type ComponentRegistryTier = 'basic' | 'advanced' | 'plugin';

export interface ComponentPropertyDescriptor {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select';
  label: string;
  labelId: string;
  defaultValue: any;
  options?: { value: string; label: string }[];
}

export interface RegisteredVisualComponent {
  type: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  tier: ComponentRegistryTier;
  pluginId?: string;
  iconName: string;
  defaultProperties: Record<string, any>;
  propertiesSchema: ComponentPropertyDescriptor[];
  supportedEvents: string[];
  xmlTag: string;
  isContainer?: boolean;
}

class VisualComponentRegistry {
  private components: Map<string, RegisteredVisualComponent> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // Basic Components
    this.register({
      type: 'text',
      name: 'Text View',
      nameId: 'Tampilan Teks',
      description: 'Standard Android TextView component.',
      descriptionId: 'Komponen TextView standar Android.',
      tier: 'basic',
      iconName: 'Type',
      defaultProperties: { text: 'Sample Text', textSize: 14, textColor: '#FFFFFF' },
      propertiesSchema: [
        { name: 'text', type: 'string', label: 'Text', labelId: 'Teks', defaultValue: 'Sample Text' },
        { name: 'textSize', type: 'number', label: 'Text Size (sp)', labelId: 'Ukuran Teks (sp)', defaultValue: 14 },
      ],
      supportedEvents: ['onClick'],
      xmlTag: 'TextView',
    });

    this.register({
      type: 'button',
      name: 'Button',
      nameId: 'Tombol',
      description: 'MaterialButton click target.',
      descriptionId: 'Target klik MaterialButton.',
      tier: 'basic',
      iconName: 'RectangleHorizontal',
      defaultProperties: { buttonLabel: 'Click Me', cornerRadius: 8 },
      propertiesSchema: [
        { name: 'buttonLabel', type: 'string', label: 'Label', labelId: 'Label', defaultValue: 'Click Me' },
      ],
      supportedEvents: ['onClick', 'onLongClick'],
      xmlTag: 'com.google.android.material.button.MaterialButton',
    });

    this.register({
      type: 'image',
      name: 'Image View',
      nameId: 'Tampilan Gambar',
      description: 'Standard ImageView for local assets and URLs.',
      descriptionId: 'ImageView standar untuk aset lokal dan URL.',
      tier: 'basic',
      iconName: 'Image',
      defaultProperties: { scaleType: 'centerCrop', contentDescription: 'Image' },
      propertiesSchema: [
        { name: 'contentDescription', type: 'string', label: 'Alt Text', labelId: 'Teks Alternatif', defaultValue: 'Image' },
      ],
      supportedEvents: ['onClick'],
      xmlTag: 'ImageView',
    });

    this.register({
      type: 'textField',
      name: 'Input Field',
      nameId: 'Kolom Input',
      description: 'Material TextInputLayout with EditText.',
      descriptionId: 'TextInputLayout Material dengan EditText.',
      tier: 'basic',
      iconName: 'FormInput',
      defaultProperties: { hint: 'Enter value' },
      propertiesSchema: [
        { name: 'hint', type: 'string', label: 'Hint', labelId: 'Petunjuk', defaultValue: 'Enter value' },
      ],
      supportedEvents: ['onTextChanged', 'onFocusChange'],
      xmlTag: 'com.google.android.material.textfield.TextInputLayout',
    });

    this.register({
      type: 'scrollView',
      name: 'List / Scroll View',
      nameId: 'Daftar / Scroll View',
      description: 'Vertical scroll container.',
      descriptionId: 'Kontainer gulir vertikal.',
      tier: 'basic',
      iconName: 'ScrollText',
      defaultProperties: { orientation: 'vertical' },
      propertiesSchema: [],
      supportedEvents: ['onScroll'],
      xmlTag: 'ScrollView',
      isContainer: true,
    });

    // Advanced Components
    this.register({
      type: 'webView',
      name: 'WebView Container',
      nameId: 'Kontainer WebView',
      description: 'Interactive Android WebView container for local or remote web content.',
      descriptionId: 'Kontainer WebView Android interaktif untuk konten web lokal atau publik.',
      tier: 'advanced',
      iconName: 'Globe2',
      defaultProperties: { targetUrl: 'https://example.com', javaScriptEnabled: true },
      propertiesSchema: [
        { name: 'targetUrl', type: 'string', label: 'Website URL', labelId: 'URL Website', defaultValue: 'https://example.com' },
      ],
      supportedEvents: ['onPageFinished', 'onPageError'],
      xmlTag: 'android.webkit.WebView',
    });

    this.register({
      type: 'admobBanner',
      name: 'AdMob Banner',
      nameId: 'Banner AdMob',
      description: 'Official Google AdMob AdView container (320x50 or adaptive).',
      descriptionId: 'Kontainer AdView Google AdMob resmi (320x50 atau adaptif).',
      tier: 'advanced',
      iconName: 'DollarSign',
      defaultProperties: { adUnitId: 'ca-app-pub-3940256099942544/6300978111', adSize: 'BANNER' },
      propertiesSchema: [
        { name: 'adUnitId', type: 'string', label: 'Ad Unit ID', labelId: 'ID Unit Iklan', defaultValue: 'ca-app-pub-3940256099942544/6300978111' },
      ],
      supportedEvents: ['onAdLoaded', 'onAdFailedToLoad'],
      xmlTag: 'com.google.android.gms.ads.AdView',
    });

    this.register({
      type: 'sqliteTable',
      name: 'SQLite Data Table',
      nameId: 'Tabel Data SQLite',
      description: 'Offline-first SQLite relational data grid view.',
      descriptionId: 'Tampilan kisi data relasional SQLite luring.',
      tier: 'advanced',
      iconName: 'Database',
      defaultProperties: { tableName: 'users', pageSize: 20 },
      propertiesSchema: [
        { name: 'tableName', type: 'string', label: 'Table Name', labelId: 'Nama Tabel', defaultValue: 'users' },
      ],
      supportedEvents: ['onRowClick', 'onDataLoaded'],
      xmlTag: 'androidx.recyclerview.widget.RecyclerView',
    });

    this.register({
      type: 'apiConsumer',
      name: 'REST API Feed',
      nameId: 'Umpan REST API',
      description: 'Dynamic JSON data consumer with automatic pagination and caching.',
      descriptionId: 'Konsumen data JSON dinamis dengan paginasi dan *caching* otomatis.',
      tier: 'advanced',
      iconName: 'Network',
      defaultProperties: { endpointUrl: 'https://api.example.com/items', method: 'GET' },
      propertiesSchema: [
        { name: 'endpointUrl', type: 'string', label: 'Endpoint URL', labelId: 'URL Endpoint', defaultValue: 'https://api.example.com/items' },
      ],
      supportedEvents: ['onSuccess', 'onError'],
      xmlTag: 'androidx.recyclerview.widget.RecyclerView',
    });
  }

  public register(component: RegisteredVisualComponent): boolean {
    this.components.set(component.type, component);
    return true;
  }

  public unregisterByPluginId(pluginId: string): void {
    for (const [type, comp] of this.components.entries()) {
      if (comp.pluginId === pluginId) {
        this.components.delete(type);
      }
    }
  }

  public get(type: string): RegisteredVisualComponent | undefined {
    return this.components.get(type);
  }

  public getAll(): RegisteredVisualComponent[] {
    return Array.from(this.components.values());
  }

  public getByTier(tier: ComponentRegistryTier): RegisteredVisualComponent[] {
    return this.getAll().filter((c) => c.tier === tier);
  }
}

export const ComponentRegistry = new VisualComponentRegistry();
