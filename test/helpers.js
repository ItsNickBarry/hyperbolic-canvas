const assert = require('node:assert');
const seedrandom = require('seedrandom');

const seed = process.env.SEED || String(Date.now());
seedrandom(seed, { global: true });
console.log(`Random seed: ${seed}`);

const HyperbolicCanvas = require('../index.js');

function assertApproximate(actual, expected, message) {
  if (actual === expected) return;
  if (Number.isNaN(actual) && Number.isNaN(expected)) return;
  assert(
    Math.abs(actual - expected) < HyperbolicCanvas.ZERO,
    message ||
      `Expected ${actual} to approximate ${expected} (diff: ${Math.abs(actual - expected)})`,
  );
}

function assertIsRealNumber(value, message) {
  assert(
    typeof value === 'number' &&
      !Number.isNaN(value) &&
      value !== Infinity &&
      value !== -Infinity,
    message || `Expected ${value} to be a real number`,
  );
}

function assertIsA(actual, expected, message) {
  assert(
    actual instanceof expected,
    message || `Expected ${actual} to be an instance of ${expected.name}`,
  );
}

module.exports = {
  HyperbolicCanvas,
  assertApproximate,
  assertIsRealNumber,
  assertIsA,
};
