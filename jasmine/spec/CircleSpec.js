describe('Circle', function () {
  var Circle = HyperbolicCanvas.Circle;
  var circle;

  describe('in general', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10
      );
    });

    it('should be clonable', function () {
      var clone = circle.clone();
      expect(clone).toBeA(Circle);
      expect(clone).not.toBe(circle);
      expect(circle.equals(clone)).toBe(true);

      expect(
        circle.getEuclideanCenter().equals(clone.getEuclideanCenter())
      ).toBe(true);
      expect(circle.getEuclideanRadius())
        .toApproximate(clone.getEuclideanRadius());
      expect(
        circle.getHyperbolicCenter().equals(clone.getHyperbolicCenter())
      ).toBe(true);
      expect(circle.getHyperbolicRadius())
        .toApproximate(clone.getHyperbolicRadius());
    });

    it('should equal equivalent Circle', function () {
      var otherCircle = Circle.givenHyperbolicCenterRadius(
        circle.getHyperbolicCenter(),
        circle.getHyperbolicRadius()
      );
      expect(circle.equals(otherCircle)).toBe(true);
    });

    it('should have Euclidean area', function () {
      expect(circle.getEuclideanArea()).toBeARealNumber();
    });

    it('should have Euclidean center', function () {
      expect(circle.getEuclideanCenter()).toBeA(HyperbolicCanvas.Point);
    });

    it('should have Euclidean circumference', function () {
      expect(circle.getEuclideanCircumference()).toBeARealNumber();
    });

    it('should have Euclidean diameter', function () {
      expect(circle.getEuclideanDiameter()).toBeARealNumber();
    });

    it('should have Euclidean radius', function () {
      expect(circle.getEuclideanRadius()).toBeARealNumber();
    });

    it('should have hyperbolic area', function () {
      expect(circle.getHyperbolicArea()).toBeARealNumber();
    });

    it('should have hyperbolic center', function () {
      expect(circle.getHyperbolicCenter()).toBeA(HyperbolicCanvas.Point);
    });

    it('should have hyperbolic circumference', function () {
      expect(circle.getHyperbolicCircumference()).toBeARealNumber();
    });

    it('should have hyperbolic diameter', function () {
      expect(circle.getHyperbolicDiameter()).toBeARealNumber();
    });

    it('should have hyperbolic radius', function () {
      expect(circle.getHyperbolicRadius()).toBeARealNumber();
    });

    it('should not have unit circle intersects', function () {
      expect(circle.getUnitCircleIntersects()).toBe(false);
    });

    describe('when mapping angles from center to Points on edge', function () {
      var angle, point;
      describe('along Euclidean geodesics', function () {
        it('should have angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.euclideanAngleAt(point);
          expect(angle).toBeARealNumber();
        });

        it('should have Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.euclideanPointAt(angle);
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(circle.euclideanAngleAt(point)).toApproximate(angle);
        });
      });

      describe('along hyperbolic geodesics', function () {
        it('should have angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.hyperbolicAngleAt(point);
          expect(angle).toBeARealNumber();
        });

        it('should have Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.hyperbolicPointAt(angle);
          expect(point).toBeA(HyperbolicCanvas.Point);

          expect(circle.hyperbolicAngleAt(point)).toApproximate(angle);
        });
      });
    });

    describe('when calculating Points at given x or y coordinate', function () {
      var euclideanCenter, euclideanRadius, hyperbolicCenter, hyperbolicRadius;
      beforeEach(function () {
        euclideanCenter = circle.getEuclideanCenter();
        euclideanRadius = circle.getEuclideanRadius();
        hyperbolicCenter = circle.getHyperbolicCenter();
        hyperbolicRadius = circle.getHyperbolicRadius();
      });

      it('should have two Points with a given x coordinate within Euclidean radius of center', function () {
        var x = euclideanCenter.getX() +
                euclideanRadius * (Math.random() - .5) * 1.99;
        var points = circle.pointsAtX(x);

        expect(points).toBeA(Array);
        expect(points.length).toBe(2);

        points.forEach(function (point) {
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(point.euclideanDistanceTo(euclideanCenter))
            .toApproximate(euclideanRadius);
          expect(point.hyperbolicDistanceTo(hyperbolicCenter))
            .toApproximate(hyperbolicRadius);
        });
      });

      it('should have two Points with a given y coordinate within Euclidean radius of center', function () {
        var y = euclideanCenter.getY() +
                euclideanRadius * (Math.random() - .5) * 1.99;
        var points = circle.pointsAtY(y);

        expect(points).toBeA(Array);
        expect(points.length).toBe(2);

        points.forEach(function (point) {
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(point.euclideanDistanceTo(euclideanCenter))
            .toApproximate(euclideanRadius);
          expect(point.hyperbolicDistanceTo(hyperbolicCenter))
            .toApproximate(hyperbolicRadius);
        });
      });
    });

    // TODO xAtY, yAtX; better to return Array of Points than Array of x or y values?
    // TODO (Euclidean | hyperbolic) tangent at (Euclidean | hyperbolic) (angle | Point)
    //      potentially 8 different functions
  });

  describe('given Euclidean center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random()
      );
    });

    it('should be a Circle', function () {
      expect(circle).toBeA(Circle);
    });
  });

  describe('given hyperbolic center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10
      );
    });

    it('should be a Circle', function () {
      expect(circle).toBeA(Circle);
    });

      // only one guaranteed to have hyperbolic values
  });

  describe('given two points', function () {
    beforeEach(function () {
      circle = Circle.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    it('should be a Circle', function () {
      expect(circle).toBeA(Circle);
    });
  });

  describe('given three points', function () {
    beforeEach(function () {
      circle = Circle.givenThreePoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    it('should be a Circle', function () {
      expect(circle).toBeA(Circle);
    });
  });

  describe('intersects', function () {
    var c0, c1;
    beforeEach(function () {
      c0 = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random()
      );
    });
    describe('where Circles are too far apart to intersect', function () {
      beforeEach(function () {
        c1 = Circle.givenEuclideanCenterRadius(
          c0.getEuclideanCenter().euclideanDistantPoint(
            2,
            HyperbolicCanvas.Angle.random()
          ),
          1
        );
      });

      it('should be false', function () {
        expect(Circle.intersects(c0, c1)).toBe(false);
      });
    });

    describe('where one Circle is contained within the other', function () {
      beforeEach(function () {
        var r = c0.getEuclideanRadius();
        c1 = Circle.givenEuclideanCenterRadius(
          c0.getEuclideanCenter().euclideanDistantPoint(
            (r / 2) * Math.random(),
            HyperbolicCanvas.Angle.random()
          ),
          (r / 2) * Math.random()
        );
      });

      it('should be false', function () {
        expect(Circle.intersects(c0, c1)).toBe(false);
      });
    });

    describe('where Circles intersect', function () {
      beforeEach(function () {
        var center = c0.getEuclideanCenter().euclideanDistantPoint(
          c0.getEuclideanRadius(),
          HyperbolicCanvas.Angle.random()
        );
        c1 = Circle.givenEuclideanCenterRadius(
          center,
          c0.getEuclideanRadius()
        );
      });

      it('should be an Array of two Points', function () {
        var intersects = Circle.intersects(c0, c1);
        expect(intersects).toBeA(Array);
        expect(intersects.length).toBe(2);
        intersects.forEach(function (intersect) {
          expect(intersect).toBeA(HyperbolicCanvas.Point);
        });
      });
    });
  });

  describe('UNIT', function () {
    beforeEach(function () {
      circle = Circle.UNIT;
    });

    it('should be Circle', function () {
      expect(circle).toBeA(Circle);
    }, true);

    it('should have Euclidean and hyperbolic center at origin', function () {
      expect(circle.getEuclideanCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
      expect(circle.getHyperbolicCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
    }, true);

    it('should have Euclidean area of pi', function () {
      expect(circle.getEuclideanArea()).toBe(Math.PI);
    }, true);

    it('should have Euclidean circumference of tau', function () {
      expect(circle.getEuclideanCircumference()).toBe(Math.TAU);
    }, true);

    it('should have Euclidean radius of 1', function () {
      expect(circle.getEuclideanRadius()).toBe(1);
    }, true);

    it('should have Euclidean diameter of 2', function () {
      expect(circle.getEuclideanDiameter()).toBe(2);
    }, true);

    it('should calculate angle towards Point along Euclidean geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      expect(circle.euclideanAngleAt(point)).toApproximate(point.getAngle());
    });

    it('should calculate Point in direction of angle along Euclidean geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      expect(circle.euclideanPointAt(angle).equals(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      )).toBe(true);
    });

    it('should have hyperbolic area of infinity', function () {
      expect(circle.getHyperbolicArea()).toBe(Infinity);
    }, true);

    it('should have hyperbolic circumference of infinity', function () {
      expect(circle.getHyperbolicCircumference()).toBe(Infinity);
    }, true);

    it('should have hyperbolic radius of infinity', function () {
      expect(circle.getHyperbolicRadius()).toBe(Infinity);
    }, true);

    it('should have hyperbolic diameter of infinity', function () {
      expect(circle.getHyperbolicDiameter()).toBe(Infinity);
    }, true);

    it('should calculate angle towards Point along hyperbolic geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      expect(circle.hyperbolicAngleAt(point)).toApproximate(point.getAngle());
    });

    it('should calculate Point in direction of angle along hyperbolic geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      expect(circle.hyperbolicPointAt(angle).equals(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      )).toBe(true);
    });
  });
});
