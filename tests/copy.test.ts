import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('sign-in CTA speaks in the user voice', () => {
  const source = readFileSync('components/AuthControl.tsx', 'utf8');
  assert.match(source, />Send me the link<\/button>/);
  assert.doesNotMatch(source, />Email sign-in link<\/button>/);
});
