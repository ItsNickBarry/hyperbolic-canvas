;
(function () {
  "use strict";
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Line = HyperbolicCanvas.Line = function (options) {
    this._p0 = options.p0;
    this._p1 = options.p1;
    this._m = options.m === -Infinity ? Infinity : options.m;
    this._euclideanUnitCircleIntersects = options.euclideanUnitCircleIntersects;
    this._idealPoints = options.idealPoints;
  };

  Line.prototype.getHyperbolicGeodesic = function () {
    if (typeof this._geodesic === 'undefined') {
      if (this.getP0().isIdeal() || this.getP1().isIdeal()) {
        if (this.getP0().isIdeal() && this.getP1().isIdeal()) {
          // both points are ideal
          this._calculateGeodesicThroughTwoIdealPoints();
        } else {
          // one point is on plane
          this._calculateGeodesicThroughOnePointOnPlane();
        }
      } else if (!this.isOnPlane()) {
        // either Point is not well defined, so geodesic is not defined
        this._geodesic = false;
      } else if (
        this.getP0().equals(HyperbolicCanvas.Point.ORIGIN) ||
        this.getP1().equals(HyperbolicCanvas.Point.ORIGIN)
      ) {
        // either Point is at origin, so geodesic is a Line
        this._geodesic = this;
      } else {
        // both Points are on plane; only need one
        this._calculateGeodesicThroughOnePointOnPlane();
      }
    }
    return this._geodesic;
  };

  Line.prototype.getEuclideanLength = function () {
    if (typeof this._euclideanLength === 'undefined') {
      this._euclideanLength = this.getP0().euclideanDistanceTo(this.getP1());
    }
    return this._euclideanLength;
  };

  Line.prototype.getEuclideanMidpoint = function () {
    if (typeof this._euclideanMidpoint === 'undefined') {
      this._euclideanMidpoint = HyperbolicCanvas.Point.euclideanBetween(
        this.getP0(),
        this.getP1()
      );
    }
    return this._euclideanMidpoint;
  };

  Line.prototype.getHyperbolicLength = function () {
    if (typeof this._hyperbolicLength === 'undefined') {
      this._hyperbolicLength = this.getP0().hyperbolicDistanceTo(this.getP1());
    }
    return this._hyperbolicLength;
  };

  Line.prototype.getHyperbolicMidpoint = function () {
    if (typeof this._hyperbolicMidpoint === 'undefined') {
      if (this.isOnPlane()) {
        this._hyperbolicMidpoint = this.getP0().hyperbolicDistantPoint(
          this.getHyperbolicLength() / 2,
          this.getP0().hyperbolicAngleTo(this.getP1())
        );
      } else {
        this._hyperbolicMidpoint = false;
      }
    }
    return this._hyperbolicMidpoint;
  };

  Line.prototype.getIdealLine = function () {
    if (typeof this._idealLine === 'undefined') {
      this._idealLine = Line.givenTwoPoints(
        this.getIdealPoints()[0],
        this.getIdealPoints()[1]
      );
    }
    return this._idealLine;
  };

  Line.prototype.getIdealPoints = function () {
    if (typeof this._idealPoints === 'undefined') {
      var g = this.getHyperbolicGeodesic();
      if (g === false) {
        this._idealPoints = false;
      } else if (g === this) {
        this._idealPoints = this.getEuclideanUnitCircleIntersects();
      } else {
        this._idealPoints = g.getUnitCircleIntersects();
      }
    }
    return this._idealPoints;
  };

  Line.prototype.getP0 = function () {
    return this._p0;
  };

  Line.prototype.getP1 = function () {
    if (typeof this._p1 === 'undefined') {
      var x, y;
      var p = this.getP0();
      var m = this.getSlope();
      if (m === Infinity) {
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
      if (Math.abs(this._m) > 1e15) {
        this._m = Infinity;
      }
    }
    return this._m;
  };

  Line.prototype.getEuclideanUnitCircleIntersects = function () {
    if (typeof this._euclideanUnitCircleIntersects === 'undefined') {
      var m = this.getSlope();

      if (m > 1e9) {
        // TODO can't calculate intersects properly if slope is too high
        var x0, x1, y0, y1;
        x0 = x1 = this.getP0().getX();
        y0 = Math.sqrt(1 - x0 * x0);
        y1 = -1 * y0;
        return [
          HyperbolicCanvas.Point.givenCoordinates(x0, y0),
          HyperbolicCanvas.Point.givenCoordinates(x1, y1)
        ];
      }

      //quadratic formula
      var a = Math.pow(m, 2) + 1;

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

      this._euclideanUnitCircleIntersects = [p0, p1];
    }
    return this._euclideanUnitCircleIntersects;
  };

  Line.prototype.clone = function () {
    return Line.givenTwoPoints(this.getP0(), this.getP1());
  };

  Line.prototype.euclideanIncludesPoint = function (point) {
    if (this.getSlope() === Infinity) {
      return this.getP0().getX() === point.getX();
    }
    return Math.abs(
      (point.getY() - this.getP0().getY()) -
      (this.getSlope() * (point.getX() - this.getP0().getX()))
    ) < 1e-6;
  };

  Line.prototype.hyperbolicIncludesPoint = function (point) {
    if (!(point.isOnPlane() ^ point.isIdeal())) {
      return false;
    }
    var g = this.getHyperbolicGeodesic();
    if (g instanceof HyperbolicCanvas.Circle) {
      return g.includesPoint(point);
    } else if (g instanceof Line) {
      return this.euclideanIncludesPoint(point);
    } else {
      return false;
    }
  };

  Line.prototype.equals = function (otherLine) {
    return this.isEuclideanParallelTo(otherLine) &&
           this.euclideanIncludesPoint(otherLine.getP0());
  };

  Line.prototype.hyperbolicEquals = function (otherLine) {
    var g = this.getHyperbolicGeodesic();
    var otherG = otherLine.getHyperbolicGeodesic();
    if (
      g instanceof HyperbolicCanvas.Circle &&
      otherG instanceof HyperbolicCanvas.Circle
    ) {
      return g.equals(otherG);
    } else if (g instanceof Line && otherG instanceof Line) {
      return g.equals(otherG);
    } else {
      return false;
    }
  };

  Line.prototype.euclideanIntersectsWithCircle = function (circle) {
    // rotate circle and line by same amount about origin such that line
    // becomes the x-axis

    var angleOffset = HyperbolicCanvas.Angle.fromSlope(this.getSlope()) * -1;

    var offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
      circle.getEuclideanRadius()
    );

    // distance from line to origin
    var lineOffset = Line.euclideanIntersect(
      this,
      this.euclideanPerpindicularLineAt(HyperbolicCanvas.Point.ORIGIN)
    ).euclideanDistanceTo(HyperbolicCanvas.Point.ORIGIN);

    // line passes above or below origin
    lineOffset *= this.euclideanYAtX(0) > 0 ? 1 : -1;

    var offsetIntersects = offsetCircle.pointsAtY(lineOffset);
    var intersects = [];
    for (var i = 0; i < offsetIntersects.length; i++) {
      intersects.push(offsetIntersects[i].rotateAboutOrigin(angleOffset * -1));
    }
    return intersects;
  };

  Line.prototype.hyperbolicIntersectsWithCircle = function (circle) {
    var g = this.getHyperbolicGeodesic();

    if (g instanceof HyperbolicCanvas.Circle) {
      return HyperbolicCanvas.Circle.intersects(g, circle);
    } else if (g instanceof Line) {
      return this.euclideanIntersectsWithCircle(circle);
    } else {
      return false;
    }
  };

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

  Line.prototype.isIdeal = function () {
    return this.getP0().isIdeal() || this.getP1().isIdeal();
  };

  Line.prototype.isOnPlane = function () {
    return this.getP0().isOnPlane() && this.getP1().isOnPlane();
  };

  Line.prototype.isEuclideanParallelTo = function (otherLine) {
    return Math.abs(this.getSlope() - otherLine.getSlope()) < 1e-6;
  };

  Line.prototype.isHyperbolicParallelTo = function (otherLine) {
    return Line.hyperbolicIntersect(this, otherLine) === false;
  };

  Line.prototype.euclideanPerpindicularBisector = function () {
    return this.euclideanPerpindicularLineAt(this.getEuclideanMidpoint());
  };

  Line.prototype.euclideanPerpindicularLineAt = function (point) {
    return Line.givenPointSlope(point, this.euclideanPerpindicularSlope());
  };

  Line.prototype.euclideanPerpindicularSlope = function () {
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

  Line.prototype._calculateGeodesicThroughTwoIdealPoints = function () {
    var a0 = this.getP0().getAngle();
    var a1 = this.getP1().getAngle();
    if (Math.abs(a0 - HyperbolicCanvas.Angle.opposite(a1)) < 1e-6) {
      this._geodesic = this;
    } else {
      var t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
        this.getP0()
      );
      var t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
        this.getP1()
      );
      var center = Line.euclideanIntersect(t0, t1);
      this._geodesic = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
        center,
        center.euclideanDistanceTo(this.getP0())
      );
    }
  };

  Line.prototype._calculateGeodesicThroughOnePointOnPlane = function () {
    var l0 = Line.givenTwoPoints(this.getP0(), HyperbolicCanvas.Point.ORIGIN);
    var l1 = Line.givenTwoPoints(this.getP1(), HyperbolicCanvas.Point.ORIGIN);

    if (l0.equals(l1)) {
      // both points are colinear with origin, so geodesic is a Line, itself
      return this._geodesic = this;
    }

    // get the line through point on plane, which is perpindicular to origin
    // get intersects of that line with unit circle
    if (this.getP0().isIdeal()) {
      var intersects = l1.euclideanPerpindicularLineAt(
        this.getP1()
      ).getEuclideanUnitCircleIntersects();
    } else {
      var intersects = l0.euclideanPerpindicularLineAt(
        this.getP0()
      ).getEuclideanUnitCircleIntersects();
    }

    if (!intersects || intersects.length < 2) {
      // line is outside of or tangent to unit circle
      return this._geodesic = false;
    }

    var t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      intersects[0]
    );
    var t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      intersects[1]
    );

    var c = Line.euclideanIntersect(t0, t1);

    this._geodesic = HyperbolicCanvas.Circle.givenThreePoints(
      this.getP0(),
      this.getP1(),
      c
    );
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
    var g0 = l0.getHyperbolicGeodesic();
    var g1 = l1.getHyperbolicGeodesic();

    var g0IsLine = g0 instanceof Line;
    var g1IsLine = g1 instanceof Line;

    if (g0IsLine || g1IsLine) {
      if (g0IsLine && g1IsLine) {
        return HyperbolicCanvas.Point.ORIGIN;
      }
      var circle = g0IsLine ? g1 : g0;
      var line = g0IsLine ? g0 : g1;

      var angleOffset = HyperbolicCanvas.Angle.fromSlope(line.getSlope()) * -1;

      var offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
        circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
        circle.getEuclideanRadius()
      );

      var offsetIntersects = offsetCircle.pointsAtY(0);
      var intersects = [];
      for (var i = 0; i < offsetIntersects.length; i++) {
        intersects.push(
          offsetIntersects[i].rotateAboutOrigin(angleOffset * -1)
        );
      }

      for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].isOnPlane()) {
          return intersects[i];
        }
      }
      return false;
    }

    var intersects = HyperbolicCanvas.Circle.intersects(g0, g1);

    if (!intersects) {
      return false;
    }

    for (var i = 0; i < intersects.length; i++) {
      if (intersects[i].isOnPlane()) {
        return intersects[i]
      }
    }
    // this should never happen
    return false;
  };

  Line.randomSlope = function () {
    return HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
  };

  Line.givenPointSlope = function (p, slope) {
    return new Line({ p0: p, m: Math.abs(slope) > 1e15 ? Infinity : slope });
  };

  Line.givenTwoPoints = function (p0, p1) {
    return new Line({ p0: p0, p1: p1 });
  };

  Line.givenAnglesOfIdealPoints = function (a0, a1) {
    var points = [
      HyperbolicCanvas.Point.givenIdealAngle(a0),
      HyperbolicCanvas.Point.givenIdealAngle(a1)
    ];
    return new Line({
      p0: points[0],
      p1: points[1],
      euclideanUnitCircleIntersects: points,
      idealPoints: points
    });
  };

  Line.X_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: 0 });

  Line.Y_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: Infinity });
})();
