#!/usr/bin/env node

const fs = require('node:fs');

const commitMessageFile = process.argv[2];

if (!commitMessageFile) {
  console.error('Missing commit message file path.');
  process.exit(1);
}

const message = fs.readFileSync(commitMessageFile, 'utf8').trim();
const lines = message.split(/\r?\n/);
const firstLine = lines[0];
const issueCommit = /^\[#[0-9]+\] .{1,72}$/;

if (firstLine.startsWith('Merge ') || firstLine.startsWith('Revert "')) {
  process.exit(0);
}

if (!issueCommit.test(firstLine)) {
  console.error(`Invalid commit message: ${firstLine}`);
  console.error('Use [#{issue-number}] {commit title}, for example [#4] README 프로젝트 개요 정리.');
  process.exit(1);
}

const invalidBodyLine = lines.slice(1).find((line) => line.trim() && !line.startsWith('- '));

if (invalidBodyLine) {
  console.error(`Invalid commit body line: ${invalidBodyLine}`);
  console.error('Optional commit body lines must use dash-prefixed list items.');
  process.exit(1);
}
