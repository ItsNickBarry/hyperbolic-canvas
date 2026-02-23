const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { createCanvas, CanvasRenderingContext2D } = require('canvas');
const {
  HyperbolicCanvas,
  assertIsRealNumber,
  assertIsA,
} = require('./helpers.js');

describe('Canvas', function () {
  let canvas;

  beforeEach(function () {
    let diameter = 200;
    let ctx = createCanvas(diameter, diameter).getContext('2d');
    canvas = new HyperbolicCanvas.Canvas(ctx);
  });

  it('has a radius and diameter', function () {
    assertIsRealNumber(canvas.getRadius());
    assertIsRealNumber(canvas.getDiameter());
    assert.strictEqual(canvas.getDiameter(), canvas.getRadius() * 2);
  });

  describe('when converting canvas coordinates to a Point', function () {
    it('returns a Point', function () {
      let coordinates = [
        canvas.getRadius() * Math.random(),
        canvas.getRadius() * Math.random(),
      ];
      let point = canvas.at(coordinates);
      assertIsA(point, HyperbolicCanvas.Point);
    });
  });

  it('sets multiple context properties', function () {
    let ctx = canvas.getContext();
    let properties = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    canvas.setContextProperties(properties);

    for (let property in properties) {
      assert.strictEqual(ctx[property], properties[property]);
    }
  });

  it('sets single context property', function () {
    let ctx = canvas.getContext();
    let properties = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    for (let property in properties) {
      canvas.setContextProperty(property, properties[property]);
      assert.strictEqual(ctx[property], properties[property]);
    }
  });

  describe('when converting a Point to canvas coordinates', function () {
    it('returns an Array with length of 2', function () {
      let point = HyperbolicCanvas.Point.random();
      let coordinates = canvas.at(point);
      assertIsA(coordinates, Array);
      assert.strictEqual(coordinates.length, 2);
      coordinates.forEach(function (n) {
        assert(n > 0, `Expected ${n} to be greater than 0`);
        assert(
          n < canvas.getDiameter(),
          `Expected ${n} to be less than ${canvas.getDiameter()}`,
        );
      });
    });
  });

  describe('when generating path', function () {
    let object;
    beforeEach(function () {
      object = HyperbolicCanvas.Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
    });

    it('returns CanvasRenderingContext2D by default', function () {
      assertIsA(canvas.pathForEuclidean(object), CanvasRenderingContext2D);
      assertIsA(canvas.pathForHyperbolic(object), CanvasRenderingContext2D);
    });

    it('returns input path if given', function () {
      let ctx = canvas.getContext();
      let options = { path2D: false, path: ctx };
      assert.strictEqual(canvas.pathForEuclidean(object, options), ctx);
      assert.strictEqual(canvas.pathForHyperbolic(object, options), ctx);
    });

    it('returns CanvasRenderingContext2D if Path2D is requested but unavailable', function () {
      let options = { path2D: true, path: false };
      assertIsA(
        canvas.pathForEuclidean(object, options),
        CanvasRenderingContext2D,
      );
      assertIsA(
        canvas.pathForHyperbolic(object, options),
        CanvasRenderingContext2D,
      );
    });
  });
});
