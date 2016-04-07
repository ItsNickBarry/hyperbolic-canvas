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

        expect(line.getEuclideanDistance())
          .toBeCloseTo(clone.getEuclideanDistance(), jasmine.precision);
        expect(line.getHyperbolicDistance())
          .toBeCloseTo(clone.getHyperbolicDistance(), jasmine.precision);

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
        expect(line.isParallelTo(otherLine));
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
        expect(typeof x).toBe('number');
        expect(line.euclideanYAtX(x)).toBeCloseTo(y, jasmine.precision);
      });

      it('should have y value for any x value', function () {
        var x = Math.random() * 2 - 1;
        var y = line.euclideanYAtX(x);
        expect(typeof y).toBe('number');
        expect(line.euclideanXAtY(y)).toBeCloseTo(x, jasmine.precision);
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

        it('should not have an arc', function () {
          // TODO return arc of type Line instead?
          // will it return itself?  clone of itself?
          expect(line.getArc()).toBe(false);
          //expect(line.getArc()).toBeA(Line);
        });

        it('should have Euclidean distance', function () {
          expect(line.getEuclideanDistance()).toBeDefined();
        });

        it('should have Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeDefined();
        });

        it('should have hyperbolic distance', function () {
          var d = line.getHyperbolicDistance();
          expect(d).toBeDefined();
          expect(d).not.toBeNaN();
        });

        it('should have hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.angleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.angleTo(line.getP1())
          );
          expect(angle0).toBeCloseTo(angle1, jasmine.precision);
        });

        it('should have unit circle intersects with opposite angles', function () {
          var intersects = line.getUnitCircleIntersects();
          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(HyperbolicCanvas.Angle.normalize(
            intersects[0].getAngle() - intersects[1].getAngle()
          )).toBeCloseTo(Math.PI, jasmine.precision);
          intersects.forEach(function (intersect) {
            expect(intersect).toBeA(HyperbolicCanvas.Point);
            expect(intersect.getEuclideanRadius()).toBeCloseTo(1, jasmine.precision);
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

        it('should not have an arc', function () {
          // TODO return arc of type Line instead?
          // will it return itself?  clone of itself?
          expect(line.getArc()).toBe(false);
          //expect(line.getArc()).toBeA(Line);
        });

        it('should have Euclidean distance', function () {
          expect(line.getEuclideanDistance()).toBeDefined();
        });

        it('should have Euclidean midpoint', function () {
          expect(line.getEuclideanMidpoint()).toBeDefined();
        });

        it('should have hyperbolic distance', function () {
          var d = line.getHyperbolicDistance();
          expect(d).toBeDefined();
          expect(d).not.toBeNaN();
        });

        it('should have hyperbolic midpoint', function () {
          var midpoint = line.getHyperbolicMidpoint();
          expect(midpoint).toBeA(HyperbolicCanvas.Point);
          var angle0 = midpoint.angleTo(line.getP0());
          var angle1 = HyperbolicCanvas.Angle.opposite(
            midpoint.angleTo(line.getP1())
          );
          expect(angle0).toBeCloseTo(angle1, jasmine.precision);
        });

        it('should have unit circle intersects with opposite angles', function () {
          var intersects = line.getUnitCircleIntersects();
          expect(intersects).toBeA(Array);
          expect(intersects.length).toBe(2);
          expect(HyperbolicCanvas.Angle.normalize(
            intersects[0].getAngle() - intersects[1].getAngle()
          )).toBeCloseTo(Math.PI, jasmine.precision);
          intersects.forEach(function (intersect) {
            expect(intersect).toBeA(HyperbolicCanvas.Point);
            expect(intersect.getEuclideanRadius()).toBeCloseTo(1, jasmine.precision);
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

      it('should have an arc', function () {
        expect(line.getArc()).toBeTruthy();
        expect(line.getArc()).toBeA(HyperbolicCanvas.Circle);
      });

      it('should have Euclidean distance', function () {
        expect(line.getEuclideanDistance()).toBeDefined();
      });

      it('should have Euclidean midpoint', function () {
        expect(line.getEuclideanMidpoint()).toBeDefined();
      });

      it('should have hyperbolic distance', function () {
        var d = line.getHyperbolicDistance();
        expect(d).toBeDefined();
        expect(d).not.toBeNaN();
      });

      it('should have hyperbolic midpoint', function () {
        var midpoint = line.getHyperbolicMidpoint();
        expect(midpoint).toBeA(HyperbolicCanvas.Point);
        var angle0 = midpoint.angleTo(line.getP0());
        var angle1 = HyperbolicCanvas.Angle.opposite(
          midpoint.angleTo(line.getP1())
        );
        expect(angle0).toBeCloseTo(angle1, jasmine.precision);
      });

      it('should have unit circle intersects', function () {
        var intersects = line.getUnitCircleIntersects();
        expect(intersects).toBeA(Array);
        expect(intersects.length).toBe(2);
        intersects.forEach(function (intersect){
          expect(intersect).toBeA(HyperbolicCanvas.Point);
          expect(intersect.getEuclideanRadius()).toBeCloseTo(1, jasmine.precision);
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

    it('should not have an arc', function () {
      // TODO use NaN or undefined?
      expect(line.getArc()).toBe(false);
    });

    it('should have Euclidean distance', function () {
      expect(line.getEuclideanDistance()).toBeDefined();
    });

    it('should have Euclidean midpoint', function () {
      expect(line.getEuclideanMidpoint()).toBeDefined();
    });

    it('should not have hyperbolic distance', function () {
      var d = line.getHyperbolicDistance();
      expect(d).toBeDefined();
      expect(d).toBeNaN();
    });

    it('should not have hyperbolic midpoint', function () {
      expect(line.getHyperbolicMidpoint()).toBe(false);
    });

    // TODO unit circle intersects for line not on plane?
  });

  describe('given point and slope', function () {
    beforeEach(function () {
      line = Line.givenPointSlope(
        HyperbolicCanvas.Point.random(),
        Line.randomSlope()
      );
    });

    it('should have point and slope', function () {
      expect(line.getP0()).toBeDefined();
      expect(line.getSlope()).toBeDefined();
    });

    it('should have second point', function () {
      expect(line.getP1()).toBeDefined();
    });
  });

  describe('given two points', function () {
    beforeEach(function () {
      line = Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    it('should have two points', function () {
      expect(line.getP0()).toBeDefined();
      expect(line.getP1()).toBeDefined();
    });

    it('should have slope', function () {
      expect(line.getSlope()).toBeDefined();
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

      it('should exist', function () {
        expect(Line.euclideanIntersect(line, otherLine)).toBeDefined();
      });
    });

    describe('with x-axis', function () {
      beforeEach(function () {
        otherLine = Line.X_AXIS;
      });

      it('should exist', function () {
        expect(Line.euclideanIntersect(line, otherLine)).toBeDefined();
      });
    });

    describe('with y-axis', function () {
      beforeEach(function () {
        otherLine = Line.Y_AXIS;
      });

      it('should exist', function () {
        expect(Line.euclideanIntersect(line, otherLine)).toBeDefined();
      });
    });
  });

  describe('hyperbolic intersect', function () {
    var otherLine;

    // TODO
  });

  describe('random slope', function () {
    it('should be number', function () {
      expect(typeof Line.randomSlope() === 'number').toBe(true);
    });
  });

  describe('X_AXIS', function () {
    beforeEach(function () {
      line = Line.X_AXIS;
    });

    it('should be defined', function () {
      expect(line).toBeDefined();
    });

    it('should include origin', function () {
      expect(line.containsPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    });

    it('should have a slope of 0', function () {
      expect(line.getSlope()).toBe(0);
    });
  });

  describe('Y_AXIS', function () {
    beforeEach(function () {
      line = Line.Y_AXIS;
    });

    it('should be defined', function () {
      expect(line).toBeDefined();
    });

    it('should include origin', function () {
      expect(line.containsPoint(HyperbolicCanvas.Point.ORIGIN)).toBe(true);
    });

    it('should have a slope of infinity', function () {
      expect(line.getSlope()).toBe(Infinity);
    });
  });
});
