const test = require('node:test');
const assert = require('node:assert');
const { openReturn } = require('./returns');

const order = {
  id: 'ODK-1',
  lines: [
    { sku: 'A1', quantity: 2 },
    { sku: 'B2', quantity: 2 },
  ],
};

test('refuses a return of only final-clearance lines', () => {
  assert.throws(
    () => openReturn(order, [{ sku: 'A1', quantity: 1, finalClearance: true }]),
    /final-clearance/
  );
});

test('keeps only the normal lines in a mixed return', () => {
  const result = openReturn(order, [
    { sku: 'A1', quantity: 1, finalClearance: true },
    { sku: 'B2', quantity: 1, finalClearance: false },
  ]);
  assert.deepStrictEqual(result.lines.map((l) => l.sku), ['B2']);
});
