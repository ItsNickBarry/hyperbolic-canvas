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

      it('is cloneable', function () {
        var clone = line.clone();
        expect(clone).toBeA(Line);
        expect(clone).not.toBe(line);
        expect(line.equals(clone)).toBe(true);

        expect(line.getEuclideanLength())
          .toApproximate(clone.getEuclideanLength());
        expect(line.getHyperbolicLength())
          .toApproximate(clone.getHyperbolicLength());

        expect(line.euclideanIncludesPoint(clone.getP0())).toBe(true);
        expect(clone.euclideanIncludesPoint(line.getP0())).toBe(true);
      });

      it('is equal to identical Line', function () {
        var otherLine = Line.givenPointSlope(
          line.getP0(),
          line.getSlope()
        );
        expect(line.equals(otherLine)).toBe(true);
      });

      it('includes Points in Euclidean context', function () {
        expect(line.euclideanIncludesPoint(line.getP0())).toBe(true);
        expect(line.euclideanIncludesPoint(line.getP1())).toBe(true);
        expect(line.euclideanIncludesPoint(
          line.pointAtEuclideanX(Math.random())
        )).toBe(true);
        expect(line.euclideanIncludesPoint(
          line.pointAtEuclideanY(Math.random())
        )).toBe(true);
      });

      it('is parallel to Line with same slope in Euclidean context', function () {
        var otherLine = Line.givenPointSlope(
          HyperbolicCanvas.Point.random(),
          line.getSlope()
        );
        expect(line.isEuclideanParallelTo(otherLine)).toBe(true);
      });

      it('has a perpindicular slope', function () {
        expect(line.euclideanPerpindicularSlope()).toBe(-1 / line.getSlope());
      });

      it('has perpindicular lines', function () {
        var perpindicularLine = line.euclideanPerpindicularLineAt(
          HyperbolicCanvas.Point.random()
        );
        expect(perpindicularLine).toBeA(Line);
        expect(perpindicularLine.getSlope()).toBe(line.euclideanPerpindicularSlope());
        expect(Line.euclideanIntersect(line, perpindicularLine)).toBeA(
          HyperbolicCanvas.Point
        );
      });

      it('has a perpindicular bisector', function () {
        var bisector = line.euclideanPerpindicularBisector();
        expect(bisector).toBeA(Line);
        expect(bisector.getSlope()).toBe(line.euclideanPerpindicularSlope());
        var intersect = Line.euclideanIntersect(line, bisector);
        expect(line.euclideanIncludesPoint(intersect)).toBe(true);
        expect(bisector.euclideanIncludesPoint(intersect)).toBe(true);
      });

      it('has Point for any x value', function () {
        var point = line.pointAtEuclideanX(Math.random());
        expect(point).toBeA(HyperbolicCanvas.Point);
        expect(line.euclideanIncludesPoint(point)).toBe(true);
      });

      it('has Point for any y value', function () {
        var point = line.pointAtEuclideanY(Math.random());
        expect(point).toBeA(HyperbolicCanvas.Point);
        expect(line.euclideanIncludesPoint(point)).toBe(true);
      });

      it('has x value for any y value', function () {
        var y = Math.random() * 2 - 1;
        var x = line.euclideanXAtY(y);
        expect(x).toBeARealNumber();
        expect(line.euclideanYAtX(x)).toApproximate(y);
      });

      it('has y value for any x value', function () {
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

      it('has a perpindicular slope', function () {
        expect(line.euclideanPerpindicularSlope()).toBe(Infinity);
      });

      it('has x value of true for only one y value', function () {
        expect(line.euclideanXAtY(Math.random())).toBe(false);
        expect(line.euclideanXAtY(line.getP0().getY())).toBe(true);
      });

      it('has single y value for any x value', function () {
        expect(line.euclideanYAtX(Math.random())).toBe(line.getP0().getY());
      });
    });

    describe('with infinite slope', function () {
      beforeEach(function () {
        line = Line.givenPointSlope(HyperbolicCanvas.Point.random(), Infinity);
      });

      it('has a perpindicular slope', function () {
        expect(line.euclideanPerpindicularSlope()).toBe(0);
      });

      it('has single x value for any y value', function () {
        expect(line.euclideanXAtY(Math.random())).toBe(line.getP0().getX());
      });

      it('has y value of true for only one x value', function () {
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

        it('is on plane', function () {
          expect(line.isOnPlane()).toBe(true);
        });

        it('has hyperbolic geodesic Line', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          var pointOnLine = line.getP0().hyperbolicDistantPoint(
            line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1()) + (Math.random() < .5 ? Math.PI : 0)
          );

          var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          expect(line.hyperbolicEquals(otherLine)).toBe(true);
        });

        it('has Euclidean length', function () {
          expect(line.getEuclideanLength()).toBeARealNumber();
        });

        it('has Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
        });

        it('has Euclidean intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
            line.getP0().euclideanDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random()
            ),
            radius + 1
          );

          var intersects = line.euclideanIntersectsWithCircle(circle);

          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line)
          ).toBe(true);
        });

        it('has hyperbolic intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            line.getP0().hyperbolicDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random()
            ),
            radius + 1
          );

          var intersects = line.hyperbolicIntersectsWithCircle(circle);

          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);

          expect(
            Line.givenTwoPoints(
              intersects[0],
              intersects[1]
            ).hyperbolicEquals(line)
          ).toBe(true);
        });

        it('has hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          expect(d).not.toBeNaN();
          expect(d).toApproximate(
            line.getP0().hyperbolicDistanceTo(line.getP1())
          );
        });

        it('has hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1())
          );
          expect(angle0).toApproximate(angle1);
        });

        it('has ideal Points and Line', function () {
          var idealPoints = line.getIdealPoints();
          var idealLine = line.getIdealLine();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
          expect(idealLine.getP0()).toBe(idealPoints[0]);
          expect(idealLine.getP1()).toBe(idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
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

        it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
          var referenceAngle = line.getP0().getAngle();
          var otherLine = Line.givenAnglesOfIdealPoints(
            referenceAngle + Math.PI * Math.random(),
            referenceAngle + Math.PI * Math.random()
          );
          expect(line.isHyperbolicParallelTo(otherLine)).toBe(true);
        });

        it('includes Points in hyperbolic context', function () {
          expect(line.hyperbolicIncludesPoint(line.getP0())).toBe(true);
          expect(line.hyperbolicIncludesPoint(line.getP1())).toBe(true);
          var point = line.getP0().hyperbolicDistantPoint(
            line.getHyperbolicLength() * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1())
          );
          expect(line.hyperbolicIncludesPoint(point)).toBe(true);
          expect(
            line.hyperbolicIncludesPoint(HyperbolicCanvas.Point.ORIGIN)
          ).toBe(true);
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

        it('is on plane', function () {
          expect(line.isOnPlane()).toBe(true);
        });

        it('has hyperbolic geodesic Line', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(Line);
        });

        it('equals hyperbolic Line with same geodesic', function () {
          var pointOnLine = line.getP0().hyperbolicDistantPoint(
            line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
            line.getP0().hyperbolicAngleTo(line.getP1()) + (Math.random() < .5 ? Math.PI : 0)
          );

          var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

          expect(line.hyperbolicEquals(otherLine)).toBe(true);
        });

        it('has Euclidean length', function () {
          expect(line.getEuclideanLength()).toBeARealNumber();
        });

        it('has Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
        });

        it('has Euclidean intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
            line.getP0().euclideanDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random()
            ),
            radius + 1
          );

          var intersects = line.euclideanIntersectsWithCircle(circle);

          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(
            Line.givenTwoPoints(intersects[0], intersects[1]).equals(line)
          ).toBe(true);
        });

        it('has hyperbolic intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            line.getP0().hyperbolicDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random()
            ),
            radius + 1
          );

          var intersects = line.hyperbolicIntersectsWithCircle(circle)

          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);

          expect(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(line)
          ).toBe(true);
        });

        it('has hyperbolic length', function () {
          var d = line.getHyperbolicLength();
          expect(d).not.toBeNaN();
          expect(d).toApproximate(
            line.getP0().hyperbolicDistanceTo(line.getP1())
          );
        });

        it('has hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.hyperbolicAngleTo(line.getP1())
          );
          expect(angle0).toApproximate(angle1);
        });

        it('has ideal Points and Line', function () {
          var idealPoints = line.getIdealPoints();
          var idealLine = line.getIdealLine();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
          expect(idealLine.getP0()).toBe(idealPoints[0]);
          expect(idealLine.getP1()).toBe(idealPoints[1]);
        });

        it('has Euclidean unit circle intersects with opposite angles', function () {
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

      it('is on plane', function () {
        expect(line.isOnPlane()).toBe(true);
      });

      it('has hyperbolic geodesic Circle', function () {
        expect(line.getHyperbolicGeodesic()).toBeA(HyperbolicCanvas.Circle);
      });

      it('equals hyperbolic Line with same geodesic', function () {
        var pointOnLine = line.getP0().hyperbolicDistantPoint(
          line.getP0().hyperbolicDistanceTo(line.getP1()) * Math.random(),
          line.getP0().hyperbolicAngleTo(line.getP1()) + (Math.random() < .5 ? Math.PI : 0)
        );

        var otherLine = Line.givenTwoPoints(line.getP1(), pointOnLine);

        expect(line.hyperbolicEquals(otherLine)).toBe(true);
      });

      it('has Euclidean length', function () {
        expect(line.getEuclideanLength()).toBeARealNumber();
      });

      it('has Euclidean midpoint', function () {
        expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
      });

      it('has Euclidean intersects with Circle', function () {
        var radius = Math.random() * 5;
        var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
          line.getP0().euclideanDistantPoint(
            radius * Math.random(),
            HyperbolicCanvas.Angle.random()
          ),
          radius
        );

        var intersects = line.euclideanIntersectsWithCircle(circle);

        expect(intersects).toBeA(Array);
        expect(intersects.length).toBe(2);

        expect(
          Line.givenTwoPoints(intersects[0], intersects[1]).equals(line)
        ).toBe(true);

        it('has hyperbolic intersects with Circle', function () {
          var radius = Math.random() * 5;
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            line.getP0().hyperbolicDistantPoint(
              radius * Math.random(),
              HyperbolicCanvas.Angle.random()
            ),
            radius + 1
          );

          var intersects = line.hyperbolicIntersectsWithCircle(circle)

          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);

          expect(
            Line.givenTwoPoints(intersects[0], intersects[1]).hyperbolicEquals(line)
          ).toBe(true);
        });
      });

      it('has hyperbolic length', function () {
        var d = line.getHyperbolicLength();
        expect(d).not.toBeNaN();
        expect(d).toApproximate(
          line.getP0().hyperbolicDistanceTo(line.getP1())
        );
      });

      it('has hyperbolic midpoint', function () {
        var midpoint = line.getHyperbolicMidpoint();
        expect(midpoint).toBeA(HyperbolicCanvas.Point);
        var angle0 = midpoint.hyperbolicAngleTo(line.getP0());
        var angle1 = HyperbolicCanvas.Angle.opposite(
          midpoint.hyperbolicAngleTo(line.getP1())
        );
        expect(angle0).toApproximate(angle1);
      });

      it('has ideal Points and Line', function () {
        var idealPoints = line.getIdealPoints();
        var idealLine = line.getIdealLine();
        expect(idealPoints).toBeA(Array);
        expect(idealPoints.length).toBe(2);
        idealPoints.forEach(function (point) {
          expect(point).toBeA(HyperbolicCanvas.Point);
          expect(point.isIdeal()).toBe(true);
        });
        expect(idealLine.getP0()).toBe(idealPoints[0]);
        expect(idealLine.getP1()).toBe(idealPoints[1]);
      });

      it('has Euclidean unit circle intersects', function () {
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

      it('is parallel to Line with which it does not intersect in hyperbolic context', function () {
        var otherLine = Line.givenTwoPoints(
          line.getP0().opposite(),
          line.getP1().opposite()
        );
        expect(line.isHyperbolicParallelTo(otherLine)).toBe(true);
      });

      it('includes Points in hyperbolic context', function () {
        expect(line.hyperbolicIncludesPoint(line.getP0())).toBe(true);
        expect(line.hyperbolicIncludesPoint(line.getP1())).toBe(true);
        var point = line.getP0().hyperbolicDistantPoint(
          line.getHyperbolicLength() * Math.random(),
          line.getP0().hyperbolicAngleTo(line.getP1())
        );
        expect(line.hyperbolicIncludesPoint(point)).toBe(true);
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

    it('is not on plane', function () {
      expect(line.isOnPlane()).toBe(false);
    });

    it('does not have hyperbolic geodesic', function () {
      expect(line.getHyperbolicGeodesic()).toBe(false);
    });

    it('has Euclidean length', function () {
      expect(line.getEuclideanLength()).toBeARealNumber();
    });

    it('has Euclidean midpoint', function () {
      expect(line.getEuclideanMidpoint()).toBeA(HyperbolicCanvas.Point);
    });

    it('does not have hyperbolic length', function () {
      var l = line.getHyperbolicLength();
      expect(l).toBeA(Number);
      expect(l).toBeNaN();
    });

    it('does not have hyperbolic midpoint', function () {
      expect(line.getHyperbolicMidpoint()).toBe(false);
    });

    it('does not have ideal Points', function () {
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

    it('has point and slope', function () {
      expect(line.getP0()).toBeA(HyperbolicCanvas.Point);
      expect(line.getSlope()).toBeARealNumber();
    });

    it('has second point', function () {
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

      it('has two points', function () {
        expect(line.getP0()).toBeA(HyperbolicCanvas.Point);
        expect(line.getP1()).toBeA(HyperbolicCanvas.Point);
      });

      it('has slope', function () {
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

        it('is ideal', function () {
          expect(line.isIdeal()).toBe(true);
        });

        it('has hyperbolic length of infinity', function () {
          expect(line.getHyperbolicLength()).toBe(Infinity);
        });

        it('has geodesic Circle', function () {
          expect(line.getHyperbolicGeodesic()).toBeA(HyperbolicCanvas.Circle);
        });

        it('has ideal Points', function () {
          var idealPoints = line.getIdealPoints();
          expect(idealPoints).toBeA(Array);
          expect(idealPoints.length).toBe(2);
          idealPoints.forEach(function (point) {
            expect(point).toBeA(HyperbolicCanvas.Point);
            expect(point.isIdeal()).toBe(true);
          });
        });

        it('has Euclidean unit circle intersects', function () {
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

        it('is ideal', function () {
          expect(line.isIdeal()).toBe(true);
        });

        it('has hyperbolic length of infinity', function () {
          expect(line.getHyperbolicLength()).toBe(Infinity);
        });

        it('has geodesic Line', function () {
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

      it('has two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        expect(p0).toBeA(HyperbolicCanvas.Point);
        expect(p1).toBeA(HyperbolicCanvas.Point);
        expect(p0.isIdeal()).toBe(true);
        expect(p1.isIdeal()).toBe(true);
      });

      it('is ideal', function () {
        expect(line.isIdeal()).toBe(true);
      });

      it('has hyperbolic length of infinity', function () {
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });

      it('has geodesic Circle', function () {
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

      it('has two ideal points', function () {
        var p0 = line.getP0();
        var p1 = line.getP1();

        expect(p0).toBeA(HyperbolicCanvas.Point);
        expect(p1).toBeA(HyperbolicCanvas.Point);
        expect(p0.isIdeal()).toBe(true);
        expect(p1.isIdeal()).toBe(true);
      });

      it('is ideal', function () {
        expect(line.isIdeal()).toBe(true);
      });

      it('has hyperbolic length of infinity', function () {
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });

      it('has geodesic Line', function () {
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

      it('does not exist', function () {
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

      it('is Point', function () {
        expect(
          Line.euclideanIntersect(line, otherLine)
        ).toBeA(HyperbolicCanvas.Point);
      });
    });

    describe('with x-axis', function () {
      beforeEach(function () {
        otherLine = Line.X_AXIS;
      });

      it('is Point', function () {
        expect(
          Line.euclideanIntersect(line, otherLine)
        ).toBeA(HyperbolicCanvas.Point);
      });
    });

    describe('with y-axis', function () {
      beforeEach(function () {
        otherLine = Line.Y_AXIS;
      });

      it('is Point', function () {
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

      it('does not exist', function () {
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

        it('is Point on plane', function () {
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

        it('is Point on plane', function () {
          var intersect = Line.hyperbolicIntersect(line, otherLine);
          expect(intersect).toBeA(HyperbolicCanvas.Point);
          expect(intersect.isOnPlane()).toBe(true);
          expect(intersect.equals(expectedIntersect)).toBe(true);
        });
      });
    });
  });

  describe('random slope', function () {
    it('is number', function () {
      expect(Line.randomSlope()).toBeARealNumber();
    });
  });

  describe('X_AXIS', function () {
    beforeEach(function () {
      line = Line.X_AXIS;
    });

    it('is Line', function () {
      expect(line).toBeA(Line);
    }, true);

    it('includes origin', function () {
      expect(line.euclideanIncludesPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    }, true);

    it('has a slope of 0', function () {
      expect(line.getSlope()).toBe(0);
    }, true);
  });

  describe('Y_AXIS', function () {
    beforeEach(function () {
      line = Line.Y_AXIS;
    });

    it('is Line', function () {
      expect(line).toBeA(Line);
    }, true);

    it('includes origin', function () {
      expect(line.euclideanIncludesPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    }, true);

    it('has slope of infinity', function () {
      expect(line.getSlope()).toBe(Infinity);
    }, true);
  });
});
