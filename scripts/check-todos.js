#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const skippedDirs = new Set([
  '.expo',
  '.git',
  '.next',
  'android',
  'dist',
  'ios',
  'node_modules',
]);
const skippedFiles = new Set(['pnpm-lock.yaml']);
const checkedExtensions = new Set([
  '.css',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
]);
const trackedMarker = 'TO' + 'DO';
const untrackedMarkers = ['FIX' + 'ME', 'HA' + 'CK'];
const markerPattern = new RegExp(
  `\\b(${[trackedMarker, ...untrackedMarkers].join('|')})\\b(?:\\((#[0-9]+|docs\\/adr\\/[0-9]{4}[-a-z0-9]*\\.md)\\):)?`,
  'g',
);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skippedDirs.has(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }

    if (!entry.isFile() || skippedFiles.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (checkedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const failures = [];

for (const file of walk(root)) {
  const relativePath = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    markerPattern.lastIndex = 0;
    let match;
    while ((match = markerPattern.exec(line)) !== null) {
      const [, marker, reference] = match;
      if (marker !== trackedMarker || !reference) {
        failures.push(`${relativePath}:${index + 1}: ${marker} must be traceable`);
      }
    }
  });
}

if (failures.length > 0) {
  console.error(
    `Deferred work markers must use ${trackedMarker}(#123): or ${trackedMarker}(docs/adr/0001-title.md):`,
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
