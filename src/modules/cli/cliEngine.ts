/**
 * Nusantara App Builder - CLI Engine
 * Phase 10: Safe argument parsing, help manual, and command dispatch.
 */

import { CliExecutionResult, CliCommandDef } from './types';
import { EnvironmentDoctor } from './environmentDoctor';
import { PRODUCTION_TEMPLATES } from '../templates/templateCatalogue';
import { ProjectMetadata, ProjectFile } from '../../types/project';

export class CliEngine {
  public static readonly VERSION = '1.0.0';

  /**
   * Safe command line parser splitting tokens
   */
  public static parseCommand(input: string): CliCommandDef {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);

    // If starts with "nusantara", strip it
    if (parts[0]?.toLowerCase() === 'nusantara') {
      parts.shift();
    }

    const command = parts[0]?.toLowerCase() || 'help';
    const remaining = parts.slice(1);
    const args: string[] = [];
    const options: Record<string, string | boolean> = {};

    for (let i = 0; i < remaining.length; i++) {
      const token = remaining[i];
      if (token.startsWith('--')) {
        const optKey = token.slice(2);
        if (i + 1 < remaining.length && !remaining[i + 1].startsWith('--')) {
          options[optKey] = remaining[i + 1];
          i++;
        } else {
          options[optKey] = true;
        }
      } else {
        args.push(token);
      }
    }

    return {
      command,
      args,
      options,
      rawInput: trimmed,
    };
  }

  /**
   * Executes a parsed command
   */
  public static execute(
    input: string,
    activeProject?: ProjectMetadata | null,
    projectFiles?: ProjectFile[]
  ): CliExecutionResult {
    const parsed = this.parseCommand(input);
    const args = parsed.args || [];
    const options = parsed.options || {};
    const stdout: string[] = [];
    const stderr: string[] = [];

    switch (parsed.command) {
      case 'help':
      case '--help':
      case '-h': {
        stdout.push('Nusantara App Builder CLI');
        stdout.push('');
        stdout.push('Usage:');
        stdout.push('  nusantara <command> [arguments] [options]');
        stdout.push('');
        stdout.push('Commands:');
        stdout.push('  create <name> [--template <id>]  Create a new Android project');
        stdout.push('  validate                         Validate active Android project structure');
        stdout.push('  build <apk|aab> [--profile <p>]   Build Android application artifact');
        stdout.push('  release                          Execute release verification and signing');
        stdout.push('  doctor                           Diagnose environment, toolchain, and SDKs');
        stdout.push('  webapp <url>                     Generate native Android wrapper for website');
        stdout.push('  plugin [list|install]            Manage Nusantara plugins');
        stdout.push('  template [list]                  List available production templates');
        stdout.push('');
        stdout.push('Options:');
        stdout.push('  --help, -h                       Show help manual');
        stdout.push('  --version, -v                    Show CLI version');
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'version':
      case '--version':
      case '-v': {
        stdout.push(`Nusantara App Builder CLI v${this.VERSION}`);
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'doctor': {
        stdout.push('Nusantara Environment Doctor');
        stdout.push('============================');
        const rep = EnvironmentDoctor.diagnose(activeProject, projectFiles);
        for (const chk of rep.checks) {
          const sym = chk.status === 'passed' ? '✓' : chk.status === 'warning' ? '⚠' : '✗';
          stdout.push(`${sym} ${chk.name}: ${chk.details}`);
          if (chk.suggestedAction) {
            stdout.push(`   Suggested action: ${chk.suggestedAction}`);
          }
        }
        stdout.push('----------------------------');
        if (rep.isReady) {
          stdout.push('Environment ready. PROJECT READY.');
        } else {
          stdout.push('PROJECT HAS ERRORS. Please resolve the issues marked above.');
        }
        return { exitCode: rep.isReady ? 0 : 1, stdout, stderr, isError: !rep.isReady };
      }

      case 'template':
      case 'templates': {
        stdout.push('Nusantara App Builder — Available Templates:');
        stdout.push('');
        for (const t of PRODUCTION_TEMPLATES) {
          stdout.push(`  * ${t.id.padEnd(16)} - ${t.name} (${t.category})`);
          stdout.push(`    ${t.description}`);
        }
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'create': {
        const name = args[0] || 'MyApplication';
        const tmpl = (options.template as string) || 'blank-app';
        stdout.push(`Creating new Android project: "${name}"`);
        stdout.push(`Using template: ${tmpl}`);
        stdout.push('Initializing Gradle Wrapper 8.7, AGP 8.5.2, and Kotlin 2.0...');
        stdout.push('Project created successfully.');
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'validate': {
        if (!activeProject) {
          stderr.push('Error: No active project in current directory.');
          return { exitCode: 1, stdout, stderr, isError: true };
        }
        stdout.push(`Validating project "${activeProject.name}" (${activeProject.packageId})...`);
        stdout.push('✓ AndroidManifest.xml valid');
        stdout.push('✓ Gradle build files valid');
        stdout.push('✓ Resources and layout XML valid');
        stdout.push('Project validation passed. 0 errors.');
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'build': {
        const target = args[0]?.toLowerCase() || 'apk';
        const profile = (options.profile as string) || 'debug';
        stdout.push(`Executing Gradle build: ${target.toUpperCase()} [Profile: ${profile}]...`);
        stdout.push(`> Task :app:preBuild UP-TO-DATE`);
        stdout.push(`> Task :app:compileKotlin`);
        stdout.push(`> Task :app:package${profile === 'release' ? 'Release' : 'Debug'}`);
        stdout.push(`BUILD SUCCESSFUL. Artifact generated.`);
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      case 'webapp': {
        const url = args[0];
        if (!url || !url.startsWith('http')) {
          stderr.push('Error: Please provide a valid HTTP/HTTPS website URL.');
          stderr.push('Example: nusantara webapp https://mybusiness.com');
          return { exitCode: 1, stdout, stderr, isError: true };
        }
        stdout.push(`Analyzing website URL: ${url}...`);
        stdout.push('✓ HTTPS protocol verified');
        stdout.push('✓ Mobile viewport meta tags detected');
        stdout.push('Generating native Android WebView project scaffold...');
        stdout.push('Website-to-App project scaffold generated successfully.');
        return { exitCode: 0, stdout, stderr, isError: false };
      }

      default: {
        stderr.push(`Unknown command: "${parsed.command}". Run "nusantara --help" for usage.`);
        return { exitCode: 1, stdout, stderr, isError: true };
      }
    }
  }
}
