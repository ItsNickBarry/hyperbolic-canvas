;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle;
  var Point = window.HyperbolicCanvas.Point;

  // TODO allow functions to save their results as instance variables (optimization)
  var Line = window.HyperbolicCanvas.Line = function (options) {
    this.p0 = options.p0;
    this.p1 = options.p1;
    this.slope = options.slope === -Infinity ? Infinity : options.slope;
  };

  Line.prototype.arcCircle = function () {
    if (this.p0.equals(Point.CENTER) || this.p1.equals(Point.CENTER)) {
      return false;
    }
    if (Line.givenTwoPoints(this.p0, Point.CENTER).slope === Line.givenTwoPoints(this.p1, Point.CENTER).slope) {
      return false;
    }
    var m = Line.givenTwoPoints(Point.CENTER, this.p0).perpindicularSlope();

    var l1 = Line.givenPointSlope(this.p0, m);

    var intersects = l1.unitCircleIntersects();

    if (!intersects || intersects.length < 2) {
      return false;
    }

    var t1 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[0]);
    var t2 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[1]);

    var c = Line.intersect(t1, t2);

    return HyperbolicCanvas.Circle.givenThreePoints(this.p0, this.p1, c);
  };

  Line.prototype.containsPoint = function (p) {
    return p.y - this.p0.y === this.slope * (p.x - this.p0.x);
  };

  Line.prototype.equals = function (otherLine) {
    return this.slope === otherLine.slope && this.containsPoint(otherLine.p0);
  };

  Line.prototype.isOnPlane = function () {
    return this.p0.isOnPlane() && this.p1.isOnPlane();
  };

  // TODO decide how to handle x -> all y values or y -> all x values; return true?
  Line.prototype.yAtX = function (x) {
    if (this.slope === Infinity) {
      return x === this.p0.x ? this.p0.y : false;
    } else {
      return (x - this.p0.x) * this.slope + this.p0.y;
    }
  };

  Line.prototype.xAtY = function (y) {
    if (this.slope === 0) {
      return y === this.p0.y ? this.p0.x : false;
    } else {
      return (y - this.p0.y) / this.slope + this.p0.x;
    }
  };

  Line.prototype.perpindicularBisector = function () {
    return Line.givenPointSlope(this.midpoint(), this.perpindicularSlope());
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p0.x - this.p1.x, 2) + Math.pow(this.p0.y - this.p1.y, 2));
  };

  Line.prototype.hyperbolicDistance = function () {
    var b = this.p0.distanceFromCenter();
    var c = this.p1.distanceFromCenter();
    var alpha = Math.abs(Math.abs(Angle.normalize(this.p0.angle()) - Angle.normalize(this.p1.angle())));

    return Math.acosh(Math.cosh(b) * Math.cosh(c) - Math.sinh(b) * Math.sinh(c) * Math.cos(alpha));
  };

  Line.prototype.midpoint = function () {
    return Point.between(this.p0, this.p1);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.prototype.unitCircleIntersects = function () {
    // TODO is this function working?

    //quadratic formula
    var a = Math.pow(this.slope, 2) + 1;

    if (a > 1e9) {
      // TODO this is ridiculous
      var x0, x1, y0, y1;
      x0 = x1 = this.p0.x;
      y0 = Math.sqrt(1 - x0 * x0);
      y1 = -1 * y0;
      return [Point.givenCoordinates(x0, y0), Point.givenCoordinates(x1, y1)];
    }
    var b = this.slope * 2 * (this.p0.y - this.slope * this.p0.x);
    var c = Math.pow(this.p0.y, 2) + Math.pow(this.p0.x * this.slope, 2) - (2 * this.slope * this.p0.x * this.p0.y) - 1;

    var discriminant = b * b - (4 * a * c);

    if (discriminant < 0) {
      return false;
    }

    var x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
    var y0 = this.yAtX(x0);
    var p0 = Point.givenCoordinates(x0, y0);

    if (discriminant === 0) {
      return [p0];
    }

    var x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
    var y1 = this.yAtX(x1);

    var p1 = Point.givenCoordinates(x1, y1);

    return [p0, p1];
  };

  Line.prototype.intersectsWithCircle = function (c) {

  };

  Line.intersect = function (l0, l1) {
    var x, y;
    if (l0.slope === l1.slope) {
      return false;
    }

    if (l0.slope === Infinity || l0.slope === -Infinity) {
      x = l0.p0.x;
    } else if (l1.slope === Infinity || l1.slope === -Infinity) {
      x = l1.p0.x;
    }

    if (l0.slope === 0) {
      y = l0.p0.y;
    } else if (l1.slope === 0) {
      y = l1.p0.y;
    }

    if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      return Point.givenCoordinates(x, y);
    }
    x = x || (l0.p0.x * l0.slope - l1.p0.x * l1.slope + l1.p0.y - l0.p0.y) / (l0.slope - l1.slope);
    if (l0.slope === Infinity) {
      y = y || l1.slope * (x - l1.p0.x) + l1.p0.y;
    } else {
      y = y || l0.slope * (x - l0.p0.x) + l0.p0.y;
    }
    return Point.givenCoordinates(x, y);
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    if (!(l0.isOnPlane() && l1.isOnPlane())) {
      return false;
    }
    // TODO won't work for lines along diameter; arcCircles will return false
    var intersects = Circle.intersects(l0.arcCircle(), l1.arcCircle());
    if (!intersects) {
      return false;
    }
    var d0 = Line.givenTwoPoints(intersects[0], Point.CENTER).euclideanDistance();
    var d1 = Line.givenTwoPoints(intersects[1], Point.CENTER).euclideanDistance();
    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Line.givenPointSlope = function (p, slope) {
    if (!p || (!slope && slope !==0)) {
      return false;
    }
    var x, y;
    if (Math.abs(slope) === Infinity) {
      x = p.x
      y = p.y ? p.y * 2 : p.y + 1;
    } else if (slope === 0) {
      x = p.x ? p.x * 2 : p.x + 1;
      y = p.y;
    } else {
      x = 0;
      y = p.y - slope * p.x;
    }
    var p0 = p;
    var p1 = Point.givenCoordinates(x, y);
    return new Line({ p0: p0, p1: p1, slope: slope });
  };

  Line.givenTwoPoints = function (p0, p1) {
    if (!p0 || !p1) {
      return false;
    }
    var m = (p0.y - p1.y) / (p0.x - p1.x);
    return new Line({ p0: p0, p1: p1, slope: m });
  };
})();
