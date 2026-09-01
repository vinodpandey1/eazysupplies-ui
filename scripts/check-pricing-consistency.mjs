import assert from "node:assert/strict";
import { getProductPricing } from "../src/utils/pricing/productPricing.js";
import { calculateCartLine, calculateCartTotals } from "../src/utils/pricing/orderTotals.js";

const cases = [
  {
    name: "base price is used when sale price is absent",
    item: { quantity: 2, product: { price: 100 } },
    expectedUnitPrice: 100,
  },
  {
    name: "lower positive sale price is accepted",
    item: { quantity: 2, product: { price: 100, sale_price: 80 } },
    expectedUnitPrice: 80,
  },
  {
    name: "equal sale price is not treated as an offer",
    item: { quantity: 2, product: { price: 100, sale_price: 100 } },
    expectedUnitPrice: 100,
  },
  {
    name: "sale price above the base price is rejected",
    item: { quantity: 2, product: { price: 100, sale_price: 125 } },
    expectedUnitPrice: 100,
  },
  {
    name: "zero and invalid sale values do not replace the base price",
    item: { quantity: 2, product: { price: "100", sale_price: "not-a-price" } },
    expectedUnitPrice: 100,
  },
  {
    name: "variation price and valid variation sale price take precedence",
    item: {
      quantity: 3,
      product: { price: 100, sale_price: 80 },
      variation: { price: 120, sale_price: 95 },
    },
    expectedUnitPrice: 95,
  },
  {
    name: "invalid variation sale price falls back to variation base price",
    item: {
      quantity: 3,
      product: { price: 100 },
      variation: { price: 120, sale_price: 140 },
    },
    expectedUnitPrice: 120,
  },
];

for (const testCase of cases) {
  const display = getProductPricing(
    testCase.item.product,
    testCase.item.variation,
  );
  const cartLine = calculateCartLine(testCase.item);

  assert.equal(
    cartLine.unitPrice,
    display.sellingPrice,
    `${testCase.name}: cart and storefront display prices differ`,
  );
  assert.equal(
    cartLine.unitPrice,
    testCase.expectedUnitPrice,
    `${testCase.name}: unexpected unit price`,
  );
  assert.equal(
    cartLine.total,
    testCase.expectedUnitPrice * testCase.item.quantity,
    `${testCase.name}: unexpected line total`,
  );
}

const totals = calculateCartTotals(cases.slice(0, 4).map((testCase) => testCase.item));
assert.equal(totals.subtotal, 760, "cart subtotal must use the same validated prices");

console.log(`Pricing consistency regression passed (${cases.length} cases).`);
