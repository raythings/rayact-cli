import { spawnSync } from 'node:child_process';

interface SimDevice {
  udid: string;
  name?: string;
  isAvailable: boolean;
  state?: string;
}

/**
 * Pick an iOS simulator: a booted one if any, otherwise the first available.
 * Returns null when simctl is unavailable or lists nothing usable.
 */
export function pickSimulator(): { udid: string; name: string; booted: boolean } | null {
  const res = spawnSync('xcrun', ['simctl', 'list', 'devices', 'available', '-j'], {
    encoding: 'utf8'
  });
  if (!res.stdout) return null;
  try {
    const data = JSON.parse(res.stdout) as { devices: Record<string, SimDevice[]> };
    let first: SimDevice | null = null;
    for (const runtime of Object.values(data.devices)) {
      for (const d of runtime) {
        if (!d.isAvailable) continue;
        if (d.state === 'Booted') return { udid: d.udid, name: d.name ?? d.udid, booted: true };
        first ??= d;
      }
    }
    return first ? { udid: first.udid, name: first.name ?? first.udid, booted: false } : null;
  } catch {
    return null;
  }
}

/**
 * Install an .app bundle on a simulator (booting it first when necessary) and
 * launch the given bundle id. Returns false when no simulator is usable.
 */
export function installOnSimulator(appPath: string, bundleId: string): boolean {
  const sim = pickSimulator();
  if (!sim) {
    console.error('No iOS simulator available (xcrun simctl found none).');
    return false;
  }
  if (!sim.booted) {
    console.log(`Booting simulator ${sim.name} ...`);
    spawnSync('xcrun', ['simctl', 'boot', sim.udid], { stdio: 'inherit' });
    spawnSync('open', ['-a', 'Simulator'], { stdio: 'ignore' });
  }
  console.log(`Installing on ${sim.name} ...`);
  const install = spawnSync('xcrun', ['simctl', 'install', sim.udid, appPath], {
    stdio: 'inherit'
  });
  if (install.status !== 0) return false;
  spawnSync('xcrun', ['simctl', 'launch', sim.udid, bundleId], { stdio: 'inherit' });
  return true;
}
