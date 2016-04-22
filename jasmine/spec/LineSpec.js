describe('Line', function () {
  var Line = HyperbolicCanvas.Line;
  var line;

  describe('in general', function () {
    var point, slope;
    describe('with random slope', function () {

      beforeEach(function () {
        point = HyperbolicCanvas.Point.random();
        slope = HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
        line = Line.givenPointSlope(point, slope);
      });

      it('should be cloneable', function () {
        var clone = line.clone();
        expect(clone).toBeA(Line);
        expect(clone).not.toBe(line);
        expect(line.equals(clone)).toBe(true);

        expect(line.getEuclideanLength())
          .toApproximate(clone.getEuclideanLength());
        expect(line.getHyperbolicLength())
          .toApproximate(clone.getHyperbolicLength());

        expect(line.containsPoint(clone.getP0())).toBe(true);
        expect(clone.containsPoint(line.getP0())).toBe(true);
      });

      it('should be equal to identical Line', function () {
        var otherLine = Line.givenPointSlope(
          line.getP0(),
          line.getSlope()
        );
        expect(line.equals(otherLine)).toBe(true);
      });

      it('should contain Points', function () {
        expect(line.containsPoint(line.getP0())).toBe(true);
        expect(line.containsPoint(line.getP1())).toBe(true);
        expect(line.containsPoint(
          line.pointAtEuclideanX(Math.random())
        )).toBe(true);
        expect(line.containsPoint(
          line.pointAtEuclideanY(Math.random())
        )).toBe(true);
      });

      it('should be parallel to Line with same slope', function () {
        var otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          line.getSlope()
        );
        expect(line.isParallelTo(otherLine)).toBe(true);
      });

      it('should have a perpindicular slope', function () {
        expect(line.perpindicularSlope()).toBe(-1 / line.getSlope());
      });

      it('should have perpindicular lines', function () {
        var perpindicularLine = line.perpindicularLineAt(
          HyperbolicCanvas.Point.random()
        );
        expect(perpindicularLine).toBeA(Line);
        expect(perpindicularLine.getSlope()).toBe(line.perpindicularSlope());
        expect(Line.euclideanIntersect(line, perpindicularLine)).toBeA(
          HyperbolicCanvas.Point
        );
      });

      it('should have a perpindicular bisector', function () {
        var bisector = line.perpindicularBisector();
        expect(bisector).toBeA(Line);
        expect(bisector.getSlope()).toBe(line.perpindicularSlope());
        var intersect = Line.euclideanIntersect(line, bisector);
        expect(line.containsPoint(intersect)).toBe(true);
        expect(bisector.containsPoint(intersect)).toBe(true);
      });

      it('should have Point for any x value', function () {
        var point = line.pointAtEuclideanX(Math.random());
        expect(point).toBeA(HyperbolicCanvas.Point);
        expect(line.containsPoint(point)).toBe(true);
      });

      it('should have Point for any y value', function () {
        var point = line.pointAtEuclideanY(Math.random());
        expect(point).toBeA(HyperbolicCanvas.Point);
        expect(line.containsPoint(point)).toBe(true);
      });

      it('should have x value for any y value', function () {
        var y = Math.random() * 2 - 1;
        var x = line.euclideanXAtY(y);
        expect(x).toBeARealNumber();
        expect(line.euclideanYAtX(x)).toApproximate(y);
      });

      it('should have y value for any x value', function () {
        var x = Math.random() * 2 - 1;
        var y = line.euclideanYAtX(x);
        expect(y).toBeARealNumber();
        expect(line.euclideanXAtY(y)).toApproximate(x);
      });
    });

    describe('with slope of 0', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(HyperbolicCanvas.Point.random(), 0);
      });

      it('should have a perpindicular slope', function () {
        expect(line.perpindicularSlope()).toBe(Infinity);
      });

      it('should have x value of true for only one y value', function () {
        expect(line.euclideanXAtY(Math.random())).toBe(false);
        expect(line.euclideanXAtY(line.getP0().getY())).toBe(true);
      });

      it('should have single y value for any x value', function () {
        expect(line.euclideanYAtX(Math.random())).toBe(line.getP0().getY());
      });
    });

    describe('with infinite slope', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(HyperbolicCanvas.Point.random(), Infinity);
      });

      it('should have a perpindicular slope', function () {
        expect(line.perpindicularSlope()).toBe(0);
      });

      it('should have single x value for any y value', function () {
        expect(line.euclideanXAtY(Math.random())).toBe(line.getP0().getX());
      });

      it('should have y value of true for only one x value', function () {
        expect(line.euclideanYAtX(Math.random())).toBe(false);
        expect(line.euclideanYAtX(line.getP0().getX())).toBe(true);
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
              angle
            ),
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random() * -1,
              angle
            )
          );
        });

        it('should be on plane', function () {
          expect(line.isOnPlane()).toBe(true);
        });

        it('should have hyperbolic geodesic Line', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(Line);
        });

        it('should have Euclidean length', function () {
          expect(line.getEuclideanLength()).toBeARealNumber();
        });

        it('should have Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
        });

        it('should have hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          expect(d).not.toBeNaN();
          expect(d).toApproximate(
            line.getP0().hyperbolicDistanceTo(line.getP1())
          );
        });

        it('should have hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1())
          );
          expect(angle0).toApproximate(angle1);
        });

        it('should have ideal Points', function () {
          var idealPoints = line.getIdealPoints();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
        });

        it('should have Euclidean unit circle intersects with opposite angles', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(HyperbolicCanvas.Angle.normalize(
            intersects[0].getAngle() - intersects[1].getAngle()
          )).toApproximate(Math.PI);
          intersects.forEach(function (intersect) {
            expect(intersect).toBeA(HyperbolicCanvas.Point);
            expect(intersect.getX()).toBeARealNumber();
            expect(intersect.getY()).toBeARealNumber();
            expect(intersect.getEuclideanRadius()).toApproximate(1);
          });
        });
      });

      describe('on one side of origin', function () {
        beforeEach(function () {
          var angle = HyperbolicCanvas.Angle.random();
          line = Line.givenTwoPoints(
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random(),
              angle
            ),
            HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
              Math.random(),
              angle
            )
          );
        });

        it('should be on plane', function () {
          expect(line.isOnPlane()).toBe(true);
        });

        it('should have hyperbolic geodesic Line', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(Line);
        });

        it('should have Euclidean length', function () {
          expect(line.getEuclideanLength()).toBeARealNumber();
        });

        it('should have Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
        });

        it('should have hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          expect(d).not.toBeNaN();
          expect(d).toApproximate(
            line.getP0().hyperbolicDistanceTo(line.getP1())
          );
        });

        it('should have hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1())
          );
          expect(angle0).toApproximate(angle1);
        });

        it('should have ideal Points', function () {
          var idealPoints = line.getIdealPoints();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
        });

        it('should have Euclidean unit circle intersects with opposite angles', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(HyperbolicCanvas.Angle.normalize(
            intersects[0].getAngle() - intersects[1].getAngle()
          )).toApproximate(Math.PI);
          intersects.forEach(function (intersect) {
            expect(intersect).toBeA(HyperbolicCanvas.Point);
            expect(intersect.getX()).toBeARealNumber();
            expect(intersect.getY()).toBeARealNumber();
            expect(intersect.getEuclideanRadius()).toApproximate(1);
          });
        });
      });
    });

    describe('not along diameter', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(
          HyperbolicCanvas.Point.random(),
          HyperbolicCanvas.Point.random()
        );
      });

      it('should be on plane', function () {
        expect(line.isOnPlane()).toBe(true);
      });

      it('should have hyperbolic geodesic Circle', function () {
        expect(line.getHyperbolicGeodesic()).toBeA(HyperbolicCanvas.Circle);
      });

      it('should have Euclidean length', function () {
        expect(line.getEuclideanLength()).toBeARealNumber();
      });

      it('should have Euclidean midpoint', function () {
        expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
      });

      it('should have hyperbolic length', function () {
        var d = line.getHyperbolicLength();
        expect(d).not.toBeNaN();
        expect(d).toApproximate(
          line.getP0().hyperbolicDistanceTo(line.getP1())
        );
      });

      it('should have hyperbolic midpoint', function () {
        var midpoint = line.getHyperbolicMidpoint();
        expect(midpoint).toBeA(HyperbolicCanvas.Point);
        var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
        var angle1 = HyperbolicCanvas.Angle.opposite(
          midpoint.hyperbolicAngleTo(line.getP1())
        );
        expect(angle0).toApproximate(angle1);
      });

      it('should have ideal Points', function () {
        var idealPoints = line.getIdealPoints();
        expect(idealPoints).toBeA(Array);
        expect(idealPoints.length).toBe(2);
        idealPoints.forEach(function (point) {
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(point.isIdeal()).toBe(true);
        });
      });

      it('should have Euclidean unit circle intersects', function () {
        var intersects = line.getEuclideanUnitCircleIntersects();
        expect(intersects).toBeA(Array);
        expect(intersects.length).toBe(2);
        intersects.forEach(function (intersect){
          expect(intersect).toBeA(HyperbolicCanvas.Point);
          expect(intersect.getX()).toBeARealNumber();
          expect(intersect.getY()).toBeARealNumber();
          expect(intersect.getEuclideanRadius()).toApproximate(1);
        });
      });
    });
  });

  describe('not on hyperbolic plane', function () {
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
          Math.random() + 1,
          HyperbolicCanvas.Angle.random()
        )
      );
    });

    it('should not be on plane', function () {
      expect(line.isOnPlane()).toBe(false);
    });

    it('should not have hyperbolic geodesic', function () {
      expect(line.getHyperbolicGeodesic()).toBe(false);
    });

    it('should have Euclidean length', function () {
      expect(line.getEuclideanLength()).toBeARealNumber();
    });

    it('should have Euclidean midpoint', function () {
      expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
    });

    it('should not have hyperbolic length', function () {
      var l = line.getHyperbolicLength();
      expect(l).toBeA(Number);
      expect(l).toBeNaN();
    });

    it('should not have hyperbolic midpoint', function () {
      expect(line.getHyperbolicMidpoint()).toBe(false);
    });

    it('should not have ideal Points', function () {
      expect(line.getIdealPoints()).toBe(false);
    });
  });

  describe('given point and slope', function () {
    beforeEach(function () {
      line = Line.givenPointSlope(
        HyperbolicCanvas.Point.random(),
        Line.randomSlope()
      );
    });

    it('should have point and slope', function () {
      expect(line.getP0()).toBeA(HyperbolicCanvas.Point);
      expect(line.getSlope()).toBeARealNumber();
    });

    it('should have second point', function () {
      expect(line.getP1()).toBeA(HyperbolicCanvas.Point);
    });
  });

  describe('given two points', function () {
    describe('on hyperbolic plane', function () {
      beforeEach(function () {
        line = Line.givenTwoPoints(
          HyperbolicCanvas.Point.random(),
          HyperbolicCanvas.Point.random()
        );
      });

      it('should have two points', function () {
        expect(line.getP0()).toBeA(HyperbolicCanvas.Point);
        expect(line.getP1()).toBeA(HyperbolicCanvas.Point);
      });

      it('should have slope', function () {
        expect(line.getSlope()).toBeARealNumber();
      });
    });

    describe('including one ideal point', function () {
      describe('generated at random', function () {
        beforeEach(function () {
          line = Line.givenTwoPoints(
            HyperbolicCanvas.Point.random(),
            HyperbolicCanvas.Point.givenIdealAngle(
              HyperbolicCanvas.Angle.random()
            )
          );
        });

        it('should be ideal', function () {
          expect(line.isIdeal()).toBe(true);
        });

        it('should have hyperbolic length of infinity', function () {
          expect(line.getHyperbolicLength()).toBe(Infinity);
        });

        it('should have geodesic Circle', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(HyperbolicCanvas.Circle);
        });

        it('should have ideal Points', function () {
          var idealPoints = line.getIdealPoints();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
        });

        it('should have Euclidean unit circle intersects', function () {
          var intersects = line.getEuclideanUnitCircleIntersects();
          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          intersects.forEach(function (intersect){
            expect(intersect).toBeA(HyperbolicCanvas.Point);
            expect(intersect.getX()).toBeARealNumber();
            expect(intersect.getY()).toBeARealNumber();
            expect(intersect.getEuclideanRadius()).toApproximate(1);
          });
        });
      });

      describe('along diameter of plane', function () {
        beforeEach(function () {
          var p = HyperbolicCanvas.Point.random();
          line = Line.givenTwoPoints(
            p,
            HyperbolicCanvas.Point.givenIdealAngle(p.getAngle())
          );
        });

        it('should be ideal', function () {
          expect(line.isIdeal()).toBe(true);
        });

        it('should have hyperbolic length of infinity', function () {
          expect(line.getHyperbolicLength()).toBe(Infinity);
        });

        it('should have geodesic Line', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(Line);
        });
      });
    });
  });

  describe('given angles of ideal points', function () {
    describe('generated at random', function () {
      beforeEach(function () {
        line = Line.givenAnglesOfIdealPoints(
          HyperbolicCanvas.Angle.random(),
          HyperbolicCanvas.Angle.random()
        );
      });

      it('should have two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        expect(p0).toBeA(HyperbolicCanvas.Point);
        expect(p1).toBeA(HyperbolicCanvas.Point);
        expect(p0.isIdeal()).toBe(true);
        expect(p1.isIdeal()).toBe(true);
      });

      it('should be ideal', function () {
        expect(line.isIdeal()).toBe(true);
      });

      it('should have hyperbolic length of infinity', function () {
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });

      it('should have geodesic Circle', function () {
        expect(line.getHyperbolicGeodesic()).toBeA(HyperbolicCanvas.Circle);
      });
    });

    describe('along diameter of plane', function () {
      beforeEach(function () {
        var angle = HyperbolicCanvas.Angle.random();
        line = Line.givenAnglesOfIdealPoints(
          angle,
          HyperbolicCanvas.Angle.opposite(angle)
        );
      });

      it('should have two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        expect(p0).toBeA(HyperbolicCanvas.Point);
        expect(p1).toBeA(HyperbolicCanvas.Point);
        expect(p0.isIdeal()).toBe(true);
        expect(p1.isIdeal()).toBe(true);
      });

      it('should be ideal', function () {
        expect(line.isIdeal()).toBe(true);
      });

      it('should have hyperbolic length of infinity', function () {
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });

      it('should have geodesic Line', function () {
        expect(line.getHyperbolicGeodesic()).toBeA(Line);
      });
    });
  });

  describe('Euclidean intersect', function () {
    var otherLine;
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    describe('of parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          line.getSlope()
        );
      });

      it('should not exist', function () {
        expect(Line.euclideanIntersect(line, otherLine)).toBe(false);
      });
    });

    describe('of non-parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          Line.randomSlope()
        );
      });

      it('should be Point', function () {
        expect(
          Line.euclideanIntersect(line, otherLine)
        ).toBeA(HyperbolicCanvas.Point);
      });
    });

    describe('with x-axis', function () {
      beforeEach(function () {
        otherLine = Line.X_AXIS;
      });

      it('should be Point', function () {
        expect(
          Line.euclideanIntersect(line, otherLine)
        ).toBeA(HyperbolicCanvas.Point);
      });
    });

    describe('with y-axis', function () {
      beforeEach(function () {
        otherLine = Line.Y_AXIS;
      });

      it('should be Point', function () {
        expect(
          Line.euclideanIntersect(line, otherLine)
        ).toBeA(HyperbolicCanvas.Point);
      });
    });
  });

  describe('hyperbolic intersect', function () {
    var otherLine;
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    describe('of parallel lines', function () {
      beforeEach(function () {
        otherLine = Line.givenTwoPoints(
          line.getP0().opposite(),
          line.getP1().opposite()
        );
      });

      it('should not exist', function () {
        expect(Line.hyperbolicIntersect(line, otherLine)).toBe(false);
      });
    });

    describe('of non-parallel lines', function () {
      var expectedIntersect;
      beforeEach(function () {
        // calculate some point on line
        var angleAlongLine = line.getP0().hyperbolicAngleTo(line.getP1());
        var lengthOfLine = line.getHyperbolicLength();
        expectedIntersect = line.getP0().hyperbolicDistantPoint(
          lengthOfLine / 2,
          angleAlongLine
        );
      });

      describe('with curved hyperbolic geodesics', function () {
        beforeEach(function () {
          var p0 = HyperbolicCanvas.Point.random();
          var angleAlongOtherLine = expectedIntersect.hyperbolicAngleTo(p0);
          var p1 = expectedIntersect.hyperbolicDistantPoint(
            expectedIntersect.hyperbolicDistanceTo(p0) / 2,
            expectedIntersect.hyperbolicAngleTo(p0)
          );

          otherLine = Line.givenTwoPoints(p0, p1);
        });

        it('should be Point on plane', function () {
          var intersect = Line.hyperbolicIntersect(line, otherLine);
          expect(intersect).toBeA(HyperbolicCanvas.Point);
          expect(intersect.isOnPlane()).toBe(true);
          expect(intersect.equals(expectedIntersect)).toBe(true);
        });
      });

      describe('with curved and straight hyperbolic geodesics', function () {
        beforeEach(function () {
          var angle = expectedIntersect.getAngle();
          otherLine = Line.givenTwoPoints(
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle),
            expectedIntersect.hyperbolicDistantPoint(Math.random() * 10, angle)
          );
        });

        it('should be Point on plane', function () {
          var intersect = Line.hyperbolicIntersect(line, otherLine);
          expect(intersect).toBeA(HyperbolicCanvas.Point);
          expect(intersect.isOnPlane()).toBe(true);
          expect(intersect.equals(expectedIntersect)).toBe(true);
        });
      });
    });
  });

  describe('random slope', function () {
    it('should be number', function () {
      expect(Line.randomSlope()).toBeARealNumber();
    });
  });

  describe('X_AXIS', function () {
    beforeEach(function () {
      line = Line.X_AXIS;
    });

    it('should be Line', function () {
      expect(line).toBeA(Line);
    }, true);

    it('should include origin', function () {
      expect(line.containsPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    }, true);

    it('should have a slope of 0', function () {
      expect(line.getSlope()).toBe(0);
    }, true);
  });

  describe('Y_AXIS', function () {
    beforeEach(function () {
      line = Line.Y_AXIS;
    });

    it('should be Line', function () {
      expect(line).toBeA(Line);
    }, true);

    it('should include origin', function () {
      expect(line.containsPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    }, true);

    it('should have slope of infinity', function () {
      expect(line.getSlope()).toBe(Infinity);
    }, true);
  });
});
