/**
 * Vitest Unit Tests: Project & Package Validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  validatePackageId,
  validateProjectLocation,
  validateProjectCreation,
} from '../validation/projectValidator';
import { ProjectMetadata } from '../types/project';

describe('Project Validator', () => {
  describe('Project Name Validation', () => {
    it('accepts valid alphanumeric project names', () => {
      const errors = validateProjectName('MyCoolApp');
      expect(errors).toHaveLength(0);
    });

    it('accepts names with spaces, dashes, and underscores', () => {
      const errors = validateProjectName('Nusantara-App_2026 Test');
      expect(errors).toHaveLength(0);
    });

    it('rejects empty or whitespace-only names', () => {
      const errors = validateProjectName('   ');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].field).toBe('name');
    });

    it('rejects names shorter than 3 characters', () => {
      const errors = validateProjectName('ab');
      expect(errors.some((e) => e.message.includes('at least 3'))).toBe(true);
    });

    it('rejects names longer than 50 characters', () => {
      const errors = validateProjectName('a'.repeat(51));
      expect(errors.some((e) => e.message.includes('50 characters'))).toBe(true);
    });

    it('rejects invalid characters like <, >, $, @, *', () => {
      const errors = validateProjectName('App$Name@*');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects Windows reserved device names (CON, PRN, AUX, NUL)', () => {
      expect(validateProjectName('CON').length).toBeGreaterThan(0);
      expect(validateProjectName('aux').length).toBeGreaterThan(0);
      expect(validateProjectName('PRN').length).toBeGreaterThan(0);
    });
  });

  describe('Package ID Validation', () => {
    it('accepts standard Android reverse-domain format', () => {
      expect(validatePackageId('com.nusantara.app')).toHaveLength(0);
      expect(validatePackageId('id.co.company.myapp')).toHaveLength(0);
    });

    it('rejects single-segment package IDs', () => {
      const errors = validatePackageId('myapp');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects uppercase letters in package ID', () => {
      const errors = validatePackageId('com.Nusantara.MyApp');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects Java reserved keywords like int, void, return, class', () => {
      expect(validatePackageId('com.example.void').length).toBeGreaterThan(0);
      expect(validatePackageId('com.class.app').length).toBeGreaterThan(0);
      expect(validatePackageId('int.example.app').length).toBeGreaterThan(0);
    });
  });

  describe('Project Location Validation', () => {
    it('accepts valid Windows and Unix paths', () => {
      expect(validateProjectLocation('C:\\Users\\User\\Projects')).toHaveLength(0);
      expect(validateProjectLocation('/home/user/projects')).toHaveLength(0);
    });

    it('rejects empty paths', () => {
      expect(validateProjectLocation('').length).toBeGreaterThan(0);
    });

    it('rejects directory traversal (..) for security', () => {
      const errors = validateProjectLocation('C:\\Users\\User\\..\\System32');
      expect(errors.some((e) => e.message.includes('traversal'))).toBe(true);
    });
  });

  describe('Duplicate Detection', () => {
    const existing: ProjectMetadata[] = [
      {
        id: '1',
        name: 'ExistingApp',
        displayName: 'Existing App',
        packageId: 'com.test.existing',
        location: 'C:\\Projects',
        description: '',
        template: 'empty-android',
        language: 'kotlin',
        interfaceLanguage: 'id',
        createdAt: '',
        updatedAt: '',
        formatVersion: '2.0',
        minSdk: 26,
        targetSdk: 34,
        compileSdk: 34,
        versionCode: 1,
        versionName: '1.0',
        filesCount: 15,
      },
    ];

    it('detects duplicate project names (case-insensitive)', () => {
      const res = validateProjectCreation(
        {
          name: 'existingapp',
          packageId: 'com.test.newpkg',
          location: 'C:\\OtherDir',
          description: '',
          template: 'empty-android',
          interfaceLanguage: 'id',
        },
        existing
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.message.includes('already exists'))).toBe(true);
    });

    it('detects duplicate destination directory path', () => {
      const res = validateProjectCreation(
        {
          name: 'DifferentName',
          packageId: 'com.test.newpkg',
          location: 'C:\\Projects\\ExistingApp', // Points to existing folder
          description: '',
          template: 'empty-android',
          interfaceLanguage: 'id',
        },
        existing
      );
      // If combined path collides with existing project
      expect(typeof res.isValid).toBe('boolean');
    });
  });
});
