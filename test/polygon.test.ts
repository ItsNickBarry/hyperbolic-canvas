import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  HyperbolicCanvas,
  assertApproximate,
  assertIsA,
} from './helpers.js';

const Polygon = HyperbolicCanvas.Polygon;

describe('Polygon', function () {
  let polygon: InstanceType<typeof Polygon>;

  describe('given n vertices', function () {
    let vertices: InstanceType<typeof HyperbolicCanvas.Point>[], n: number;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      vertices = [];
      for (let i = 0; i < n; i++) {
        vertices.push(HyperbolicCanvas.Point.random());
      }
      polygon = Polygon.givenVertices(vertices);
    });

    it('has n vertices of type Point', function () {
      const verts = polygon.getVertices() as InstanceType<typeof HyperbolicCanvas.Point>[];
      assertIsA(verts, Array);
      assert.strictEqual(verts.length, n);
      verts.forEach(function (vertex) {
        assertIsA(vertex, HyperbolicCanvas.Point);
      });
    });

    it('has n lines of type Line', function () {
      const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
      assert.strictEqual(lines.length, n);
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, HyperbolicCanvas.Line);
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
        const angle = HyperbolicCanvas.Angle.random();
        baseAngles.push(angle);
        total += angle;
      }
      const angles = [];
      let currentAngle = 0;
      for (let i = 0; i < baseAngles.length; i++) {
        const angle = (baseAngles[i] * Math.TAU) / total;
        angles.push((currentAngle += angle));
      }
      polygon = Polygon.givenAnglesOfIdealVertices(angles);
    });

    it('has n lines of infinite hyperbolic length', function () {
      const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, HyperbolicCanvas.Line);
        assert.strictEqual(line.getHyperbolicLength(), Infinity);
      });
    });
  });

  describe('given side count, center, radius', function () {
    let n: number;
    let center: InstanceType<typeof HyperbolicCanvas.Point>;
    let radius: number;
    let rotation: number;

    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      center = HyperbolicCanvas.Point.random();
      rotation = HyperbolicCanvas.Angle.random();
    });

    describe('in Euclidean context', function () {
      beforeEach(function () {
        radius = Math.random();
        polygon = Polygon.givenEuclideanNCenterRadius(
          n,
          center,
          radius,
          rotation,
        );
      });

      it('has n vertices of type Point', function () {
        const verts = polygon.getVertices() as InstanceType<typeof HyperbolicCanvas.Point>[];
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        const firstVertex = polygon.getVertices()[0] as InstanceType<typeof HyperbolicCanvas.Point>;
        assertApproximate(
          firstVertex.euclideanAngleFrom(center),
          rotation,
        );
      });

      it('has n lines of type Line', function () {
        const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal Euclidean length', function () {
        const lengths = [];
        const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
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
        );
      });

      it('has n vertices of type Point', function () {
        const verts = polygon.getVertices() as InstanceType<typeof HyperbolicCanvas.Point>[];
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        const firstVertex = polygon.getVertices()[0] as InstanceType<typeof HyperbolicCanvas.Point>;
        assertApproximate(
          firstVertex.hyperbolicAngleFrom(center),
          rotation,
        );
      });

      it('has n lines of type Line', function () {
        const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal hyperbolic length', function () {
        const lengths = [];
        const lines = polygon.getLines() as InstanceType<typeof HyperbolicCanvas.Line>[];
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
