import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export async function resolve(specifier, context, nextResolve) {
  let target;
  if (specifier.startsWith('@/')) target = path.join(root, specifier.slice(2));
  else if (specifier.startsWith('.') && context.parentURL?.startsWith(pathToFileURL(root).href)) target = fileURLToPath(new URL(specifier, context.parentURL));
  if (target && !path.extname(target)) {
    for (const extension of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      try { await access(target + extension); target += extension; break; } catch { /* try next TS resolution */ }
    }
  }
  return target ? nextResolve(pathToFileURL(target).href, context) : nextResolve(specifier, context);
}
