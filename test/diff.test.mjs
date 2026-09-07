import test from 'node:test';
import assert from 'node:assert/strict';
import { compareContracts, summary } from '../src/diff.mjs';
import { readFile } from 'node:fs/promises';

const load = async (name) => JSON.parse(await readFile(new URL(`../fixtures/${name}`, import.meta.url)));

test('safe additive change is allowed', async () => {
  const changes = compareContracts(await load('baseline.json'), await load('current-safe.json'));
  assert.deepEqual(summary(changes), { breaking: 0, nonBreaking: 1, total: 1, status: 'safe' });
});

test('removed operation, response type, and new required parameter are reported', async () => {
  const changes = compareContracts(await load('baseline.json'), await load('current-breaking.json'));
  assert.equal(summary(changes).status, 'blocked');
  assert.deepEqual(changes.map((change) => change.code), ['operation_removed', 'response_type_changed', 'required_parameter_added']);
});

test('empty documents are safe', () => {
  assert.deepEqual(summary(compareContracts({}, {})), { breaking: 0, nonBreaking: 0, total: 0, status: 'safe' });
});
