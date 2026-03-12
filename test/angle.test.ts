import { TAU } from '../src/constants.js';
import { Angle } from '../src/index.js';
import type { Quadrant } from '../src/types.js';
import { assertApproximate, assertIsRealNumber } from './helpers.js';
import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

describe('Angle', function () {
  it('converts from degrees to radians', function () {
    const degrees = Math.random() * 360;
    const radians = Angle.fromDegrees(degrees);
    assertIsRealNumber(radians);
    assert.strictEqual(radians, Angle.normalize(radians));
    assertApproximate(radians / TAU, degrees / 360);
  });

  it('finds the angle of a slope', function () {
    const slope = (Math.random() - 0.5) * 100;
    assertApproximate(Angle.fromSlope(slope), Math.atan(slope));
  });

  it('normalizes angles to within 0 and TAU', function () {
    const angle = Angle.normalize((Math.random() - 0.5) * 100);
    assert(angle > 0);
    assert(angle < TAU);
  });

  it('generates a random angle in a given quadrant', function () {
    ([1, 2, 3, 4] as Quadrant[]).forEach(function (q) {
      const angle = Angle.random(q);
      assert(angle > (Math.PI / 2) * (q - 1));
      assert(angle < (Math.PI / 2) * q);
    });
  });

  describe('generated at random', function () {
    let angle: number;
    beforeEach(function () {
      angle = Angle.random();
    });

    it('is between 0 and tau', function () {
      assertIsRealNumber(angle);
      assert(angle > 0);
      assert(angle < TAU);
    });

    it('converts to degrees', function () {
      assertApproximate(Angle.toDegrees(angle), (angle * 360) / TAU);
    });

    it('has opposite angle', function () {
      const opposite = Angle.opposite(angle);
      assertApproximate(
        opposite,
        angle < Math.PI ? angle + Math.PI : angle - Math.PI,
      );
      assert.strictEqual(opposite, Angle.normalize(opposite));
    });

    it('has equivalent slope', function () {
      const slope = Angle.toSlope(angle);
      assertIsRealNumber(slope);
      assertApproximate(slope, Math.tan(angle));
    });
  });
});
