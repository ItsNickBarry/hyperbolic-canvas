const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Line = HyperbolicCanvas.Line = function (options) {
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
    let g = this.getHyperbolicGeodesic();
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
    let x, y;
    let p = this.getP0();
    let m = this.getSlope();
    if (m === Infinity) {
      x = p.getX();
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
    if (Math.abs(this._m) > HyperbolicCanvas.INFINITY) {
      this._m = Infinity;
    }
  }
  return this._m;
};

Line.prototype.getEuclideanUnitCircleIntersects = function () {
  if (typeof this._euclideanUnitCircleIntersects === 'undefined') {
    let m = this.getSlope();

    if (m > HyperbolicCanvas.INFINITY) {
      let x0, x1, y0, y1;
      x0 = x1 = this.getP0().getX();
      y0 = Math.sqrt(1 - x0 * x0);
      y1 = -1 * y0;
      return [
        HyperbolicCanvas.Point.givenCoordinates(x0, y0),
        HyperbolicCanvas.Point.givenCoordinates(x1, y1)
      ];
    }

    //quadratic formula
    let a = Math.pow(m, 2) + 1;

    // calculate discriminant
    let x = this.getP0().getX();
    let y = this.getP0().getY();

    let b = m * 2 * (y - m * x);
    let c = Math.pow(y, 2) + Math.pow(x * m, 2) - (2 * m * x * y) - 1;

    let discriminant = b * b - (4 * a * c);

    if (discriminant < 0) {
      return false;
    }

    let x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
    let y0 = this.euclideanYAtX(x0);
    let p0 = HyperbolicCanvas.Point.givenCoordinates(x0, y0);

    if (discriminant === 0) {
      return [p0];
    }

    let x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
    let y1 = this.euclideanYAtX(x1);

    let p1 = HyperbolicCanvas.Point.givenCoordinates(x1, y1);

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
  ) < HyperbolicCanvas.ZERO;
};

Line.prototype.hyperbolicIncludesPoint = function (point) {
  if (!(point.isOnPlane() ^ point.isIdeal())) {
    return false;
  }
  let g = this.getHyperbolicGeodesic();
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
  let g = this.getHyperbolicGeodesic();
  let otherG = otherLine.getHyperbolicGeodesic();
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

  let angleOffset = HyperbolicCanvas.Angle.fromSlope(this.getSlope()) * -1;

  let offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
    circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
    circle.getEuclideanRadius()
  );

  // distance from line to origin
  let lineOffset = Line.euclideanIntersect(
    this,
    this.euclideanPerpindicularLineAt(HyperbolicCanvas.Point.ORIGIN)
  ).euclideanDistanceTo(HyperbolicCanvas.Point.ORIGIN);

  // line passes above or below origin
  lineOffset *= this.euclideanYAtX(0) > 0 ? 1 : -1;

  let offsetIntersects = offsetCircle.pointsAtY(lineOffset);
  let intersects = [];
  for (let i = 0; i < offsetIntersects.length; i++) {
    intersects.push(offsetIntersects[i].rotateAboutOrigin(angleOffset * -1));
  }
  return intersects;
};

Line.prototype.hyperbolicIntersectsWithCircle = function (circle) {
  let g = this.getHyperbolicGeodesic();

  if (g instanceof HyperbolicCanvas.Circle) {
    return HyperbolicCanvas.Circle.intersects(g, circle);
  } else if (g instanceof Line) {
    return this.euclideanIntersectsWithCircle(circle);
  } else {
    return false;
  }
};

Line.prototype.euclideanXAtY = function (y) {
  if (this.getSlope() === 0) {
    // TODO use Infinity/undefined instead of true/false ?
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
  return Math.abs(this.getSlope() - otherLine.getSlope()) < HyperbolicCanvas.ZERO;
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
  let slope = this.getSlope();
  if (slope === Infinity) {
    return 0;
  } else if (slope === 0) {
    return Infinity;
  } else {
    return -1 / slope;
  }
};

Line.prototype.pointAtEuclideanX = function (x) {
  let y = this.euclideanYAtX(x);
  if (typeof y === 'boolean') {
    if (y) { y = 0; } else { return y; }
  }
  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.prototype.pointAtEuclideanY = function (y) {
  let x = this.euclideanXAtY(y);
  if (typeof x === 'boolean') {
    if (x) { x = 0; } else { return x; }
  }
  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.prototype._calculateGeodesicThroughTwoIdealPoints = function () {
  let a0 = this.getP0().getAngle();
  let a1 = this.getP1().getAngle();
  if (Math.abs(a0 - HyperbolicCanvas.Angle.opposite(a1)) < HyperbolicCanvas.ZERO) {
    this._geodesic = this;
  } else {
    let t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      this.getP0()
    );
    let t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      this.getP1()
    );
    let center = Line.euclideanIntersect(t0, t1);
    this._geodesic = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      center,
      center.euclideanDistanceTo(this.getP0())
    );
  }
};

