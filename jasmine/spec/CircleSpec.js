describe('Circle', function () {
  var Circle = HyperbolicCanvas.Circle;
  var circle;

  describe('in general', function () {

  });

  describe('given Euclidean center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenEuclideanCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random()
      );
    });
  });

  describe('given hyperbolic center and radius', function () {
    beforeEach(function () {
      circle = Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.random(),
        Math.random() * 10
      );
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
  });

  describe('given three points', function () {
    beforeEach(function () {
      circle = Circle.givenThreePoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    it('should ', function () {

    });
  });

  describe('intersects', function () {

  });

  describe('UNIT', function () {
    beforeEach(function () {
      circle = Circle.UNIT;
    });

    it('should have Euclidean and hyperbolic center at origin', function () {
      expect(circle.getEuclideanCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
      expect(circle.getHyperbolicCenter()).toBe(HyperbolicCanvas.Point.ORIGIN);
    });

    it('should have Euclidean area of pi', function () {
      expect(circle.getEuclideanArea()).toBe(Math.PI);
    });

    it('should have Euclidean circumference of tau', function () {
      expect(circle.getEuclideanCircumference()).toBe(Math.TAU);
    });

    it('should have Euclidean radius of 1', function () {
      expect(circle.getEuclideanRadius()).toBe(1);
    });

    it('should have Euclidean diameter of 2', function () {
      expect(circle.getEuclideanDiameter()).toBe(2);
    });

    it('should calculate angle towards Point along Euclidean geodesic', function () {
      // this is syllogistic given the current implementation, but the math
      // should be tested by the Point specs
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
    });

    it('should have hyperbolic circumference of infinity', function () {
      expect(circle.getHyperbolicCircumference()).toBe(Infinity);
    });

    it('should have hyperbolic radius of infinity', function () {
      expect(circle.getHyperbolicRadius()).toBe(Infinity);
    });

    it('should have hyperbolic diameter of infinity', function () {
      expect(circle.getHyperbolicDiameter()).toBe(Infinity);
    });

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
