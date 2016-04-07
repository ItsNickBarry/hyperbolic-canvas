describe('Angle', function () {
  var Angle = HyperbolicCanvas.Angle;

  it('should convert from degrees to radians', function () {
    expect(Angle.fromDegrees(180)).toEqual(Math.PI);
    expect(Angle.fromDegrees(90)).toEqual(Math.PI / 2);
  });

  it('should convert from radians to degrees', function () {
    expect(Angle.toDegrees(Math.PI)).toEqual(180);
    expect(Angle.toDegrees(Math.PI / 2)).toEqual(90);
  });

  it('should find opposite angles', function () {
    expect(Angle.opposite(0)).toEqual(Math.PI);
    expect(Angle.opposite(Math.PI)).toEqual(0);
  });

  it('should find the slope of an angle', function () {
    [0, Math.PI, Math.TAU].forEach(function (angle) {
      expect(Angle.toSlope(angle)).toApproximate(0);
    });
    [Math.TAU / 8, Math.TAU * 5 / 8].forEach(function (angle) {
      expect(Angle.toSlope(angle)).toApproximate(1);
    });
    [Math.PI / 2, Math.PI * 3 / 2].forEach(function (angle) {
      expect(Angle.toSlope(angle)).toBeGreaterThan(1e9);
    });
  });

  it('should find the angle of a slope', function () {
    [
      [0, 0],
      [1, Math.TAU / 8],
      [-1, Math.TAU / -8],
    ].forEach(function (pair) {
      expect(Angle.fromSlope(pair[0])).toApproximate(pair[1]);
    });
  });

  it('should normalize angles to within 0 and TAU', function () {
    [
      [0, 0],
      [4, 4],
      [-4, Math.TAU - 4],
      [Math.PI * 3, Math.PI],
      [Math.PI * -3, Math.PI],
    ].forEach(function (pair) {
      expect(Angle.normalize(pair[0])).toEqual(pair[1]);
    });
  });
});
