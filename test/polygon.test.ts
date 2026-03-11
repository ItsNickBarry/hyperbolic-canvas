import { Angle, Line, Polygon, Point } from '../src/index.js';
import { assertApproximate, assertIsA } from './helpers.js';
import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

describe('Polygon', function () {
  let polygon: InstanceType<typeof Polygon>;

  describe('given n vertices', function () {
    let vertices: InstanceType<typeof Point>[], n: number;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      vertices = [];
      for (let i = 0; i < n; i++) {
        vertices.push(Point.random());
      }
      polygon = Polygon.givenVertices(vertices) as Polygon;
    });

    it('has n vertices of type Point', function () {
      const verts = polygon.getVertices() as InstanceType<typeof Point>[];
      assertIsA(verts, Array);
      assert.strictEqual(verts.length, n);
      verts.forEach(function (vertex) {
        assertIsA(vertex, Point);
      });
    });

    it('has n lines of type Line', function () {
      const lines = polygon.getLines() as InstanceType<typeof Line>[];
      assert.strictEqual(lines.length, n);
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, Line);
      });
    });
  });

  describe('given n angles of ideal points', function () {
    let n: number;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      const baseAngles = [];
      let total = 0;
      for (let i = 0; i < n; i++) {
        const angle = Angle.random();
        baseAngles.push(angle);
        total += angle;
      }
      const angles = [];
      let currentAngle = 0;
      for (let i = 0; i < baseAngles.length; i++) {
        const angle = (baseAngles[i] * Math.TAU) / total;
        angles.push((currentAngle += angle));
      }
      polygon = Polygon.givenAnglesOfIdealVertices(angles) as Polygon;
    });

    it('has n lines of infinite hyperbolic length', function () {
      const lines = polygon.getLines() as InstanceType<typeof Line>[];
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, Line);
        assert.strictEqual(line.getHyperbolicLength(), Infinity);
      });
    });
  });

  describe('given side count, center, radius', function () {
    let n: number;
    let center: InstanceType<typeof Point>;
    let radius: number;
    let rotation: number;

    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      center = Point.random();
      rotation = Angle.random();
    });

    describe('in Euclidean context', function () {
      beforeEach(function () {
        radius = Math.random();
        polygon = Polygon.givenEuclideanNCenterRadius(
          n,
          center,
          radius,
          rotation,
        ) as Polygon;
      });

      it('has n vertices of type Point', function () {
        const verts = polygon.getVertices() as InstanceType<typeof Point>[];
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        const firstVertex = polygon.getVertices()[0] as InstanceType<
          typeof Point
        >;
        assertApproximate(firstVertex.euclideanAngleFrom(center), rotation);
      });

      it('has n lines of type Line', function () {
        const lines = polygon.getLines() as InstanceType<typeof Line>[];
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, Line);
        });
      });

      it('has lines of equal Euclidean length', function () {
        const lengths: number[] = [];
        const lines = polygon.getLines() as InstanceType<typeof Line>[];
        lines.forEach(function (line) {
          lengths.push(line.getEuclideanLength());
        });
        const count = lengths.length;
        for (let i = 0; i < count; i++) {
          assertApproximate(lengths[i], lengths[(i + 1) % count]);
        }
      });
    });

    describe('in hyperbolic context', function () {
      beforeEach(function () {
        radius = Math.random() * 10;
        polygon = Polygon.givenHyperbolicNCenterRadius(
          n,
          center,
          radius,
          rotation,
        ) as Polygon;
      });

      it('has n vertices of type Point', function () {
        const verts = polygon.getVertices() as InstanceType<typeof Point>[];
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        const firstVertex = polygon.getVertices()[0] as InstanceType<
          typeof Point
        >;
        assertApproximate(firstVertex.hyperbolicAngleFrom(center), rotation);
      });

      it('has n lines of type Line', function () {
        const lines = polygon.getLines() as InstanceType<typeof Line>[];
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, Line);
        });
      });

      it('has lines of equal hyperbolic length', function () {
        const lengths: number[] = [];
        const lines = polygon.getLines() as InstanceType<typeof Line>[];
        lines.forEach(function (line) {
          lengths.push(line.getHyperbolicLength());
        });
        const count = lengths.length;
        for (let i = 0; i < count; i++) {
          assertApproximate(lengths[i], lengths[(i + 1) % count]);
        }
      });
    });
  });
});
