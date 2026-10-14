/**
 * Nusantara App Builder - Android XML Generator Tests
 * Phase 3: Layout Generation & XML Escaping Tests
 */

import { describe, it, expect } from 'vitest';
import {
  escapeXml,
  formatDimension,
  generateAndroidXmlLayout,
} from '../modules/visual-designer/xml-generator/androidXmlGenerator';
import { VisualScreen } from '../types/visualDesigner';

describe('XML Escaping & Dimension Formatting', () => {
  it('correctly escapes XML special characters', () => {
    expect(escapeXml('A & B')).toBe('A &amp; B');
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;');
    expect(escapeXml('Quote: "Hello"')).toBe('Quote: &quot;Hello&quot;');
    expect(escapeXml("Don't fail")).toBe("Don\\'t fail");
  });

  it('formats layout dimensions as match_parent, wrap_content, or dp values', () => {
    expect(formatDimension('match_parent')).toBe('match_parent');
    expect(formatDimension('wrap_content')).toBe('wrap_content');
    expect(formatDimension(48)).toBe('48dp');
    expect(formatDimension(0)).toBe('0dp');
  });
});

describe('Android XML Layout Generator', () => {
  const sampleScreen: VisualScreen = {
    id: 'screen_home',
    name: 'Home Screen',
    layoutFileName: 'activity_home.xml',
    orientation: 'portrait',
    devicePreset: 'pixel_7',
    backgroundColor: '#0F172A',
    root: {
      id: 'root_linear',
      type: 'verticalLayout',
      name: 'Root Layout',
      properties: {
        id: 'root_linear',
        name: 'Root Layout',
        width: 'match_parent',
        height: 'match_parent',
        orientation: 'vertical',
        paddingTop: 16,
        paddingBottom: 16,
        paddingStart: 16,
        paddingEnd: 16,
        backgroundColor: '#0F172A',
      },
      children: [
        {
          id: 'tv_title',
          type: 'heading',
          name: 'Title Text',
          properties: {
            id: 'tv_title',
            name: 'Title Text',
            width: 'match_parent',
            height: 'wrap_content',
            text: 'Halo & Selamat Datang <Android>',
            textSize: 24,
            textColor: '#FFFFFF',
            textStyle: 'bold',
            marginBottom: 12,
          },
        },
        {
          id: 'btn_submit',
          type: 'button',
          name: 'Submit Button',
          properties: {
            id: 'btn_submit',
            name: 'Submit Button',
            width: 'match_parent',
            height: 'wrap_content',
            buttonLabel: 'Kirim Sekarang',
            buttonBackgroundColor: '#2563EB',
            buttonTextColor: '#FFFFFF',
            cornerRadius: 12,
          },
        },
        {
          id: 'et_username',
          type: 'textField',
          name: 'Username Input',
          properties: {
            id: 'et_username',
            name: 'Username Input',
            width: 'match_parent',
            height: 'wrap_content',
            hint: 'Masukkan nama pengguna...',
            inputType: 'text',
          },
        },
        {
          id: 'sw_darkmode',
          type: 'switch',
          name: 'Dark Mode Switch',
          properties: {
            id: 'sw_darkmode',
            name: 'Dark Mode Switch',
            width: 'match_parent',
            height: 'wrap_content',
            label: 'Mode Gelap',
            isChecked: true,
          },
        },
        {
          id: 'card_box',
          type: 'card',
          name: 'Feature Card',
          properties: {
            id: 'card_box',
            name: 'Feature Card',
            width: 'match_parent',
            height: 'wrap_content',
            elevation: 4,
            cardCornerRadius: 16,
          },
          children: [
            {
              id: 'tv_card_label',
              type: 'label',
              name: 'Card Label',
              properties: {
                id: 'tv_card_label',
                name: 'Card Label',
                width: 'wrap_content',
                height: 'wrap_content',
                text: 'Fitur Unggulan',
              },
            },
          ],
        },
      ],
    },
  };

  it('generates standard XML declaration and Android namespaces on root tag', () => {
    const res = generateAndroidXmlLayout(sampleScreen);
    expect(res.fullXml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(res.fullXml).toContain('xmlns:android="http://schemas.android.com/apk/res/android"');
    expect(res.fullXml).toContain('xmlns:app="http://schemas.android.com/apk/res-auto"');
    expect(res.fullXml).toContain('xmlns:tools="http://schemas.android.com/tools"');
    expect(res.relativePath).toBe('app/src/main/res/layout/activity_home.xml');
  });

  it('maps components to valid Android View tags and attributes', () => {
    const res = generateAndroidXmlLayout(sampleScreen);

    // Root LinearLayout
    expect(res.fullXml).toContain('<LinearLayout');
    expect(res.fullXml).toContain('android:id="@+id/root_linear"');
    expect(res.fullXml).toContain('android:orientation="vertical"');
    expect(res.fullXml).toContain('android:paddingTop="16dp"');

    // TextView with escaped text
    expect(res.fullXml).toContain('<TextView');
    expect(res.fullXml).toContain('android:id="@+id/tv_title"');
    expect(res.fullXml).toContain('android:text="Halo &amp; Selamat Datang &lt;Android&gt;"');
    expect(res.fullXml).toContain('android:textSize="24sp"');
    expect(res.fullXml).toContain('android:textStyle="bold"');

    // MaterialButton
    expect(res.fullXml).toContain('<com.google.android.material.button.MaterialButton');
    expect(res.fullXml).toContain('android:id="@+id/btn_submit"');
    expect(res.fullXml).toContain('android:text="Kirim Sekarang"');
    expect(res.fullXml).toContain('app:backgroundTint="#2563EB"');
    expect(res.fullXml).toContain('app:cornerRadius="12dp"');

    // TextInputLayout & TextInputEditText
    expect(res.fullXml).toContain('<com.google.android.material.textfield.TextInputLayout');
    expect(res.fullXml).toContain('<com.google.android.material.textfield.TextInputEditText');
    expect(res.fullXml).toContain('android:hint="Masukkan nama pengguna..."');

    // MaterialSwitch
    expect(res.fullXml).toContain('<com.google.android.material.materialswitch.MaterialSwitch');
    expect(res.fullXml).toContain('android:checked="true"');

    // MaterialCardView
    expect(res.fullXml).toContain('<com.google.android.material.card.MaterialCardView');
    expect(res.fullXml).toContain('app:cardElevation="4dp"');
    expect(res.fullXml).toContain('app:cardCornerRadius="16dp"');
  });

  it('handles unsupported or custom components gracefully with View fallback and warning comment', () => {
    const unsupportedScreen: VisualScreen = {
      ...sampleScreen,
      root: {
        id: 'root_view',
        type: 'verticalLayout',
        name: 'Root',
        properties: { id: 'root_view', name: 'Root', width: 'match_parent', height: 'match_parent' },
        children: [
          {
            id: 'unsupported_test',
            // @ts-expect-error Testing runtime fallback for unsupported component type
            type: 'futureAiWidget',
            name: 'AI Widget',
            properties: { id: 'unsupported_test', name: 'AI Widget', width: 'match_parent', height: 'wrap_content' },
          },
        ],
      },
    };

    const res = generateAndroidXmlLayout(unsupportedScreen);
    expect(res.fullXml).toContain('<!-- Unrecognized Component: futureAiWidget -->');
    expect(res.fullXml).toContain('android:id="@+id/unsupported_test"');
  });
});
