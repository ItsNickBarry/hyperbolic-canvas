const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  HyperbolicCanvas,
  assertApproximate,
  assertIsRealNumber,
  assertIsA,
} = require('./helpers.js');

const Point = HyperbolicCanvas.Point;

describe('Point', function () {
  var point;

  describe('generated at random on hyperbolic plane', function () {
    var quadrant;
    beforeEach(function () {
      quadrant = Math.floor(Math.random() * 4) + 1;
      point = Point.random(quadrant);
    });

    it('is on plane', function () {
      assert(point.isOnPlane());
      assert(point.getEuclideanRadius() < 1);
    });

    it('is not ideal', function () {
      assert(!point.isIdeal());
    });

    it('has Cartesian coordinates, angle, and Euclidean and hyperbolic radii', function () {
      assertIsRealNumber(point.getX());
      assertIsRealNumber(point.getY());
      assertIsRealNumber(point.getAngle());
      assertIsRealNumber(point.getEuclideanRadius());
      assertIsRealNumber(point.getHyperbolicRadius());
    });

    it('is equal to identical Point', function () {
      var otherPoint = Point.givenCoordinates(point.getX(), point.getY());
      assert(point.equals(otherPoint));
    });

    it('is clonable', function () {
      var clone = point.clone();
      assertIsA(clone, Point);
      assert.notStrictEqual(clone, point);
      assert(point.equals(clone));

      assertApproximate(clone.getX(), point.getX());
      assertApproximate(clone.getY(), point.getY());
      assertApproximate(clone.getAngle(), point.getAngle());
      assertApproximate(clone.getEuclideanRadius(), point.getEuclideanRadius());
      assertApproximate(
        clone.getHyperbolicRadius(),
        point.getHyperbolicRadius(),
      );
    });

    it('calculates Cartesian quadrant', function () {
      assert.strictEqual(point.quadrant(), quadrant);
    });

    it('has opposite Point', function () {
      var opposite = point.opposite();
      assertApproximate(
        opposite.getEuclideanRadius(),
        point.getEuclideanRadius(),
      );
      assertApproximate(
        opposite.getAngle(),
        HyperbolicCanvas.Angle.opposite(point.getAngle()),
      );
    });

    it('has Point rotated about origin', function () {
      var angle = HyperbolicCanvas.Angle.random();
      var rotatedPoint = point.rotateAboutOrigin(angle);
      assertIsA(rotatedPoint, Point);
      assertApproximate(
        rotatedPoint.getEuclideanRadius(),
        point.getEuclideanRadius(),
      );
      assertApproximate(
        rotatedPoint.getAngle(),
        HyperbolicCanvas.Angle.normalize(point.getAngle() + angle),
      );
      var rotatedBackPoint = rotatedPoint.rotateAboutOrigin(angle * -1);
      assert(rotatedBackPoint.equals(point));
    });

    describe('relative to other Point', function () {
      var otherPoint;
      beforeEach(function () {
        otherPoint = Point.random();
      });

      it('calculates Euclidean distance to other Point', function () {
        var d = point.euclideanDistanceTo(otherPoint);
        assertIsRealNumber(d);
      });

      it('calculates Euclidean angle towards and away from other Point', function () {
        var angleTo = point.euclideanAngleTo(otherPoint);
        var angleFrom = point.euclideanAngleFrom(otherPoint);
        assertIsRealNumber(angleTo);
        assertApproximate(angleFrom, HyperbolicCanvas.Angle.opposite(angleTo));
      });

      it('calculates hyperbolic distance to other Point', function () {
        var d = point.hyperbolicDistanceTo(otherPoint);
        assertIsRealNumber(d);
      });

      it('calculates hyperbolic angle towards and away from other Point', function () {
        var angleTo = point.hyperbolicAngleTo(otherPoint);
        var angleFrom = point.hyperbolicAngleFrom(otherPoint);
        assertIsRealNumber(angleTo);
        assertIsRealNumber(angleFrom);
      });
    });

    describe('when calculating Euclidean distant Point', function () {
      var distance, direction, distantPoint;
      beforeEach(function () {
        distance = Math.random();
        direction = HyperbolicCanvas.Angle.random();
        distantPoint = point.euclideanDistantPoint(distance, direction);
      });

      it('calculates location of distant point along Euclidean geodesic', function () {
        assertIsA(distantPoint, Point);
      });

      it('stores angle of travel', function () {
        assert.strictEqual(distantPoint.getDirection(), direction);
      });

      it('is reversible', function () {
        assert(
          distantPoint
            .euclideanDistantPoint(
              distance,
              HyperbolicCanvas.Angle.opposite(direction),
            )
            .equals(point),
        );
      });
    });

    describe('when calculating hyperbolic distant Point', function () {
      var distance, direction;
      describe('in general', function () {
        beforeEach(function () {
          distance = Math.random();
          direction = HyperbolicCanvas.Angle.random();
        });

        it('calculates location of distant point along hyperbolic geodesic', function () {
          var distantPoint = point.hyperbolicDistantPoint(distance, direction);
          assertIsA(distantPoint, Point);
          assert(distantPoint.isOnPlane());

          assertApproximate(point.hyperbolicDistanceTo(distantPoint), distance);
        });

        it('stores instantaneous angle of travel at destination on distant Point', function () {
          var distantPoint = point.hyperbolicDistantPoint(distance, direction);
          assertIsRealNumber(distantPoint.getDirection());
        });

        it('calculates accurate distant Point regardless of number of intermediate steps', function () {
          var distantPoint0 = point.hyperbolicDistantPoint(
            distance * 3,
            direction,
          );
          var distantPoint1 = point
            .hyperbolicDistantPoint(distance, direction)
            .hyperbolicDistantPoint(distance)
            .hyperbolicDistantPoint(distance);
          assert(distantPoint0.equals(distantPoint1));
        });

        it('is reversible', function () {
          var distantPoint0 = point.hyperbolicDistantPoint(distance, direction);
          var distantPoint1 = distantPoint0.hyperbolicDistantPoint(
            distance,
            HyperbolicCanvas.Angle.opposite(distantPoint0.getDirection()),
          );
          assert(point.equals(distantPoint1));
        });
      });

      describe('along diameter of hyperbolic plane', function () {
        describe('away from origin', function () {
          it('calculates Point away from origin', function () {
            distance = Math.random();
            direction = point.getAngle();
            var distantPoint = point.hyperbolicDistantPoint(
              distance,
              direction,
            );
            assert.strictEqual(distantPoint.getAngle(), direction);
            assert.strictEqual(distantPoint.getDirection(), direction);
            assert.strictEqual(distantPoint.quadrant(), point.quadrant());

            assert.strictEqual(
              distantPoint.getHyperbolicRadius(),
              point.getHyperbolicRadius() + distance,
            );
          });
        });

        describe('towards origin', function () {
          beforeEach(function () {
            direction = HyperbolicCanvas.Angle.opposite(point.getAngle());
          });

          it('calculates Point towards but not across origin', function () {
            distance = Math.random() * point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(
              distance,
              direction,
            );
            assert.strictEqual(distantPoint.getAngle(), point.getAngle());
            assert.strictEqual(distantPoint.quadrant(), point.quadrant());
            assert.strictEqual(distantPoint.getDirection(), direction);

            assert.strictEqual(
              distantPoint.getHyperbolicRadius(),
              point.getHyperbolicRadius() - distance,
            );
          });

          it('calculates Point towards and across origin', function () {
            distance = (Math.random() + 1) * point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(
              distance,
              direction,
            );
            assert.strictEqual(distantPoint.getAngle(), direction);
            assert.strictEqual(
              distantPoint.quadrant() % 4,
              (point.quadrant() + 2) % 4,
            );
            assert.strictEqual(distantPoint.getDirection(), direction);

            assert.strictEqual(
              distantPoint.getHyperbolicRadius(),
              distance - point.getHyperbolicRadius(),
            );
          });

          it('calculates origin', function () {
            distance = point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(
              distance,
              direction,
            );
            assert(distantPoint.getX() === 0);
            assert(distantPoint.getY() === 0);
            assert(distantPoint.getEuclideanRadius() === 0);
            assert(distantPoint.getHyperbolicRadius() === 0);
            assert.strictEqual(distantPoint.getDirection(), direction);
          });
        });
      });
    });

    describe('when comparing to distant Point', function () {
      var distance, direction, distantPoint;
      beforeEach(function () {
        distance = Math.random();
        direction = HyperbolicCanvas.Angle.random();
        distantPoint = point.hyperbolicDistantPoint(distance, direction);
      });

      it('calculates angle of hyperbolic geodesic towards self from perspective of other Point', function () {
        assertApproximate(
          point.hyperbolicAngleFrom(distantPoint),
          HyperbolicCanvas.Angle.opposite(distantPoint.getDirection()),
        );
      });

      it('calculates angle of hyperbolic geodesic towards other Point from perspective of self', function () {
        assertApproximate(point.hyperbolicAngleTo(distantPoint), direction);
      });
    });
  });

  describe('between two other Points along Euclidean geodesic', function () {
    var p0, p1;
    beforeEach(function () {
      p0 = Point.random();
      p1 = Point.random();
      point = Point.euclideanBetween(p0, p1);
    });

    it('has mean Cartesian coordinates', function () {
      assert.strictEqual(point.getX(), (p0.getX() + p1.getX()) / 2);
      assert.strictEqual(point.getY(), (p0.getY() + p1.getY()) / 2);
    });
  });

  describe('between two other points along hyperbolic geodesic', function () {
    var p0, p1;
    beforeEach(function () {
      p0 = Point.random();
      p1 = Point.random();
      point = Point.hyperbolicBetween(p0, p1);
    });

    it('is equidistant to other points at half total distance', function () {
      var d = p0.hyperbolicDistanceTo(p1);
      var d0 = point.hyperbolicDistanceTo(p0);
      var d1 = point.hyperbolicDistanceTo(p1);
      assertApproximate(d0, d1);
      assertApproximate(d0 + d1, d);
    });
  });

  describe('given Cartesian coordinates', function () {
    beforeEach(function () {
      var angle = HyperbolicCanvas.Angle.random();
      var radius = Math.random();
      point = Point.givenCoordinates(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
    });

    it('has Cartesian coordinates', function () {
      assertIsRealNumber(point.getX());
      assertIsRealNumber(point.getY());
    });

    it('has angle', function () {
      assertIsRealNumber(point.getAngle());
    });

    it('has Euclidean radius', function () {
      assertIsRealNumber(point.getEuclideanRadius());
    });

    it('has hyperbolic radius', function () {
      assertIsRealNumber(point.getHyperbolicRadius());
    });

    it('is not ideal', function () {
      assert(!point.isIdeal());
    });
  });

  describe('given Euclidean polar coordinates', function () {
    describe('in general', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random() + 0.5,
          HyperbolicCanvas.Angle.random(),
        );
      });

      it('has angle and Euclidean radius', function () {
        assertIsRealNumber(point.getAngle());
        assertIsRealNumber(point.getEuclideanRadius());
      });

      it('has Cartesian coordinates', function () {
        assertIsRealNumber(point.getX());
        assertIsRealNumber(point.getY());
      });

      it('equals Point defined by opposite angle and negative radius', function () {
        var otherPoint = Point.givenEuclideanPolarCoordinates(
          point.getEuclideanRadius() * -1,
          HyperbolicCanvas.Angle.opposite(point.getAngle()),
        );
        assert(point.equals(otherPoint));
      });
    });

    describe('with radius >= 1', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random() + 1,
          HyperbolicCanvas.Angle.random(),
        );
      });

      it('does not have hyperbolic radius', function () {
        assert(Number.isNaN(point.getHyperbolicRadius()));
      });

      it('is not on hyperbolic plane', function () {
        assert(!point.isOnPlane());
      });
    });

    describe('with 0 <= radius < 1', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random(),
          HyperbolicCanvas.Angle.random(),
        );
      });

      it('has hyperbolic radius', function () {
        assertIsRealNumber(point.getHyperbolicRadius());
      });

      it('is on hyperbolic plane', function () {
        assert(point.isOnPlane());
      });
    });
  });

  describe('given hyperbolic polar coordinates', function () {
    beforeEach(function () {
      point = Point.givenHyperbolicPolarCoordinates(
        Math.random() * 10,
        HyperbolicCanvas.Angle.random(),
      );
    });

    it('has angle and hyperbolic radius', function () {
      assertIsRealNumber(point.getAngle());
      assertIsRealNumber(point.getHyperbolicRadius());
    });

    it('has Euclidean radius', function () {
      assertIsRealNumber(point.getEuclideanRadius());
      assert(point.getEuclideanRadius() < 1);
    });

    it('has Cartesian coordinates', function () {
      assertIsRealNumber(point.getX());
      assertIsRealNumber(point.getY());
    });

    it('is on hyperbolic plane', function () {
      assert(point.isOnPlane());
    });

    it('equals Point defined by opposite angle and negative radius', function () {
      var otherPoint = Point.givenHyperbolicPolarCoordinates(
        point.getHyperbolicRadius() * -1,
        HyperbolicCanvas.Angle.opposite(point.getAngle()),
      );
      assert(point.equals(otherPoint));
    });
  });

  describe('given ideal angle', function () {
    beforeEach(function () {
      point = Point.givenIdealAngle(HyperbolicCanvas.Angle.random());
    });

    it('is Point', function () {
      assertIsA(point, Point);
    });

    it('is not on plane', function () {
      assert(!point.isOnPlane());
    });

    it('is ideal', function () {
      assert(point.isIdeal());
    });

    it('has Euclidean radius of 1', function () {
      assertApproximate(point.getEuclideanRadius(), 1);
    });
  });

  describe('ORIGIN', function () {
    beforeEach(function () {
      point = Point.ORIGIN;
    });

    it('is Point', function () {
      assertIsA(point, Point);
    });

    it('has Cartesian coordinates (0, 0)', function () {
      assert.strictEqual(point.getX(), 0);
      assert.strictEqual(point.getY(), 0);
    });

    it('has Euclidean and hyperbolic radii of 0', function () {
      assert.strictEqual(point.getEuclideanRadius(), 0);
      assert.strictEqual(point.getHyperbolicRadius(), 0);
    });

    it('has angle of 0', function () {
      assert.strictEqual(point.getAngle(), 0);
    });

    it('is on hyperbolic plane', function () {
      assert(point.isOnPlane());
    });
  });
});