Line.prototype._calculateGeodesicThroughOnePointOnPlane = function () {
  let l0 = Line.givenTwoPoints(this.getP0(), HyperbolicCanvas.Point.ORIGIN);
  let l1 = Line.givenTwoPoints(this.getP1(), HyperbolicCanvas.Point.ORIGIN);

  if (l0.equals(l1)) {
    // both points are colinear with origin, so geodesic is a Line, itself
    return this._geodesic = this;
  }

  // get the line through point on plane, which is perpindicular to origin
  // get intersects of that line with unit circle
  let intersects;

  if (this.getP0().isIdeal()) {
    intersects = l1.euclideanPerpindicularLineAt(
      this.getP1()
    ).getEuclideanUnitCircleIntersects();
  } else {
    intersects = l0.euclideanPerpindicularLineAt(
      this.getP0()
    ).getEuclideanUnitCircleIntersects();
  }

  if (!intersects || intersects.length < 2) {
    // line is outside of or tangent to unit circle
    return this._geodesic = false;
  }

  let t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
    intersects[0]
  );
  let t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
    intersects[1]
  );

  let c = Line.euclideanIntersect(t0, t1);

  this._geodesic = HyperbolicCanvas.Circle.givenThreePoints(
    this.getP0(),
    this.getP1(),
    c
  );
};

Line.euclideanIntersect = function (l0, l1) {
  let x, y;

  let l0m = l0.getSlope();
  let l1m = l1.getSlope();

  if (l0m === l1m) {
    // lines are parallel; lines may also be the same line
    return false;
  }

  let l0x = l0.getP0().getX();
  let l1x = l1.getP0().getX();
  let l0y = l0.getP0().getY();
  let l1y = l1.getP0().getY();

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
      l1m * (x - l1x) + l1y
      :
      l0m * (x - l0x) + l0y
    ;
  }

  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.hyperbolicIntersect = function (l0, l1) {
  if (!(l0.isOnPlane() && l1.isOnPlane())) {
    return false;
  }
  let g0 = l0.getHyperbolicGeodesic();
  let g1 = l1.getHyperbolicGeodesic();

  let g0IsLine = g0 instanceof Line;
  let g1IsLine = g1 instanceof Line;

  if (g0IsLine || g1IsLine) {
    if (g0IsLine && g1IsLine) {
      return HyperbolicCanvas.Point.ORIGIN;
    }
    let circle = g0IsLine ? g1 : g0;
    let line = g0IsLine ? g0 : g1;

    let angleOffset = HyperbolicCanvas.Angle.fromSlope(line.getSlope()) * -1;

    let offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
      circle.getEuclideanRadius()
    );

    let offsetIntersects = offsetCircle.pointsAtY(0);
    let intersects = [];
    for (let i = 0; i < offsetIntersects.length; i++) {
      intersects.push(
        offsetIntersects[i].rotateAboutOrigin(angleOffset * -1)
      );
    }

    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].isOnPlane()) {
        return intersects[i];
      }
    }
    return false;
  }

  let intersects = HyperbolicCanvas.Circle.intersects(g0, g1);

  if (!intersects) {
    return false;
  }

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].isOnPlane()) {
      return intersects[i];
    }
  }
  // this should never happen
  return false;
};

Line.randomSlope = function () {
  return HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
};

Line.givenPointSlope = function (p, slope) {
  return new Line({ p0: p, m: Math.abs(slope) > HyperbolicCanvas.INFINITY ? Infinity : slope });
};

Line.givenTwoPoints = function (p0, p1) {
  return new Line({ p0: p0, p1: p1 });
};

Line.givenAnglesOfIdealPoints = function (a0, a1) {
  let points = [
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
