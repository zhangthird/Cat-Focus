import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
let html = await readFile(resolve(output, 'index.html'), 'utf8');

// Inline the locally built JavaScript and CSS for direct file:// use.
for (const match of [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)]) {
  const source = await readFile(resolve(output, match[1]), 'utf8');
  html = html.replace(match[0], () => `<script type="module">${source.replace(/<\/script/gi, '<\\/script')}</script>`);
}
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const css = await readFile(resolve(output, match[1]), 'utf8');
  html = html.replace(match[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
const favicon = await readFile(resolve(root, 'public/favicon.svg'), 'utf8');
html = html.replace(/href="[^"]*favicon\.svg"/, () => `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`);
await writeFile(resolve(root, 'cat-focus.html'), html);
console.log('Generated cat-focus.html from src/.');
