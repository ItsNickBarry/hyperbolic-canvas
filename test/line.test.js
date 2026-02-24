const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  HyperbolicCanvas,
  assertApproximate,
  assertIsRealNumber,
  assertIsA,
} = require('./helpers.js');

const Line = HyperbolicCanvas.Line;

describe('Line', function () {
  var line;

  describe('in general', function () {
    var point, slope;
    describe('with random slope', function () {
      beforeEach(function () {
        point = HyperbolicCanvas.Point.random();
        slope = HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
        line = Line.givenPointSlope(point, slope);
      });

      it('is cloneable', function () {
        var clone = line.clone();
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
        var otherLine = Line.givenPointSlope(line.getP0(), line.getSlope());
        assert(line.equals(otherLine));
      });

      it('includes Points in Euclidean context', function () {
        assert(line.euclideanIncludesPoint(line.getP0()));
        assert(line.euclideanIncludesPoint(line.getP1()));
        assert(
          line.euclideanIncludesPoint(line.pointAtEuclideanX(Math.random())),
        );
        assert(
          line.euclideanIncludesPoint(line.pointAtEuclideanY(Math.random())),
        );
      });

      it('is parallel to Line with same slope in Euclidean context', function () {
        var otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          line.getSlope(),
        );
        assert(line.isEuclideanParallelTo(otherLine));
      });

      it('has a perpindicular slope', function () {
        assert.strictEqual(
          line.euclideanPerpindicularSlope(),
          -1 / line.getSlope(),
        );
      });

      it('has perpindicular lines', function () {
        var perpindicularLine = line.euclideanPerpindicularLineAt(
          HyperbolicCanvas.Point.random(),
        );
        assertIsA(perpindicularLine, Line);
        assert.strictEqual(
          perpindicularLine.getSlope(),
          line.euclideanPerpindicularSlope(),
        );
        assertIsA(
          Line.euclideanIntersect(line, perpindicularLine),
          HyperbolicCanvas.Point,
        );
      });

      it('has a perpindicular bisector', function () {
        var bisector = line.euclideanPerpindicularBisector();
        assertIsA(bisector, Line);
        assert.strictEqual(
          bisector.getSlope(),
          line.euclideanPerpindicularSlope(),
        );
        var intersect = Line.euclideanIntersect(line, bisector);
        assert(line.euclideanIncludesPoint(intersect));
        assert(bisector.euclideanIncludesPoint(intersect));
      });

      it('has Point for any x value', function () {
        var p = line.pointAtEuclideanX(Math.random());
        assertIsA(p, HyperbolicCanvas.Point);
        assert(line.euclideanIncludesPoint(p));
      });

      it('has Point for any y value', function () {
        var p = line.pointAtEuclideanY(Math.random());
        assertIsA(p, HyperbolicCanvas.Point);
        assert(line.euclideanIncludesPoint(p));
      });

      it('has x value for any y value', function () {
        var y = Math.random() * 2 - 1;
        var x = line.euclideanXAtY(y);
        assertIsRealNumber(x);
        assertApproximate(line.euclideanYAtX(x), y);
      });

      it('has y value for any x value', function () {
        var x = Math.random() * 2 - 1;
        var y = line.euclideanYAtX(x);
        assertIsRealNumber(y);
        assertApproximate(line.euclideanXAtY(y), x);
      });
    });

    describe('with slope of 0', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(HyperbolicCanvas.Point.random(), 0);
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
        line = Line.givenPointSlope(HyperbolicCanvas.Point.random(), Infinity);
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
          var angle = HyperbolicCanvas.Angle.random();
          line = Line.givenTwoPoints(
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random(),
              angle,
            ),
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random() * -1,
              angle,
            ),
          );
        });

        it('is on plane', function () {
          assert(line.isOnPlane());
        });

        it('has hyperbolic geodesic Line', function () {
          assertIsA(line.getHyperbolicGeodesic(), Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          var pointOnLine = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()) +
                (Math.random() < 0.5 ? Math.PI : 0),
            );

          var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          assert(line.hyperbolicEquals(otherLine));
        });

        it('has Euclidean length', function () {
          assertIsRealNumber(line.getEuclideanLength());
        });

        it('has Euclidean midpoint', function () {
          assertIsA(line.getEuclideanMidpoint(), HyperbolicCanvas.Point);
        });

        it('has Euclidean intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
            line
              .getP0()
              .euclideanDistantPoint(
                radius * Math.random(),
                HyperbolicCanvas.Angle.random(),
              ),
            radius + 1,
          );

          var intersects = line.euclideanIntersectsWithCircle(circle);

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line),
          );
        });

        it('has hyperbolic intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            line
              .getP0()
              .hyperbolicDistantPoint(
                radius * Math.random(),
                HyperbolicCanvas.Angle.random(),
              ),
            radius + 1,
          );

          var intersects = line.hyperbolicIntersectsWithCircle(circle);

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);

          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
              line,
            ),
          );
        });

        it('has hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          assert(!Number.isNaN(d));
          assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
        });

        it('has hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          assertIsA(midpoint, HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1()),
          );
          assertApproximate(angle0, angle1);
        });

        it('has ideal Points and Line', function () {
          var idealPoints = line.getIdealPoints();
          var idealLine = line.getIdealLine();
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, HyperbolicCanvas.Point);
            assert(point.isIdeal());
          });
          assert.strictEqual(idealLine.getP0(), idealPoints[0]);
          assert.strictEqual(idealLine.getP1(), idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assertApproximate(
            HyperbolicCanvas.Angle.normalize(
              intersects[0].getAngle() - intersects[1].getAngle(),
            ),
            Math.PI,
          );
          intersects.forEach(function (intersect) {
            assertIsA(intersect, HyperbolicCanvas.Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });

        it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
          var referenceAngle = line.getP0().getAngle();
          var otherLine = Line.givenAnglesOfIdealPoints(
            referenceAngle + Math.PI * Math.random(),
            referenceAngle + Math.PI * Math.random(),
          );
          assert(line.isHyperbolicParallelTo(otherLine));
        });

        it('includes Points in hyperbolic context', function () {
          assert(line.hyperbolicIncludesPoint(line.getP0()));
          assert(line.hyperbolicIncludesPoint(line.getP1()));
          var p = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getHyperbolicLength() * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()),
            );
          assert(line.hyperbolicIncludesPoint(p));
          assert(line.hyperbolicIncludesPoint(HyperbolicCanvas.Point.ORIGIN));
        });
      });

      describe('on one side of origin', function () {
        beforeEach(function () {
          var angle = HyperbolicCanvas.Angle.random();
          line = Line.givenTwoPoints(
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random(),
              angle,
            ),
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random(),
              angle,
            ),
          );
        });

        it('is on plane', function () {
          assert(line.isOnPlane());
        });

        it('has hyperbolic geodesic Line', function () {
          assertIsA(line.getHyperbolicGeodesic(), Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          var pointOnLine = line
            .getP0()
            .hyperbolicDistantPoint(
              line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
              line.getP0().hyperbolicAngleTo(line.getP1()) +
                (Math.random() < 0.5 ? Math.PI : 0),
            );

          var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          assert(line.hyperbolicEquals(otherLine));
        });

        it('has Euclidean length', function () {
          assertIsRealNumber(line.getEuclideanLength());
        });

        it('has Euclidean midpoint', function () {
          assertIsA(line.getEuclideanMidpoint(), HyperbolicCanvas.Point);
        });

        it('has Euclidean intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
            line
              .getP0()
              .euclideanDistantPoint(
                radius * Math.random(),
                HyperbolicCanvas.Angle.random(),
              ),
            radius + 1,
          );

          var intersects = line.euclideanIntersectsWithCircle(circle);

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line),
          );
        });

        it('has hyperbolic intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            line
              .getP0()
              .hyperbolicDistantPoint(
                radius * Math.random(),
                HyperbolicCanvas.Angle.random(),
              ),
            radius + 1,
          );

          var intersects = line.hyperbolicIntersectsWithCircle(circle);

          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);

          assert(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
              line,
            ),
          );
        });

        it('has hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          assert(!Number.isNaN(d));
          assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
        });

        it('has hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          assertIsA(midpoint, HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1()),
          );
          assertApproximate(angle0, angle1);
        });

        it('has ideal Points and Line', function () {
          var idealPoints = line.getIdealPoints();
          var idealLine = line.getIdealLine();
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, HyperbolicCanvas.Point);
            assert(point.isIdeal());
          });
          assert.strictEqual(idealLine.getP0(), idealPoints[0]);
          assert.strictEqual(idealLine.getP1(), idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          assertApproximate(
            HyperbolicCanvas.Angle.normalize(
              intersects[0].getAngle() - intersects[1].getAngle(),
            ),
            Math.PI,
          );
          intersects.forEach(function (intersect) {
            assertIsA(intersect, HyperbolicCanvas.Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });
      });
    });

    describe('not along diameter', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(
          HyperbolicCanvas.Point.random(),
          HyperbolicCanvas.Point.random(),
        );
      });

      it('is on plane', function () {
        assert(line.isOnPlane());
      });

      it('has hyperbolic geodesic Circle', function () {
        assertIsA(line.getHyperbolicGeodesic(), HyperbolicCanvas.Circle);
      });

      it('equals hyperbolic Line with same geodesic', function () {
        var pointOnLine = line
          .getP0()
          .hyperbolicDistantPoint(
            line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1()) +
              (Math.random() < 0.5 ? Math.PI : 0),
          );

        var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

        assert(line.hyperbolicEquals(otherLine));
      });

      it('has Euclidean length', function () {
        assertIsRealNumber(line.getEuclideanLength());
      });

      it('has Euclidean midpoint', function () {
        assertIsA(line.getEuclideanMidpoint(), HyperbolicCanvas.Point);
      });

      it('has Euclidean intersects with Circle', function () {
        var radius = Math.random() * 5;
        var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
          line
            .getP0()
            .euclideanDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random(),
            ),
          radius,
        );

        var intersects = line.euclideanIntersectsWithCircle(circle);

        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);

        assert(Line.givenTwoPoints(intersects[0], intersects[1]).equals(line));
      });

      it('has hyperbolic intersects with Circle', function () {
        var radius = Math.random() * 5;
        var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
          line
            .getP0()
            .hyperbolicDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random(),
            ),
          radius + 1,
        );

        var intersects = line.hyperbolicIntersectsWithCircle(circle);

        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);

        assert(
          Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(
            line,
          ),
        );
      });

      it('has hyperbolic length', function () {
        var d = line.getHyperbolicLength();
        assert(!Number.isNaN(d));
        assertApproximate(d, line.getP0().hyperbolicDistanceTo(line.getP1()));
      });

      it('has hyperbolic midpoint', function () {
        var midpoint = line.getHyperbolicMidpoint();
        assertIsA(midpoint, HyperbolicCanvas.Point);
        var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
        var angle1 = HyperbolicCanvas.Angle.opposite(
          midpoint.hyperbolicAngleTo(line.getP1()),
        );
        assertApproximate(angle0, angle1);
      });

      it('has ideal Points and Line', function () {
        var idealPoints = line.getIdealPoints();
        var idealLine = line.getIdealLine();
        assertIsA(idealPoints, Array);
        assert.strictEqual(idealPoints.length, 2);
        idealPoints.forEach(function (point) {
          assertIsA(point, HyperbolicCanvas.Point);
          assert(point.isIdeal());
        });
        assert.strictEqual(idealLine.getP0(), idealPoints[0]);
        assert.strictEqual(idealLine.getP1(), idealPoints[1]);
      });

      it('has Euclidean unit circle intersects', function () {
        var intersects = line.getEuclideanUnitCircleIntersects();
        assertIsA(intersects, Array);
        assert.strictEqual(intersects.length, 2);
        intersects.forEach(function (intersect) {
          assertIsA(intersect, HyperbolicCanvas.Point);
          assertIsRealNumber(intersect.getX());
          assertIsRealNumber(intersect.getY());
          assertApproximate(intersect.getEuclideanRadius(), 1);
        });
      });

      it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
        var otherLine = Line.givenTwoPoints(
          line.getP0().opposite(),
          line.getP1().opposite(),
        );
        assert(line.isHyperbolicParallelTo(otherLine));
      });

      it('includes Points in hyperbolic context', function () {
        assert(line.hyperbolicIncludesPoint(line.getP0()));
        assert(line.hyperbolicIncludesPoint(line.getP1()));
        var p = line
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
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
          Math.random() + 1,
          HyperbolicCanvas.Angle.random(),
        ),
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
      assertIsA(line.getEuclideanMidpoint(), HyperbolicCanvas.Point);
    });

    it('does not have hyperbolic length', function () {
      var l = line.getHyperbolicLength();
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
      line = Line.givenPointSlope(
        HyperbolicCanvas.Point.random(),
        Line.randomSlope(),
      );
    });

    it('has point and slope', function () {
      assertIsA(line.getP0(), HyperbolicCanvas.Point);
      assertIsRealNumber(line.getSlope());
    });

    it('has second point', function () {
      assertIsA(line.getP1(), HyperbolicCanvas.Point);
    });
  });

  describe('given two points', function () {
    describe('on hyperbolic plane', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(
          HyperbolicCanvas.Point.random(),
          HyperbolicCanvas.Point.random(),
        );
      });

      it('has two points', function () {
        assertIsA(line.getP0(), HyperbolicCanvas.Point);
        assertIsA(line.getP1(), HyperbolicCanvas.Point);
      });

      it('has slope', function () {
        assertIsRealNumber(line.getSlope());
      });
    });

    describe('including one ideal point', function () {
      describe('generated at random', function () {
        beforeEach(function () {
          line = Line.givenTwoPoints(
            HyperbolicCanvas.Point.random(),
            HyperbolicCanvas.Point.givenIdealAngle(
              HyperbolicCanvas.Angle.random(),
            ),
          );
        });

        it('is ideal', function () {
          assert(line.isIdeal());
        });

        it('has hyperbolic length of infinity', function () {
          assert.strictEqual(line.getHyperbolicLength(), Infinity);
        });

        it('has geodesic Circle', function () {
          assertIsA(line.getHyperbolicGeodesic(), HyperbolicCanvas.Circle);
        });

        it('has ideal Points', function () {
          var idealPoints = line.getIdealPoints();
          assertIsA(idealPoints, Array);
          assert.strictEqual(idealPoints.length, 2);
          idealPoints.forEach(function (point) {
            assertIsA(point, HyperbolicCanvas.Point);
            assert(point.isIdeal());
          });
        });

        it('has Euclidean unit circle intersects', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          assertIsA(intersects, Array);
          assert.strictEqual(intersects.length, 2);
          intersects.forEach(function (intersect) {
            assertIsA(intersect, HyperbolicCanvas.Point);
            assertIsRealNumber(intersect.getX());
            assertIsRealNumber(intersect.getY());
            assertApproximate(intersect.getEuclideanRadius(), 1);
          });
        });
      });

      describe('along diameter of plane', function () {
        beforeEach(function () {
          var p = HyperbolicCanvas.Point.random();
          line = Line.givenTwoPoints(
            p,
            HyperbolicCanvas.Point.givenIdealAngle(p.getAngle()),
          );
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
        line = Line.givenAnglesOfIdealPoints(
          HyperbolicCanvas.Angle.random(),
          HyperbolicCanvas.Angle.random(),
        );
      });

      it('has two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        assertIsA(p0, HyperbolicCanvas.Point);
        assertIsA(p1, HyperbolicCanvas.Point);
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
        assertIsA(line.getHyperbolicGeodesic(), HyperbolicCanvas.Circle);
      });
    });

    describe('along diameter of plane', function () {
      beforeEach(function () {
        var angle = HyperbolicCanvas.Angle.random();
        line = Line.givenAnglesOfIdealPoints(
          angle,
          HyperbolicCanvas.Angle.opposite(angle),
        );
      });

      it('has two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        assertIsA(p0, HyperbolicCanvas.Point);
        assertIsA(p1, HyperbolicCanvas.Point);
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
    var otherLine;
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
    });

    describe('of parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          line.getSlope(),
        );
      });

      it('does not exist', function () {
        assert.strictEqual(Line.euclideanIntersect(line, otherLine), false);
      });
    });

    describe('of non-parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          Line.randomSlope(),
        );
      });

      it('is Point', function () {
        assertIsA(
          Line.euclideanIntersect(line, otherLine),
          HyperbolicCanvas.Point,
        );
      });
    });

    describe('with x-axis', function () {
      beforeEach(function () {
        otherLine = Line.X_AXIS;
      });

      it('is Point', function () {
        assertIsA(
          Line.euclideanIntersect(line, otherLine),
          HyperbolicCanvas.Point,
        );
      });
    });

    describe('with y-axis', function () {
      beforeEach(function () {
        otherLine = Line.Y_AXIS;
      });

      it('is Point', function () {
        assertIsA(
          Line.euclideanIntersect(line, otherLine),
          HyperbolicCanvas.Point,
        );
      });
    });
  });

  describe('hyperbolic intersect', function () {
    var otherLine;
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
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
      var expectedIntersect;
      beforeEach(function () {
        var angleAlongLine = line.getP0().hyperbolicAngleTo(line.getP1());
        var lengthOfLine = line.getHyperbolicLength();
        expectedIntersect = line
          .getP0()
          .hyperbolicDistantPoint(lengthOfLine / 2, angleAlongLine);
      });

      describe('with curved hyperbolic geodesics', function () {
        beforeEach(function () {
          var p0 = HyperbolicCanvas.Point.random();
          var angleAlongOtherLine = expectedIntersect.hyperbolicAngleTo(p0);
          var p1 = expectedIntersect.hyperbolicDistantPoint(
            expectedIntersect.hyperbolicDistanceTo(p0) / 2,
            expectedIntersect.hyperbolicAngleTo(p0),
          );

          otherLine = Line.givenTwoPoints(p0, p1);
        });

        it('is Point on plane', function () {
          var intersect = Line.hyperbolicIntersect(line, otherLine);
          assertIsA(intersect, HyperbolicCanvas.Point);
          assert(intersect.isOnPlane());
          assert(intersect.equals(expectedIntersect));
        });
      });

      describe('with curved and straight hyperbolic geodesics', function () {
        beforeEach(function () {
          var angle = expectedIntersect.getAngle();
          otherLine = Line.givenTwoPoints(
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle),
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle),
          );
        });

        it('is Point on plane', function () {
          var intersect = Line.hyperbolicIntersect(line, otherLine);
          assertIsA(intersect, HyperbolicCanvas.Point);
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
      assert(line.euclideanIncludesPoint(HyperbolicCanvas.Point.ORIGIN));
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
      assert(line.euclideanIncludesPoint(HyperbolicCanvas.Point.ORIGIN));
    });

    it('has slope of infinity', function () {
      assert.strictEqual(line.getSlope(), Infinity);
    });
  });
});
