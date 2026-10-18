/**
 * Example Plugin Entry Point: HelloCard
 * Demonstrates registering a custom Android component with the Developer SDK.
 */

export interface HelloPluginContext {
  designer: {
    registerComponent: (comp: any) => boolean;
  };
  ui: {
    showToast: (msg: string) => void;
  };
}

export function activate(context: HelloPluginContext) {
  context.designer.registerComponent({
    type: 'customHelloCard',
    name: 'Hello Gradient Card',
    nameId: 'Kartu Gradien Hello',
    description: 'Custom plugin component displaying an interactive gradient banner with a greeting.',
    descriptionId: 'Komponen plugin kustom dengan spanduk gradien interaktif dan sapaan.',
    iconName: 'Sparkles',
    defaultProperties: {
      greeting: 'Halo Nusantara!',
      backgroundColor: '#4F46E5',
      elevation: 6,
    },
    propertiesSchema: [
      {
        name: 'greeting',
        type: 'string',
        label: 'Greeting Text',
        labelId: 'Teks Sapaan',
        defaultValue: 'Halo Nusantara!',
      },
    ],
    supportedEvents: ['onClick'],
    xmlTag: 'com.google.android.material.card.MaterialCardView',
  });

  context.ui.showToast('HelloCard plugin activated successfully!');
}
