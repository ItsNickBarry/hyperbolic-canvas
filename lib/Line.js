;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Line = window.HyperbolicCanvas.Line = function (options) {
    this._p0 = options.p0;
    this._p1 = options.p1;
    this._slope = options.slope === -Infinity ? Infinity : options.slope;
  };

  Line.prototype.getArc = function () {
    // TODO should this return both Circle and Line, or return false if Line?
    if (typeof this._geodesic === 'undefined') {
      if (this.getP0().equals(HyperbolicCanvas.Point.ORIGIN) || this.getP1().equals(HyperbolicCanvas.Point.ORIGIN)) {
        return false;
      }
      if (Line.givenTwoPoints(this.getP0(), HyperbolicCanvas.Point.ORIGIN).getSlope() === Line.givenTwoPoints(this.getP1(), HyperbolicCanvas.Point.ORIGIN).getSlope()) {
        return false;
      }
      var m = Line.givenTwoPoints(HyperbolicCanvas.Point.ORIGIN, this.getP0()).perpindicularSlope();

      var l1 = Line.givenPointSlope(this.getP0(), m);

      var intersects = l1.getUnitCircleIntersects();

      if (!intersects || intersects.length < 2) {
        return false;
      }

      var t1 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[0]);
      var t2 = window.HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[1]);

      var c = Line.intersect(t1, t2);

      this._geodesic = HyperbolicCanvas.Circle.givenThreePoints(this.getP0(), this.getP1(), c);
    }
    return this._geodesic;
  };

  Line.prototype.getEuclideanDistance = function () {
    if (typeof this._euclideanDistance === 'undefined') {
      this._euclideanDistance = Math.sqrt(
        Math.pow(this.getP0().getX() - this.getP1().getX(), 2) +
        Math.pow(this.getP0().getY() - this.getP1().getY(), 2)
      );
    }
    return this._euclideanDistance;
  };

  Line.prototype.getEuclideanMidpoint = function () {
    if (typeof this._euclideanMidpoint === 'undefined') {
      this._euclideanMidpoint = HyperbolicCanvas.Point.between(this.getP0(), this.getP1());
    }
    return this._euclideanMidpoint;
  };

  Line.prototype.getHyperbolicDistance = function () {
    if (typeof this._hyperbolicDistance === 'undefined') {
      var b = this.getP0().getHyperbolicRadius();
      var c = this.getP1().getHyperbolicRadius();
      var alpha = HyperbolicCanvas.Angle.normalize(this.getP0().getAngle()) -
                  HyperbolicCanvas.Angle.normalize(this.getP1().getAngle());

      this._hyperbolicDistance = Math.acosh(
        Math.cosh(b) * Math.cosh(c) -
        Math.sinh(b) * Math.sinh(c) * Math.cos(alpha)
      );
    }
    return this._hyperbolicDistance;
  };

  // Line.prototype.getHyperbolicMidpoint = function () {
  //   if (typeof this._hyperbolicMidpoint === 'undefined') {
  //     // TODO calculate hyperbolic midpoint
  //   }
  //   return this._hyperbolicMidpoint;
  // };

  Line.prototype.getP0 = function () {
    return this._p0;
  };

  Line.prototype.getP1 = function () {
    return this._p1;
  };

  Line.prototype.getSlope = function () {
    if (typeof this._slope === 'undefined') {
      this._slope = (this.getP0().getY() - this.getP1().getY()) /
                    (this.getP0().getX() - this.getP1().getX());
      if (this._slope === -Infinity) {
        this._slope = Infinity;
      }
    }
    return this._slope;
  };

  Line.prototype.getUnitCircleIntersects = function () {
    if (typeof this._unitCircleIntersects === 'undefined') {
      // TODO is this function working?

      //quadratic formula
      var a = Math.pow(this.getSlope(), 2) + 1;

      if (a > 1e9) {
        // TODO this is ridiculous
        var x0, x1, y0, y1;
        x0 = x1 = this.getP0().getX();
        y0 = Math.sqrt(1 - x0 * x0);
        y1 = -1 * y0;
        return [HyperbolicCanvas.Point.givenCoordinates(x0, y0), HyperbolicCanvas.Point.givenCoordinates(x1, y1)];
      }
      var b = this.getSlope() * 2 * (this.getP0().getY() - this.getSlope() * this.getP0().getX());
      var c = Math.pow(this.getP0().getY(), 2) + Math.pow(this.getP0().getX() * this.getSlope(), 2) - (2 * this.getSlope() * this.getP0().getX() * this.getP0().getY()) - 1;

      var discriminant = b * b - (4 * a * c);

      if (discriminant < 0) {
        return false;
      }

      var x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
      var y0 = this.yAtX(x0);
      var p0 = HyperbolicCanvas.Point.givenCoordinates(x0, y0);

      if (discriminant === 0) {
        return [p0];
      }

      var x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
      var y1 = this.yAtX(x1);

      var p1 = HyperbolicCanvas.Point.givenCoordinates(x1, y1);

      this._unitCircleIntersects = [p0, p1];
    }
    return this._unitCircleIntersects;
  };

  Line.prototype.containsPoint = function (p) {
    return p.getY() - this.getP0().getY() === this.getSlope() * (p.getX() - this.getP0().getX());
  };

  Line.prototype.equals = function (otherLine) {
    // TODO only for Euclidean lines; other function for hyperbolic lines?
    return this.getSlope() === otherLine.getSlope() && this.containsPoint(otherLine.getP0());
  };

  Line.prototype.isOnPlane = function () {
    return this.getP0().isOnPlane() && this.getP1().isOnPlane();
  };

  // TODO decide how to handle x -> all y values or y -> all x values; return true?
  Line.prototype.yAtX = function (x) {
    if (this.getSlope() === Infinity) {
      return x === this.getP0().getX() ? this.getP0().getY() : false;
    } else {
      return (x - this.getP0().getX()) * this.getSlope() + this.getP0().getY();
    }
  };

  Line.prototype.xAtY = function (y) {
    if (this.getSlope() === 0) {
      return y === this.getP0().getY() ? this.getP0().getX() : false;
    } else {
      return (y - this.getP0().getY()) / this.getSlope() + this.getP0().getX();
    }
  };

  Line.prototype.perpindicularBisector = function () {
    return Line.givenPointSlope(this.getEuclideanMidpoint(), this.perpindicularSlope());
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.getSlope();
  };

  // Line.prototype.intersectsWithCircle = function (c) {
  //   // TODO line-circle intersections
  // };

  Line.intersect = function (l0, l1) {
    var x, y;
    if (l0.getSlope() === l1.getSlope()) {
      return false;
    }

    if (l0.getSlope() === Infinity || l0.getSlope() === -Infinity) {
      x = l0.getP0().getX();
    } else if (l1.getSlope() === Infinity || l1.getSlope() === -Infinity) {
      x = l1.getP0().getX();
    }

    if (l0.getSlope() === 0) {
      y = l0.getP0().getY();
    } else if (l1.getSlope() === 0) {
      y = l1.getP0().getY();
    }

    if (typeof x !== 'undefined' && typeof y !== 'undefined') {
      return HyperbolicCanvas.Point.givenCoordinates(x, y);
    }
    x = x || (l0.getP0().getX() * l0.getSlope() - l1.getP0().getX() * l1.getSlope() + l1.getP0().getY() - l0.getP0().getY()) / (l0.getSlope() - l1.getSlope());
    if (l0.getSlope() === Infinity) {
      y = y || l1.getSlope() * (x - l1.getP0().getX()) + l1.getP0().getY();
    } else {
      y = y || l0.getSlope() * (x - l0.getP0().getX()) + l0.getP0().getY();
    }
    return HyperbolicCanvas.Point.givenCoordinates(x, y);
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    if (!(l0.isOnPlane() && l1.isOnPlane())) {
      return false;
    }
    // TODO won't work for lines along diameter; arcCircles will return false
    var intersects = HyperbolicCanvas.Circle.intersects(l0.getArc(), l1.getArc());
    if (!intersects) {
      return false;
    }
    var d0 = Line.givenTwoPoints(intersects[0], HyperbolicCanvas.Point.ORIGIN).getEuclideanDistance();
    var d1 = Line.givenTwoPoints(intersects[1], HyperbolicCanvas.Point.ORIGIN).getEuclideanDistance();
    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Line.givenPointSlope = function (p, slope) {
    if (!p || (!slope && slope !== 0)) {
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
    var p1 = HyperbolicCanvas.Point.givenCoordinates(x, y);
    return new Line({ p0: p0, p1: p1, slope: slope });
  };

  Line.givenTwoPoints = function (p0, p1) {
    if (!p0 || !p1) {
      return false;
    }
    return new Line({ p0: p0, p1: p1 });
  };
})();
