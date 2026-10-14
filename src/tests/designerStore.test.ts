/**
 * Nusantara App Builder - Designer Store & State Machine Tests
 * Phase 3: Visual Designer Store Actions, History (Undo/Redo), and Screen Management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDesignerStore } from '../store/designerStore';
import { ProjectMetadata } from '../types/project';

describe('Designer Store State Machine & Operations', () => {
  const mockProject: ProjectMetadata = {
    id: 'proj_test_phase3',
    name: 'NusantaraTest',
    displayName: 'Nusantara Test App',
    packageId: 'com.nusantara.test',
    location: 'C:\\Projects\\NusantaraTest',
    description: 'Testing visual designer store',
    template: 'basic-activity',
    language: 'kotlin',
    interfaceLanguage: 'id',
    createdAt: '2026-10-14T00:00:00Z',
    updatedAt: '2026-10-14T00:00:00Z',
    minSdk: 26,
    targetSdk: 34,
    compileSdk: 34,
    versionCode: 1,
    versionName: '1.0.0',
    formatVersion: '2.0',
    filesCount: 12,
  };

  beforeEach(async () => {
    // Reset store state by loading fresh project design
    await useDesignerStore.getState().loadDesignForProject(mockProject);
  });

  it('loads default starter design matching project template', () => {
    const store = useDesignerStore.getState();
    expect(store.design).not.toBeNull();
    expect(store.design?.screens.length).toBeGreaterThan(0);
    expect(store.activeScreenId).toBe(store.design?.screens[0].id);
    expect(store.isDirty).toBe(false);
  });

  it('adds new component to the active screen root layout', () => {
    const store = useDesignerStore.getState();
    const initialChildrenCount = store.design!.screens[0].root.children?.length || 0;

    const newId = store.addComponent('button');
    expect(newId).not.toBeNull();

    const updatedStore = useDesignerStore.getState();
    const updatedChildren = updatedStore.design!.screens[0].root.children || [];
    expect(updatedChildren.length).toBe(initialChildrenCount + 1);
    expect(updatedStore.selectedComponentId).toBe(newId);
    expect(updatedStore.isDirty).toBe(true);
  });

  it('updates component properties in real-time', () => {
    const store = useDesignerStore.getState();
    const newId = store.addComponent('text')!;

    store.updateComponentProperties(newId, {
      text: 'Teks Terkini',
      textSize: 18,
      textColor: '#FF0000',
    });

    const updatedStore = useDesignerStore.getState();
    const activeScreen = updatedStore.design!.screens[0];
    const textComp = activeScreen.root.children?.find((c) => c.id === newId);

    expect(textComp?.properties.text).toBe('Teks Terkini');
    expect(textComp?.properties.textSize).toBe(18);
    expect(textComp?.properties.textColor).toBe('#FF0000');
  });

  it('duplicates component with new unique ID', () => {
    const store = useDesignerStore.getState();
    const newId = store.addComponent('button')!;
    const beforeCount = useDesignerStore.getState().design!.screens[0].root.children?.length || 0;

    store.duplicateComponent(newId);

    const updatedStore = useDesignerStore.getState();
    const afterCount = updatedStore.design!.screens[0].root.children?.length || 0;
    expect(afterCount).toBe(beforeCount + 1);

    const duplicatedId = updatedStore.selectedComponentId;
    expect(duplicatedId).not.toBe(newId);
    expect(duplicatedId).toContain('btn_action');
  });

  it('deletes component safely while protecting root layout', () => {
    const store = useDesignerStore.getState();
    const newId = store.addComponent('switch')!;
    expect(useDesignerStore.getState().design!.screens[0].root.children?.some((c) => c.id === newId)).toBe(true);

    store.deleteComponent(newId);
    const updatedStore = useDesignerStore.getState();
    expect(updatedStore.design!.screens[0].root.children?.some((c) => c.id === newId)).toBe(false);

    // Root layout cannot be deleted
    const rootId = updatedStore.design!.screens[0].root.id;
    updatedStore.deleteComponent(rootId);
    expect(useDesignerStore.getState().design!.screens[0].root.id).toBe(rootId);
  });

  it('manages screens (add, rename, duplicate, and delete with safety check)', () => {
    const store = useDesignerStore.getState();
    const initialScreenCount = store.design!.screens.length;

    // Add screen
    const newScreenId = store.addScreen('Profile Screen', 'activity_profile.xml');
    expect(newScreenId).toBeTruthy();
    expect(useDesignerStore.getState().design!.screens.length).toBe(initialScreenCount + 1);
    expect(useDesignerStore.getState().activeScreenId).toBe(newScreenId);

    // Rename screen
    store.renameScreen(newScreenId, 'User Profile Updated');
    const renamed = useDesignerStore.getState().design!.screens.find((s) => s.id === newScreenId);
    expect(renamed?.name).toBe('User Profile Updated');

    // Duplicate screen
    store.duplicateScreen(newScreenId);
    expect(useDesignerStore.getState().design!.screens.length).toBe(initialScreenCount + 2);

    // Delete screen
    const canDelete = store.deleteScreen(newScreenId);
    expect(canDelete).toBe(true);

    // Cannot delete if only 1 screen left
    const state = useDesignerStore.getState();
    while (state.design!.screens.length > 1) {
      state.deleteScreen(state.design!.screens[0].id);
    }
    const deleteLastRes = state.deleteScreen(state.design!.screens[0].id);
    expect(deleteLastRes).toBe(false);
    expect(useDesignerStore.getState().design!.screens.length).toBe(1);
  });

  it('supports Undo and Redo operations across state changes', () => {
    const store = useDesignerStore.getState();
    const beforeAddCount = store.design!.screens[0].root.children?.length || 0;

    store.addComponent('progressBar');
    expect(useDesignerStore.getState().design!.screens[0].root.children?.length).toBe(
      beforeAddCount + 1
    );

    // Undo should restore previous component count
    store.undo();
    expect(useDesignerStore.getState().design!.screens[0].root.children?.length).toBe(beforeAddCount);

    // Redo should bring back the added component
    store.redo();
    expect(useDesignerStore.getState().design!.screens[0].root.children?.length).toBe(
      beforeAddCount + 1
    );
  });

  it('generates Android XML layouts for all screens in project', async () => {
    const store = useDesignerStore.getState();
    const res = await store.generateAndroidLayouts();

    expect(res.success).toBe(true);
    expect(res.results.length).toBe(store.design!.screens.length);
    expect(res.results[0].fullXml).toContain('<?xml');
    expect(res.results[0].relativePath).toContain('app/src/main/res/layout/');
  });
});
