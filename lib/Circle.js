;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;

  var Line = window.HyperbolicCanvas.Line;

  var Circle = window.HyperbolicCanvas.Circle = function (center, radius) {
    this.center = center;
    this.radius = radius;
  };

  Circle.prototype.atX = function (x) {
    //returns absolute value
    // return Math.sqrt(Math.pow(this.radius, 2) - Math.pow(x - this.center.x, 2)) + this.center.y;
    return
  };

  Circle.prototype.atY = function (y) {
    //returns absolute value
    return Math.sqrt(Math.pow(this.radius, 2) - Math.pow(y - this.center.y, 2)) + this.center.x;
  };

  Circle.prototype.tangentAt = function (p) {
    // TODO return tangent line through point
    //      should maybe be angle instead of point parameter
    //      because point is not necessarily on circle, and probably isn't, due to floating point math


    return Line.pointSlope(p, Line.pointPoint(Point.CENTER, p).perpindicularSlope());
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

    return [new Point(xi, yi), new Point(xi_prime, yi_prime)];
  }

  Circle.pointPointPoint = function (p1, p2, p3) {
    // TODO make someone else check this
    if (p1.equals(p2) || p1.equals(p3) || p2.equals(p3)) {
      // points are not unique
      // TODO throw exception ?
      return false;
    }
    b1 = Line.pointPoint(p1, p2);
    b2 = Line.pointPoint(p2, p3);
    var center = Line.intersect(b1.bisector(), b2.bisector());
    var radius = Line.pointPoint(p1, center).euclideanDistance();
    return new Circle(center, radius);
  };

  Circle.UNIT = new Circle(Point.CENTER, 1);
})();
