/**
 * Nusantara App Builder - Design Validator & Tree Utilities
 * Enforces valid Android IDs, hierarchy validation, circular reference prevention, and tree manipulations.
 */

import {
  ComponentType,
  VisualComponent,
  VisualProjectDesign,
  VisualScreen,
} from '../../../types/visualDesigner';

/**
 * Android ID prefixes conforming to standard Android conventions
 */
export const COMPONENT_ID_PREFIXES: Record<ComponentType, string> = {
  linearLayout: 'layout_linear',
  verticalLayout: 'layout_vertical',
  horizontalLayout: 'layout_horizontal',
  container: 'layout_container',
  scrollView: 'scroll_view',
  card: 'card_view',
  heading: 'tv_heading',
  text: 'tv_text',
  label: 'tv_label',
  button: 'btn_action',
  textField: 'et_input',
  passwordField: 'et_password',
  checkbox: 'cb_option',
  switch: 'sw_toggle',
  radioButton: 'rb_choice',
  image: 'iv_image',
  imageButton: 'ib_button',
  divider: 'view_divider',
  spacer: 'space_gap',
  progressBar: 'pb_progress',
};

/**
 * Checks if a component type is capable of containing child components
 */
export function canAcceptChildren(type: ComponentType): boolean {
  return [
    'linearLayout',
    'verticalLayout',
    'horizontalLayout',
    'container',
    'scrollView',
    'card',
  ].includes(type);
}

/**
 * Traverses a component tree and collects all unique IDs
 */
export function collectAllComponentIds(root: VisualComponent): Set<string> {
  const ids = new Set<string>();

  function traverse(comp: VisualComponent) {
    if (comp.id) ids.add(comp.id);
    if (comp.children && Array.isArray(comp.children)) {
      for (const child of comp.children) {
        traverse(child);
      }
    }
  }

  traverse(root);
  return ids;
}

/**
 * Validates whether an ID matches Android XML resource identifier rules:
 * - Must start with a letter or underscore
 * - May only contain letters, digits, and underscores
 * - Must be unique within the screen
 */
export function validateComponentId(
  id: string,
  existingIds: Set<string>,
  currentId?: string
): { isValid: boolean; error?: string } {
  const trimmed = id.trim();
  if (!trimmed) {
    return { isValid: false, error: 'ID komponen tidak boleh kosong' };
  }

  const androidIdRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!androidIdRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'ID harus diawali huruf/garis bawah dan hanya boleh berisi huruf, angka, atau garis bawah',
    };
  }

  // Check uniqueness (ignoring the component itself when renaming)
  if (trimmed !== currentId && existingIds.has(trimmed)) {
    return {
      isValid: false,
      error: `ID '${trimmed}' sudah digunakan oleh komponen lain dalam layar ini`,
    };
  }

  return { isValid: true };
}

/**
 * Generates an Android ID that is guaranteed to be unique in the screen
 */
export function generateUniqueComponentId(
  type: ComponentType,
  existingIds: Set<string>
): string {
  const prefix = COMPONENT_ID_PREFIXES[type] || 'view';
  let counter = 1;
  let candidate = `${prefix}_${counter}`;

  while (existingIds.has(candidate)) {
    counter += 1;
    candidate = `${prefix}_${counter}`;
  }

  return candidate;
}

/**
 * Searches the component tree for a component with the specified ID
 */
export function findComponentById(
  root: VisualComponent,
  id: string
): VisualComponent | null {
  if (root.id === id) return root;
  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findComponentById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the parent component and index of a target component ID
 */
export function findParentComponent(
  root: VisualComponent,
  targetId: string
): { parent: VisualComponent; index: number } | null {
  if (root.children && Array.isArray(root.children)) {
    const index = root.children.findIndex((c) => c.id === targetId);
    if (index !== -1) {
      return { parent: root, index };
    }
    for (const child of root.children) {
      const res = findParentComponent(child, targetId);
      if (res) return res;
    }
  }
  return null;
}

/**
 * Prevents circular references: returns true if targetId is a descendant of ancestorId
 */
export function isDescendantOf(
  root: VisualComponent,
  ancestorId: string,
  targetId: string
): boolean {
  if (ancestorId === targetId) return true;
  const ancestor = findComponentById(root, ancestorId);
  if (!ancestor) return false;

  const found = findComponentById(ancestor, targetId);
  return found !== null && found.id !== ancestor.id;
}

/**
 * Deep clones a VisualComponent tree and assigns new unique IDs to all duplicated elements
 */
export function duplicateComponentWithNewIds(
  source: VisualComponent,
  existingIds: Set<string>
): VisualComponent {
  const newId = generateUniqueComponentId(source.type, existingIds);
  existingIds.add(newId);

  const cloned: VisualComponent = {
    ...source,
    id: newId,
    name: `${source.name} (Salinan)`,
    properties: {
      ...source.properties,
      id: newId,
      name: `${source.properties.name || source.name} (Salinan)`,
    },
    children: source.children
      ? source.children.map((child) => duplicateComponentWithNewIds(child, existingIds))
      : undefined,
  };

  return cloned;
}

/**
 * Validates the full VisualProjectDesign JSON structure
 */
export function validateDesignModel(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Format data desain tidak valid (harus berupa objek JSON)'] };
  }

  const d = data as Partial<VisualProjectDesign>;

  if (d.schemaVersion !== 1) {
    errors.push(`Versi skema tidak didukung: ${d.schemaVersion || 'tidak diketahui'}`);
  }

  if (!d.projectId || typeof d.projectId !== 'string') {
    errors.push('Project ID tidak ditemukan pada model desain');
  }

  if (!Array.isArray(d.screens) || d.screens.length === 0) {
    errors.push('Desain harus memiliki setidaknya satu layar');
  } else {
    d.screens.forEach((screen, index) => {
      if (!screen.id || typeof screen.id !== 'string') {
        errors.push(`Layar indeks ${index} tidak memiliki ID yang sah`);
      }
      if (!screen.name || typeof screen.name !== 'string') {
        errors.push(`Layar '${screen.id || index}' tidak memiliki nama layar`);
      }
      if (!screen.root || typeof screen.root !== 'object') {
        errors.push(`Layar '${screen.name || index}' tidak memiliki komponen root`);
      } else {
        const screenIds = collectAllComponentIds(screen.root);
        if (screenIds.size === 0) {
          errors.push(`Layar '${screen.name}' memiliki struktur root kosong`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
