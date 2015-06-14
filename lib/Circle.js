;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle;
  var Point = window.HyperbolicCanvas.Point;
  var Line = window.HyperbolicCanvas.Line;

  var Circle = window.HyperbolicCanvas.Circle = function (options) {
    this.center = options.center;
    this.radius = options.radius;
  };

  Circle.prototype.arcLength = function (p0, p1) {
    var d = Line.fromTwoPoints(p0, p1).euclideanDistance();
    return Math.acos(1 - (Math.pow(d, 2) / (2 * Math.pow(this.radius, 2))));
  };

  Circle.prototype.angleAt = function (p) {
    var dx = p.x - this.center.x;
    var dy = p.y - this.center.y;
    return Angle.normalize(Math.atan2(dy, dx));
  };

  Circle.prototype.pointAt = function (angle) {
    return Point.fromCoordinates(this.radius * Math.cos(angle) + this.center.x, this.radius * Math.sin(angle) + this.center.y);
  };

  Circle.prototype.yAtX = function (x) {
    var abs = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(x - this.center.x, 2));
    return abs ? [this.center.y + abs, this.center.y - abs] : false;
  };

  Circle.prototype.xAtY = function (y) {
    var abs = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(y - this.center.y, 2));
    return abs ? [this.center.x + abs, this.center.x - abs] : false;
  };

  Circle.prototype.hyperbolicCenter = function () {
    var l = Line.fromTwoPoints(this.center, Point.CENTER);
    // var intersects = TODO find intersects between line and circle

  };

  Circle.prototype.tangentAtPoint = function (p) {
    // TODO use angle instead ?; this presumes that p is on the circle
    //      probably would be less efficient, but more mathematical

    return Line.fromPointSlope(p, Line.fromTwoPoints(this.center, p).perpindicularSlope());
  };

  Circle.prototype.unitCircleIntersects = function () {
    return Circle.intersects(this, Circle.UNIT);
  };

  Circle.intersects = function (c0, c1) {
    // copied and pasted, mostly
    // thank you, 01AutoMonkey
    var x0 = c0.center.x;
    var y0 = c0.center.y;
    var r0 = c0.radius;
    var x1 = c1.center.x;
    var y1 = c1.center.y;
    var r1 = c1.radius;

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

    var p0 = Point.fromCoordinates(xi, yi);
    var p1 = Point.fromCoordinates(xi_prime, yi_prime);
    return p0.equals(p1) ? [p0] : [p0, p1];
  };

  Circle.fromCenterRadius = function (center, radius) {
    return new Circle({ center: center, radius: radius });
  };

  Circle.fromHyperbolicCenterRadius = function (center, radius) {
    if (!center.isOnPlane()) {
      return false;
    }
    var dh = center.distanceFromCenter();
    var angle = Circle.UNIT.angleAt(center);
    var farPoint = Point.fromHyperbolicPolarCoordinates(dh + radius, angle);
    var nearPoint = Point.fromHyperbolicPolarCoordinates(Math.abs(dh - radius), angle + (dh - radius < 0 ? Math.PI : 0));
    return Circle.fromTwoPoints(farPoint, nearPoint);
  };

  Circle.fromTwoPoints = function (p0, p1) {
    var l = Line.fromTwoPoints(p0, p1);
    return new Circle({ center: l.midpoint(), radius: l.euclideanDistance() / 2 })
  };

  Circle.fromThreePoints = function (p0, p1, p2) {
    if (!(p0 && p1 && p2)) {
      //not all points exist
      return false;
    }
    if (p0.equals(p1) || p0.equals(p2) || p1.equals(p2)) {
      // points are not unique
      return false;
    }
    if (Line.fromTwoPoints(p0, p1).slope === Line.fromTwoPoints(p0, p2).slope) {
      // points are in a straight line
      return false;
    }
    b0 = Line.fromTwoPoints(p0, p1);
    b1 = Line.fromTwoPoints(p1, p2);
    var center = Line.intersect(b0.perpindicularBisector(), b1.perpindicularBisector());
    var radius = Line.fromTwoPoints(p0, center).euclideanDistance();
    return new Circle({ center: center, radius: radius });
  };

  Circle.UNIT = new Circle({ center: Point.CENTER, radius: 1 });
})();
