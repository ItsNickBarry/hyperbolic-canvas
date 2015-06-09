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

    return Point.fromHyperbolicPolarCoordinates(a, Circle.UNIT.angleAt(this) + gamma);
  };

  Point.prototype.distantPoint2 = function (distance, angle) {
    var simplifyAngle = function(angle) {
      if (angle < 0) {
        return Math.abs(Math.floor(angle / Math.TAU)) * Math.TAU + angle;
      } else if (angle >= Math.TAU) {
        return angle % Math.TAU;
      } else {
        return angle;
      }
    }

    var awayFromCenter = Math.abs(simplifyAngle(Circle.UNIT.angleAt(this)) - simplifyAngle(angle)) > Math.PI / 2 ? false : true;

    if (distance === 0) {
      return this;
    }
    if (this.equals(Point.CENTER)) {
      return Point.fromHyperbolicPolarCoordinates(distance, angle);
    }
    if (simplifyAngle(Math.atan(Line.fromTwoPoints(Point.CENTER, this).slope)) === simplifyAngle(angle)) {
      // if (!awayFromCenter) {
      //   debugger
      // }
      return Point.fromHyperbolicPolarCoordinates(this.distanceFromCenter() + (awayFromCenter ? distance : -1 * distance), Circle.UNIT.angleAt(this));
    }
    var range = Circle.fromHyperbolicCenterRadius(this, distance);
    var tangentSlope = Math.tan(angle);
    var lineH = Line.fromPointSlope(range.center, tangentSlope);
    var lineG = Line.fromPointSlope(this, lineH.perpindicularSlope());
    var intersect = Line.intersect(lineH, lineG);
    var newLineG = Line.fromTwoPoints(this, intersect);
    var newLineH = Line.fromTwoPoints(range.center, intersect);
    var r0 = range.radius;
    var g = newLineG.euclideanDistance();
    var h = newLineH.euclideanDistance();
    var r1 = (Math.pow(r0, 2) - Math.pow(h, 2) - Math.pow(g, 2)) / (2 * g);
    // very hacky
    var center = Circle.fromCenterRadius(this, r1).pointAt(Math.atan(newLineG.slope));
    var arcCirc = Circle.fromCenterRadius(center, r1);

    var intersects = Circle.intersects(range, arcCirc);
    // choose from the intersects

    if (intersects === false) {
      // debugger
    }

    // very bad TODO works for points < x = y approximately
    // var checkPoint = Point.fromCoordinates(range.center.x - Math.cos(angle) * range.radius, range.center.y - Math.sin(angle) * range.radius);
    var checkPoint = range.pointAt(angle);
    var d0 = Line.fromTwoPoints(intersects[0], checkPoint).euclideanDistance();
    var d1 = Line.fromTwoPoints(intersects[1], checkPoint).euclideanDistance();
    // var thisAngle = Circle.UNIT.angleAt(this);
    // if
    if (this.equals(xMinus)) {
      // debugger
    }
    return d0 < d1 ? intersects[0] : intersects[1];
    // return awayFromCenter ? (d0 < d1 ? intersects[0] : intersects[1]) : (d0 > d1 ? intersects[0] : intersects[1]);
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
