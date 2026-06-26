import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CliFlags } from '../parse.js';

const require = createRequire(import.meta.url);

export function runInit(flags: CliFlags): void {
  const projectName = flags.positional[0];
  if (!projectName) {
    console.error('Usage: rayact init <project-name> [--template default|blank]');
    process.exit(1);
  }

  let createRayactAppBin: string;
  try {
    createRayactAppBin = require.resolve('create-rayact-app/dist/index.js');
  } catch {
    createRayactAppBin = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../create-rayact-app/dist/index.js'
    );
  }

  const args = [createRayactAppBin, projectName, '--template', flags.template];
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
