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
    if (this.equals(Point.CENTER)) {
      return 0;
    }
    // TODO "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math
    var r = HyperbolicCanvas.Line.fromTwoPoints(Point.CENTER, this).euclideanDistance();
    // TODO is this the right base to use?  is base related to curvature?
    // var base = 1.1;
    var base = Math.E;
    return Math.log((1 + r) / (1 - r)) / Math.log(base);

    // TODO use return 2 * Math.atanh(r);
  };

  Point.prototype.distantPoint = function (distance, angle) {
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
      debugger
    }

    // very bad TODO works for points < x = y approximately
    // var checkPoint = Point.fromCoordinates(range.center.x - Math.cos(angle) * range.radius, range.center.y - Math.sin(angle) * range.radius);
    var checkPoint = range.pointAt(angle);
    var d0 = Line.fromTwoPoints(intersects[0], checkPoint).euclideanDistance();
    var d1 = Line.fromTwoPoints(intersects[1], checkPoint).euclideanDistance();
    // var thisAngle = Circle.UNIT.angleAt(this);
    // if
    if (this.equals(xMinus)) {
      debugger
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
