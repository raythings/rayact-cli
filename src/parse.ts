import { loadRayactConfig } from '@rayact/dev-server';
import type { RayactBuildMode } from '@rayact/dev-server';

export interface CliFlags {
  command: string;
  subcommand?: string;
  host: string;
  port: number;
  entry: string;
  platform: string;
  desktopBin: string;
  mode: RayactBuildMode;
  outDir: string;
  minify: boolean | null;
  bytecode: boolean | null;
  android: boolean;
  ios: boolean;
  desktopApp: boolean;
  install: boolean;
  debug: boolean;
  dev: boolean;
  template: string;
  help: boolean;
  version: boolean;
  positional: string[];
}

export function parseCli(argv: string[]): CliFlags {
  const config = loadRayactConfig();
  const flags: CliFlags = {
    command: argv[0] ?? 'help',
    host: config.devServer?.host ?? '0.0.0.0',
    port: config.devServer?.port ?? 8081,
    entry: config.entry ?? 'src/App.tsx',
    platform: config.platform ?? 'desktop',
    desktopBin: process.env.RAYACT_DESKTOP_BIN ?? 'build/bin/rayact_desktop',
    mode: 'development',
    outDir: 'dist',
    minify: null,
    bytecode: null,
    android: false,
    ios: false,
    desktopApp: false,
    install: false,
    debug: true,
    dev: false,
    template: 'default',
    help: false,
    version: false,
    positional: []
  };

  let i = 0;
  const first = argv[0];
  if (first && !first.startsWith('-')) {
    if (first.startsWith('run:')) {
      flags.command = 'run';
      flags.subcommand = first.slice('run:'.length);
      i = 1;
    } else {
      flags.command = first;
      i = 1;
      if (argv[1] && !argv[1].startsWith('-')) {
        if (flags.command === 'run') {
          flags.subcommand = argv[1];
          i = 2;
        } else if (flags.command === 'init') {
          flags.positional.push(argv[1]);
          i = 2;
        }
      }
    }
  } else if (!first || first.startsWith('-')) {
    flags.command = 'help';
    i = 0;
  }

  for (; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--version' || arg === '-v') flags.version = true;
    else if (arg === '--host' && next) { flags.host = next; i++; }
    else if (arg === '--port' && next) { flags.port = Number(next); i++; }
    else if (arg === '--entry' && next) { flags.entry = next; i++; }
    else if (arg === '--platform' && next) { flags.platform = next; i++; }
    else if (arg === '--desktop-bin' && next) { flags.desktopBin = next; i++; }
    else if (arg === '--mode' && next) {
      if (!['development', 'dev-client', 'release'].includes(next)) {
        throw new Error(`Invalid --mode ${next}`);
      }
      flags.mode = next as RayactBuildMode;
      i++;
    } else if (arg === '--out' && next) { flags.outDir = next; i++; }
    else if (arg === '--template' && next) { flags.template = next; i++; }
    else if (arg === '--minify') flags.minify = true;
    else if (arg === '--no-minify') flags.minify = false;
    else if (arg === '--bytecode') flags.bytecode = true;
    else if (arg === '--no-bytecode') flags.bytecode = false;
    else if (arg === '--android') flags.android = true;
    else if (arg === '--ios') flags.ios = true;
    else if (arg === '--desktop') flags.desktopApp = true;
    else if (arg === '--dev') flags.dev = true;
    else if (arg === '--debug') flags.debug = true;
    else if (arg === '--release') { flags.debug = false; flags.mode = 'release'; }
    else if (arg === '--install') {
      flags.install = true;
      if (!flags.ios) flags.android = true;
    }
    else if (!arg.startsWith('-')) flags.positional.push(arg);
    else throw new Error(`Unknown flag: ${arg}`);
  }

  if (flags.command === 'run' && flags.subcommand) {
    if (flags.subcommand === 'android') flags.platform = 'android';
    else if (flags.subcommand === 'ios') flags.platform = 'ios';
    else if (flags.subcommand === 'desktop') flags.platform = 'desktop';
    else throw new Error(`Unknown run target: ${flags.subcommand}. Use run:desktop, run:android, or run:ios`);
  }

  return flags;
}

export function toDevServerArgs(flags: CliFlags) {
  return {
    command: flags.command,
    host: flags.host,
    port: flags.port,
    entry: flags.entry,
    platform: flags.platform,
    desktopBin: flags.desktopBin,
    mode: flags.mode,
    outDir: flags.outDir,
    minify: flags.minify ?? false,
    bytecode: flags.bytecode ?? false,
    android: flags.android,
    debug: flags.debug
  };
}
