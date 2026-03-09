import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HyperbolicCanvas } from './helpers.js';

describe('HyperbolicCanvas', function () {
  it('defines the natural and just constant tau', function () {
    assert.strictEqual(Math.TAU, Math.PI * 2);
  });

  it('defines the threshold for effective zero values', function () {
    assert(typeof HyperbolicCanvas.ZERO === 'number');
  });

  it('defines the threshold for effective infinity values', function () {
    assert(typeof HyperbolicCanvas.INFINITY === 'number');
  });
});
