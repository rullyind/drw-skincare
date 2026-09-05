import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await rm('dist', { recursive: true, force: true });
await rm('android', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

const files = [
  ['chess.html', 'dist/index.html'],
  ['chess.css', 'dist/chess.css'],
  ['chess.js', 'dist/chess.js'],
  ['chess-account.js', 'dist/chess-account.js'],
  ['chess-features.js', 'dist/chess-features.js'],
  ['chess-matchmaking.js', 'dist/chess-matchmaking.js'],
  ['firebase-config.js', 'dist/firebase-config.js']
];

for (const [from, to] of files) await cp(from, to);

try { await cp('assets', 'dist/assets', { recursive: true }); } catch {}

execFileSync('npx', ['cap', 'add', 'android'], { stdio: 'inherit' });
execFileSync('npx', ['cap', 'sync', 'android'], { stdio: 'inherit' });

console.log('Android project prepared successfully.');
