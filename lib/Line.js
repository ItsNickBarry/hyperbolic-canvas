;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;

  // TODO allow functions to save their results as instance variables
  var Line = window.HyperbolicCanvas.Line = function (options) {
    this.p0 = options.p0;
    this.p1 = options.p1;
    this.slope = options.slope === -Infinity ? Infinity : options.slope;
  };

  Line.prototype.arcCircle = function () {
    if (Line.fromTwoPoints(this.p0, Point.CENTER).slope === Line.fromTwoPoints(this.p1, Point.CENTER).slope) {
      return false;
    }
    var m = Line.fromTwoPoints(Point.CENTER, this.p0).perpindicularSlope();

    var l1 = Line.fromPointSlope(this.p0, m);

    // TODO is the unitCircleIntersects function working ?
    var intersects = l1.unitCircleIntersects();

    if (!intersects || intersects.length < 2) {
      return false;
    }

    var t1 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[0]);
    var t2 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[1]);

    var c = Line.intersect(t1, t2);

    return HyperbolicCanvas.Circle.fromThreePoints(this.p0, this.p1, c);
  };

  Line.prototype.containsPoint = function (p) {
    return p.y - this.p0.y === this.slope * (p.x - this.p0.x);
  };

  Line.prototype.equals = function (otherLine) {
    return this.slope === otherLine.slope && this.containsPoint(otherLine.p0);
  };

  // TODO decide how to handle x -> all y values or y -> all x values
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
    return Line.fromPointSlope(this.midpoint(), this.perpindicularSlope());
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p0.x - this.p1.x, 2) + Math.pow(this.p0.y - this.p1.y, 2));
  };

  Line.prototype.hyperbolicDistance2 = function () {
    // cosh(a) = cosh(b)cosh(c) - sinh(b)sinh(c)cos(A)
    // for triangle ABC where C is center of unit circle, A is starting point, C is destination point
    // c is distance travelled, b is distance of start from center, a is distance of destination from center
    // alpha is angle at A, beta is angle at B, gamma is angle at C



    // TODO https://en.wikipedia.org/wiki/Hyperbolic_triangle#Trigonometry


    // TODO why need this ?
    if (this.p0.equals(Point.CENTER)) {
      return this.p1.distanceFromCenter();
    } else if (this.p1.equals(Point.CENTER)) {
      return this.p0.distanceFromCenter();
    }

    var a, b, c, alpha, beta, gamma;

    var circle = this.arcCircle();

    a = this.p1.distanceFromCenter();

    // TODO bad
    alpha = Math.tan(circle.tangentAtPoint(this.p0).slope) % Math.PI;

    gamma = Math.abs(Circle.UNIT.angleAt(this.p0) - Circle.UNIT.angleAt(this.p1));

    return Math.asinh(Math.sin(gamma) * Math.sinh(a) / Math.sin(alpha));
  };

  Line.prototype.hyperbolicDistance = function () {
    // TODO broken probably
    var circle = this.arcCircle();

    if (!circle) {
      var d0 = this.p0.distanceFromCenter();
      var d1 = this.p1.distanceFromCenter();

      if (this.p0.x > 0 && this.p1.x > 0) {
        // both points in same quadrant
        return Math.abs(d0 - d1);
      } else {
        return d0 + d1;
      }
    }

    var intersects = circle.unitCircleIntersects();

    if (!intersects || intersects.length < 2) {
      // TODO this shouldn't even happen if Points are valid; maybe store a 'valid' attribute on Line and check that instead
      //      return false instead?
      return NaN;
    }
    var ap = circle.arcLength(this.p0, intersects[0]);
    var bq = circle.arcLength(this.p1, intersects[1]);
    var aq = circle.arcLength(this.p0, intersects[1]);
    var bp = circle.arcLength(this.p1, intersects[0]);

    var crossRatio = (ap * bq) / (aq * bp);
    return Math.abs(Math.log(crossRatio));
  };

  Line.prototype.midpoint = function () {
    return Point.between(this.p0, this.p1);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.prototype.unitCircleIntersects = function () {
    //quadratic formula
    var a = Math.pow(this.slope, 2) + 1;

    if (a > 1e9) {
      // TODO this is ridiculous
      var x0, x1, y0, y1;
      x0 = x1 = this.p0.x;
      y0 = Math.sqrt(1 - x0 * x0);
      y1 = -1 * y0;
      return [Point.fromCoordinates(x0, y0), Point.fromCoordinates(x1, y1)];
    }
    var b = this.slope * 2 * (this.p0.y - this.slope * this.p0.x);
    var c = Math.pow(this.p0.y, 2) + Math.pow(this.p0.x * this.slope, 2) - (2 * this.slope * this.p0.x * this.p0.y) - 1;
    // the +/- part on top
    var discriminant = b * b - (4 * a * c);

    if (discriminant < 0) {
      return false;
    }

    var x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
    var y0 = this.yAtX(x0);
    var p0 = Point.fromCoordinates(x0, y0);

    if (discriminant === 0) {
      return [p0];
    }

    var x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
    var y1 = this.yAtX(x1);

    var p1 = Point.fromCoordinates(x1, y1);

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
      return Point.fromCoordinates(x, y);
    }
    x = x || (l0.p0.x * l0.slope - l1.p0.x * l1.slope + l1.p0.y - l0.p0.y) / (l0.slope - l1.slope);
    if (l0.slope === Infinity || l0.slope === -Infinity) {
      y = y || l1.slope * (x - l1.p0.x) + l1.p0.y;
    } else {
      y = y || l0.slope * (x - l0.p0.x) + l0.p0.y;
    }
    return Point.fromCoordinates(x, y);
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    // TODO won't work for lines along diameter
    var intersects = Circle.intersects(l0.arcCircle(), l1.arcCircle());
    if (!intersects) {
      return false;
    }
    var d0 = Line.fromTwoPoints(intersects[0], Point.CENTER).euclideanDistance();
    var d1 = Line.fromTwoPoints(intersects[1], Point.CENTER).euclideanDistance();
    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Line.fromPointSlope = function (p, slope) {
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
    var p1 = Point.fromCoordinates(x, y);
    return new Line({ p0: p0, p1: p1, slope: slope });
  };

  Line.fromTwoPoints = function (p0, p1) {
    if (!p0 || !p1) {
      return false;
    }
    var m = (p0.y - p1.y) / (p0.x - p1.x);
    return new Line({ p0: p0, p1: p1, slope: m });
  };
})();
