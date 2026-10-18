#!/usr/bin/env tsx
/**
 * Nusantara App Builder - Command Line Interface Runner
 * Usage:
 *   npx tsx scripts/cli.ts <command>
 */

import { CliEngine } from '../src/modules/cli/cliEngine';

const args = process.argv.slice(2);
const commandString = args.join(' ');

const result = CliEngine.execute(commandString || 'help', null, []);

for (const line of result.stdout) {
  console.log(line);
}

for (const err of result.stderr) {
  console.error(err);
}

process.exit(result.exitCode);
