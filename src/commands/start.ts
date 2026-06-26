import path from 'node:path';
import { existsSync } from 'node:fs';
import { loadRayactConfig, setupAdbReverse } from '@rayact/dev-server';
import type { CliFlags } from '../parse.js';
import { runDesktopHost } from '../desktop.js';
import { runBuild } from './build.js';

/**
 * `rayact run` — the no-shell-script entry point that replaces run.sh /
 * run-android.sh. Two modes:
 *   --dev : attach to a running dev server (desktop launches against it; android
 *           wires `adb reverse` so the device dev launcher can connect).
 *   else  : build the app and launch it (desktop runs the container/bundle;
 *           android/iOS build + install + launch on the device).
 */
export async function runStart(flags: CliFlags): Promise<void> {
  const config = loadRayactConfig();
  const port = flags.port || config.devServer?.port || 8081;
  const devUrl = `http://127.0.0.1:${port}`;
  const isAndroid = flags.platform === 'android' || flags.android;
  const isIos = flags.platform === 'ios' || flags.ios;

  if (flags.dev) {
    if (isAndroid) {
      await setupAdbReverse(devUrl, config.devServer?.cdpPort ?? 9229);
      console.log(`Android: adb reverse configured for ${devUrl}`);
      console.log('Launch the debug APK and connect via the in-app dev launcher.');
      return;
    }
    const code = runDesktopHost({
      cwd: process.cwd(),
      desktopBin: flags.desktopBin,
      devServer: devUrl
    });
    process.exit(code);
  }

  // Production run = build, then launch.
  if (isAndroid) {
    flags.android = true;
    flags.install = true;
    await runBuild(flags); // bundle + APK + install + launch
    return;
  }
  if (isIos) {
    flags.ios = true;
    flags.install = true;
    await runBuild(flags);
    return;
  }

  flags.desktopApp = true;
  await runBuild(flags); // produces <outDir>/app.rayactpack + bundle + host
  const pack = path.join(flags.outDir, 'app.rayactpack');
  const bundle = path.join(flags.outDir, 'bundle.js');
  const code = runDesktopHost({
    cwd: process.cwd(),
    desktopBin: flags.desktopBin,
    bundle: existsSync(pack) ? pack : bundle
  });
  process.exit(code);
}
