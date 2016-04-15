describe('Point', function () {
  var Point = HyperbolicCanvas.Point;
  var point;

  describe('generated at random on hyperbolic plane', function () {
    var quadrant;
    beforeEach(function () {
      quadrant = Math.floor(Math.random() * 4) + 1;
      point = Point.random(quadrant);
    });

    it('should be on plane', function () {
      expect(point.isOnPlane()).toBe(true);
      expect(point.getEuclideanRadius()).toBeLessThan(1);
    });

    it('should have Cartesian coordinates, angle, and Euclidean and hyperbolic radii', function () {
      expect(typeof point.getX()               ).toBe('number');
      expect(typeof point.getY()               ).toBe('number');
      expect(typeof point.getAngle()           ).toBe('number');
      expect(typeof point.getEuclideanRadius() ).toBe('number');
      expect(typeof point.getHyperbolicRadius()).toBe('number');
    });

    it('should be equal to identical Point', function () {
      var otherPoint = Point.givenCoordinates(
        point.getX(),
        point.getY()
      );
      expect(point.equals(otherPoint)).toBe(true);
    });

    it('should be clonable', function () {
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

    it('should set and get direction', function () {
      var angle = HyperbolicCanvas.Angle.random();
      point.setDirection(angle);
      expect(point.getDirection()).toBe(angle);
    });

    it('should calculate Cartesian quadrant', function () {
      expect(point.quadrant()).toBe(quadrant);
    });

    describe('relative to other Point', function () {
      var otherPoint;
      beforeEach(function () {
        otherPoint = Point.random();
      });

      it('should calculate Euclidean distance to other Point', function () {
        var d = point.euclideanDistanceTo(otherPoint);
        expect(typeof d).toBe('number');
        expect(d).not.toBeNaN();
      });

      it('should calculate Euclidean angle towards and away from other Point', function () {
        var angleTo = point.euclideanAngleTo(otherPoint);
        var angleFrom = point.euclideanAngleFrom(otherPoint);
        expect(typeof angleTo).toBe('number');
        expect(angleTo).not.toBeNaN();
        expect(angleFrom).toApproximate(
          HyperbolicCanvas.Angle.opposite(angleTo)
        );
      });

      it('should calculate hyperbolic distance to other Point', function () {
        var d = point.hyperbolicDistanceTo(otherPoint);
        expect(typeof d).toBe('number');
        expect(d).not.toBeNaN();
      });

      it('should calculate hyperbolic angle towards and away from other Point', function () {
        var angleTo = point.hyperbolicAngleTo(otherPoint);
        var angleFrom = point.hyperbolicAngleFrom(otherPoint);
        expect(typeof angleTo).toBe('number');
        expect(angleTo).not.toBeNaN();
        expect(typeof angleFrom).toBe('number');
        expect(angleFrom).not.toBeNaN();
      });
    });

    describe('when calculating distant Point', function () {
      var distance, direction;
      describe('in general', function () {
        beforeEach(function () {
          distance = Math.random();
          direction = HyperbolicCanvas.Angle.random();
        });

        it('should calculate location of distant point along hyperbolic geodesic', function () {
          // TODO check the math?
          var distantPoint = point.distantPoint(distance, direction);
          expect(distantPoint).toBeDefined();
        });

        it('should store instantaneous angle of travel at destination on distant Point', function () {
          var distantPoint = point.distantPoint(distance, direction);
          expect(distantPoint.getDirection()).toBeDefined();
        });

        it('should calculate accurate distant Point regardless of number of intermediate steps', function () {
          var distantPoint0 = point.distantPoint(distance * 3, direction);
          var distantPoint1 = point.distantPoint(distance, direction)
                                   .distantPoint(distance)
                                   .distantPoint(distance);
          expect(distantPoint0.equals(distantPoint1)).toBe(true);
        });

        it('should be reversible', function () {
          var distantPoint0 = point.distantPoint(distance, direction);
          var distantPoint1 = distantPoint0.distantPoint(
            distance,
            HyperbolicCanvas.Angle.opposite(distantPoint0.getDirection())
          );
          expect(point.equals(distantPoint1)).toBe(true);
        });
      });

      describe('along diameter of hyperbolic plane', function () {
        // TODO check paths almost along diameter, but not quite
        describe('away from origin', function () {
          it('should calculate Point away from origin', function () {
            distance = Math.random();
            direction = point.getAngle();
            var distantPoint = point.distantPoint(distance, direction);
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

          it('should calculate Point towards but not across origin', function () {
            distance = Math.random() * point.getHyperbolicRadius();
            var distantPoint = point.distantPoint(distance, direction);
            expect(distantPoint.getAngle()).toBe(point.getAngle());
            expect(distantPoint.quadrant()).toBe(point.quadrant());
            expect(distantPoint.getDirection()).toBe(direction);

            expect(distantPoint.getHyperbolicRadius()).toBe(
              point.getHyperbolicRadius() - distance
            );
          });

          it('should calculate Point towards and across origin', function () {
            distance = (Math.random() + 1) * point.getHyperbolicRadius();
            var distantPoint = point.distantPoint(distance, direction);
            expect(distantPoint.getAngle()).toBe(direction);
            expect(distantPoint.quadrant() % 4).toBe((point.quadrant() + 2) % 4);
            expect(distantPoint.getDirection()).toBe(direction);

            expect(distantPoint.getHyperbolicRadius()).toBe(
              distance - point.getHyperbolicRadius()
            );
          });

          it('should calculate origin', function () {
            distance = point.getHyperbolicRadius();
            var distantPoint = point.distantPoint(distance, direction);
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
        distantPoint = point.distantPoint(distance, direction);
      });

      it('should calculate angle of hyperbolic geodesic towards self from perspective of other Point', function () {
        expect(point.hyperbolicAngleFrom(distantPoint)).toApproximate(
          HyperbolicCanvas.Angle.opposite(distantPoint.getDirection()),
          jasmine.precision
        );
      });

      it('should calculate angle of hyperbolic geodesic towards other Point from perspective of self', function () {
        expect(point.hyperbolicAngleTo(distantPoint)).toApproximate(
          direction,
          jasmine.precision
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

    it('should have mean Cartesian coordinates', function () {
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

    it('should be equidistant to other points at half total distance', function () {
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

    it('should have Cartesian coordinates',function () {
      expect(point.getX()).toBeDefined();
      expect(point.getY()).toBeDefined();
    });

    it('should have angle and Euclidean and hyperbolic radii', function () {
      expect(point.getAngle()).toBeDefined();
      expect(point.getEuclideanRadius()).toBeDefined();
      expect(point.getHyperbolicRadius()).toBeDefined();
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

      it('should have angle and Euclidean radius', function () {
        expect(point.getAngle()).toBeDefined();
        expect(point.getEuclideanRadius()).toBeDefined();
      });

      it('should have Cartesian coordinates',function () {
        expect(point.getX()).toBeDefined();
        expect(point.getY()).toBeDefined();
      });

      it('should equal Point defined by opposite angle and negative radius', function () {
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

      it('should not have hyperbolic radius', function () {
        // TODO determine return type for invalid hyperbolic radius
        expect(point.getHyperbolicRadius()).toBeNaN();
      });

      it('should not be on hyperbolic plane', function () {
        expect(point.isOnPlane()).toBe(false);
      });
    });

    describe('with radius < 1', function () {
      beforeEach(function () {
        point = Point.givenEuclideanPolarCoordinates(
          Math.random(),
          HyperbolicCanvas.Angle.random()
        );
      });

      it('should have hyperbolic radius', function () {
        expect(point.getHyperbolicRadius()).toBeDefined();
      });

      it('should be on hyperbolic plane', function () {
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

    it('should have angle and hyperbolic radius', function () {
      expect(point.getAngle()).toBeDefined();
      expect(point.getHyperbolicRadius()).toBeDefined();
    });

    it('should have Euclidean radius', function () {
      expect(point.getEuclideanRadius()).toBeDefined();
    });

    it('should have Cartesian coordinates',function () {
      expect(point.getX()).toBeDefined();
      expect(point.getY()).toBeDefined();
    });

    it('should be on hyperbolic plane', function () {
      expect(point.isOnPlane()).toBe(true);
    });

    it('should equal Point defined by opposite angle and negative radius', function () {
      var otherPoint = Point.givenHyperbolicPolarCoordinates(
        point.getHyperbolicRadius() * -1,
        HyperbolicCanvas.Angle.opposite(point.getAngle())
      );
      expect(point.equals(otherPoint)).toBe(true);
    });
  });

  describe('ORIGIN', function () {
    beforeEach(function () {
      point = Point.ORIGIN;
    });

    it('should be defined', function () {
      expect(point).toBeDefined();
    });

    it('should have Cartesian coordinates (0, 0)', function () {
      expect(point.getX()).toEqual(0);
      expect(point.getY()).toEqual(0);
    });

    it('should have Euclidean and hyperbolic radii of 0', function () {
      expect(point.getEuclideanRadius()).toEqual(0);
      expect(point.getHyperbolicRadius()).toEqual(0);
    });

    it('should have angle of 0', function () {
      expect(point.getAngle()).toEqual(0);
    });

    it('should be on hyperbolic plane', function () {
      expect(point.isOnPlane()).toBe(true);
    });
  });
});
