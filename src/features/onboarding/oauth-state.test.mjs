import assert from 'node:assert/strict';

import { getOAuthCallbackAction, isOAuthStateValid } from './oauth-state.ts';

assert.equal(isOAuthStateValid('state-1', 'state-1'), true);
assert.equal(isOAuthStateValid('state-1', 'state-2'), false);
assert.equal(isOAuthStateValid(null, 'state-1'), false);
assert.equal(isOAuthStateValid('state-1', ''), false);
assert.equal(getOAuthCallbackAction('state-1', 'state-1', null, null, 'code-1'), 'consume');
assert.equal(getOAuthCallbackAction(null, 'state-1', 'state-1', 'code-1', 'code-1'), 'duplicate');
assert.equal(getOAuthCallbackAction(null, 'state-1', 'state-1', 'code-2', 'code-1'), 'invalid');
