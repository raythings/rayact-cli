import { spawnSync } from 'node:child_process';
import { adbInstall, adbLaunch, loadRayactConfig, setupAdbReverse } from '@rayact/dev-server';
import { ensureDevApp } from '@rayact/prebuild';
import type { DevAppPlatform } from '@rayact/prebuild';
import type { CliFlags } from '../parse.js';
import { installOnSimulator } from '../ios.js';

function adbDeviceAttached(): boolean {
  const res = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  if (res.status !== 0) return false;
  return (res.stdout ?? '')
    .split('\n')
    .slice(1)
    .some((line) => line.trim().endsWith('device') && !line.includes('offline'));
}

function pickPlatform(flags: CliFlags): DevAppPlatform {
  if (flags.android) return 'android';
  if (flags.iosSimulator) return 'ios-simulator';
  if (flags.iosDevice) return 'ios-device';
  // No explicit platform: an attached Android device wins, then the iOS
  // simulator on macOS. Error with guidance otherwise.
  if (adbDeviceAttached()) return 'android';
  if (process.platform === 'darwin') return 'ios-simulator';
  throw new Error(
    'No target found. Connect an Android device (USB debugging on) or pass ' +
      '--android / --ios-simulator / --ios-device.'
  );
}

/**
 * `rayact dev-app` — download the prebuilt Rayact dev app from the GitHub
 * release and install + launch it on a device/simulator (Expo Go style).
 * The app then connects to `rayact dev` via QR scan, mDNS discovery, or the
 * adb-reversed localhost URL.
 */
export async function runDevApp(flags: CliFlags): Promise<void> {
  const config = loadRayactConfig();
  const platform = pickPlatform(flags);
  const artifact = await ensureDevApp(platform);

  if (platform === 'android') {
    if (!adbDeviceAttached()) {
      console.error('No Android device attached (check `adb devices` / USB debugging).');
      console.error(`Dev app APK is cached at: ${artifact}`);
      process.exit(1);
    }
    console.log('Installing dev app on the connected Android device ...');
    if (!adbInstall(artifact)) {
      console.error('adb install failed.');
      process.exit(1);
    }
    // Reverse the dev-server + CDP ports so the phone reaches 127.0.0.1 over USB.
    const port = config.devServer?.port ?? 8081;
    await setupAdbReverse(`http://127.0.0.1:${port}`, config.devServer?.cdpPort ?? 9229);
    adbLaunch('com.rayact.app', '.DevLauncherActivity');
    console.log('\nDev app installed and launched.');
  } else if (platform === 'ios-simulator') {
    if (!installOnSimulator(artifact, 'com.rayact.ios')) process.exit(1);
    console.log('\nDev app installed and launched on the simulator.');
  } else {
    console.log(`\nUnsigned device IPA downloaded to:\n  ${artifact}`);
    console.log('\nRe-sign it with your Apple Developer certificate, then install, e.g.:');
    console.log('  1. unzip the .ipa, codesign Payload/Rayact.app with your identity');
    console.log('  2. install via Xcode Devices & Simulators or `ios-deploy`');
    return;
  }

  console.log('Next: run `npm run dev` in your project — the dev app connects via');
  console.log('QR scan, local-network discovery, or the USB-forwarded localhost URL.');
}
