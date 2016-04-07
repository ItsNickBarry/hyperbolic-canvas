;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Line = HyperbolicCanvas.Line = function (options) {
    this._p0 = options.p0;
    this._p1 = options.p1;
    this._m = options.m === -Infinity ? Infinity : options.m;
  };

  Line.prototype.getArc = function () {
    // TODO should this return both Circle and Line, or return false if Line?
    if (typeof this._geodesic === 'undefined') {
      if (!this.isOnPlane()) {
        this._geodesic = false;
        return false;
      }
      if (
        this.getP0().equals(HyperbolicCanvas.Point.ORIGIN) ||
        this.getP1().equals(HyperbolicCanvas.Point.ORIGIN)
      ) {
        // either point is at origin, so geodesic is not an arc
        this._geodesic = false;
        return false;
      }

      var l0 = Line.givenTwoPoints(this.getP0(), HyperbolicCanvas.Point.ORIGIN);
      var l1 = Line.givenTwoPoints(this.getP1(), HyperbolicCanvas.Point.ORIGIN);

      if (l0.equals(l1)) {
        // both points are colinear with origin, so geodesic is not an arc
        this._geodesic = false;
        return false;
      }

      // get the line either of the points, which is perpindicular to origin
      // get intersects of that line with unit circle
      var intersects = l0.perpindicularLineAt(
        this.getP0()
      ).getUnitCircleIntersects();

      if (!intersects || intersects.length < 2) {
        // line is outside of or tangent to unit circle
        this._geodesic = false;
        return false;
      }

      var t0 = HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[0]);
      var t1 = HyperbolicCanvas.Circle.UNIT.tangentAtPoint(intersects[1]);

      var c = Line.euclideanIntersect(t0, t1);

      this._geodesic = HyperbolicCanvas.Circle.givenThreePoints(
        this.getP0(),
        this.getP1(),
        c
      );
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
      this._euclideanMidpoint = HyperbolicCanvas.Point.between(
        this.getP0(),
        this.getP1()
      );
    }
    return this._euclideanMidpoint;
  };

  Line.prototype.getHyperbolicDistance = function () {
    if (typeof this._hyperbolicDistance === 'undefined') {
      // TODO for lines outside of plane?
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

  Line.prototype.getHyperbolicMidpoint = function () {
    if (typeof this._hyperbolicMidpoint === 'undefined') {
      if (this.isOnPlane()) {
        this._hyperbolicMidpoint = this.getP0().distantPoint(
          this.getHyperbolicDistance() / 2,
          this.getP0().angleTo(this.getP1())
        );
      } else {
        this._hyperbolicMidpoint = false;
      }
    }
    return this._hyperbolicMidpoint;
  };

  Line.prototype.getP0 = function () {
    return this._p0;
  };

  Line.prototype.getP1 = function () {
    if (typeof this._p1 === 'undefined') {
      var x, y;
      var p = this.getP0();
      var m = this.getSlope();
      if (Math.abs(m) === Infinity) {
        x = p.getX()
        y = p.getY() ? p.getY() * 2 : p.getY() + 1;
      } else if (m === 0) {
        x = p.getX() ? p.getX() * 2 : p.getX() + 1;
        y = p.getY();
      } else {
        x = 0;
        y = p.getY() - m * p.getX();
      }
      this._p1 = HyperbolicCanvas.Point.givenCoordinates(x, y);
    }
    return this._p1;
  };

  Line.prototype.getSlope = function () {
    if (typeof this._m === 'undefined') {
      this._m = (this.getP0().getY() - this.getP1().getY()) /
                    (this.getP0().getX() - this.getP1().getX());
      if (this._m === -Infinity) {
        this._m = Infinity;
      }
    }
    return this._m;
  };

  Line.prototype.getUnitCircleIntersects = function () {
    if (typeof this._unitCircleIntersects === 'undefined') {
      //quadratic formula
      var a = Math.pow(this.getSlope(), 2) + 1;

      if (a > 1e9) {
        // TODO this is ridiculous
        var x0, x1, y0, y1;
        x0 = x1 = this.getP0().getX();
        y0 = Math.sqrt(1 - x0 * x0);
        y1 = -1 * y0;
        return [
          HyperbolicCanvas.Point.givenCoordinates(x0, y0),
          HyperbolicCanvas.Point.givenCoordinates(x1, y1)
        ];
      }

      // calculate discriminant
      var m = this.getSlope();
      var x = this.getP0().getX();
      var y = this.getP0().getY();

      var b = m * 2 * (y - m * x);
      var c = Math.pow(y, 2) + Math.pow(x * m, 2) - (2 * m * x * y) - 1;

      var discriminant = b * b - (4 * a * c);

      if (discriminant < 0) {
        return false;
      }

      var x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
      var y0 = this.euclideanYAtX(x0);
      var p0 = HyperbolicCanvas.Point.givenCoordinates(x0, y0);

      if (discriminant === 0) {
        return [p0];
      }

      var x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
      var y1 = this.euclideanYAtX(x1);

      var p1 = HyperbolicCanvas.Point.givenCoordinates(x1, y1);

      this._unitCircleIntersects = [p0, p1];
    }
    return this._unitCircleIntersects;
  };

  Line.prototype.clone = function () {
    return Line.givenTwoPoints(this.getP0(), this.getP1());
  };

  Line.prototype.containsPoint = function (p) {
    // TODO hyperbolic version
    if (this.getSlope() === Infinity) {
      return this.getP0().getX() === p.getX();
    }
    return Math.abs(
      (p.getY() - this.getP0().getY()) -
      (this.getSlope() * (p.getX() - this.getP0().getX()))
    ) < 1e-6;
  };

  Line.prototype.equals = function (otherLine) {
    // TODO only for Euclidean lines; other function for hyperbolic lines?
    return this.isParallelTo(otherLine) &&
           this.containsPoint(otherLine.getP0());
  };

  // Line.prototype.intersectsWithCircle = function (c) {
  //   // TODO line-circle intersections
  // };

  // TODO use Infinity/undefined instead of true/false ?
  Line.prototype.euclideanXAtY = function (y) {
    if (this.getSlope() === 0) {
      return y === this.getP0().getY();
    } else {
      return (y - this.getP0().getY()) / this.getSlope() + this.getP0().getX();
    }
  };

  Line.prototype.euclideanYAtX = function (x) {
    if (this.getSlope() === Infinity) {
      return x === this.getP0().getX();
    } else {
      return (x - this.getP0().getX()) * this.getSlope() + this.getP0().getY();
    }
  };

  Line.prototype.isOnPlane = function () {
    return this.getP0().isOnPlane() && this.getP1().isOnPlane();
  };

  Line.prototype.isParallelTo = function (otherLine) {
    return Math.abs(this.getSlope() - otherLine.getSlope()) < 1e-6;
  };

  Line.prototype.perpindicularBisector = function () {
    // TODO specify that this is Euclidean
    return this.perpindicularLineAt(this.getEuclideanMidpoint());
  };

  Line.prototype.perpindicularLineAt = function (point) {
    return Line.givenPointSlope(point, this.perpindicularSlope());
  };

  Line.prototype.perpindicularSlope = function () {
    var slope = this.getSlope();
    if (slope === Infinity) {
      return 0;
    } else if (slope === 0) {
      return Infinity;
    } else {
      return -1 / slope;
    }
  };

  Line.prototype.pointAtEuclideanX = function (x) {
    var y = this.euclideanYAtX(x);
    if (typeof y === 'boolean') {
      if (y) { y = 0; } else { return y; }
    }
    return HyperbolicCanvas.Point.givenCoordinates(x, y);
  };

  Line.prototype.pointAtEuclideanY = function (y) {
    var x = this.euclideanXAtY(y);
    if (typeof x === 'boolean') {
      if (x) { x = 0; } else { return x; }
    }
    return HyperbolicCanvas.Point.givenCoordinates(x, y);
  };

  Line.euclideanIntersect = function (l0, l1) {
    var x, y;

    var l0m = l0.getSlope();
    var l1m = l1.getSlope();

    if (l0m === l1m) {
      // lines are parallel; lines may also be the same line
      return false;
    }

    var l0x = l0.getP0().getX();
    var l1x = l1.getP0().getX();
    var l0y = l0.getP0().getY();
    var l1y = l1.getP0().getY();

    if (l0m === Infinity) {
      x = l0x;
    } else if (l1m === Infinity) {
      x = l1x;
    } else {
      x = (l0x * l0m - l1x * l1m + l1y - l0y) / (l0m - l1m);
    }

    if (l0m === 0) {
      y = l0y;
    } else if (l1m === 0) {
      y = l1y;
    } else {
      y = l0m === Infinity ?
          l1m * (x - l1x) + l1y :
          l0m * (x - l0x) + l0y;
    }

    return HyperbolicCanvas.Point.givenCoordinates(x, y);
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    if (!(l0.isOnPlane() && l1.isOnPlane())) {
      return false;
    }
    // TODO won't work for lines along diameter; arcCircles will return false
    var intersects = HyperbolicCanvas.Circle.intersects(
      l0.getArc(),
      l1.getArc()
    );

    if (!intersects) {
      return false;
    }

    var d0 = Line.givenTwoPoints(
      intersects[0],
      HyperbolicCanvas.Point.ORIGIN
    ).getEuclideanDistance();
    var d1 = Line.givenTwoPoints(
      intersects[1],
      HyperbolicCanvas.Point.ORIGIN
    ).getEuclideanDistance();

    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Line.randomSlope = function () {
    return HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
  };

  Line.givenPointSlope = function (p, slope) {
    if (!p || (!slope && slope !== 0)) {
      return false;
    }
    return new Line({ p0: p, m: slope });
  };

  Line.givenTwoPoints = function (p0, p1) {
    if (!p0 || !p1) {
      return false;
    }
    return new Line({ p0: p0, p1: p1 });
  };

  Line.X_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: 0 });

  Line.Y_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: Infinity });
})();
