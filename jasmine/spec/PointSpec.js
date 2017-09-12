describe('Point', function () {
  var Point = HyperbolicCanvas.Point;
  var point;

  describe('generated at random on hyperbolic plane', function () {
    var quadrant;
    beforeEach(function () {
      quadrant = Math.floor(Math.random() * 4) + 1;
      point = Point.random(quadrant);
    });

    it('is on plane', function () {
      expect(point.isOnPlane()).toBe(true);
      expect(point.getEuclideanRadius()).toBeLessThan(1);
    });

    it('is not ideal', function () {
      expect(point.isIdeal()).toBe(false);
    });

    it('has Cartesian coordinates, angle, and Euclidean and hyperbolic radii', function () {
      expect(point.getX()               ).toBeARealNumber();
      expect(point.getY()               ).toBeARealNumber();
      expect(point.getAngle()           ).toBeARealNumber();
      expect(point.getEuclideanRadius() ).toBeARealNumber();
      expect(point.getHyperbolicRadius()).toBeARealNumber();
    });

    it('is equal to identical Point', function () {
      var otherPoint = Point.givenCoordinates(
        point.getX(),
        point.getY()
      );
      expect(point.equals(otherPoint)).toBe(true);
    });

    it('is clonable', function () {
      var clone = point.clone();
      expect(clone).toBeA(Point);
      expect(clone).not.toBe(point);
      expect(point.equals(clone)).toBe(true);

      expect(clone.getX())
        .toApproximate(point.getX());
      expect(clone.getY())
        .toApproximate(point.getY());
      expect(clone.getAngle())
        .toApproximate(point.getAngle());
      expect(clone.getEuclideanRadius())
        .toApproximate(point.getEuclideanRadius());
      expect(clone.getHyperbolicRadius())
        .toApproximate(point.getHyperbolicRadius());
    });

    it('calculates Cartesian quadrant', function () {
      expect(point.quadrant()).toBe(quadrant);
    });

    it('has opposite Point', function () {
      var opposite = point.opposite();
      expect(opposite.getEuclideanRadius())
        .toApproximate(point.getEuclideanRadius());
      expect(opposite.getAngle())
        .toApproximate(HyperbolicCanvas.Angle.opposite(point.getAngle()));
    });

    it('has Point rotated about origin', function () {
      var angle = HyperbolicCanvas.Angle.random();
      var rotatedPoint = point.rotateAboutOrigin(angle);
      expect(rotatedPoint).toBeA(Point);
      expect(rotatedPoint.getEuclideanRadius()).toApproximate(
        point.getEuclideanRadius()
      );
      expect(rotatedPoint.getAngle()).toApproximate(
        HyperbolicCanvas.Angle.normalize(point.getAngle() + angle)
      );
      var rotatedBackPoint = rotatedPoint.rotateAboutOrigin(angle * -1);
      expect(rotatedBackPoint.equals(point)).toBe(true);
    });

    describe('relative to other Point', function () {
      var otherPoint;
      beforeEach(function () {
        otherPoint = Point.random();
      });

      it('calculates Euclidean distance to other Point', function () {
        var d = point.euclideanDistanceTo(otherPoint);
        expect(d).toBeARealNumber();
      });

      it('calculates Euclidean angle towards and away from other Point', function () {
        var angleTo = point.euclideanAngleTo(otherPoint);
        var angleFrom = point.euclideanAngleFrom(otherPoint);
        expect(angleTo).toBeARealNumber()
        expect(angleFrom).toApproximate(
          HyperbolicCanvas.Angle.opposite(angleTo)
        );
      });

      it('calculates hyperbolic distance to other Point', function () {
        var d = point.hyperbolicDistanceTo(otherPoint);
        expect(d).toBeARealNumber();
      });

      it('calculates hyperbolic angle towards and away from other Point', function () {
        var angleTo = point.hyperbolicAngleTo(otherPoint);
        var angleFrom = point.hyperbolicAngleFrom(otherPoint);
        expect(angleTo).toBeARealNumber();
        expect(angleFrom).toBeARealNumber();
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
        expect(distantPoint).toBeA(Point);
      });

      it('stores angle of travel', function () {
        expect(distantPoint.getDirection()).toBe(direction);
      });

      it('is reversible', function () {
        expect(distantPoint.euclideanDistantPoint(
          distance,
          HyperbolicCanvas.Angle.opposite(direction)
        ).equals(point)).toBe(true);
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
          expect(distantPoint).toBeA(Point);
          expect(distantPoint.isOnPlane()).toBe(true);

          expect(
            point.hyperbolicDistanceTo(distantPoint)
          ).toApproximate(distance);
        });

        it('stores instantaneous angle of travel at destination on distant Point', function () {
          var distantPoint = point.hyperbolicDistantPoint(distance, direction);
          expect(distantPoint.getDirection()).toBeARealNumber();
        });

        it('calculates accurate distant Point regardless of number of intermediate steps', function () {
          var distantPoint0 = point.hyperbolicDistantPoint(distance * 3, direction);
          var distantPoint1 = point.hyperbolicDistantPoint(distance, direction)
                                   .hyperbolicDistantPoint(distance)
                                   .hyperbolicDistantPoint(distance);
          expect(distantPoint0.equals(distantPoint1)).toBe(true);
        });

        it('is reversible', function () {
          var distantPoint0 = point.hyperbolicDistantPoint(distance, direction);
          var distantPoint1 = distantPoint0.hyperbolicDistantPoint(
            distance,
            HyperbolicCanvas.Angle.opposite(distantPoint0.getDirection())
          );
          expect(point.equals(distantPoint1)).toBe(true);
        });
      });

      describe('along diameter of hyperbolic plane', function () {
        describe('away from origin', function () {
          it('calculates Point away from origin', function () {
            distance = Math.random();
            direction = point.getAngle();
            var distantPoint = point.hyperbolicDistantPoint(distance, direction);
            expect(distantPoint.getAngle()).toBe(direction);
            expect(distantPoint.getDirection()).toBe(direction);
            expect(distantPoint.quadrant()).toBe(point.quadrant());

            expect(distantPoint.getHyperbolicRadius()).toBe(
              point.getHyperbolicRadius() + distance
            );
          });
        });

        describe('towards origin', function () {
          beforeEach(function () {
            direction = HyperbolicCanvas.Angle.opposite(point.getAngle());
          });

          it('calculates Point towards but not across origin', function () {
            distance = Math.random() * point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(distance, direction);
            expect(distantPoint.getAngle()).toBe(point.getAngle());
            expect(distantPoint.quadrant()).toBe(point.quadrant());
            expect(distantPoint.getDirection()).toBe(direction);

            expect(distantPoint.getHyperbolicRadius()).toBe(
              point.getHyperbolicRadius() - distance
            );
          });

          it('calculates Point towards and across origin', function () {
            distance = (Math.random() + 1) * point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(distance, direction);
            expect(distantPoint.getAngle()).toBe(direction);
            expect(distantPoint.quadrant() % 4).toBe((point.quadrant() + 2) % 4);
            expect(distantPoint.getDirection()).toBe(direction);

            expect(distantPoint.getHyperbolicRadius()).toBe(
              distance - point.getHyperbolicRadius()
            );
          });

          it('calculates origin', function () {
            distance = point.getHyperbolicRadius();
            var distantPoint = point.hyperbolicDistantPoint(distance, direction);
            expect(distantPoint.getX()).toBe(0);
            expect(distantPoint.getY()).toBe(0);
            expect(distantPoint.getEuclideanRadius()).toBe(0);
            expect(distantPoint.getHyperbolicRadius()).toBe(0);
            expect(distantPoint.getDirection()).toBe(direction);
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
        expect(point.hyperbolicAngleFrom(distantPoint)).toApproximate(
          HyperbolicCanvas.Angle.opposite(distantPoint.getDirection())
        );
      });

      it('calculates angle of hyperbolic geodesic towards other Point from perspective of self', function () {
        expect(point.hyperbolicAngleTo(distantPoint)).toApproximate(
          direction
        );
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
      expect(point.getX()).toBe((p0.getX() + p1.getX()) / 2);
      expect(point.getY()).toBe((p0.getY() + p1.getY()) / 2);
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
      expect(d0).toApproximate(d1);
      expect(d0 + d1).toApproximate(d);
    });
  });

  describe('given Cartesian coordinates', function () {
    beforeEach(function () {
      var angle = HyperbolicCanvas.Angle.random();
      var radius = Math.random();
      point = Point.givenCoordinates(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    });

    it('has Cartesian coordinates',function () {
      expect(point.getX()).toBeARealNumber();
      expect(point.getY()).toBeARealNumber();
    });

    it('has angle', function () {
      expect(point.getAngle()).toBeARealNumber();
    });

    it('has Euclidean radius', function () {
      expect(point.getEuclideanRadius()).toBeARealNumber();
    });

    it('has hyperbolic radius', function () {
      expect(point.getHyperbolicRadius()).toBeARealNumber();
    });

    it('is not ideal', function () {
      expect(point.isIdeal()).toBe(false);
    });
  });

  describe('given Euclidean polar coordinates', function () {
    describe('in general', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random() + .5,
          HyperbolicCanvas.Angle.random()
        );
      });

      it('has angle and Euclidean radius', function () {
        expect(point.getAngle()).toBeARealNumber();
        expect(point.getEuclideanRadius()).toBeARealNumber();
      });

      it('has Cartesian coordinates',function () {
        expect(point.getX()).toBeARealNumber();
        expect(point.getY()).toBeARealNumber();
      });

      it('equals Point defined by opposite angle and negative radius', function () {
        var otherPoint = Point.givenEuclideanPolarCoordinates(
          point.getEuclideanRadius() * -1,
          HyperbolicCanvas.Angle.opposite(point.getAngle())
        );
        expect(point.equals(otherPoint)).toBe(true);
      });
    });

    describe('with radius >= 1', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random() + 1,
          HyperbolicCanvas.Angle.random()
        );
      });

      it('does not have hyperbolic radius', function () {
        expect(point.getHyperbolicRadius()).toBeNaN();
      });

      it('is not on hyperbolic plane', function () {
        expect(point.isOnPlane()).toBe(false);
      });
    });

    describe('with 0 <= radius < 1', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random(),
          HyperbolicCanvas.Angle.random()
        );
      });

      it('has hyperbolic radius', function () {
        expect(point.getHyperbolicRadius()).toBeARealNumber();
      });

      it('is on hyperbolic plane', function () {
        expect(point.isOnPlane()).toBe(true);
      });
    });
  });

  describe('given hyperbolic polar coordinates', function () {
    beforeEach(function () {
      point = Point.givenHyperbolicPolarCoordinates(
        Math.random() * 10,
        HyperbolicCanvas.Angle.random()
      );
    });

    it('has angle and hyperbolic radius', function () {
      expect(point.getAngle()).toBeARealNumber();
      expect(point.getHyperbolicRadius()).toBeARealNumber();
    });

    it('has Euclidean radius', function () {
      expect(point.getEuclideanRadius()).toBeARealNumber();
      expect(point.getEuclideanRadius()).toBeLessThan(1);
    });

    it('has Cartesian coordinates',function () {
      expect(point.getX()).toBeARealNumber();
      expect(point.getY()).toBeARealNumber();
    });

    it('is on hyperbolic plane', function () {
      expect(point.isOnPlane()).toBe(true);
    });

    it('equals Point defined by opposite angle and negative radius', function () {
      var otherPoint = Point.givenHyperbolicPolarCoordinates(
        point.getHyperbolicRadius() * -1,
        HyperbolicCanvas.Angle.opposite(point.getAngle())
      );
      expect(point.equals(otherPoint)).toBe(true);
    });
  });

  describe('given ideal angle', function () {
    beforeEach(function () {
      point = Point.givenIdealAngle(HyperbolicCanvas.Angle.random());
    });

    it('is Point', function () {
      expect(point).toBeA(Point);
    });

    it('is not on plane', function () {
      expect(point.isOnPlane()).toBe(false);
    });

    it('is ideal', function () {
      expect(point.isIdeal()).toBe(true);
    });

    it('has Euclidean radius of 1', function () {
      expect(point.getEuclideanRadius()).toApproximate(1);
    });
  });

  describe('ORIGIN', function () {
    beforeEach(function () {
      point = Point.ORIGIN;
    });

    it('is Point', function () {
      expect(point).toBeA(Point);
    }, true);

    it('has Cartesian coordinates (0, 0)', function () {
      expect(point.getX()).toBe(0);
      expect(point.getY()).toBe(0);
    }, true);

    it('has Euclidean and hyperbolic radii of 0', function () {
      expect(point.getEuclideanRadius()).toBe(0);
      expect(point.getHyperbolicRadius()).toBe(0);
    }, true);

    it('has angle of 0', function () {
      expect(point.getAngle()).toBe(0);
    }, true);

    it('is on hyperbolic plane', function () {
      expect(point.isOnPlane()).toBe(true);
    }, true);
  });
});
