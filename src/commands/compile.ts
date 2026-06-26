import fs from 'node:fs/promises';
import { compileToBytecode } from '@rayact/dev-server';
import type { CliFlags } from '../parse.js';

export async function runCompile(flags: CliFlags): Promise<void> {
  const src = flags.positional[0] ?? 'dist/bundle.js';
  const out = flags.positional[1] ?? 'dist/bundle.qjsbc';
  const js = await fs.readFile(src, 'utf8');
  const bc = await compileToBytecode(js, { root: process.cwd(), desktopBin: flags.desktopBin });
  await fs.writeFile(out, bc);
  console.log(`Compiled ${src} → ${out} (${bc.length} bytes)`);
}
