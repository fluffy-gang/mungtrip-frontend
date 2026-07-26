#!/usr/bin/env node

const { execFileSync } = require('node:child_process');

const protectedBranches = /^(main|develop)$/;
const workingBranch =
  /^[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*-#[0-9]+$/;

function getBranchName() {
  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

const branchName = getBranchName();

if (!branchName) {
  process.exit(0);
}

if (protectedBranches.test(branchName) || workingBranch.test(branchName)) {
  process.exit(0);
}

console.error(`Invalid branch name: ${branchName}`);
console.error('Use {tag}/{task-title}-#{issue-number}, for example feat/auth-api-client-#1.');
process.exit(1);
