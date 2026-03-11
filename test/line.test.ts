import { Angle, Circle, Line, Point } from '../src/index.js';
import { assertApproximate, assertIsRealNumber, assertIsA } from './helpers.js';
import assert from 'node:assert';
import { describe, it, beforeEach } from 'node:test';

describe('Line', function () {
  let line: Line;

  describe('in general', function () {
    let point: Point;
    let slope: number;

    describe('with random slope', function () {
      beforeEach(function () {
        point = Point.random();
        slope = Angle.toSlope(Angle.random());
        line = Line.givenPointSlope(point, slope);
      });

      it('is cloneable', function () {
        const clone = line.clone();
        assertIsA(clone, Line);
        assert.notStrictEqual(clone, line);
        assert(line.equals(clone));

        assertApproximate(
          line.getEuclideanLength(),
          clone.getEuclideanLength(),
        );
        assertApproximate(
          line.getHyperbolicLength(),
          clone.getHyperbolicLength(),
        );

        assert(line.euclideanIncludesPoint(clone.getP0()));
        assert(clone.euclideanIncludesPoint(line.getP0()));
      });

      it('is equal to identical Line', function () {
        const otherLine = Line.givenPointSlope(line.getP0(), line.getSlope());
        assert(line.equals(otherLine));
      });

      it('includes Points in Euclidean context', function () {
        assert(line.euclideanIncludesPoint(line.getP0()));
        assert(line.euclideanIncludesPoint(line.getP1()));
        assert(
          line.euclideanIncludesPoint(
            line.pointAtEuclideanX(Math.random()) as Point,
          ),
        );
        assert(
          line.euclideanIncludesPoint(
            line.pointAtEuclideanY(Math.random()) as Point,
          ),
        );
      });

      it('is parallel to Line with same slope in Euclidean context', function () {
        const otherLine = Line.givenPointSlope(Point.random(), line.getSlope());
        assert(line.isEuclideanParallelTo(otherLine));
      });

      it('has a perpindicular slope', function () {
        assert.strictEqual(
          line.euclideanPerpindicularSlope(),
          -1 / line.getSlope(),
        );
      });

      it('has perpindicular lines', function () {
        const perpindicularLine = line.euclideanPerpindicularLineAt(
          Point.random(),
        );
        assertIsA(perpindicularLine, Line);
        assert.strictEqual(
          perpindicularLine.getSlope(),
          line.euclideanPerpindicularSlope(),
        );
        assertIsA(Line.euclideanIntersect(line, perpindicularLine), Point);
      });

      it('has a perpindicular bisector', function () {
        const bisector = line.euclideanPerpindicularBisector();
        assertIsA(bisector, Line);
        assert.strictEqual(
          bisector.getSlope(),
          line.euclideanPerpindicularSlope(),
        );
        const intersect = Line.euclideanIntersect(
          line,
          bisector,
        ) as InstanceType<typeof Point>;
        assert(line.euclideanIncludesPoint(intersect));
        assert(bisector.euclideanIncludesPoint(intersect));
      });

      it('has Point for any x value', function () {
        const p = line.pointAtEuclideanX(Math.random()) as Point;
        assertIsA(p, Point);
        assert(line.euclideanIncludesPoint(p));
      });

      it('has Point for any y value', function () {
        const p = line.pointAtEuclideanY(Math.random()) as Point;
        assertIsA(p, Point);
        assert(line.euclideanIncludesPoint(p));
      });

      it('has x value for any y value', function () {
        const y = Math.random() * 2 - 1;
        const x = line.euclideanXAtY(y) as number;
        assertIsRealNumber(x);
        assertApproximate(line.euclideanYAtX(x) as number, y);
      });

      it('has y value for any x value', function () {
        const x = Math.random() * 2 - 1;
        const y = line.euclideanYAtX(x) as number;
        assertIsRealNumber(y);
        assertApproximate(line.euclideanXAtY(y) as number, x);
      });
    });

    describe('with slope of 0', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(Point.random(), 0);
      });

      it('has a perpindicular slope', function () {
        assert.strictEqual(line.euclideanPerpindicularSlope(), Infinity);
      });

      it('has x value of true for only one y value', function () {
        assert.strictEqual(line.euclideanXAtY(Math.random()), false);
        assert.strictEqual(line.euclideanXAtY(line.getP0().getY()), true);
      });

      it('has single y value for any x value', function () {
        assert.strictEqual(
          line.euclideanYAtX(Math.random()),
          line.getP0().getY(),
        );
      });
    });

    describe('with infinite slope', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(Point.random(), Infinity);
      });

      it('has a perpindicular slope', function () {
        assert.strictEqual(line.euclideanPerpindicularSlope(), 0);
      });

      it('has single x value for any y value', function () {
        assert.strictEqual(
          line.euclideanXAtY(Math.random()),
          line.getP0().getX(),
        );
      });

      it('has y value of true for only one x value', function () {
        assert.strictEqual(line.euclideanYAtX(Math.random()), false);
        assert.strictEqual(line.euclideanYAtX(line.getP0().getX()), true);
      });
    });
  });

  describe('on hyperbolic plane', function () {
    describe('along diameter', function () {
      describe('on either side of origin', function () {
        beforeEach(function () {
          const angle = Angle.random();
          line = Line.givenTwoPoints(
            Point.givenEuclideanPolarCoordinates(Math.random(), angle),
            Point.givenEuclideanPolarCoordinates(Math.random() * -1, angle),
          );
        });

        it('is on plane', function () {
          assert(line.isOnPlane());
        });

        it('has hyperbolic geodesic Line', function () {
          assertIsA(line.getHyperbolicGeodesic(), Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          const pointOnLine = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()) +
                (Math.random() < 0.5 ? Math.PI : 0),
            );

          const otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          assert(line.hyperbolicEquals(otherLine));
        });

        it('has Euclidean length', function () {
          assertIsRealNumber(line.getEuclideanLength());
        });

        it('has Euclidean midpoint', function () {
          assertIsA(line.getEuclideanMidpoint(), Point);
        });

        it('has Euclidean intersects with Circle', function () {
          const radius = Math.random() * 5;
          const circle = Circle.givenEuclideanCenterRadius(
            line
              .getP0()
              .euclideanDistantPoint(radius * Math.random(), Angle.random()),
            radius + 1,
          );

          const intersects = line.euclideanIntersectsWithCircle(
            circle,
          ) as InstanceType<typeof Point>[];

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line),
          );
        });

        it('has hyperbolic intersects with Circle', function () {
          const radius = Math.random() * 5;
          const circle = Circle.givenHyperbolicCenterRadius(
            line
              .getP0()
              .hyperbolicDistantPoint(radius * Math.random(), Angle.random()),
            radius + 1,
          ) as Circle;

          const intersects = line.hyperbolicIntersectsWithCircle(
            circle,
          ) as InstanceType<typeof Point>[];

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);

          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
              line,
            ),
          );
        });

        it('has hyperbolic length', function () {
          const d = line.getHyperbolicLength();
          assert(!Number.isNaN(d));
          assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
        });

        it('has hyperbolic midpoint', function () {
          const midpoint = line.getHyperbolicMidpoint() as Point;
          assertIsA(midpoint, Point);
          const angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          const angle1 = Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1()),
          );
          assertApproximate(angle0, angle1);
        });

        it('has ideal Points and Line', function () {
          const idealPoints = line.getIdealPoints() as InstanceType<
            typeof Point
          >[];
          const idealLine = line.getIdealLine() as InstanceType<typeof Line>;
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, Point);
            assert(point.isIdeal());
          });
          assert.strictEqual(idealLine.getP0(), idealPoints[0]);
          assert.strictEqual(idealLine.getP1(), idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
          const intersects =
            line.getEuclideanUnitCircleIntersects() as InstanceType<
              typeof Point
            >[];
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assertApproximate(
            Angle.normalize(
              intersects[0].getAngle() - intersects[1].getAngle(),
            ),
            Math.PI,
          );
          intersects.forEach(function (intersect) {
            assertIsA(intersect, Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });

        it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
          const referenceAngle = line.getP0().getAngle();
          const otherLine = Line.givenAnglesOfIdealPoints(
            referenceAngle + Math.PI * Math.random(),
            referenceAngle + Math.PI * Math.random(),
          );
          assert(line.isHyperbolicParallelTo(otherLine));
        });

        it('includes Points in hyperbolic context', function () {
          assert(line.hyperbolicIncludesPoint(line.getP0()));
          assert(line.hyperbolicIncludesPoint(line.getP1()));
          const p = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getHyperbolicLength() * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()),
            );
          assert(line.hyperbolicIncludesPoint(p));
          assert(line.hyperbolicIncludesPoint(Point.ORIGIN));
        });
      });

      describe('on one side of origin', function () {
        beforeEach(function () {
          const angle = Angle.random();
          line = Line.givenTwoPoints(
            Point.givenEuclideanPolarCoordinates(Math.random(), angle),
            Point.givenEuclideanPolarCoordinates(Math.random(), angle),
          );
        });

        it('is on plane', function () {
          assert(line.isOnPlane());
        });

        it('has hyperbolic geodesic Line', function () {
          assertIsA(line.getHyperbolicGeodesic(), Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          const pointOnLine = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()) +
                (Math.random() < 0.5 ? Math.PI : 0),
            );

          const otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          assert(line.hyperbolicEquals(otherLine));
        });

        it('has Euclidean length', function () {
          assertIsRealNumber(line.getEuclideanLength());
        });

        it('has Euclidean midpoint', function () {
          assertIsA(line.getEuclideanMidpoint(), Point);
        });

        it('has Euclidean intersects with Circle', function () {
          const radius = Math.random() * 5;
          const circle = Circle.givenEuclideanCenterRadius(
            line
              .getP0()
              .euclideanDistantPoint(radius * Math.random(), Angle.random()),
            radius + 1,
          );

          const intersects = line.euclideanIntersectsWithCircle(
            circle,
          ) as InstanceType<typeof Point>[];

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line),
          );
        });

        it('has hyperbolic intersects with Circle', function () {
          const radius = Math.random() * 5;
          const circle = Circle.givenHyperbolicCenterRadius(
            line
              .getP0()
              .hyperbolicDistantPoint(radius * Math.random(), Angle.random()),
            radius + 1,
          ) as Circle;

          const intersects = line.hyperbolicIntersectsWithCircle(
            circle,
          ) as InstanceType<typeof Point>[];

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);

          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
              line,
            ),
          );
        });

        it('has hyperbolic length', function () {
          const d = line.getHyperbolicLength();
          assert(!Number.isNaN(d));
          assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
        });

        it('has hyperbolic midpoint', function () {
          const midpoint = line.getHyperbolicMidpoint() as Point;
          assertIsA(midpoint, Point);
          const angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          const angle1 = Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1()),
          );
          assertApproximate(angle0, angle1);
        });

        it('has ideal Points and Line', function () {
          const idealPoints = line.getIdealPoints() as InstanceType<
            typeof Point
          >[];
          const idealLine = line.getIdealLine() as InstanceType<typeof Line>;
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, Point);
            assert(point.isIdeal());
          });
          assert.strictEqual(idealLine.getP0(), idealPoints[0]);
          assert.strictEqual(idealLine.getP1(), idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
          const intersects =
            line.getEuclideanUnitCircleIntersects() as InstanceType<
              typeof Point
            >[];
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assertApproximate(
            Angle.normalize(
              intersects[0].getAngle() - intersects[1].getAngle(),
            ),
            Math.PI,
          );
          intersects.forEach(function (intersect) {
            assertIsA(intersect, Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });
      });
    });

    describe('not along diameter', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(Point.random(), Point.random());
      });

      it('is on plane', function () {
        assert(line.isOnPlane());
      });

      it('has hyperbolic geodesic Circle', function () {
        assertIsA(line.getHyperbolicGeodesic(), Circle);
      });

      it('equals hyperbolic Line with same geodesic', function () {
        const pointOnLine = line
          .getP0()
          .hyperbolicDistantPoint(
            line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1()) +
              (Math.random() < 0.5 ? Math.PI : 0),
          );

        const otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

        assert(line.hyperbolicEquals(otherLine));
      });

      it('has Euclidean length', function () {
        assertIsRealNumber(line.getEuclideanLength());
      });

      it('has Euclidean midpoint', function () {
        assertIsA(line.getEuclideanMidpoint(), Point);
      });

      it('has Euclidean intersects with Circle', function () {
        const radius = Math.random() * 5;
        const circle = Circle.givenEuclideanCenterRadius(
          line
            .getP0()
            .euclideanDistantPoint(radius * Math.random(), Angle.random()),
          radius,
        );

        const intersects = line.euclideanIntersectsWithCircle(
          circle,
        ) as InstanceType<typeof Point>[];

        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);

        assert(Line.givenTwoPoints(intersects[0], intersects[1]).equals(line));
      });

      it('has hyperbolic intersects with Circle', function () {
        const radius = Math.random() * 5;
        const circle = Circle.givenHyperbolicCenterRadius(
          line
            .getP0()
            .hyperbolicDistantPoint(radius * Math.random(), Angle.random()),
          radius + 1,
        ) as Circle;

        const intersects = line.hyperbolicIntersectsWithCircle(
          circle,
        ) as InstanceType<typeof Point>[];

        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);

        assert(
          Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
            line,
          ),
        );
      });

      it('has hyperbolic length', function () {
        const d = line.getHyperbolicLength();
        assert(!Number.isNaN(d));
        assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
      });

      it('has hyperbolic midpoint', function () {
        const midpoint = line.getHyperbolicMidpoint() as Point;
        assertIsA(midpoint, Point);
        const angle0 = midpoint.hyperbolicAngleTo(line.getP0());
        const angle1 = Angle.opposite(midpoint.hyperbolicAngleTo(line.getP1()));
        assertApproximate(angle0, angle1);
      });

      it('has ideal Points and Line', function () {
        const idealPoints = line.getIdealPoints() as InstanceType<
          typeof Point
        >[];
        const idealLine = line.getIdealLine() as InstanceType<typeof Line>;
        assertIsA(idealPoints, Array);
        assert.strictEqual(idealPoints.length, 2);
        idealPoints.forEach(function (point) {
          assertIsA(point, Point);
          assert(point.isIdeal());
        });
        assert.strictEqual(idealLine.getP0(), idealPoints[0]);
        assert.strictEqual(idealLine.getP1(), idealPoints[1]);
      });

      it('has Euclidean unit circle intersects', function () {
        const intersects =
          line.getEuclideanUnitCircleIntersects() as InstanceType<
            typeof Point
          >[];
        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);
        intersects.forEach(function (intersect) {
          assertIsA(intersect, Point);
          assertIsRealNumber(intersect.getX());
          assertIsRealNumber(intersect.getY());
          assertApproximate(intersect.getEuclideanRadius(), 1);
        });
      });

      it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
        const otherLine = Line.givenTwoPoints(
          line.getP0().opposite(),
          line.getP1().opposite(),
        );
        assert(line.isHyperbolicParallelTo(otherLine));
      });

      it('includes Points in hyperbolic context', function () {
        assert(line.hyperbolicIncludesPoint(line.getP0()));
        assert(line.hyperbolicIncludesPoint(line.getP1()));
        const p = line
          .getP0()
          .hyperbolicDistantPoint(
            line.getHyperbolicLength() * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1()),
          );
        assert(line.hyperbolicIncludesPoint(p));
      });
    });
  });

  describe('not on hyperbolic plane', function () {
    beforeEach(function () {
      line = Line.givenTwoPoints(
        Point.random(),
        Point.givenEuclideanPolarCoordinates(Math.random() + 1, Angle.random()),
      );
    });

    it('is not on plane', function () {
      assert(!line.isOnPlane());
    });

    it('does not have hyperbolic geodesic', function () {
      assert.strictEqual(line.getHyperbolicGeodesic(), false);
    });

    it('has Euclidean length', function () {
      assertIsRealNumber(line.getEuclideanLength());
    });

    it('has Euclidean midpoint', function () {
      assertIsA(line.getEuclideanMidpoint(), Point);
    });

    it('does not have hyperbolic length', function () {
      const l = line.getHyperbolicLength();
      assert(typeof l === 'number');
      assert(Number.isNaN(l));
    });

    it('does not have hyperbolic midpoint', function () {
      assert.strictEqual(line.getHyperbolicMidpoint(), false);
    });

    it('does not have ideal Points', function () {
      assert.strictEqual(line.getIdealPoints(), false);
    });
  });

  describe('given point and slope', function () {
    beforeEach(function () {
      line = Line.givenPointSlope(Point.random(), Line.randomSlope());
    });

    it('has point and slope', function () {
      assertIsA(line.getP0(), Point);
      assertIsRealNumber(line.getSlope());
    });

    it('has second point', function () {
      assertIsA(line.getP1(), Point);
    });
  });

  describe('given two points', function () {
    describe('on hyperbolic plane', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(Point.random(), Point.random());
      });

      it('has two points', function () {
        assertIsA(line.getP0(), Point);
        assertIsA(line.getP1(), Point);
      });

      it('has slope', function () {
        assertIsRealNumber(line.getSlope());
      });
    });

    describe('including one ideal point', function () {
      describe('generated at random', function () {
        beforeEach(function () {
          line = Line.givenTwoPoints(
            Point.random(),
            Point.givenIdealAngle(Angle.random()),
          );
        });

        it('is ideal', function () {
          assert(line.isIdeal());
        });

        it('has hyperbolic length of infinity', function () {
          assert.strictEqual(line.getHyperbolicLength(), Infinity);
        });

        it('has geodesic Circle', function () {
          assertIsA(line.getHyperbolicGeodesic(), Circle);
        });

        it('has ideal Points', function () {
          const idealPoints = line.getIdealPoints() as InstanceType<
            typeof Point
          >[];
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, Point);
            assert(point.isIdeal());
          });
        });

        it('has Euclidean unit circle intersects', function () {
          const intersects =
            line.getEuclideanUnitCircleIntersects() as InstanceType<
              typeof Point
            >[];
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          intersects.forEach(function (intersect) {
            assertIsA(intersect, Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });
      });

      describe('along diameter of plane', function () {
        beforeEach(function () {
          const p = Point.random();
          line = Line.givenTwoPoints(p, Point.givenIdealAngle(p.getAngle()));
        });

        it('is ideal', function () {
          assert(line.isIdeal());
        });

        it('has hyperbolic length of infinity', function () {
          assert.strictEqual(line.getHyperbolicLength(), Infinity);
        });

        it('has geodesic Line', function () {
          assertIsA(line.getHyperbolicGeodesic(), Line);
        });
      });
    });
  });

  describe('given angles of ideal points', function () {
    describe('generated at random', function () {
      beforeEach(function () {
        line = Line.givenAnglesOfIdealPoints(Angle.random(), Angle.random());
      });

      it('has two ideal points', function () {
        const p0 = line.getP0();
        const p1 = line.getP1();

        assertIsA(p0, Point);
        assertIsA(p1, Point);
        assert(p0.isIdeal());
        assert(p1.isIdeal());
      });

      it('is ideal', function () {
        assert(line.isIdeal());
      });

      it('has hyperbolic length of infinity', function () {
        assert.strictEqual(line.getHyperbolicLength(), Infinity);
      });

      it('has geodesic Circle', function () {
        assertIsA(line.getHyperbolicGeodesic(), Circle);
      });
    });

    describe('along diameter of plane', function () {
      beforeEach(function () {
        const angle = Angle.random();
        line = Line.givenAnglesOfIdealPoints(angle, Angle.opposite(angle));
      });

      it('has two ideal points', function () {
        const p0 = line.getP0();
        const p1 = line.getP1();

        assertIsA(p0, Point);
        assertIsA(p1, Point);
        assert(p0.isIdeal());
        assert(p1.isIdeal());
      });

      it('is ideal', function () {
        assert(line.isIdeal());
      });

      it('has hyperbolic length of infinity', function () {
        assert.strictEqual(line.getHyperbolicLength(), Infinity);
      });

      it('has geodesic Line', function () {
        assertIsA(line.getHyperbolicGeodesic(), Line);
      });
    });
  });

  describe('Euclidean intersect', function () {
    let otherLine: InstanceType<typeof Line>;

    beforeEach(function () {
      line = Line.givenTwoPoints(Point.random(), Point.random());
    });

    describe('of parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(Point.random(), line.getSlope());
      });

      it('does not exist', function () {
        assert.strictEqual(Line.euclideanIntersect(line, otherLine), false);
      });
    });

    describe('of non-parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(Point.random(), Line.randomSlope());
      });

      it('is Point', function () {
        assertIsA(Line.euclideanIntersect(line, otherLine), Point);
      });
    });

    describe('with x-axis', function () {
      beforeEach(function () {
        otherLine = Line.X_AXIS;
      });

      it('is Point', function () {
        assertIsA(Line.euclideanIntersect(line, otherLine), Point);
      });
    });

    describe('with y-axis', function () {
      beforeEach(function () {
        otherLine = Line.Y_AXIS;
      });

      it('is Point', function () {
        assertIsA(Line.euclideanIntersect(line, otherLine), Point);
      });
    });
  });

  describe('hyperbolic intersect', function () {
    let otherLine: InstanceType<typeof Line>;

    beforeEach(function () {
      line = Line.givenTwoPoints(Point.random(), Point.random());
    });

    describe('of parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenTwoPoints(
          line.getP0().opposite(),
          line.getP1().opposite(),
        );
      });

      it('does not exist', function () {
        assert.strictEqual(Line.hyperbolicIntersect(line, otherLine), false);
      });
    });

    describe('of non-parallel lines', function () {
      let expectedIntersect: InstanceType<typeof Point>;
      beforeEach(function () {
        const angleAlongLine = line.getP0().hyperbolicAngleTo(line.getP1());
        const lengthOfLine = line.getHyperbolicLength();
        expectedIntersect = line
          .getP0()
          .hyperbolicDistantPoint(lengthOfLine / 2, angleAlongLine);
      });

      describe('with curved hyperbolic geodesics', function () {
        beforeEach(function () {
          const p0 = Point.random();
          const angleAlongOtherLine = expectedIntersect.hyperbolicAngleTo(p0);
          const p1 = expectedIntersect.hyperbolicDistantPoint(
            expectedIntersect.hyperbolicDistanceTo(p0) / 2,
            expectedIntersect.hyperbolicAngleTo(p0),
          );

          otherLine = Line.givenTwoPoints(p0, p1);
        });

        it('is Point on plane', function () {
          const intersect = Line.hyperbolicIntersect(
            line,
            otherLine,
          ) as InstanceType<typeof Point>;
          assertIsA(intersect, Point);
          assert(intersect.isOnPlane());
          assert(intersect.equals(expectedIntersect));
        });
      });

      describe('with curved and straight hyperbolic geodesics', function () {
        beforeEach(function () {
          const angle = expectedIntersect.getAngle();
          otherLine = Line.givenTwoPoints(
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle),
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle),
          );
        });

        it('is Point on plane', function () {
          const intersect = Line.hyperbolicIntersect(
            line,
            otherLine,
          ) as InstanceType<typeof Point>;
          assertIsA(intersect, Point);
          assert(intersect.isOnPlane());
          assert(intersect.equals(expectedIntersect));
        });
      });
    });
  });

  describe('random slope', function () {
    it('is number', function () {
      assertIsRealNumber(Line.randomSlope());
    });
  });

  describe('X_AXIS', function () {
    beforeEach(function () {
      line = Line.X_AXIS;
    });

    it('is Line', function () {
      assertIsA(line, Line);
    });

    it('includes origin', function () {
      assert(line.euclideanIncludesPoint(Point.ORIGIN));
    });

    it('has a slope of 0', function () {
      assert.strictEqual(line.getSlope(), 0);
    });
  });

  describe('Y_AXIS', function () {
    beforeEach(function () {
      line = Line.Y_AXIS;
    });

    it('is Line', function () {
      assertIsA(line, Line);
    });

    it('includes origin', function () {
      assert(line.euclideanIncludesPoint(Point.ORIGIN));
    });

    it('has slope of infinity', function () {
      assert.strictEqual(line.getSlope(), Infinity);
    });
  });

  describe('getEuclideanUnitCircleIntersects', function () {
    it('returns intersects for near-tangent lines', function () {
      // Create a line that is almost tangent to the unit circle
      // Due to floating point errors, the discriminant might be slightly negative
      const angle = 0.007;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      const p0 = Point.givenCoordinates(x, y);
      const slope = -x / y; // perpendicular to radius = tangent
      const testLine = Line.givenPointSlope(p0, slope);

      const intersects = testLine.getEuclideanUnitCircleIntersects();
      // Should not return false for a near-tangent line
      assert.notStrictEqual(intersects, false);
      // Should return at least one point
      assert(intersects instanceof Array);
      assert(intersects.length >= 1);
    });
  });
});
