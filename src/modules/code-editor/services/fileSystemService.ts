/**
 * Nusantara App Builder - File System Service for Code Editor
 * Phase 4: Path validation, file discovery, tree building, and file extension mapping.
 */

import { ProjectFile } from '../../../types/project';
import { FileTreeNode, SupportedLanguage } from '../types';

export const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'jar',
  'aar',
  'apk',
  'aab',
  'class',
  'so',
  'zip',
  'tar',
  'gz',
  'keystore',
  'jks',
  'ttf',
  'otf',
  'woff',
  'woff2',
]);

/**
 * Detect language based on file path and extension
 */
export function detectLanguageByPath(filePath: string): SupportedLanguage {
  const normalized = filePath.toLowerCase();
  const ext = normalized.split('.').pop() || '';

  if (normalized.endsWith('.gradle.kts') || ext === 'kt' || ext === 'kts') {
    return 'kotlin';
  }
  if (normalized.endsWith('.gradle') || ext === 'groovy') {
    return 'groovy';
  }
  if (ext === 'xml') {
    return 'xml';
  }
  if (ext === 'java') {
    return 'java';
  }
  if (ext === 'properties') {
    return 'properties';
  }
  if (ext === 'json') {
    return 'json';
  }
  if (ext === 'html' || ext === 'htm') {
    return 'html';
  }
  if (ext === 'css') {
    return 'css';
  }
  if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') {
    return 'javascript';
  }
  if (ext === 'md' || ext === 'markdown') {
    return 'markdown';
  }

  return 'plaintext';
}

/**
 * Checks whether a file path points to a known binary format
 */
export function isBinaryFile(filePath: string): boolean {
  const ext = filePath.toLowerCase().split('.').pop() || '';
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Validates a relative file path inside a project to prevent directory traversal
 */
export function validateProjectFilePath(path: string): { isValid: boolean; error?: string } {
  if (!path || !path.trim()) {
    return { isValid: false, error: 'Nama berkas tidak boleh kosong.' };
  }

  const trimmed = path.trim().replace(/\\/g, '/');

  // Prevent directory traversal
  if (trimmed.includes('../') || trimmed.includes('/..') || trimmed === '..') {
    return { isValid: false, error: 'Jalur berkas tidak boleh mengandung traversal direktori (..).' };
  }

  // Prevent absolute paths or Windows drive letters
  if (trimmed.startsWith('/') || /^[a-zA-Z]:/.test(trimmed)) {
    return { isValid: false, error: 'Jalur berkas harus bersifat relatif terhadap root proyek.' };
  }

  // Prevent illegal characters
  if (/[*?"<>|:]/.test(trimmed)) {
    return { isValid: false, error: 'Nama berkas mengandung karakter tidak valid (* ? " < > | :).' };
  }

  return { isValid: true };
}

/**
 * Converts a flat array of ProjectFiles into a nested hierarchy tree for File Explorer
 */
export function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const rootNodes: FileTreeNode[] = [];
  const map = new Map<string, FileTreeNode>();

  // Sort files by path depth and alphabetically
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const parts = file.path.replace(/\\/g, '/').split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLeaf = i === parts.length - 1 && !file.isDirectory;
      const nodePath = currentPath ? `${currentPath}/${part}` : part;

      if (!map.has(nodePath)) {
        const node: FileTreeNode = {
          path: nodePath,
          name: part,
          isDirectory: !isLeaf,
          children: isLeaf ? undefined : [],
          size: isLeaf ? file.size ?? file.content.length : undefined,
          isBinary: isLeaf ? isBinaryFile(part) : undefined,
          extension: isLeaf ? part.split('.').pop() : undefined,
        };

        map.set(nodePath, node);

        if (i === 0) {
          rootNodes.push(node);
        } else {
          const parent = map.get(currentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      }

      currentPath = nodePath;
    }
  }

  // Sort nodes recursively: directories first, then alphabetical
  function sortNodes(nodes: FileTreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    for (const node of nodes) {
      if (node.children) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(rootNodes);
  return rootNodes;
}
