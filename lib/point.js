const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Point = HyperbolicCanvas.Point = function (options) {
  this._angle = options.angle;
  this._euclideanRadius = options.euclideanRadius;
  this._direction = options.direction;
  this._hyperbolicRadius = options.hyperbolicRadius;
  this._x = options.x;
  this._y = options.y;
};

Point.prototype.getAngle = function () {
  if (typeof this._angle === 'undefined') {
    this._angle = HyperbolicCanvas.Angle.normalize(Math.atan2(
      this.getY(),
      this.getX()
    ));
  }
  return this._angle;
};

Point.prototype.getDirection = function (direction) {
  if (typeof direction !== 'undefined') {
    return HyperbolicCanvas.Angle.normalize(direction);
  }
  if (typeof this._direction !== 'undefined') {
    return this._direction;
  }
  return this.getAngle();
};

Point.prototype.getEuclideanRadius = function () {
  if (typeof this._euclideanRadius === 'undefined') {
    if (typeof this._x === 'undefined' || this._y === 'undefined') {
      if (this.getHyperbolicRadius() === Infinity) {
        this._euclideanRadius = 1;
      } else {
        this._euclideanRadius = (Math.exp(this.getHyperbolicRadius()) - 1) /
                                (Math.exp(this.getHyperbolicRadius()) + 1);
      }
    } else {
      this._euclideanRadius = Math.sqrt(
        Math.pow(this.getX(), 2) +
        Math.pow(this.getY(), 2)
      );
    }
    if (Math.abs(this._euclideanRadius - 1) < HyperbolicCanvas.ZERO) {
      this._euclideanRadius = 1;
    }
  }
  return this._euclideanRadius;
};

Point.prototype.getHyperbolicRadius = function () {
  if (typeof this._hyperbolicRadius === 'undefined') {
    if (this.isIdeal()) {
      this._hyperbolicRadius = Infinity;
    } else {
      this._hyperbolicRadius = 2 * Math.atanh(this.getEuclideanRadius());
    }
  }
  return this._hyperbolicRadius;
};

Point.prototype.getX = function () {
  if (typeof this._x === 'undefined') {
    this._x = this.getEuclideanRadius() * Math.cos(this.getAngle());
  }
  return this._x;
};

Point.prototype.getY = function () {
  if (typeof this._y === 'undefined') {
    this._y = this.getEuclideanRadius() * Math.sin(this.getAngle());
  }
  return this._y;
};

Point.prototype.equals = function (otherPoint) {
  return Math.abs(this.getX() - otherPoint.getX()) < HyperbolicCanvas.ZERO &&
         Math.abs(this.getY() - otherPoint.getY()) < HyperbolicCanvas.ZERO;
};

Point.prototype.clone = function () {
  return new Point({
    angle: this._angle,
    direction: this._direction,
    euclideanRadius: this._euclideanRadius,
    hyperbolicRadius: this._hyperbolicRadius,
    x: this._x,
    y: this._y
  });
};

Point.prototype.euclideanAngleFrom = function (otherPoint) {
  return otherPoint.euclideanAngleTo(this);
};

Point.prototype.euclideanAngleTo = function (otherPoint) {
  return HyperbolicCanvas.Angle.normalize(Math.atan2(
    otherPoint.getY() - this.getY(),
    otherPoint.getX() - this.getX()
  ));
};

Point.prototype.euclideanDistanceTo = function (otherPoint) {
  return Math.sqrt(
    Math.pow(this.getX() - otherPoint.getX(), 2) +
    Math.pow(this.getY() - otherPoint.getY(), 2)
  );
};

Point.prototype.euclideanDistantPoint = function (distance, direction) {
  let bearing = this.getDirection(direction);
  let distantPoint = Point.givenCoordinates(
    this.getX() + Math.cos(bearing) * distance,
    this.getY() + Math.sin(bearing) * distance
  );
  distantPoint._setDirection(bearing);
  return distantPoint;
};

Point.prototype.hyperbolicAngleFrom = function (otherPoint) {
  return otherPoint.hyperbolicAngleTo(this);
};

