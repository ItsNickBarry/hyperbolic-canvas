import { Canvas, Point, Line } from '../src/index.js';
import { assertIsRealNumber, assertIsA } from './helpers.js';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

describe('Canvas', function () {
  let canvas: InstanceType<typeof Canvas>;

  beforeEach(function () {
    const diameter = 200;
    const ctx = createCanvas(diameter, diameter).getContext('2d');
    canvas = new Canvas(ctx);
  });

  it('has a radius and diameter', function () {
    assertIsRealNumber(canvas.getRadius());
    assertIsRealNumber(canvas.getDiameter());
    assert.strictEqual(canvas.getDiameter(), canvas.getRadius() * 2);
  });

  describe('when converting canvas coordinates to a Point', function () {
    it('returns a Point', function () {
      const coordinates = [
        canvas.getRadius() * Math.random(),
        canvas.getRadius() * Math.random(),
      ];
      const point = canvas.getPoint(coordinates);
      assertIsA(point, Point);
    });
  });

  it('sets multiple context properties', function () {
    const ctx = canvas.getContext();
    const properties: Partial<CanvasRenderingContext2D> = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    canvas.setContextProperties(properties);

    for (const property in properties) {
      assert.strictEqual(
        ctx[property as keyof CanvasRenderingContext2D],
        properties[property as keyof typeof properties],
      );
    }
  });

  it('sets single context property', function () {
    const ctx = canvas.getContext();
    const properties: Partial<CanvasRenderingContext2D> = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    for (const property in properties) {
      canvas.setContextProperty(
        property,
        properties[property as keyof typeof properties],
      );
      assert.strictEqual(
        ctx[property],
        properties[property as keyof typeof properties],
      );
    }
  });

  describe('when converting a Point to canvas coordinates', function () {
    it('returns an Array with length of 2', function () {
      const point = Point.random();
      const coordinates = canvas.getCoordinates(point);
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
    let object: InstanceType<typeof Line>;
    beforeEach(function () {
      object = Line.givenTwoPoints(
        Point.random(),
        Point.random(),
      );
    });

    it('returns CanvasRenderingContext2D by default', function () {
      assertIsA(canvas.pathForEuclidean(object), CanvasRenderingContext2D);
      assertIsA(canvas.pathForHyperbolic(object), CanvasRenderingContext2D);
    });

    it('returns input path if given', function () {
      const ctx = canvas.getContext();
      const options = { path2D: false, path: ctx };
      assert.strictEqual(canvas.pathForEuclidean(object, options), ctx);
      assert.strictEqual(canvas.pathForHyperbolic(object, options), ctx);
    });

    // TODO: test Path2D behavior once path2d polyfill is added as a dependency
    it('returns CanvasRenderingContext2D if Path2D is requested but unavailable', function () {
      const options = { path2D: true, path: false };
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
