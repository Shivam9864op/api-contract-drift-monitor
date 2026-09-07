import { readFile } from 'node:fs/promises';
import { compareContracts, summary } from './diff.mjs';

const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) {
  console.error('Usage: node src/cli.mjs <baseline.json> <current.json>');
  process.exit(2);
}

const before = JSON.parse(await readFile(beforePath, 'utf8'));
const after = JSON.parse(await readFile(afterPath, 'utf8'));
const changes = compareContracts(before, after);
const result = { ...summary(changes), changes };
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.status === 'blocked' ? 1 : 0;
