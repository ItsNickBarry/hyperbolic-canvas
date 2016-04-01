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
    return p.getY() - this.p0.getY() === this.slope * (p.getX() - this.p0.getX());
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
      return x === this.p0.getX() ? this.p0.getY() : false;
    } else {
      return (x - this.p0.getX()) * this.slope + this.p0.getY();
    }
  };

  Line.prototype.xAtY = function (y) {
    if (this.slope === 0) {
      return y === this.p0.getY() ? this.p0.getX() : false;
    } else {
      return (y - this.p0.getY()) / this.slope + this.p0.getX();
    }
  };

  Line.prototype.perpindicularBisector = function () {
    return Line.givenPointSlope(this.midpoint(), this.perpindicularSlope());
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p0.getX() - this.p1.getX(), 2) + Math.pow(this.p0.getY() - this.p1.getY(), 2));
  };

  Line.prototype.hyperbolicDistance = function () {
    var b = this.p0.getHyperbolicRadius();
    var c = this.p1.getHyperbolicRadius();
    var alpha = Angle.normalize(this.p0.getAngle()) - Angle.normalize(this.p1.getAngle());

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
      x0 = x1 = this.p0.getX();
      y0 = Math.sqrt(1 - x0 * x0);
      y1 = -1 * y0;
      return [Point.givenCoordinates(x0, y0), Point.givenCoordinates(x1, y1)];
    }
    var b = this.slope * 2 * (this.p0.getY() - this.slope * this.p0.getX());
    var c = Math.pow(this.p0.getY(), 2) + Math.pow(this.p0.getX() * this.slope, 2) - (2 * this.slope * this.p0.getX() * this.p0.getY()) - 1;

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
    // TODO line-circle intersections
  };

  Line.intersect = function (l0, l1) {
    var x, y;
    if (l0.slope === l1.slope) {
      return false;
    }

    if (l0.slope === Infinity || l0.slope === -Infinity) {
      x = l0.p0.getX();
    } else if (l1.slope === Infinity || l1.slope === -Infinity) {
      x = l1.p0.getX();
    }

    if (l0.slope === 0) {
      y = l0.p0.getY();
    } else if (l1.slope === 0) {
      y = l1.p0.getY();
    }

    if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      return Point.givenCoordinates(x, y);
    }
    x = x || (l0.p0.getX() * l0.slope - l1.p0.getX() * l1.slope + l1.p0.getY() - l0.p0.getY()) / (l0.slope - l1.slope);
    if (l0.slope === Infinity) {
      y = y || l1.slope * (x - l1.p0.getX()) + l1.p0.getY();
    } else {
      y = y || l0.slope * (x - l0.p0.getX()) + l0.p0.getY();
    }
    return Point.givenCoordinates(x, y);
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    if (!(l0.isOnPlane() && l1.isOnPlane())) {
      return false;
    }
    // TODO won't work for lines along diameter; arcCircles will return false
    var intersects = HyperbolicCanvas.Circle.intersects(l0.arcCircle(), l1.arcCircle());
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
      x = p.getX()
      y = p.getY() ? p.getY() * 2 : p.getY() + 1;
    } else if (slope === 0) {
      x = p.getX() ? p.getX() * 2 : p.getX() + 1;
      y = p.getY();
    } else {
      x = 0;
      y = p.getY() - slope * p.getX();
    }
    var p0 = p;
    var p1 = Point.givenCoordinates(x, y);
    return new Line({ p0: p0, p1: p1, slope: slope });
  };

  Line.givenTwoPoints = function (p0, p1) {
    if (!p0 || !p1) {
      return false;
    }
    var m = (p0.getY() - p1.getY()) / (p0.getX() - p1.getX());
    return new Line({ p0: p0, p1: p1, slope: m });
  };
})();
