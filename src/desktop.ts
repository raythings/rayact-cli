import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveDesktopBinPrebuilt } from '@rayact/prebuild';

/**
 * Locate the rayact_desktop host: explicit/env override, source-tree build,
 * installed @rayact/prebuilt-<host> package, or the per-user cache. Returns null
 * if absent — run `rayact prebuild` to download it.
 */
export function resolveDesktopBin(cwd: string, configured?: string): string | null {
  return resolveDesktopBinPrebuilt(cwd, configured)?.bin ?? null;
}

export function runDesktopHost(options: {
  cwd: string;
  bundle?: string;
  devServer?: string;
  desktopBin?: string;
  env?: NodeJS.ProcessEnv;
}): number {
  const bin = resolveDesktopBin(options.cwd, options.desktopBin);
  if (!bin) {
    console.error('rayact_desktop not found.');
    console.error('Run `rayact prebuild` to fetch the host, or set RAYACT_DESKTOP_BIN.');
    return 1;
  }

  const args: string[] = [];
  const env = { ...process.env, ...options.env };

  if (options.devServer) {
    env.RAYACT_DEV_SERVER = options.devServer;
  } else if (options.bundle) {
    const bundlePath = path.isAbsolute(options.bundle)
      ? options.bundle
      : path.resolve(options.cwd, options.bundle);
    if (!fs.existsSync(bundlePath)) {
      console.error(`Bundle not found: ${bundlePath}`);
      console.error('Run: npm run build  or  rayact build');
      return 1;
    }
    args.push(bundlePath);
  } else {
    const defaultBundle = path.resolve(options.cwd, 'dist/bundle.js');
    if (fs.existsSync(defaultBundle)) {
      args.push(defaultBundle);
    } else {
      console.error('No bundle or dev server URL. Use --dev or build first.');
      return 1;
    }
  }

  const result = spawnSync(bin, args, { stdio: 'inherit', cwd: options.cwd, env });
  return result.status ?? 1;
}
