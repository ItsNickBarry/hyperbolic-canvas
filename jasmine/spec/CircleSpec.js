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
  });
});
