#!/usr/bin/env node
// Cross-platform launcher for scripts/assets/generate.py (python3 on Linux/macOS, python on Windows).
//   npm run assets            → generate missing fonts/icons/OG image
//   npm run assets -- --force → regenerate everything
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generate.py');
const args = process.argv.slice(2);

for (const bin of ['python3', 'python', 'py']) {
  const result = spawnSync(bin, bin === 'py' ? ['-3', script, ...args] : [script, ...args], {
    stdio: 'inherit',
  });
  if (result.error?.code === 'ENOENT') continue;
  process.exit(result.status ?? 1);
}
console.error(
  '[assets] Python 3 not found. Install Python 3 with `pip install fonttools pillow`, or commit the binary assets under public/ directly.',
);
process.exit(1);
