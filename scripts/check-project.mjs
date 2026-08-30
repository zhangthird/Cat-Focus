import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const requiredFiles = [
  'cat-focus.html',
  'desktop/main.cjs',
  'desktop/preload.cjs',
  'package.json',
];

for (const file of requiredFiles) {
  await access(file, constants.R_OK);
}

const html = await readFile('cat-focus.html', 'utf8');
if (!html.includes('<!doctype html>')) {
  throw new Error('cat-focus.html does not look like a valid HTML document.');
}
if (!html.includes('id="root"')) {
  throw new Error('cat-focus.html is missing the React root element.');
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.main !== 'desktop/main.cjs') {
  throw new Error('package.json main entry must point to desktop/main.cjs.');
}

console.log('Project structure check passed.');
