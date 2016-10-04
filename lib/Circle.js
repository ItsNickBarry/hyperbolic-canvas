;
(function () {
  "use strict";
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Circle = HyperbolicCanvas.Circle = function (options) {
    this._euclideanCenter = options.euclideanCenter;
    if (options.euclideanRadius < 0) {
      this._euclideanRadius = Math.abs(options.euclideanRadius);
    } else {
      this._euclideanRadius = options.euclideanRadius;
    }
    this._hyperbolicCenter = options.hyperbolicCenter;
    if (options.hyperbolicRadius < 0) {
      this._hyperbolicRadius = Math.abs(options.hyperbolicRadius);
    } else {
      this._hyperbolicRadius = options.hyperbolicRadius;
    }
  };

  Circle.prototype.getEuclideanArea = function () {
    if (typeof this._euclideanArea === 'undefined') {
      this._euclideanArea = Math.PI * Math.pow(this.getEuclideanRadius(), 2);
    }
    return this._euclideanArea;
  };

  Circle.prototype.getEuclideanCenter = function () {
    if (typeof this._euclideanCenter === 'undefined') {
      this._calculateEuclideanCenterRadius();
    }
    return this._euclideanCenter;
  };

  Circle.prototype.getEuclideanCircumference = function () {
    if (typeof this._euclideanCircumference === 'undefined') {
      this._euclideanCircumference = Math.TAU * this.getEuclideanRadius();
    }
    return this._euclideanCircumference;
  };

  Circle.prototype.getEuclideanDiameter = function () {
    return this.getEuclideanRadius() * 2;
  };

  Circle.prototype.getEuclideanRadius = function () {
    if (typeof this._euclideanRadius === 'undefined') {
      this._calculateEuclideanCenterRadius();
    }
    return this._euclideanRadius;
  };

  Circle.prototype.getHyperbolicArea = function () {
    if (typeof this._hyperbolicArea === 'undefined') {
      this._hyperbolicArea = Math.TAU *
                            (Math.cosh(this.getHyperbolicRadius()) - 1);
    }
    return this._hyperbolicArea;
  };

  Circle.prototype.getHyperbolicCenter = function () {
    if (typeof this._hyperbolicCenter === 'undefined') {
      this._calculateHyperbolicCenterRadius();
    }
    return this._hyperbolicCenter;
  };

  Circle.prototype.getHyperbolicCircumference = function () {
    if (typeof this._hyperbolicCircumference === 'undefined') {
      this._hyperbolicCircumference = Math.TAU *
                                      Math.sinh(this.getHyperbolicRadius())
    }
    return this._hyperbolicCircumference;
  };

  Circle.prototype.getHyperbolicDiameter = function () {
    return this.getHyperbolicRadius() * 2;
  };

  Circle.prototype.getHyperbolicRadius = function () {
    if (typeof this._hyperbolicRadius === 'undefined') {
      this._calculateHyperbolicCenterRadius();
    }
    return this._hyperbolicRadius;
  };

  Circle.prototype.getUnitCircleIntersects = function () {
    if (typeof this._unitCircleIntersects === 'undefined') {
      this._unitCircleIntersects = Circle.intersects(this, Circle.UNIT);
    }
    return this._unitCircleIntersects;
  };

  Circle.prototype.clone = function () {
    return Circle.givenEuclideanCenterRadius(
      this.getEuclideanCenter(),
      this.getEuclideanRadius()
    );
  };

  Circle.prototype.equals = function (otherCircle) {
    return this.getEuclideanCenter().equals(otherCircle.getEuclideanCenter()) &&
           Math.abs(
             this.getEuclideanRadius() - otherCircle.getEuclideanRadius()
           ) < 1e-6;
  };

  Circle.prototype.containsPoint = function (point) {
    return this.getEuclideanRadius() > point.euclideanDistanceTo(
      this.getEuclideanCenter()
    );
  };

  Circle.prototype.includesPoint = function (point) {
    return Math.abs(
      this.getEuclideanRadius() -
      point.euclideanDistanceTo(this.getEuclideanCenter())
    ) < 1e-6;
  };

  Circle.prototype.euclideanAngleAt = function (p) {
    var dx = p.getX() - this.getEuclideanCenter().getX();
    var dy = p.getY() - this.getEuclideanCenter().getY();
    return HyperbolicCanvas.Angle.normalize(Math.atan2(dy, dx));
  };

  Circle.prototype.euclideanPointAt = function (angle) {
    return HyperbolicCanvas.Point.givenCoordinates(
      this.getEuclideanRadius() * Math.cos(angle) +
        this.getEuclideanCenter().getX(),
      this.getEuclideanRadius() * Math.sin(angle) +
        this.getEuclideanCenter().getY()
    );
  };

  Circle.prototype.hyperbolicAngleAt = function (p) {
    return this.getHyperbolicCenter().hyperbolicAngleTo(p);
  };

  Circle.prototype.hyperbolicPointAt = function (angle) {
    return this.getHyperbolicCenter().hyperbolicDistantPoint(
      this.getHyperbolicRadius(),
      angle
    );
  };

  Circle.prototype.pointsAtX = function (x) {
    var values = this.yAtX(x);
    var points = [];
    values.forEach(function (y) {
      points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
    });
    return points;
  };

  Circle.prototype.pointsAtY = function (y) {
    var values = this.xAtY(y);
    var points = [];
    values.forEach(function (x) {
      points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
    });
    return points;
  };

  Circle.prototype.euclideanTangentAtAngle = function (angle) {
    return HyperbolicCanvas.Line.givenPointSlope(
      this.euclideanPointAt(angle),
      -1 / HyperbolicCanvas.Angle.toSlope(angle)
    );
  };

  Circle.prototype.euclideanTangentAtPoint = function (p) {
    // not very mathematical; point is not necessarily on circle
    return this.euclideanTangentAtAngle(this.euclideanAngleAt(p));
  };

  Circle.prototype.xAtY = function (y) {
    var center = this.getEuclideanCenter();
    var a = this._pythagoreanTheorem(y - center.getY());
    if (a) {
      return Math.abs(a) < 1e-6 ? [center.getX()] : [center.getX() + a, center.getX() - a];
    } else {
      return a === 0 ? [center.getX()] : [];
    }
  };

  Circle.prototype.yAtX = function (x) {
    var center = this.getEuclideanCenter();
    var a = this._pythagoreanTheorem(x - center.getX());
    if (a) {
      return Math.abs(a) < 1e-6 ? [center.getY()] : [center.getY() + a, center.getY() - a];
    } else {
      return a === 0 ? [center.getY()] : [];
    }
  };

  Circle.prototype._pythagoreanTheorem = function (b) {
    var c = this.getEuclideanRadius();
    var aSquared = Math.pow(c, 2) - Math.pow(b, 2);
    return Math.abs(aSquared) < 1e-6 ? 0 : Math.sqrt(aSquared);
  };

  Circle.prototype._calculateEuclideanCenterRadius = function () {
    var center = this.getHyperbolicCenter();
    var farPoint = this.hyperbolicPointAt(
      center.getAngle()
    );
    var nearPoint = this.hyperbolicPointAt(
      HyperbolicCanvas.Angle.opposite(center.getAngle())
    );
    var diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
    this._euclideanCenter = diameter.getEuclideanMidpoint();
    this._euclideanRadius = diameter.getEuclideanLength() / 2;
  };

  Circle.prototype._calculateHyperbolicCenterRadius = function () {
  var center = this.getEuclideanCenter();
    if (center.getEuclideanRadius() + this.getEuclideanRadius() >= 1) {
      // TODO horocycles
      if (this.equals(Circle.UNIT)) {
        this._hyperbolicCenter = center;
        this._hyperbolicRadius = Infinity;
      } else {
        this._hyperbolicCenter = false;
        this._hyperbolicRadius = NaN;
      }
    } else {
      var farPoint = this.euclideanPointAt(
        center.getAngle()
      );
      var nearPoint = this.euclideanPointAt(
        HyperbolicCanvas.Angle.opposite(center.getAngle())
      );
      var diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
      this._hyperbolicCenter = diameter.getHyperbolicMidpoint();
      this._hyperbolicRadius = diameter.getHyperbolicLength() / 2;
    }
  };

  Circle.intersects = function (c0, c1) {
    // this function adapted from a post on Stack Overflow by 01AutoMonkey
    // and licensed CC BY-SA 3.0:
    // https://creativecommons.org/licenses/by-sa/3.0/legalcode
    var x0 = c0.getEuclideanCenter().getX();
    var y0 = c0.getEuclideanCenter().getY();
    var r0 = c0.getEuclideanRadius();
    var x1 = c1.getEuclideanCenter().getX();
    var y1 = c1.getEuclideanCenter().getY();
    var r1 = c1.getEuclideanRadius();

    var a, dx, dy, d, h, rx, ry;
    var x2, y2;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy*dy) + (dx*dx));

    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a/d);
    y2 = y0 + (dy * a/d);

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0*r0) - (a*a));

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h/d);
    ry = dx * (h/d);

    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    var p0 = HyperbolicCanvas.Point.givenCoordinates(xi, yi);
    var p1 = HyperbolicCanvas.Point.givenCoordinates(xi_prime, yi_prime);
    return p0.equals(p1) ? [p0] : [p0, p1];
  };

  Circle.givenEuclideanCenterRadius = function (center, radius) {
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  };

  Circle.givenHyperbolicCenterRadius = function (center, radius) {
    if (!center.isOnPlane()) {
      return false;
    }
    return new Circle({ hyperbolicCenter: center, hyperbolicRadius: radius });
  };

  Circle.givenTwoPoints = function (p0, p1) {
    var l = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    return new Circle({
      euclideanCenter: l.getEuclideanMidpoint(),
      euclideanRadius: l.getEuclideanLength() / 2
    });
  };

  Circle.givenThreePoints = function (p0, p1, p2) {
    if (!(p0 && p1 && p2)) {
      //not all points exist
      return false;
    }
    if (p0.equals(p1) || p0.equals(p2) || p1.equals(p2)) {
      // points are not unique
      return false;
    }
    var b0 = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    var b1 = HyperbolicCanvas.Line.givenTwoPoints(p1, p2);
    if (b0.equals(b1)) {
      // all three points are colinear
      return false;
    }
    var center = HyperbolicCanvas.Line.euclideanIntersect(
      b0.euclideanPerpindicularBisector(),
      b1.euclideanPerpindicularBisector()
    );
    var radius = HyperbolicCanvas.Line.givenTwoPoints(
      p0,
      center
    ).getEuclideanLength();
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  };

  Circle.UNIT = new Circle({});

  Circle.UNIT.getEuclideanArea = function () { return Math.PI; };

  Circle.UNIT.getEuclideanCenter =
  Circle.UNIT.getHyperbolicCenter = function () {
    return HyperbolicCanvas.Point.ORIGIN;
  };

  Circle.UNIT.getEuclideanCircumference = function () { return Math.TAU; };

  Circle.UNIT.getEuclideanDiameter = function () { return 2; };

  Circle.UNIT.getEuclideanRadius = function () { return 1; };

  Circle.UNIT.getHyperbolicArea =
  Circle.UNIT.getHyperbolicCircumference =
  Circle.UNIT.getHyperbolicDiameter =
  Circle.UNIT.getHyperbolicRadius = function () { return Infinity; };

  Circle.UNIT.hyperbolicAngleAt =
  Circle.UNIT.euclideanAngleAt = function (point) {
    return point.getAngle();
  };

  Circle.UNIT.hyperbolicPointAt =
  Circle.UNIT.euclideanPointAt = function (angle) {
    return HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle);
  };
})();
