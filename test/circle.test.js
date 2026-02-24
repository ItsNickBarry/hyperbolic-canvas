const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  HyperbolicCanvas,
  assertApproximate,
  assertIsRealNumber,
  assertIsA,
} = require('./helpers.js');

const Circle = HyperbolicCanvas.Circle;

describe('Circle', function () {
  var circle;

  describe('on hyperbolic plane', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10,
      );
    });

    it('is clonable', function () {
      var clone = circle.clone();
      assertIsA(clone, Circle);
      assert.notStrictEqual(clone, circle);
      assert(circle.equals(clone));

      assert(circle.getEuclideanCenter().equals(clone.getEuclideanCenter()));
      assertApproximate(
        circle.getEuclideanRadius(),
        clone.getEuclideanRadius(),
      );
      assert(circle.getHyperbolicCenter().equals(clone.getHyperbolicCenter()));
      assertApproximate(
        circle.getHyperbolicRadius(),
        clone.getHyperbolicRadius(),
      );
    });

    it('equals equivalent Circle', function () {
      var otherCircle = Circle.givenHyperbolicCenterRadius(
        circle.getHyperbolicCenter(),
        circle.getHyperbolicRadius(),
      );
      assert(circle.equals(otherCircle));
    });

    it('has Euclidean area', function () {
      assertIsRealNumber(circle.getEuclideanArea());
    });

    it('has Euclidean center', function () {
      assertIsA(circle.getEuclideanCenter(), HyperbolicCanvas.Point);
    });

    it('has Euclidean circumference', function () {
      assertIsRealNumber(circle.getEuclideanCircumference());
    });

    it('has Euclidean diameter', function () {
      assertIsRealNumber(circle.getEuclideanDiameter());
    });

    it('has Euclidean radius', function () {
      assertIsRealNumber(circle.getEuclideanRadius());
    });

    it('has hyperbolic area', function () {
      assertIsRealNumber(circle.getHyperbolicArea());
    });

    it('has hyperbolic center', function () {
      assertIsA(circle.getHyperbolicCenter(), HyperbolicCanvas.Point);
    });

    it('has hyperbolic circumference', function () {
      assertIsRealNumber(circle.getHyperbolicCircumference());
    });

    it('has hyperbolic diameter', function () {
      assertIsRealNumber(circle.getHyperbolicDiameter());
    });

    it('has hyperbolic radius', function () {
      assertIsRealNumber(circle.getHyperbolicRadius());
    });

    it('does not have unit circle intersects', function () {
      assert.strictEqual(circle.getUnitCircleIntersects(), false);
    });

    it('contains Point within its radius', function () {
      var point = circle
        .getEuclideanCenter()
        .euclideanDistantPoint(
          circle.getEuclideanRadius() * 0.9 * Math.random(),
          HyperbolicCanvas.Angle.random(),
        );
      assert(circle.containsPoint(point));
    });

    it('includes Point on its circumference', function () {
      var point = circle
        .getEuclideanCenter()
        .euclideanDistantPoint(
          circle.getEuclideanRadius(),
          HyperbolicCanvas.Angle.random(),
        );
      assert(circle.includesPoint(point));
    });

    it('has Euclidean tangent line at given angle', function () {
      var angle = HyperbolicCanvas.Angle.random();
      assertIsA(circle.euclideanTangentAtAngle(angle), HyperbolicCanvas.Line);
    });

    it('has Euclidean tangent line at angle of given Point', function () {
      var point = HyperbolicCanvas.Point.random();
      assertIsA(circle.euclideanTangentAtPoint(point), HyperbolicCanvas.Line);
    });

    describe('when mapping angles from center to Points on edge', function () {
      var angle, point;
      describe('along Euclidean geodesics', function () {
        it('has angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.euclideanAngleAt(point);
          assertIsRealNumber(angle);
        });

        it('has Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.euclideanPointAt(angle);
          assertIsA(point, HyperbolicCanvas.Point);
          assertApproximate(circle.euclideanAngleAt(point), angle);
        });
      });

      describe('along hyperbolic geodesics', function () {
        it('has angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.hyperbolicAngleAt(point);
          assertIsRealNumber(angle);
        });

        it('has Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.hyperbolicPointAt(angle);
          assertIsA(point, HyperbolicCanvas.Point);

          assertApproximate(circle.hyperbolicAngleAt(point), angle);
        });
      });
    });

    describe('at coordinate', function () {
      var euclideanCenter, euclideanRadius, hyperbolicCenter, hyperbolicRadius;
      beforeEach(function () {
        euclideanCenter = circle.getEuclideanCenter();
        euclideanRadius = circle.getEuclideanRadius();
        hyperbolicCenter = circle.getHyperbolicCenter();
        hyperbolicRadius = circle.getHyperbolicRadius();
      });

      describe('x', function () {
        var x;
        describe('within Euclidean radius of center', function () {
          beforeEach(function () {
            x =
              euclideanCenter.getX() + euclideanRadius * (Math.random() - 0.5);
          });

          it('has two y values', function () {
            var values = circle.yAtX(x);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 2);

            values.forEach(function (value) {
              assertIsRealNumber(value);
            });
          });

          it('has two Points', function () {
            var points = circle.pointsAtX(x);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 2);

            points.forEach(function (pt) {
              assertIsA(pt, HyperbolicCanvas.Point);
              assertApproximate(
                pt.euclideanDistanceTo(euclideanCenter),
                euclideanRadius,
              );
              assertApproximate(
                pt.hyperbolicDistanceTo(hyperbolicCenter),
                hyperbolicRadius,
              );
            });
          });
        });

        describe('at Euclidean radius from center', function () {
          beforeEach(function () {
            x =
              euclideanCenter.getX() +
              euclideanRadius * (Math.random() > 0.5 ? 1 : -1);
          });

          it('has one y value', function () {
            var values = circle.yAtX(x);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 1);
            assertIsRealNumber(values[0]);
          });

          it('has one Point', function () {
            var points = circle.pointsAtX(x);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 1);
            assertIsA(points[0], HyperbolicCanvas.Point);
            assertApproximate(
              points[0].euclideanDistanceTo(euclideanCenter),
              euclideanRadius,
            );
            assertApproximate(
              points[0].hyperbolicDistanceTo(hyperbolicCenter),
              hyperbolicRadius,
            );
          });
        });

        describe('outside of Euclidean radius from center', function () {
          beforeEach(function () {
            x =
              euclideanCenter.getX() +
              euclideanRadius *
                (Math.random() > 0.5 ? 1 + Math.random() : -1 - Math.random());
          });

          it('has zero y values', function () {
            var values = circle.yAtX(x);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 0);
          });

          it('has zero Points', function () {
            var points = circle.pointsAtX(x);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 0);
          });
        });
      });

      describe('y', function () {
        var y;
        describe('within Euclidean radius of center', function () {
          beforeEach(function () {
            y =
              euclideanCenter.getY() + euclideanRadius * (Math.random() - 0.5);
          });

          it('has two x values', function () {
            var values = circle.xAtY(y);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 2);

            values.forEach(function (value) {
              assertIsRealNumber(value);
            });
          });

          it('has two Points', function () {
            var points = circle.pointsAtY(y);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 2);

            points.forEach(function (pt) {
              assertIsA(pt, HyperbolicCanvas.Point);
              assertApproximate(
                pt.euclideanDistanceTo(euclideanCenter),
                euclideanRadius,
              );
              assertApproximate(
                pt.hyperbolicDistanceTo(hyperbolicCenter),
                hyperbolicRadius,
              );
            });
          });
        });

        describe('at Euclidean radius from center', function () {
          beforeEach(function () {
            y =
              euclideanCenter.getY() +
              euclideanRadius * (Math.random() > 0.5 ? 1 : -1);
          });

          it('has one x value', function () {
            var values = circle.xAtY(y);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 1);
            assertIsRealNumber(values[0]);
          });

          it('has one Point', function () {
            var points = circle.pointsAtY(y);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 1);
            assertIsA(points[0], HyperbolicCanvas.Point);
            assertApproximate(
              points[0].euclideanDistanceTo(euclideanCenter),
              euclideanRadius,
            );
            assertApproximate(
              points[0].hyperbolicDistanceTo(hyperbolicCenter),
              hyperbolicRadius,
            );
          });
        });

        describe('outside of Euclidean radius from center', function () {
          beforeEach(function () {
            y =
              euclideanCenter.getY() +
              euclideanRadius *
                (Math.random() > 0.5 ? 1 + Math.random() : -1 - Math.random());
          });

          it('has zero x values', function () {
            var values = circle.xAtY(y);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 0);
          });

          it('has zero Points', function () {
            var points = circle.pointsAtY(y);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 0);
          });
        });
      });
    });
  });

  describe('not on hyperbolic plane', function () {
    beforeEach(function () {
      var center = HyperbolicCanvas.Point.random();
      circle = Circle.givenEuclideanCenterRadius(
        center,
        (1 - center.getEuclideanRadius()) * (1 + Math.random()),
      );
    });

    it('has Euclidean area', function () {
      assertIsRealNumber(circle.getEuclideanArea());
    });

    it('has Euclidean center', function () {
      assertIsA(circle.getEuclideanCenter(), HyperbolicCanvas.Point);
    });

    it('has Euclidean circumference', function () {
      assertIsRealNumber(circle.getEuclideanCircumference());
    });

    it('has Euclidean diameter', function () {
      assertIsRealNumber(circle.getEuclideanDiameter());
    });

    it('has Euclidean radius', function () {
      assertIsRealNumber(circle.getEuclideanRadius());
    });

    it('does not have hyperbolic area', function () {
      assert(Number.isNaN(circle.getHyperbolicArea()));
    });

    it('does not have hyperbolic center', function () {
      assert.strictEqual(circle.getHyperbolicCenter(), false);
    });

    it('does not have hyperbolic circumference', function () {
      assert(Number.isNaN(circle.getHyperbolicCircumference()));
    });

    it('does not have hyperbolic diameter', function () {
      assert(Number.isNaN(circle.getHyperbolicDiameter()));
    });

    it('does not have hyperbolic radius', function () {
      assert(Number.isNaN(circle.getHyperbolicRadius()));
    });
  });

  describe('given Euclidean center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random(),
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('given hyperbolic center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10,
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('given two points', function () {
    beforeEach(function () {
      circle = Circle.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('given three points', function () {
    beforeEach(function () {
      circle = Circle.givenThreePoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('intersects', function () {
    var c0, c1;
    beforeEach(function () {
      c0 = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random(),
      );
    });

    describe('where Circles are too far apart to intersect', function () {
      beforeEach(function () {
        c1 = Circle.givenEuclideanCenterRadius(
          c0
            .getEuclideanCenter()
            .euclideanDistantPoint(2, HyperbolicCanvas.Angle.random()),
          1,
        );
      });

      it('is false', function () {
        assert.strictEqual(Circle.intersects(c0, c1), false);
      });
    });

    describe('where one Circle is contained within the other', function () {
      beforeEach(function () {
        var r = c0.getEuclideanRadius();
        c1 = Circle.givenEuclideanCenterRadius(
          c0
            .getEuclideanCenter()
            .euclideanDistantPoint(
              (r / 2) * Math.random(),
              HyperbolicCanvas.Angle.random(),
            ),
          (r / 2) * Math.random(),
        );
      });

      it('is false', function () {
        assert.strictEqual(Circle.intersects(c0, c1), false);
      });
    });

    describe('where Circles intersect', function () {
      beforeEach(function () {
        var center = c0
          .getEuclideanCenter()
          .euclideanDistantPoint(
            c0.getEuclideanRadius(),
            HyperbolicCanvas.Angle.random(),
          );
        c1 = Circle.givenEuclideanCenterRadius(center, c0.getEuclideanRadius());
      });

      it('is an Array of two Points', function () {
        var intersects = Circle.intersects(c0, c1);
        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);
        intersects.forEach(function (intersect) {
          assertIsA(intersect, HyperbolicCanvas.Point);
        });
      });
    });
  });

  describe('UNIT', function () {
    beforeEach(function () {
      circle = Circle.UNIT;
    });

    it('is Circle', function () {
      assertIsA(circle, Circle);
    });

    it('has Euclidean and hyperbolic center at origin', function () {
      assert.strictEqual(
        circle.getEuclideanCenter(),
        HyperbolicCanvas.Point.ORIGIN,
      );
      assert.strictEqual(
        circle.getHyperbolicCenter(),
        HyperbolicCanvas.Point.ORIGIN,
      );
    });

    it('has Euclidean area of pi', function () {
      assert.strictEqual(circle.getEuclideanArea(), Math.PI);
    });

    it('has Euclidean circumference of tau', function () {
      assert.strictEqual(circle.getEuclideanCircumference(), Math.TAU);
    });

    it('has Euclidean radius of 1', function () {
      assert.strictEqual(circle.getEuclideanRadius(), 1);
    });

    it('has Euclidean diameter of 2', function () {
      assert.strictEqual(circle.getEuclideanDiameter(), 2);
    });

    it('calculates angle towards Point along Euclidean geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      assertApproximate(circle.euclideanAngleAt(point), point.getAngle());
    });

    it('calculates Point in direction of angle along Euclidean geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      assert(
        circle
          .euclideanPointAt(angle)
          .equals(
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle),
          ),
      );
    });

    it('has hyperbolic area of infinity', function () {
      assert.strictEqual(circle.getHyperbolicArea(), Infinity);
    });

    it('has hyperbolic circumference of infinity', function () {
      assert.strictEqual(circle.getHyperbolicCircumference(), Infinity);
    });

    it('has hyperbolic radius of infinity', function () {
      assert.strictEqual(circle.getHyperbolicRadius(), Infinity);
    });

    it('has hyperbolic diameter of infinity', function () {
      assert.strictEqual(circle.getHyperbolicDiameter(), Infinity);
    });

    it('calculates angle towards Point along hyperbolic geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      assertApproximate(circle.hyperbolicAngleAt(point), point.getAngle());
    });

    it('calculates Point in direction of angle along hyperbolic geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      assert(
        circle
          .hyperbolicPointAt(angle)
          .equals(
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle),
          ),
      );
    });
  });
});
