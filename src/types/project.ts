/**
 * Nusantara App Builder - Project Types
 * Phase 1: Open Source Foundation
 */

export type ProjectTemplateId = 'empty-android' | 'basic-activity' | 'webview-starter';

export interface ProjectTemplate {
  id: ProjectTemplateId;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  minSdk: number;
  targetSdk: number;
  features: string[];
  featuresId: string[];
}

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  isDirectory?: boolean;
  size?: number;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  packageId: string;
  location: string;
  description: string;
  template: ProjectTemplateId;
  language: 'kotlin' | 'java';
  interfaceLanguage: 'id' | 'en';
  createdAt: string;
  updatedAt: string;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  versionCode: number;
  versionName: string;
  filesCount: number;
}

export interface CreateProjectInput {
  name: string;
  packageId: string;
  location: string;
  description: string;
  template: ProjectTemplateId;
  interfaceLanguage: 'id' | 'en';
  minSdk?: number;
  targetSdk?: number;
  compileSdk?: number;
}

export interface ValidationError {
  field: 'name' | 'packageId' | 'location' | 'description' | 'template' | 'general';
  message: string;
  messageId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
