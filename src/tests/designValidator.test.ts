/**
 * Nusantara App Builder - Design Validator & Tree Utilities Tests
 * Phase 3: Visual Designer Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateComponentId,
  generateUniqueComponentId,
  collectAllComponentIds,
  findComponentById,
  findParentComponent,
  isDescendantOf,
  canAcceptChildren,
  duplicateComponentWithNewIds,
  validateDesignModel,
} from '../modules/visual-designer/validation/designValidator';
import { VisualComponent, VisualProjectDesign } from '../types/visualDesigner';

describe('Design Validator & Component IDs', () => {
  it('validates valid Android component IDs', () => {
    const existing = new Set(['tv_title', 'btn_submit']);
    expect(validateComponentId('btn_action', existing).isValid).toBe(true);
    expect(validateComponentId('layout_container_1', existing).isValid).toBe(true);
    expect(validateComponentId('_custom_view', existing).isValid).toBe(true);
  });

  it('rejects empty, invalid characters, or number prefixes for Android IDs', () => {
    const existing = new Set<string>();
    expect(validateComponentId('', existing).isValid).toBe(false);
    expect(validateComponentId('   ', existing).isValid).toBe(false);
    expect(validateComponentId('1st_button', existing).isValid).toBe(false); // Cannot start with number
    expect(validateComponentId('my-button', existing).isValid).toBe(false); // Hyphens illegal in Android IDs
    expect(validateComponentId('button.id', existing).isValid).toBe(false); // Dots illegal
    expect(validateComponentId('btn with spaces', existing).isValid).toBe(false);
  });

  it('detects duplicate component IDs within screen', () => {
    const existing = new Set(['btn_submit', 'tv_title']);
    const res = validateComponentId('btn_submit', existing);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('sudah digunakan');
  });

  it('allows matching current ID when editing self', () => {
    const existing = new Set(['btn_submit', 'tv_title']);
    const res = validateComponentId('btn_submit', existing, 'btn_submit');
    expect(res.isValid).toBe(true);
  });

  it('generates unique sequential component IDs with Android prefix conventions', () => {
    const existing = new Set(['btn_action_1', 'btn_action_2']);
    const generated = generateUniqueComponentId('button', existing);
    expect(generated).toBe('btn_action_3');

    const tvGenerated = generateUniqueComponentId('text', existing);
    expect(tvGenerated).toBe('tv_text_1');
  });
});

describe('Tree Hierarchy & Circular Reference Prevention', () => {
  const sampleTree: VisualComponent = {
    id: 'root',
    type: 'verticalLayout',
    name: 'Root Layout',
    properties: {
      id: 'root',
      name: 'Root Layout',
      width: 'match_parent',
      height: 'match_parent',
    },
    children: [
      {
        id: 'header_card',
        type: 'card',
        name: 'Header Card',
        properties: {
          id: 'header_card',
          name: 'Header Card',
          width: 'match_parent',
          height: 'wrap_content',
        },
        children: [
          {
            id: 'tv_title',
            type: 'heading',
            name: 'Title Text',
            properties: {
              id: 'tv_title',
              name: 'Title Text',
              width: 'wrap_content',
              height: 'wrap_content',
              text: 'Nusantara App',
            },
          },
        ],
      },
      {
        id: 'btn_click',
        type: 'button',
        name: 'Action Button',
        properties: {
          id: 'btn_click',
          name: 'Action Button',
          width: 'match_parent',
          height: 'wrap_content',
        },
      },
    ],
  };

  it('collects all unique IDs in component tree', () => {
    const ids = collectAllComponentIds(sampleTree);
    expect(ids.has('root')).toBe(true);
    expect(ids.has('header_card')).toBe(true);
    expect(ids.has('tv_title')).toBe(true);
    expect(ids.has('btn_click')).toBe(true);
    expect(ids.size).toBe(4);
  });

  it('finds component by ID anywhere in the hierarchy', () => {
    const found = findComponentById(sampleTree, 'tv_title');
    expect(found).not.toBeNull();
    expect(found?.type).toBe('heading');

    expect(findComponentById(sampleTree, 'non_existent')).toBeNull();
  });

  it('locates parent component and child index correctly', () => {
    const parentRes = findParentComponent(sampleTree, 'tv_title');
    expect(parentRes).not.toBeNull();
    expect(parentRes?.parent.id).toBe('header_card');
    expect(parentRes?.index).toBe(0);

    const btnParent = findParentComponent(sampleTree, 'btn_click');
    expect(btnParent?.parent.id).toBe('root');
    expect(btnParent?.index).toBe(1);
  });

  it('identifies descendant relationship and prevents circular parent moves', () => {
    // header_card is descendant of root
    expect(isDescendantOf(sampleTree, 'root', 'header_card')).toBe(true);
    // tv_title is descendant of header_card
    expect(isDescendantOf(sampleTree, 'header_card', 'tv_title')).toBe(true);
    // root is NOT descendant of tv_title
    expect(isDescendantOf(sampleTree, 'tv_title', 'root')).toBe(false);
  });

  it('distinguishes container components from leaf components', () => {
    expect(canAcceptChildren('verticalLayout')).toBe(true);
    expect(canAcceptChildren('horizontalLayout')).toBe(true);
    expect(canAcceptChildren('card')).toBe(true);
    expect(canAcceptChildren('scrollView')).toBe(true);
    expect(canAcceptChildren('container')).toBe(true);

    // Leaf components cannot accept children
    expect(canAcceptChildren('button')).toBe(false);
    expect(canAcceptChildren('text')).toBe(false);
    expect(canAcceptChildren('textField')).toBe(false);
    expect(canAcceptChildren('image')).toBe(false);
    expect(canAcceptChildren('progressBar')).toBe(false);
  });

  it('duplicates component subtree with completely new unique IDs', () => {
    const existing = new Set(['root', 'header_card', 'tv_title', 'btn_click']);
    const target = findComponentById(sampleTree, 'header_card')!;
    const duplicated = duplicateComponentWithNewIds(target, existing);

    expect(duplicated.id).not.toBe('header_card');
    expect(duplicated.properties.id).toBe(duplicated.id);
    expect(duplicated.children![0].id).not.toBe('tv_title');
    expect(existing.has(duplicated.id)).toBe(true);
  });
});

describe('Design Model JSON Schema Validation', () => {
  it('validates a complete, valid VisualProjectDesign', () => {
    const validModel: VisualProjectDesign = {
      schemaVersion: 1,
      projectId: 'proj_123',
      projectName: 'TestApp',
      packageId: 'com.test.app',
      screens: [
        {
          id: 'screen_main',
          name: 'Home',
          layoutFileName: 'activity_main.xml',
          orientation: 'portrait',
          devicePreset: 'pixel_7',
          backgroundColor: '#0F172A',
          root: {
            id: 'root_layout',
            type: 'verticalLayout',
            name: 'Root',
            properties: {
              id: 'root_layout',
              name: 'Root',
              width: 'match_parent',
              height: 'match_parent',
            },
            children: [],
          },
        },
      ],
      activeScreenId: 'screen_main',
      startScreenId: 'screen_main',
      createdAt: '2026-10-14T00:00:00Z',
      updatedAt: '2026-10-14T00:00:00Z',
      formatVersion: '3.0',
    };

    const res = validateDesignModel(validModel);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('rejects corrupt, null, or invalid JSON design structures', () => {
    expect(validateDesignModel(null).isValid).toBe(false);
    expect(validateDesignModel('corrupted string').isValid).toBe(false);
    expect(validateDesignModel({}).isValid).toBe(false);

    const missingScreens = {
      schemaVersion: 1,
      projectId: 'proj_123',
      screens: [],
    };
    const res = validateDesignModel(missingScreens);
    expect(res.isValid).toBe(false);
    expect(res.errors.some((e) => e.includes('setidaknya satu layar'))).toBe(true);
  });
});
