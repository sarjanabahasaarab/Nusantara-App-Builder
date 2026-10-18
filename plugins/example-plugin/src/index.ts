/**
 * Nusantara App Builder - Example Plugin Source Code
 * Demonstrates component registration, project inspection, and safe API usage.
 */

export function activate(context: any) {
  console.log(`[Plugin] Example Plugin activated for project`);

  // Register custom UI component into Visual Designer
  context.designer.registerComponent({
    type: 'customCounterButton',
    name: 'Counter Button',
    nameId: 'Tombol Penghitung Kustom',
    description: 'Custom MaterialButton with animated increment badge.',
    descriptionId: 'MaterialButton kustom dengan lencana angka interaktif.',
    iconName: 'Sparkles',
    defaultProperties: {
      initialCount: 0,
      step: 1,
      buttonColor: '#3B82F6',
    },
    propertiesSchema: [
      { name: 'initialCount', type: 'number', label: 'Initial Count', labelId: 'Nilai Awal', defaultValue: 0 },
      { name: 'step', type: 'number', label: 'Step Increment', labelId: 'Kelipatan', defaultValue: 1 },
    ],
    supportedEvents: ['onClick', 'onReset'],
    xmlTag: 'com.example.plugin.CounterButton',
  });
}

export function deactivate() {
  console.log(`[Plugin] Example Plugin deactivated`);
}
