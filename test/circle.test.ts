import { TAU } from '../src/constants.js';
import { Angle, Circle, Line, Point } from '../src/index.js';
import { assertApproximate, assertIsRealNumber, assertIsA } from './helpers.js';
import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

describe('Circle', function () {
  let circle: Circle;

  describe('on hyperbolic plane', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        Point.random(),
        Math.random() * 10,
      );
    });

    it('is clonable', function () {
      const clone = circle.clone();
      assertIsA(clone, Circle);
      assert.notStrictEqual(clone, circle);
      assert(circle.equals(clone));

      assert(circle.getEuclideanCenter().equals(clone.getEuclideanCenter()));
      assertApproximate(
        circle.getEuclideanRadius(),
        clone.getEuclideanRadius(),
      );
      assert(
        (circle.getHyperbolicCenter() as Point).equals(
          clone.getHyperbolicCenter() as Point,
        ),
      );
      assertApproximate(
        circle.getHyperbolicRadius(),
        clone.getHyperbolicRadius(),
      );
    });

    it('equals equivalent Circle', function () {
      const otherCircle = Circle.givenHyperbolicCenterRadius(
        circle.getHyperbolicCenter() as Point,
        circle.getHyperbolicRadius(),
      );
      assert(circle.equals(otherCircle));
    });

    it('has Euclidean area', function () {
      assertIsRealNumber(circle.getEuclideanArea());
    });

    it('has Euclidean center', function () {
      assertIsA(circle.getEuclideanCenter(), Point);
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
      assertIsA(circle.getHyperbolicCenter(), Point);
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
      assert.strictEqual(Circle.intersects(circle, Circle.UNIT), false);
    });

    it('is on plane', function () {
      assert.strictEqual(circle.isOnPlane(), true);
    });

    it('contains Point within its radius', function () {
      const point = circle
        .getEuclideanCenter()
        .euclideanDistantPoint(
          circle.getEuclideanRadius() * 0.9 * Math.random(),
          Angle.random(),
        );
      assert(circle.containsPoint(point));
    });

    it('includes Point on its circumference', function () {
      const point = circle
        .getEuclideanCenter()
        .euclideanDistantPoint(circle.getEuclideanRadius(), Angle.random());
      assert(circle.includesPoint(point));
    });

    it('has Euclidean tangent line at given angle', function () {
      const angle = Angle.random();
      assertIsA(circle.euclideanTangentAtAngle(angle), Line);
    });

    it('has Euclidean tangent line at angle of given Point', function () {
      const point = Point.random();
      assertIsA(circle.euclideanTangentAtPoint(point), Line);
    });

    describe('when mapping angles from center to Points on edge', function () {
      let angle: number;
      let point: Point;

      describe('along Euclidean geodesics', function () {
        it('has angle from center towards Point', function () {
          point = Point.random();
          angle = circle.euclideanAngleAt(point);
          assertIsRealNumber(angle);
        });

        it('has Point on edge at given angle', function () {
          angle = Angle.random();
          point = circle.euclideanPointAt(angle);
          assertIsA(point, Point);
          assertApproximate(circle.euclideanAngleAt(point), angle);
        });
      });

      describe('along hyperbolic geodesics', function () {
        it('has angle from center towards Point', function () {
          point = Point.random();
          angle = circle.hyperbolicAngleAt(point);
          assertIsRealNumber(angle);
        });

        it('has Point on edge at given angle', function () {
          angle = Angle.random();
          point = circle.hyperbolicPointAt(angle) as Point;
          assertIsA(point, Point);

          assertApproximate(circle.hyperbolicAngleAt(point), angle);
        });
      });
    });

    describe('at coordinate', function () {
      let euclideanCenter: InstanceType<typeof Point>;
      let euclideanRadius: number;
      let hyperbolicCenter: InstanceType<typeof Point>;
      let hyperbolicRadius: number;

      beforeEach(function () {
        euclideanCenter = circle.getEuclideanCenter();
        euclideanRadius = circle.getEuclideanRadius();
        hyperbolicCenter = circle.getHyperbolicCenter() as Point;
        hyperbolicRadius = circle.getHyperbolicRadius();
      });

      describe('x', function () {
        let x: number;
        describe('within Euclidean radius of center', function () {
          beforeEach(function () {
            x =
              euclideanCenter.getX() + euclideanRadius * (Math.random() - 0.5);
          });

          it('has two y values', function () {
            const values = circle.yAtX(x) as number[];

            assertIsA(values, Array);
            assert.strictEqual(values.length, 2);

            values.forEach(function (value) {
              assertIsRealNumber(value);
            });
          });

          it('has two Points', function () {
            const points = circle.pointsAtX(x) as InstanceType<typeof Point>[];

            assertIsA(points, Array);
            assert.strictEqual(points.length, 2);

            points.forEach(function (pt) {
              assertIsA(pt, Point);
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
            const values = circle.yAtX(x) as number[];

            assertIsA(values, Array);
            assert.strictEqual(values.length, 1);
            assertIsRealNumber(values[0]);
          });

          it('has one Point', function () {
            const points = circle.pointsAtX(x) as InstanceType<typeof Point>[];

            assertIsA(points, Array);
            assert.strictEqual(points.length, 1);
            assertIsA(points[0], Point);
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
            const values = circle.yAtX(x);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 0);
          });

          it('has zero Points', function () {
            const points = circle.pointsAtX(x);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 0);
          });
        });
      });

      describe('y', function () {
        let y: number;
        describe('within Euclidean radius of center', function () {
          beforeEach(function () {
            y =
              euclideanCenter.getY() + euclideanRadius * (Math.random() - 0.5);
          });

          it('has two x values', function () {
            const values = circle.xAtY(y) as number[];

            assertIsA(values, Array);
            assert.strictEqual(values.length, 2);

            values.forEach(function (value) {
              assertIsRealNumber(value);
            });
          });

          it('has two Points', function () {
            const points = circle.pointsAtY(y) as InstanceType<typeof Point>[];

            assertIsA(points, Array);
            assert.strictEqual(points.length, 2);

            points.forEach(function (pt) {
              assertIsA(pt, Point);
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
            const values = circle.xAtY(y) as number[];

            assertIsA(values, Array);
            assert.strictEqual(values.length, 1);
            assertIsRealNumber(values[0]);
          });

          it('has one Point', function () {
            const points = circle.pointsAtY(y) as InstanceType<typeof Point>[];

            assertIsA(points, Array);
            assert.strictEqual(points.length, 1);
            assertIsA(points[0], Point);
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
            const values = circle.xAtY(y);

            assertIsA(values, Array);
            assert.strictEqual(values.length, 0);
          });

          it('has zero Points', function () {
            const points = circle.pointsAtY(y);

            assertIsA(points, Array);
            assert.strictEqual(points.length, 0);
          });
        });
      });
    });
  });

  describe('not on hyperbolic plane', function () {
    beforeEach(function () {
      const center = Point.random();
      circle = Circle.givenEuclideanCenterRadius(
        center,
        (1 - center.getEuclideanRadius()) * (1 + Math.random()),
      );
    });

    it('has Euclidean area', function () {
      assertIsRealNumber(circle.getEuclideanArea());
    });

    it('has Euclidean center', function () {
      assertIsA(circle.getEuclideanCenter(), Point);
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
      assert.throws(() => circle.getHyperbolicArea(), /Circle is not on hyperbolic plane/);
    });

    it('does not have hyperbolic center', function () {
      assert.throws(() => circle.getHyperbolicCenter(), /Circle is not on hyperbolic plane/);
    });

    it('does not have hyperbolic circumference', function () {
      assert.throws(() => circle.getHyperbolicCircumference(), /Circle is not on hyperbolic plane/);
    });

    it('does not have hyperbolic diameter', function () {
      assert.throws(() => circle.getHyperbolicDiameter(), /Circle is not on hyperbolic plane/);
    });

    it('does not have hyperbolic radius', function () {
      assert.throws(() => circle.getHyperbolicRadius(), /Circle is not on hyperbolic plane/);
    });

    it('is not on plane', function () {
      assert.strictEqual(circle.isOnPlane(), false);
    });
  });

  describe('given Euclidean center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenEuclideanCenterRadius(Point.random(), Math.random());
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('given hyperbolic center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        Point.random(),
        Math.random() * 10,
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });

    it('throws when center is not on plane', function () {
      assert.throws(function () {
        Circle.givenHyperbolicCenterRadius(Point.givenIdealAngle(0), 1);
      }, /Center must be on hyperbolic plane/);
    });
  });

  describe('given two points', function () {
    beforeEach(function () {
      circle = Circle.givenTwoPoints(Point.random(), Point.random());
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });
  });

  describe('given three points', function () {
    beforeEach(function () {
      circle = Circle.givenThreePoints(
        Point.random(),
        Point.random(),
        Point.random(),
      );
    });

    it('is a Circle', function () {
      assertIsA(circle, Circle);
    });

    it('throws when points are not unique', function () {
      const p0 = Point.random();
      const p1 = Point.random();

      assert.throws(function () {
        Circle.givenThreePoints(p0, p0, p1);
      }, /Points must be unique/);
      assert.throws(function () {
        Circle.givenThreePoints(p0, p1, p0);
      }, /Points must be unique/);
      assert.throws(function () {
        Circle.givenThreePoints(p1, p0, p0);
      }, /Points must be unique/);
      assert.throws(function () {
        Circle.givenThreePoints(p0, p0, p0);
      }, /Points must be unique/);
    });

    it('throws when points are colinear', function () {
      const p0 = Point.random();
      const p1 = Point.random();
      // Use midpoint to create a third colinear point
      const p2 = Point.euclideanBetween(p0, p1);
      assert.throws(function () {
        Circle.givenThreePoints(p0, p1, p2);
      }, /Points must not be colinear/);
    });
  });

  describe('intersects', function () {
    let c0: InstanceType<typeof Circle>;
    let c1: InstanceType<typeof Circle>;

    beforeEach(function () {
      c0 = Circle.givenEuclideanCenterRadius(Point.random(), Math.random());
    });

    describe('where Circles are too far apart to intersect', function () {
      beforeEach(function () {
        c1 = Circle.givenEuclideanCenterRadius(
          c0.getEuclideanCenter().euclideanDistantPoint(2, Angle.random()),
          1,
        );
      });

      it('is false', function () {
        assert.strictEqual(Circle.intersects(c0, c1), false);
      });
    });

    describe('where one Circle is contained within the other', function () {
      beforeEach(function () {
        const r = c0.getEuclideanRadius();
        c1 = Circle.givenEuclideanCenterRadius(
          c0
            .getEuclideanCenter()
            .euclideanDistantPoint((r / 2) * Math.random(), Angle.random()),
          (r / 2) * Math.random(),
        );
      });

      it('is false', function () {
        assert.strictEqual(Circle.intersects(c0, c1), false);
      });
    });

    describe('where Circles intersect', function () {
      beforeEach(function () {
        const center = c0
          .getEuclideanCenter()
          .euclideanDistantPoint(c0.getEuclideanRadius(), Angle.random());
        c1 = Circle.givenEuclideanCenterRadius(center, c0.getEuclideanRadius());
      });

      it('is an Array of two Points', function () {
        const intersects = Circle.intersects(c0, c1) as InstanceType<
          typeof Point
        >[];
        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);
        intersects.forEach(function (intersect) {
          assertIsA(intersect, Point);
        });
      });
    });

    describe('where circles are coincident', function () {
      it('returns false', function () {
        const c0 = Circle.givenEuclideanCenterRadius(Point.ORIGIN, 0.5);
        const c1 = Circle.givenEuclideanCenterRadius(Point.ORIGIN, 0.5);
        assert.strictEqual(Circle.intersects(c0, c1), false);
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
      assert.strictEqual(circle.getEuclideanCenter(), Point.ORIGIN);
      assert.strictEqual(circle.getHyperbolicCenter(), Point.ORIGIN);
    });

    it('has Euclidean area of pi', function () {
      assert.strictEqual(circle.getEuclideanArea(), Math.PI);
    });

    it('has Euclidean circumference of tau', function () {
      assert.strictEqual(circle.getEuclideanCircumference(), TAU);
    });

    it('has Euclidean radius of 1', function () {
      assert.strictEqual(circle.getEuclideanRadius(), 1);
    });

    it('has Euclidean diameter of 2', function () {
      assert.strictEqual(circle.getEuclideanDiameter(), 2);
    });

    it('calculates angle towards Point along Euclidean geodesic', function () {
      const point = Point.random();
      assertApproximate(circle.euclideanAngleAt(point), point.getAngle());
    });

    it('calculates Point in direction of angle along Euclidean geodesic', function () {
      const angle = Angle.random();
      assert(
        circle
          .euclideanPointAt(angle)
          .equals(Point.givenEuclideanPolarCoordinates(1, angle)),
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
      const point = Point.random();
      assertApproximate(circle.hyperbolicAngleAt(point), point.getAngle());
    });

    it('calculates Point in direction of angle along hyperbolic geodesic', function () {
      const angle = Angle.random();
      assert(
        (circle.hyperbolicPointAt(angle) as Point).equals(
          Point.givenEuclideanPolarCoordinates(1, angle),
        ),
      );
    });
  });
});
