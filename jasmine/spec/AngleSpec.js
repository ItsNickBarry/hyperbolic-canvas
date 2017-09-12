describe('Angle', function () {
  var Angle = HyperbolicCanvas.Angle;

  it('converts from degrees to radians', function () {
    var degrees = Math.random() * 360;
    var radians = Angle.fromDegrees(degrees);
    expect(radians).toBeARealNumber();
    expect(radians).toBe(Angle.normalize(radians));
    expect(radians / Math.TAU).toApproximate(degrees / 360);
  });

  it('finds the angle of a slope', function () {
    var slope = (Math.random() - .5) * 100;
    expect(Angle.fromSlope(slope)).toApproximate(Math.atan(slope));
  });

  it('normalizes angles to within 0 and TAU', function () {
    var angle = Angle.normalize((Math.random() - .5) * 100);
    expect(angle).toBeGreaterThan(0);
    expect(angle).toBeLessThan(Math.TAU);
  });

  it('generates a random angle in a given quadrant', function () {
    [1, 2, 3, 4].forEach(function (q) {
      var angle = Angle.random(q);
      expect(angle).toBeGreaterThan(Math.PI / 2 * (q - 1));
      expect(angle).toBeLessThan(Math.PI / 2 * q);
    });
  });

  describe('generated at random', function () {
    var angle;
    beforeEach(function () {
      angle = Angle.random();
    });

    it('is between 0 and tau', function () {
      expect(angle).toBeARealNumber();
      expect(angle).toBeGreaterThan(0);
      expect(angle).toBeLessThan(Math.TAU);
    });

    it('converts to degrees', function () {
      expect(Angle.toDegrees(angle)).toApproximate(angle * 360 / Math.TAU);
    });

    it('has opposite angle', function () {
      var opposite = Angle.opposite(angle);
      expect(opposite).toApproximate(
        angle < Math.PI ? angle + Math.PI : angle - Math.PI
      );
      expect(opposite).toBe(Angle.normalize(opposite));
    });

    it('has equivalent slope', function () {
      var slope = Angle.toSlope(angle);
      expect(slope).toBeARealNumber();
      expect(slope).toApproximate(Math.tan(angle));
    });
  });
});
