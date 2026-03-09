import assert from 'node:assert';
import seedrandom from 'seedrandom';
import { ZERO } from '../src/constants.js';

const seed = process.env.SEED || String(Date.now());
seedrandom(seed, { global: true });
console.log(`Random seed: ${seed}`);

function assertApproximate(
  actual: number,
  expected: number,
  message?: string,
): void {
  if (actual === expected) return;
  if (Number.isNaN(actual) && Number.isNaN(expected)) return;
  assert(
    Math.abs(actual - expected) < ZERO,
    message ||
      `Expected ${actual} to approximate ${expected} (diff: ${Math.abs(actual - expected)})`,
  );
}

function assertIsRealNumber(value: number, message?: string): void {
  assert(
    typeof value === 'number' &&
      !Number.isNaN(value) &&
      value !== Infinity &&
      value !== -Infinity,
    message || `Expected ${value} to be a real number`,
  );
}

function assertIsA<T>(
  actual: unknown,
  expected: new (...args: unknown[]) => T,
  message?: string,
): void {
  assert(
    actual instanceof expected,
    message || `Expected ${actual} to be an instance of ${expected.name}`,
  );
}

export { assertApproximate, assertIsRealNumber, assertIsA };
