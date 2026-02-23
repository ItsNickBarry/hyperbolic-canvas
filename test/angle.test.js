const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  HyperbolicCanvas,
  assertApproximate,
  assertIsRealNumber,
} = require('./helpers.js');

const Angle = HyperbolicCanvas.Angle;

describe('Angle', function () {
  it('converts from degrees to radians', function () {
    var degrees = Math.random() * 360;
    var radians = Angle.fromDegrees(degrees);
    assertIsRealNumber(radians);
    assert.strictEqual(radians, Angle.normalize(radians));
    assertApproximate(radians / Math.TAU, degrees / 360);
  });

  it('finds the angle of a slope', function () {
    var slope = (Math.random() - 0.5) * 100;
    assertApproximate(Angle.fromSlope(slope), Math.atan(slope));
  });

  it('normalizes angles to within 0 and TAU', function () {
    var angle = Angle.normalize((Math.random() - 0.5) * 100);
    assert(angle > 0);
    assert(angle < Math.TAU);
  });

  it('generates a random angle in a given quadrant', function () {
    [1, 2, 3, 4].forEach(function (q) {
      var angle = Angle.random(q);
      assert(angle > (Math.PI / 2) * (q - 1));
      assert(angle < (Math.PI / 2) * q);
    });
  });

  describe('generated at random', function () {
    var angle;
    beforeEach(function () {
      angle = Angle.random();
    });

    it('is between 0 and tau', function () {
      assertIsRealNumber(angle);
      assert(angle > 0);
      assert(angle < Math.TAU);
    });

    it('converts to degrees', function () {
      assertApproximate(Angle.toDegrees(angle), (angle * 360) / Math.TAU);
    });

    it('has opposite angle', function () {
      var opposite = Angle.opposite(angle);
      assertApproximate(
        opposite,
        angle < Math.PI ? angle + Math.PI : angle - Math.PI,
      );
      assert.strictEqual(opposite, Angle.normalize(opposite));
    });

    it('has equivalent slope', function () {
      var slope = Angle.toSlope(angle);
      assertIsRealNumber(slope);
      assertApproximate(slope, Math.tan(angle));
    });
  });
});
