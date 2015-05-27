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

  Circle.prototype.tangentAt = function (p) {
    // TODO return tangent line through point
    //      should maybe be angle instead of point parameter
    //      because point is not necessarily on circle, and probably isn't due to floating point math


    return Line.pointSlope(p, Line.pointPoint(Point.CENTER, p).perpindicularSlope());
  };

  Circle.prototype.unitCircleIntersects = function () {
    // TODO make sure intersection happens at all; use the "discriminant" or something

    // TODO various special cases: circle lies on x axis -> bad prblems
    var g = Math.pow(this.center.x, 2) + Math.pow(this.center.y, 2) + 1 - Math.pow(this.radius, 2);

    //quadratic formula
    var a = 4 + 4 * this.center.x;
    var b = 4 * g * this.center.x;
    var c = Math.pow(g, 2) - 4;

    var discriminant = Math.sqrt(b * b - (4 * a * c));

  };

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
