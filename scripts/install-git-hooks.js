#!/usr/bin/env node

const { execFileSync } = require('node:child_process');

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
} catch (error) {
  console.warn('Skipping git hook installation. Run `git config core.hooksPath .githooks` manually if needed.');
}
