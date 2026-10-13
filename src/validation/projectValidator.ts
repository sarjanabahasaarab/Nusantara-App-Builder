/**
 * Nusantara App Builder - Project Validation Logic
 * Strict validation for Project Name, Android Package ID, and Filesystem Location.
 */

import { CreateProjectInput, ProjectMetadata, ValidationResult, ValidationError } from '../types/project';

// Windows reserved device names that cannot be used as folder or file names
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

// Java & Android reserved keywords that cannot be package ID segments
const JAVA_RESERVED_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
]);

export function validateProjectName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    errors.push({
      field: 'name',
      message: 'Project name is required.',
      messageId: 'Nama proyek wajib diisi.',
    });
    return errors;
  }

  if (trimmed.length < 3) {
    errors.push({
      field: 'name',
      message: 'Project name must be at least 3 characters.',
      messageId: 'Nama proyek minimal 3 karakter.',
    });
  }

  if (trimmed.length > 50) {
    errors.push({
      field: 'name',
      message: 'Project name cannot exceed 50 characters.',
      messageId: 'Nama proyek maksimal 50 karakter.',
    });
  }

  // Allowed characters: alphanumeric, spaces, underscores, hyphens
  const validCharsRegex = /^[a-zA-Z0-9_\- ]+$/;
  if (!validCharsRegex.test(trimmed)) {
    errors.push({
      field: 'name',
      message: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores.',
      messageId: 'Nama proyek hanya boleh mengandung huruf, angka, spasi, tanda strip, atau garis bawah.',
    });
  }

  // Check against Windows reserved device names
  const upper = trimmed.toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(upper)) {
    errors.push({
      field: 'name',
      message: `"${trimmed}" is a reserved system name on Windows.`,
      messageId: `"${trimmed}" adalah nama yang dilindungi oleh sistem operasi Windows.`,
    });
  }

  return errors;
}

export function validatePackageId(packageId: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = packageId.trim();

  if (!trimmed) {
    errors.push({
      field: 'packageId',
      message: 'Package ID is required.',
      messageId: 'ID Paket wajib diisi.',
    });
    return errors;
  }

  // Must match reverse domain format e.g. com.example.myapp
  const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!packageRegex.test(trimmed)) {
    errors.push({
      field: 'packageId',
      message: 'Package ID must be in lowercase reverse-domain format (e.g. com.example.myapp) with at least 2 segments.',
      messageId: 'ID Paket harus berupa format reverse-domain huruf kecil (misal: com.example.myapp) dengan minimal 2 segmen.',
    });
    return errors;
  }

  const segments = trimmed.split('.');
  if (segments.length < 2) {
    errors.push({
      field: 'packageId',
      message: 'Package ID must contain at least 2 segments separated by dots (e.g. com.myapp).',
      messageId: 'ID Paket harus memiliki minimal 2 segmen yang dipisahkan titik.',
    });
  }

  for (const seg of segments) {
    if (JAVA_RESERVED_KEYWORDS.has(seg)) {
      errors.push({
        field: 'packageId',
        message: `Package segment "${seg}" is a reserved Java keyword.`,
        messageId: `Segmen paket "${seg}" merupakan kata kunci yang dilindungi dalam Java.`,
      });
      break;
    }
  }

  return errors;
}

export function validateProjectLocation(location: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = location.trim();

  if (!trimmed) {
    errors.push({
      field: 'location',
      message: 'Project location is required.',
      messageId: 'Lokasi folder proyek wajib ditentukan.',
    });
    return errors;
  }

  // Security: Prevent directory traversal
  if (trimmed.includes('..')) {
    errors.push({
      field: 'location',
      message: 'Directory traversal (..) is not allowed in project location.',
      messageId: 'Karakter direktori traversal (..) tidak diizinkan pada lokasi proyek demi keamanan.',
    });
  }

  // Prohibit illegal characters in Windows/Unix paths (<, >, ", |, ?, *)
  const illegalPathChars = /[<>:"|?*]/;
  // Allow drive letter colon like C:\
  const cleanForDrive = trimmed.replace(/^[a-zA-Z]:[/\\]/, '');
  if (illegalPathChars.test(cleanForDrive)) {
    errors.push({
      field: 'location',
      message: 'Project location contains invalid path characters.',
      messageId: 'Lokasi proyek mengandung karakter jalur yang tidak valid.',
    });
  }

  return errors;
}

export function validateProjectCreation(
  input: CreateProjectInput,
  existingProjects: ProjectMetadata[]
): ValidationResult {
  const errors: ValidationError[] = [];

  errors.push(...validateProjectName(input.name));
  errors.push(...validatePackageId(input.packageId));
  errors.push(...validateProjectLocation(input.location));

  // Check for duplicate name or colliding directory path
  const sanitizedName = input.name.trim().toLowerCase();
  const targetDir = `${input.location.trim().replace(/[/\\]+$/, '')}/${input.name.trim()}`.toLowerCase();

  const nameCollision = existingProjects.some(
    (p) => p.name.trim().toLowerCase() === sanitizedName
  );
  if (nameCollision) {
    errors.push({
      field: 'name',
      message: `A project with the name "${input.name.trim()}" already exists.`,
      messageId: `Proyek dengan nama "${input.name.trim()}" sudah ada. Silakan gunakan nama lain.`,
    });
  }

  const dirCollision = existingProjects.some((p) => {
    const existingTarget = `${p.location.trim().replace(/[/\\]+$/, '')}/${p.name.trim()}`.toLowerCase();
    return existingTarget === targetDir;
  });
  if (dirCollision) {
    errors.push({
      field: 'location',
      message: 'Target directory path is already used by another project.',
      messageId: 'Folder tujuan sudah digunakan oleh proyek lain.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
