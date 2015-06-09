;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  /*
  * Point object relative to the unit circle, where 0,0 is canvas center
  */
  var Point = window.HyperbolicCanvas.Point = function (options) {
    this.x = options.x;
    this.y = options.y;
  };

  Point.prototype.equals = function (otherPoint) {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  };

  Point.prototype.distanceFromCenter = function () {
    var r = HyperbolicCanvas.Line.fromTwoPoints(Point.CENTER, this).euclideanDistance();
    return 2 * Math.atanh(r);
  };

  Point.prototype.distantPoint = function (distance, angle) {
    // TODO save results of calculations for re-use, such as Math.sinh(c)

    // cosh(a) = cosh(b)cosh(c) - sinh(b)sinh(c)cos(A)
    // for triangle ABC where C is center of unit circle, A is starting point, C is destination point
    // c is distance travelled, b is distance of start from center, a is distance of destination from center
    // alpha is angle at A, beta is angle at B, gamma is angle at C

    var a, b, c, alpha, beta, gamma;

    b = this.distanceFromCenter();
    c = distance;
    alpha = angle;

    a = Math.acosh(Math.cosh(b) * Math.cosh(c) - Math.sinh(b) * Math.sinh(c) * Math.cos(alpha));

    gamma = Math.asin(Math.sin(alpha) * Math.sinh(c) / Math.sinh(a));

    var newAngle = Circle.UNIT.angleAt(this) + gamma;
    return Point.fromHyperbolicPolarCoordinates(a, newAngle);
  };

  Point.fromCoordinates = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.fromPolarCoordinates = function (radius, angle, inverted) {
    return new Point({ x: radius * Math.cos(angle), y: radius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.fromHyperbolicPolarCoordinates = function (radius, angle, inverted) {
    // returns NaN coordinates at distance > 709
    // at angle 0, indistinguishable from limit at distance > 36
    var euclideanRadius = (Math.exp(radius) - 1) / (Math.exp(radius) + 1);
    return new Point({ x: euclideanRadius * Math.cos(angle), y: euclideanRadius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.between = function (p0, p1) {
    return new Point({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });
  };

  Point.CENTER = new Point({ x: 0, y: 0 });
})();
