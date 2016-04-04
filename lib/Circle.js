;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Circle = HyperbolicCanvas.Circle = function (options) {
    this._center = options.center;
    this._radius = options.radius;
  };

  Circle.prototype.getCenter = function () {
    // TODO rename to getEuclideanCenter, implement getHyperbolicCenter
    return this._center;
  };

  Circle.prototype.getCircumference = function () {
    if (typeof this._circumference === 'undefined') {
      this._circumference = Math.TAU * this.getRadius();
    }
    return this._circumference;
  };

  Circle.prototype.getDiameter = function () {
    // TODO store this._diameter?
    return this.getRadius() * 2;
  };

  Circle.prototype.getRadius = function () {
    return this._radius;
  };

  Circle.prototype.getUnitCircleIntersects = function () {
    if (typeof this._unitCircleIntersects === 'undefined') {
      this._unitCircleIntersects = Circle.intersects(this, Circle.UNIT);
    }
    return this._unitCircleIntersects;
  };

  Circle.prototype.equals = function (otherCircle) {
    return this.getCenter().equals(otherCircle.getCenter()) &&
           this.getRadius() === otherCircle.getRadius();
  };

  // Circle.prototype.arcLength = function (p0, p1) {
  //   // TODO euclidean arc length; is this useful?
  //   var d = HyperbolicCanvas.Line.givenTwoPoints(p0, p1).getEuclideanDistance();
  //   return Math.acos(1 - (Math.pow(d, 2) / (2 * Math.pow(this.getRadius(), 2))));
  // };

  Circle.prototype.angleAt = function (p) {
    var dx = p.getX() - this.getCenter().getX();
    var dy = p.getY() - this.getCenter().getY();
    return HyperbolicCanvas.Angle.normalize(Math.atan2(dy, dx));
  };

  Circle.prototype.pointAt = function (angle) {
    return HyperbolicCanvas.Point.givenCoordinates(
      this.getRadius() * Math.cos(angle) + this.getCenter().getX(),
      this.getRadius() * Math.sin(angle) + this.getCenter().getY()
    );
  };

  Circle.prototype.yAtX = function (x) {
    var abs = Math.sqrt(
      Math.pow(this.getRadius(), 2) - Math.pow(x - this.getCenter().getX(), 2)
    );
    return abs ? [this.getCenter().getY() + abs, this.getCenter().getY() - abs] : false;
  };

  Circle.prototype.xAtY = function (y) {
    var abs = Math.sqrt(
      Math.pow(this.getRadius(), 2) - Math.pow(y - this.getCenter().getY(), 2)
    );
    return abs ? [this.getCenter().getX() + abs, this.getCenter().getX() - abs] : false;
  };

  Circle.prototype.tangentAtAngle = function (angle) {
    return HyperbolicCanvas.Line.givenPointSlope(
      this.pointAt(angle),
      -1 / HyperbolicCanvas.Angle.toSlope(angle)
    );
  };

  Circle.prototype.tangentAtPoint = function (p) {
    // not very mathematical; point is not necessarily on circle
    return this.tangentAtAngle(this.angleAt(p));
  };

  Circle.intersects = function (c0, c1) {
    // copied and pasted, mostly
    // thank you, 01AutoMonkey
    var x0 = c0.getCenter().getX();
    var y0 = c0.getCenter().getY();
    var r0 = c0.getRadius();
    var x1 = c1.getCenter().getX();
    var y1 = c1.getCenter().getY();
    var r1 = c1.getRadius();

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

  Circle.givenCenterRadius = function (center, radius) {
    return new Circle({ center: center, radius: radius });
  };

  Circle.givenHyperbolicCenterRadius = function (center, radius) {
    if (!center.isOnPlane()) {
      return false;
    }
    var dh = center.getHyperbolicRadius();
    var angle = Circle.UNIT.angleAt(center);
    var farPoint = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(
      dh + radius,
      angle
    );
    var nearPoint = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(
      Math.abs(dh - radius),
      angle + (dh - radius < 0 ? Math.PI : 0)
    );
    return Circle.givenTwoPoints(farPoint, nearPoint);
  };

  Circle.givenTwoPoints = function (p0, p1) {
    var l = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    return new Circle({
      center: l.getEuclideanMidpoint(),
      radius: l.getEuclideanDistance() / 2
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
    b0 = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    b1 = HyperbolicCanvas.Line.givenTwoPoints(p1, p2);
    if (b0.equals(b1)) {
      // all three points are colinear
      return false;
    }
    var center = HyperbolicCanvas.Line.intersect(b0.perpindicularBisector(), b1.perpindicularBisector());
    var radius = HyperbolicCanvas.Line.givenTwoPoints(p0, center).getEuclideanDistance();
    return new Circle({ center: center, radius: radius });
  };

  Circle.UNIT = new Circle({ center: HyperbolicCanvas.Point.ORIGIN, radius: 1 });
})();
