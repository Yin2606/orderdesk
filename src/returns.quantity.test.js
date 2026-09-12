const test = require('node:test');
const assert = require('node:assert');
const { openReturn } = require('./returns');

const order = {
  id: 'ODK-2',
  lines: [
    { sku: 'A1', quantity: 3 },
    { sku: 'B2', quantity: 1 },
  ],
};

test('refuses a sku that is not on the order', () => {
  assert.throws(() => openReturn(order, [{ sku: 'Z9', quantity: 1 }]), /not on order/);
});

test('refuses more units than were ordered', () => {
  assert.throws(() => openReturn(order, [{ sku: 'A1', quantity: 4 }]), /only 3 were ordered/);
});

test('allows the exact ordered quantity', () => {
  const result = openReturn(order, [{ sku: 'A1', quantity: 3 }]);
  assert.strictEqual(result.lines.length, 1);
});

test('allows a partial return', () => {
  const result = openReturn(order, [{ sku: 'A1', quantity: 1 }]);
  assert.strictEqual(result.lines.length, 1);
});
