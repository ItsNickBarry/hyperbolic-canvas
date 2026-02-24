const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  HyperbolicCanvas,
  assertApproximate,
  assertIsA,
} = require('./helpers.js');

const Polygon = HyperbolicCanvas.Polygon;

describe('Polygon', function () {
  var polygon;

  describe('given n vertices', function () {
    var vertices, n;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      vertices = [];
      for (var i = 0; i < n; i++) {
        vertices.push(HyperbolicCanvas.Point.random());
      }
      polygon = Polygon.givenVertices(vertices);
    });

    it('has n vertices of type Point', function () {
      var verts = polygon.getVertices();
      assertIsA(verts, Array);
      assert.strictEqual(verts.length, n);
      verts.forEach(function (vertex) {
        assertIsA(vertex, HyperbolicCanvas.Point);
      });
    });

    it('has n lines of type Line', function () {
      var lines = polygon.getLines();
      assert.strictEqual(lines.length, n);
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, HyperbolicCanvas.Line);
      });
    });
  });

  describe('given n angles of ideal points', function () {
    var n;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      var baseAngles = [];
      var total = 0;
      for (var i = 0; i < n; i++) {
        var angle = HyperbolicCanvas.Angle.random();
        baseAngles.push(angle);
        total += angle;
      }
      var angles = [];
      var currentAngle = 0;
      for (var i = 0; i < baseAngles.length; i++) {
        var angle = (baseAngles[i] * Math.TAU) / total;
        angles.push((currentAngle += angle));
      }
      polygon = Polygon.givenAnglesOfIdealVertices(angles);
    });

    it('has n lines of infinite hyperbolic length', function () {
      var lines = polygon.getLines();
      assertIsA(lines, Array);
      lines.forEach(function (line) {
        assertIsA(line, HyperbolicCanvas.Line);
        assert.strictEqual(line.getHyperbolicLength(), Infinity);
      });
    });
  });

  describe('given side count, center, radius', function () {
    var n, center, radius, rotation;
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
        var verts = polygon.getVertices();
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        assertApproximate(
          polygon.getVertices()[0].euclideanAngleFrom(center),
          rotation,
        );
      });

      it('has n lines of type Line', function () {
        var lines = polygon.getLines();
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal Euclidean length', function () {
        var lengths = [];
        polygon.getLines().forEach(function (line) {
          lengths.push(line.getEuclideanLength());
        });
        var count = lengths.length;
        for (var i = 0; i < count; i++) {
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
        var verts = polygon.getVertices();
        assertIsA(verts, Array);
        assert.strictEqual(verts.length, n);
        verts.forEach(function (vertex) {
          assertIsA(vertex, HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        assertApproximate(
          polygon.getVertices()[0].hyperbolicAngleFrom(center),
          rotation,
        );
      });

      it('has n lines of type Line', function () {
        var lines = polygon.getLines();
        assert.strictEqual(lines.length, n);
        assertIsA(lines, Array);
        lines.forEach(function (line) {
          assertIsA(line, HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal hyperbolic length', function () {
        var lengths = [];
        polygon.getLines().forEach(function (line) {
          lengths.push(line.getHyperbolicLength());
        });
        var count = lengths.length;
        for (var i = 0; i < count; i++) {
          assertApproximate(lengths[i], lengths[(i + 1) % count]);
        }
      });
    });
  });
});
