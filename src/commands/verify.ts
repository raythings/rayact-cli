import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { CliFlags } from '../parse.js';

export function runVerify(flags: CliFlags): void {
  const script = flags.ios
    ? 'scripts/verify-ios.sh'
    : flags.android
      ? 'scripts/verify-android.sh'
      : 'scripts/verify-desktop.sh';
  const scriptPath = path.resolve(process.cwd(), script);
  const result = spawnSync('bash', [scriptPath], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  process.exit(result.status ?? 1);
}