Point.prototype.hyperbolicAngleTo = function (otherPoint) {
  let geodesic = HyperbolicCanvas.Line.givenTwoPoints(
    this,
    otherPoint
  ).getHyperbolicGeodesic();

  let intersect;

  if (geodesic instanceof HyperbolicCanvas.Circle) {
    let t0 = geodesic.euclideanTangentAtPoint(this);
    let t1 = geodesic.euclideanTangentAtPoint(otherPoint);
    intersect = HyperbolicCanvas.Line.euclideanIntersect(t0, t1);
  } else {
    intersect = otherPoint;
  }
  return this.euclideanAngleTo(intersect);
};

Point.prototype.hyperbolicDistanceTo = function (otherPoint) {
  if (this.isIdeal() || otherPoint.isIdeal()) {
    return Infinity;
  }
  let b = this.getHyperbolicRadius();
  let c = otherPoint.getHyperbolicRadius();
  let alpha = this.getAngle() - otherPoint.getAngle();

  return Math.acosh(
    Math.cosh(b) * Math.cosh(c) -
    Math.sinh(b) * Math.sinh(c) * Math.cos(alpha)
  );
};

Point.prototype.hyperbolicDistantPoint = function (distance, direction) {
  /*
    Hyperbolic Law of Cosines
    cosh(a) === cosh(b)cosh(c) - sinh(b)sinh(c)cos(alpha)

    A: this point
    B: distant point
    C: origin
    a: hyperbolic radius of distant point
    b: hyperbolic radius of this point
    c: distance from this point to distant point
    alpha, beta, gamma: angles of triangle ABC at A, B, and C, respectively

    bearing: direction from this point to distant point
    aAngle: direction from origin to this point
    bAngle: direction from origin to distant point
  */
  // TODO hyperbolic law of haversines
  // TODO throw exception if direction is not provided or stored; do not default to this.getAngle()
  // TODO allow distance of Infinity, return ideal Point
  let bearing = this.getDirection(direction);

  let c = distance;

  if (Math.abs(c) < HyperbolicCanvas.ZERO) {
    let point = this.clone();
    point._setDirection(bearing);
    return point;
  }
  if (this.equals(Point.ORIGIN)) {
    let point = Point.givenHyperbolicPolarCoordinates(c, bearing);
    point._setDirection(bearing);
    return point;
  }

  let aAngle = this.getAngle();
  let b = this.getHyperbolicRadius();

  if (Math.abs(aAngle - bearing) < HyperbolicCanvas.ZERO) {
    let point = Point.givenHyperbolicPolarCoordinates(b + c, aAngle);
    point._setDirection(bearing);
    return point;
  }

  let alpha = Math.abs(Math.PI - Math.abs(aAngle - bearing));

  if (alpha < HyperbolicCanvas.ZERO) {
    let point = Point.givenHyperbolicPolarCoordinates(b - c, aAngle);
    point._setDirection(bearing);
    return point;
  }

  // save hyperbolic functions which are called more than once
  let coshb = Math.cosh(b);
  let coshc = Math.cosh(c);
  let sinhb = Math.sinh(b);
  let sinhc = Math.sinh(c);

  let a = Math.acosh(coshb * coshc - sinhb * sinhc * Math.cos(alpha));

  let cosha = Math.cosh(a);
  let sinha = Math.sinh(a);

  // correct potential floating point error before calling acos
  let cosgamma = (cosha * coshb - coshc) / (sinha * sinhb);
  cosgamma = cosgamma > 1 ? 1 : cosgamma < -1 ? -1 : cosgamma;
  let gamma = Math.acos(cosgamma);

  // determine whether aAngle is +/- gamma
  let aAngleOpposite = HyperbolicCanvas.Angle.opposite(aAngle);
  let dir = aAngle > aAngleOpposite ?
    bearing > aAngleOpposite && bearing < aAngle ? -1 : 1
    :
    bearing > aAngle && bearing < aAngleOpposite ? 1 : -1
  ;

  let bAngle = HyperbolicCanvas.Angle.normalize(aAngle + gamma * dir);
  let distantPoint = Point.givenHyperbolicPolarCoordinates(a, bAngle);

  // correct potential floating point error before calling acos
  let cosbeta = (cosha * coshc - coshb) / (sinha * sinhc);
  cosbeta = cosbeta > 1 ? 1 : cosbeta < -1 ? -1 : cosbeta;
  let beta = Math.acos(cosbeta);

  distantPoint._setDirection(bAngle + beta * dir);

  return distantPoint;
};

