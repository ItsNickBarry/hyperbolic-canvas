describe('Circle', function () {
  var Circle = HyperbolicCanvas.Circle;
  var circle;

  describe('on hyperbolic plane', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10
      );
    });

    it('is clonable', function () {
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

    it('equals equivalent Circle', function () {
      var otherCircle = Circle.givenHyperbolicCenterRadius(
        circle.getHyperbolicCenter(),
        circle.getHyperbolicRadius()
      );
      expect(circle.equals(otherCircle)).toBe(true);
    });

    it('has Euclidean area', function () {
      expect(circle.getEuclideanArea()).toBeARealNumber();
    });

    it('has Euclidean center', function () {
      expect(circle.getEuclideanCenter()).toBeA(HyperbolicCanvas.Point);
    });

    it('has Euclidean circumference', function () {
      expect(circle.getEuclideanCircumference()).toBeARealNumber();
    });

    it('has Euclidean diameter', function () {
      expect(circle.getEuclideanDiameter()).toBeARealNumber();
    });

    it('has Euclidean radius', function () {
      expect(circle.getEuclideanRadius()).toBeARealNumber();
    });

    it('has hyperbolic area', function () {
      expect(circle.getHyperbolicArea()).toBeARealNumber();
    });

    it('has hyperbolic center', function () {
      expect(circle.getHyperbolicCenter()).toBeA(HyperbolicCanvas.Point);
    });

    it('has hyperbolic circumference', function () {
      expect(circle.getHyperbolicCircumference()).toBeARealNumber();
    });

    it('has hyperbolic diameter', function () {
      expect(circle.getHyperbolicDiameter()).toBeARealNumber();
    });

    it('has hyperbolic radius', function () {
      expect(circle.getHyperbolicRadius()).toBeARealNumber();
    });

    it('does not have unit circle intersects', function () {
      expect(circle.getUnitCircleIntersects()).toBe(false);
    });

    it('contains Point within its radius', function () {
      var point = circle.getEuclideanCenter().euclideanDistantPoint(
        circle.getEuclideanRadius() * .9 * Math.random(),
        HyperbolicCanvas.Angle.random()
      );
      expect(circle.containsPoint(point)).toBe(true);
    });

    it('includes Point on its circumference', function () {
      var point = circle.getEuclideanCenter().euclideanDistantPoint(
        circle.getEuclideanRadius(),
        HyperbolicCanvas.Angle.random()
      );
      expect(circle.includesPoint(point)).toBe(true);
    });

    it('has Euclidean tangent line at given angle', function () {
      var angle = HyperbolicCanvas.Angle.random();
      expect(circle.euclideanTangentAtAngle(angle)).toBeA(HyperbolicCanvas.Line);
    });

    it('has Euclidean tangent line at angle of given Point', function () {
      var point = HyperbolicCanvas.Point.random();
      expect(circle.euclideanTangentAtPoint(point)).toBeA(HyperbolicCanvas.Line);
    });

    describe('when mapping angles from center to Points on edge', function () {
      var angle, point;
      describe('along Euclidean geodesics', function () {
        it('has angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.euclideanAngleAt(point);
          expect(angle).toBeARealNumber();
        });

        it('has Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.euclideanPointAt(angle);
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(circle.euclideanAngleAt(point)).toApproximate(angle);
        });
      });

      describe('along hyperbolic geodesics', function () {
        it('has angle from center towards Point', function () {
          point = HyperbolicCanvas.Point.random();
          angle = circle.hyperbolicAngleAt(point);
          expect(angle).toBeARealNumber();
        });

        it('has Point on edge at given angle', function () {
          angle = HyperbolicCanvas.Angle.random();
          point = circle.hyperbolicPointAt(angle);
          expect(point).toBeA(HyperbolicCanvas.Point);

          expect(circle.hyperbolicAngleAt(point)).toApproximate(angle);
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
            x = euclideanCenter.getX() +
                euclideanRadius * (Math.random() - .5);
          });

          it('has two y values', function () {
            var values = circle.yAtX(x);

            expect(values).toBeA(Array);
            expect(values.length).toBe(2);

            values.forEach(function (value) {
              expect(value).toBeARealNumber();
            });
          });

          it('has two Points', function () {
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
        });

        describe('at Euclidean radius from center', function () {
          beforeEach(function () {
            x = euclideanCenter.getX() +
                euclideanRadius * (Math.random() > .5 ? 1 : -1);
          });

          it('has one y value', function () {
            var values = circle.yAtX(x);

            expect(values).toBeA(Array);
            expect(values.length).toBe(1);
            expect(values[0]).toBeARealNumber();
          });

          it('has one Point', function () {
            var points = circle.pointsAtX(x);

            expect(points).toBeA(Array);
            expect(points.length).toBe(1);
            expect(points[0]).toBeA(HyperbolicCanvas.Point);
            expect(points[0].euclideanDistanceTo(euclideanCenter))
              .toApproximate(euclideanRadius);
            expect(points[0].hyperbolicDistanceTo(hyperbolicCenter))
              .toApproximate(hyperbolicRadius);
          });
        });

        describe('outside of Euclidean radius from center', function () {
          beforeEach(function () {
            x = euclideanCenter.getX() +
                euclideanRadius * (
                  Math.random() > .5 ? 1 + Math.random() : -1 - Math.random()
                );
          });

          it('has zero y values', function () {
            var values = circle.yAtX(x);

            expect(values).toBeA(Array);
            expect(values.length).toBe(0);
          });

          it('has zero Points', function () {
            var points = circle.pointsAtX(x);

            expect(points).toBeA(Array);
            expect(points.length).toBe(0);
          });
        });
      });

      describe('y', function () {
        var y;
        describe('within Euclidean radius of center', function () {
          beforeEach(function () {
            y = euclideanCenter.getY() +
                euclideanRadius * (Math.random() - .5);
          });

          it('has two x values', function () {
            var values = circle.xAtY(y);

            expect(values).toBeA(Array);
            expect(values.length).toBe(2);

            values.forEach(function (value) {
              expect(value).toBeARealNumber();
            });
          });

          it('has two Points', function () {
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

        describe('at Euclidean radius from center', function () {
          beforeEach(function () {
            y = euclideanCenter.getY() +
                euclideanRadius * (Math.random() > .5 ? 1 : -1);
          });

          it('has one x value', function () {
            var values = circle.xAtY(y);

            expect(values).toBeA(Array);
            expect(values.length).toBe(1);
            expect(values[0]).toBeARealNumber();
          });

          it('has one Point', function () {
            var points = circle.pointsAtY(y);

            expect(points).toBeA(Array);
            expect(points.length).toBe(1);
            expect(points[0]).toBeA(HyperbolicCanvas.Point);
            expect(points[0].euclideanDistanceTo(euclideanCenter))
              .toApproximate(euclideanRadius);
            expect(points[0].hyperbolicDistanceTo(hyperbolicCenter))
              .toApproximate(hyperbolicRadius);
          });
        });

        describe('outside of Euclidean radius from center', function () {
          beforeEach(function () {
            y = euclideanCenter.getY() +
                euclideanRadius * (
                  Math.random() > .5 ? 1 + Math.random() : -1 - Math.random()
                );
          });

          it('has zero x values', function () {
            var values = circle.xAtY(y);

            expect(values).toBeA(Array);
            expect(values.length).toBe(0);
          });

          it('has zero Points', function () {
            var points = circle.pointsAtY(y);

            expect(points).toBeA(Array);
            expect(points.length).toBe(0);
          });
        });
      });
    });
  });

  describe('not on hyperbolic plane', function () {
    beforeEach(function () {
      var center = HyperbolicCanvas.Point.random()
      circle = Circle.givenEuclideanCenterRadius(
        center,
        (1 - center.getEuclideanRadius()) * (1 + Math.random())
      );
    });

    it('has Euclidean area', function () {
      expect(circle.getEuclideanArea()).toBeARealNumber();
    });

    it('has Euclidean center', function () {
      expect(circle.getEuclideanCenter()).toBeA(HyperbolicCanvas.Point);
    });

    it('has Euclidean circumference', function () {
      expect(circle.getEuclideanCircumference()).toBeARealNumber();
    });

    it('has Euclidean diameter', function () {
      expect(circle.getEuclideanDiameter()).toBeARealNumber();
    });

    it('has Euclidean radius', function () {
      expect(circle.getEuclideanRadius()).toBeARealNumber();
    });

    it('does not have hyperbolic area', function () {
      expect(circle.getHyperbolicArea()).toBeNaN();
    });

    it('does not have hyperbolic center', function () {
      expect(circle.getHyperbolicCenter()).toBe(false);
    });

    it('does not have hyperbolic circumference', function () {
      expect(circle.getHyperbolicCircumference()).toBeNaN();
    });

    it('does not have hyperbolic diameter', function () {
      expect(circle.getHyperbolicDiameter()).toBeNaN();
    });

    it('does not have hyperbolic radius', function () {
      expect(circle.getHyperbolicRadius()).toBeNaN();
    });
  });

  describe('given Euclidean center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random()
      );
    });

    it('is a Circle', function () {
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

    it('is a Circle', function () {
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

    it('is a Circle', function () {
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

    it('is a Circle', function () {
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

      it('is false', function () {
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

      it('is false', function () {
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

      it('is an Array of two Points', function () {
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

    it('is Circle', function () {
      expect(circle).toBeA(Circle);
    }, true);

    it('has Euclidean and hyperbolic center at origin', function () {
      expect(circle.getEuclideanCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
      expect(circle.getHyperbolicCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
    }, true);

    it('has Euclidean area of pi', function () {
      expect(circle.getEuclideanArea()).toBe(Math.PI);
    }, true);

    it('has Euclidean circumference of tau', function () {
      expect(circle.getEuclideanCircumference()).toBe(Math.TAU);
    }, true);

    it('has Euclidean radius of 1', function () {
      expect(circle.getEuclideanRadius()).toBe(1);
    }, true);

    it('has Euclidean diameter of 2', function () {
      expect(circle.getEuclideanDiameter()).toBe(2);
    }, true);

    it('calculates angle towards Point along Euclidean geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      expect(circle.euclideanAngleAt(point)).toApproximate(point.getAngle());
    });

    it('calculates Point in direction of angle along Euclidean geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      expect(circle.euclideanPointAt(angle).equals(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      )).toBe(true);
    });

    it('has hyperbolic area of infinity', function () {
      expect(circle.getHyperbolicArea()).toBe(Infinity);
    }, true);

    it('has hyperbolic circumference of infinity', function () {
      expect(circle.getHyperbolicCircumference()).toBe(Infinity);
    }, true);

    it('has hyperbolic radius of infinity', function () {
      expect(circle.getHyperbolicRadius()).toBe(Infinity);
    }, true);

    it('has hyperbolic diameter of infinity', function () {
      expect(circle.getHyperbolicDiameter()).toBe(Infinity);
    }, true);

    it('calculates angle towards Point along hyperbolic geodesic', function () {
      var point = HyperbolicCanvas.Point.random();
      expect(circle.hyperbolicAngleAt(point)).toApproximate(point.getAngle());
    });

    it('calculates Point in direction of angle along hyperbolic geodesic', function () {
      var angle = HyperbolicCanvas.Angle.random();
      expect(circle.hyperbolicPointAt(angle).equals(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      )).toBe(true);
    });
  });
});
