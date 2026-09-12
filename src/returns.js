// Returns handling for OrderDesk.
//
// A return covers one or more lines of an order. A refund against it must be
// approved by a refunds clerk before any money moves.

/**
 * Open a return request against an order.
 *
 * @param {object} order  the order being returned against
 * @param {Array}  lines  the order lines the customer is sending back
 * @returns {object} the new return request
 */
function openReturn(order, lines) {
  if (lines.length === 0) {
    throw new Error('a return must cover at least one line');
  }

  // ODK-163 runs before ODK-141 on purpose. Filtering clearance lines first
  // would discard a wrong quantity before anyone saw it: a return claiming 99
  // units of a clearance item would fail quietly as "all clearance" instead of
  // naming the real problem. Validate what the customer actually sent, then
  // decide what is returnable.
  const ordered = new Map(order.lines.map((line) => [line.sku, line.quantity]));

  for (const line of lines) {
    if (!ordered.has(line.sku)) {
      throw new Error(`sku ${line.sku} is not on order ${order.id}`);
    }

    if (line.quantity > ordered.get(line.sku)) {
      throw new Error(
        `sku ${line.sku}: returning ${line.quantity} but only ${ordered.get(line.sku)} were ordered`
      );
    }
  }

  const returnable = lines.filter((line) => !line.finalClearance);

  if (returnable.length === 0) {
    throw new Error('final-clearance items may not be returned');
  }

  return {
    orderId: order.id,
    lines: returnable,
    raisedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
  };
}

function approve(returnRequest, clerkId, reason) {
  if (!reason) {
    throw new Error('a refund approval must carry a reason');
  }

  return {
    ...returnRequest,
    approvedBy: clerkId,
    approvedAt: new Date().toISOString(),
    reason,
  };
}

module.exports = { openReturn, approve };
