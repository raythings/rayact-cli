import { loadRayactConfig } from '@rayact/dev-server';
import { runPrebuild, ensureDesktopPrebuilt } from '@rayact/prebuild';
import type { CliFlags } from '../parse.js';

/**
 * `rayact prebuild` — scaffold native android/ and ios/ shell projects from the
 * bundled templates and link the prebuilt engine libraries (downloaded from the
 * GitHub release when not installed). The expo-prebuild equivalent: after this,
 * `rayact build --debug --android --install` produces a custom dev client with
 * no engine compile.
 */
export async function runPrebuildCommand(flags: CliFlags): Promise<void> {
  const root = process.cwd();
  const config = loadRayactConfig(root);
  const devClient = flags.production ? false : true;

  // Ensure the host desktop binary is available (resolve or download). This is
  // what lets bytecode compile + `rayact run:desktop` work without a source build.
  try {
    const host = await ensureDesktopPrebuilt(root, flags.desktopBin);
    console.log(`Desktop host: ${host.bin} (${host.source})`);
  } catch (err) {
    console.warn(`warning: desktop host unavailable (${(err as Error).message})`);
  }

  const result = await runPrebuild({
    projectRoot: root,
    devClient,
    configNativeModules: config.nativeModules,
    android: config.android,
    ios: config.ios,
    force: flags.force
  });

  console.log('Rayact prebuild complete.');
  if (result.androidDir) console.log(`  Android: ${result.androidDir}`);
  if (result.iosDir) console.log(`  iOS:     ${result.iosDir}`);
  console.log(`  Native modules (${result.nativeModules.length}):`);
  for (const m of result.nativeModules) {
    console.log(`    - ${m.name}${m.jsPackage ? ` (${m.jsPackage})` : ''}`);
  }
  console.log('\nNext: rayact build --debug --android --install  (Gradle only — no engine compile)');
}