Point.prototype.isIdeal = function () {
  return this._euclideanRadius === 1 ||
         this._hyperbolicRadius === Infinity ||
         this.getEuclideanRadius() === 1;
};

Point.prototype.isOnPlane = function () {
  return this._euclideanRadius < 1 ||
         this._hyperbolicRadius < Infinity ||
         this.getEuclideanRadius() < 1;
};

Point.prototype.opposite = function () {
  return Point.givenEuclideanPolarCoordinates(
    this.getEuclideanRadius(),
    HyperbolicCanvas.Angle.opposite(this.getAngle())
  );
};

Point.prototype.quadrant = function () {
  return Math.floor(this.getAngle() / (Math.PI / 2) + 1);
};

Point.prototype.rotateAboutOrigin = function (angle) {
  return Point.givenEuclideanPolarCoordinates(
    this.getEuclideanRadius(),
    this.getAngle() + angle
  );
};

Point.prototype._setDirection = function (direction) {
  this._direction = HyperbolicCanvas.Angle.normalize(direction);
};

Point.euclideanBetween = function (p0, p1) {
  return new Point({
    x: (p0.getX() + p1.getX()) / 2,
    y: (p0.getY() + p1.getY()) / 2
  });
};

Point.hyperbolicBetween = function (p0, p1) {
  if (!(p0.isOnPlane() && p1.isOnPlane())) {
    return false;
  }
  let d = p0.hyperbolicDistanceTo(p1);
  return p0.hyperbolicDistantPoint(d / 2, p0.hyperbolicAngleTo(p1));
};

Point.givenCoordinates = function (x, y) {
  return new Point({ x: x, y: y });
};

Point.givenEuclideanPolarCoordinates = function (radius, angle) {
  if (radius < 0) {
    angle += Math.PI;
    radius = Math.abs(radius);
  }

  return new Point({
    angle: HyperbolicCanvas.Angle.normalize(angle),
    euclideanRadius: radius
  });
};

Point.givenHyperbolicPolarCoordinates = function (radius, angle) {
  // returns NaN coordinates at distance > 709
  // at angle 0, indistinguishable from limit at distance > 36
  if (radius < 0) {
    angle += Math.PI;
    radius = Math.abs(radius);
  }

  return new Point({
    angle: HyperbolicCanvas.Angle.normalize(angle),
    hyperbolicRadius: radius
  });
};

Point.givenIdealAngle = function (angle) {
  return Point.givenEuclideanPolarCoordinates(1, angle);
};

Point.random = function (quadrant) {
  return Point.givenEuclideanPolarCoordinates(
    Math.random(),
    HyperbolicCanvas.Angle.random(quadrant)
  );
};

Point.ORIGIN = Point.CENTER = new Point({ x: 0, y: 0 });

Point.ORIGIN.getAngle =
Point.ORIGIN.getEuclideanRadius =
Point.ORIGIN.getHyperbolicRadius =
Point.ORIGIN.getX =
Point.ORIGIN.getY = function () { return 0; };

Point.ORIGIN.euclideanAngleFrom =
Point.ORIGIN.hyperbolicAngleFrom = function (otherPoint) {
  return HyperbolicCanvas.Angle.opposite(this.euclideanAngleTo(otherPoint));
};

Point.ORIGIN.euclideanAngleTo =
Point.ORIGIN.hyperbolicAngleTo = function (otherPoint) {
  return otherPoint.getAngle();
};

Point.ORIGIN.euclideanDistanceTo = function (otherPoint) {
  return otherPoint.getEuclideanRadius();
};

Point.ORIGIN.hyperbolicDistanceTo = function (otherPoint) {
  return otherPoint.getHyperbolicRadius();
};

Point.ORIGIN.euclideanDistantPoint = function (distance, direction) {
  return Point.givenEuclideanCenterRadius(
    distance,
    this.getDirection(direction)
  );
};

Point.ORIGIN.hyperbolicDistantPoint = function (distance, direction) {
  return Point.givenHyperbolicPolarCoordinates(
    distance,
    this.getDirection(direction)
  );
};
