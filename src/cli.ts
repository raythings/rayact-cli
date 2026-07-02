#!/usr/bin/env node
import { parseCli, toDevServerArgs } from './parse.js';
import { printHelp, printVersion } from './help.js';
import { runBuild } from './commands/build.js';
import { runStart } from './commands/start.js';
import { runVerify } from './commands/verify.js';
import { runCompile } from './commands/compile.js';
import { runInit } from './commands/init.js';
import { runDevApp } from './commands/devApp.js';
import { runPrebuildCommand } from './commands/prebuild.js';

async function main(): Promise<void> {
  const flags = parseCli(process.argv.slice(2));

  if (flags.version) {
    printVersion();
    return;
  }
  if (flags.help || flags.command === 'help') {
    printHelp();
    return;
  }

  try {
    switch (flags.command) {
      case 'dev': {
        const { startDevTui } = await import('@rayact/dev-server');
        await startDevTui(toDevServerArgs(flags));
        break;
      }
      case 'start':
      case 'run':
        await runStart(flags);
        break;
      case 'build':
      case 'export':
        await runBuild(flags);
        break;
      case 'compile':
        await runCompile(flags);
        break;
      case 'verify':
        runVerify(flags);
        break;
      case 'init':
        runInit(flags);
        break;
      case 'dev-app':
        await runDevApp(flags);
        break;
      case 'prebuild':
        await runPrebuildCommand(flags);
        break;
      default:
        console.error(`Unknown command: ${flags.command}`);
        printHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  }
}

main();
