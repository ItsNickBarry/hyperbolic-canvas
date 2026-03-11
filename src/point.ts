import Angle from './angle.js';
import Circle from './circle.js';
import { ZERO } from './constants.js';
import Line from './line.js';
import type { Quadrant } from './types.js';

export default class Point {
  static ORIGIN: Point;
  static CENTER: Point;
  #angle: number;
  #euclideanRadius: number;
  #direction: number;
  #hyperbolicRadius: number;
  #x: number;
  #y: number;

  constructor(options) {
    this.#angle = options.angle;
    this.#euclideanRadius = options.euclideanRadius;
    this.#direction = options.direction;
    this.#hyperbolicRadius = options.hyperbolicRadius;
    this.#x = options.x;
    this.#y = options.y;
  }

  getAngle(): number {
    if (typeof this.#angle === 'undefined') {
      this.#angle = Angle.normalize(Math.atan2(this.getY(), this.getX()));
    }
    return this.#angle;
  }

  getDirection(direction?: number): number {
    if (typeof direction !== 'undefined') {
      return Angle.normalize(direction);
    }
    if (typeof this.#direction !== 'undefined') {
      return this.#direction;
    }
    return this.getAngle();
  }

  getEuclideanRadius(): number {
    if (typeof this.#euclideanRadius === 'undefined') {
      if (typeof this.#x === 'undefined' || typeof this.#y === 'undefined') {
        if (this.getHyperbolicRadius() === Infinity) {
          this.#euclideanRadius = 1;
        } else {
          this.#euclideanRadius =
            (Math.exp(this.getHyperbolicRadius()) - 1) /
            (Math.exp(this.getHyperbolicRadius()) + 1);
        }
      } else {
        this.#euclideanRadius = Math.sqrt(
          Math.pow(this.getX(), 2) + Math.pow(this.getY(), 2),
        );
      }
      if (Math.abs(this.#euclideanRadius - 1) < ZERO) {
        this.#euclideanRadius = 1;
      }
    }
    return this.#euclideanRadius;
  }

  getHyperbolicRadius(): number {
    if (typeof this.#hyperbolicRadius === 'undefined') {
      if (this.isIdeal()) {
        this.#hyperbolicRadius = Infinity;
      } else {
        this.#hyperbolicRadius = 2 * Math.atanh(this.getEuclideanRadius());
      }
    }
    return this.#hyperbolicRadius;
  }

  getX(): number {
    if (typeof this.#x === 'undefined') {
      this.#x = this.getEuclideanRadius() * Math.cos(this.getAngle());
    }
    return this.#x;
  }

  getY(): number {
    if (typeof this.#y === 'undefined') {
      this.#y = this.getEuclideanRadius() * Math.sin(this.getAngle());
    }
    return this.#y;
  }

  equals(otherPoint) {
    return (
      Math.abs(this.getX() - otherPoint.getX()) < ZERO &&
      Math.abs(this.getY() - otherPoint.getY()) < ZERO
    );
  }

  clone() {
    return new Point({
      angle: this.#angle,
      direction: this.#direction,
      euclideanRadius: this.#euclideanRadius,
      hyperbolicRadius: this.#hyperbolicRadius,
      x: this.#x,
      y: this.#y,
    });
  }

  euclideanAngleFrom(otherPoint: Point): number {
    return otherPoint.euclideanAngleTo(this);
  }

  euclideanAngleTo(otherPoint: Point): number {
    return Angle.normalize(
      Math.atan2(
        otherPoint.getY() - this.getY(),
        otherPoint.getX() - this.getX(),
      ),
    );
  }

  euclideanDistanceTo(otherPoint: Point): number {
    return Math.sqrt(
      Math.pow(this.getX() - otherPoint.getX(), 2) +
        Math.pow(this.getY() - otherPoint.getY(), 2),
    );
  }

  euclideanDistantPoint(distance: number, direction?: number): Point {
    let bearing = this.getDirection(direction);
    let distantPoint = Point.givenCoordinates(
      this.getX() + Math.cos(bearing) * distance,
      this.getY() + Math.sin(bearing) * distance,
    );
    distantPoint.#setDirection(bearing);
    return distantPoint;
  }

  hyperbolicAngleFrom(otherPoint: Point): number {
    return otherPoint.hyperbolicAngleTo(this);
  }

  hyperbolicAngleTo(otherPoint: Point): number {
    let geodesic = Line.givenTwoPoints(
      this,
      otherPoint,
    ).getHyperbolicGeodesic();

    let intersect;

    if (geodesic instanceof Circle) {
      let t0 = geodesic.euclideanTangentAtPoint(this);
      let t1 = geodesic.euclideanTangentAtPoint(otherPoint);
      intersect = Line.euclideanIntersect(t0, t1);
    } else {
      intersect = otherPoint;
    }
    return this.euclideanAngleTo(intersect);
  }

  hyperbolicDistanceTo(otherPoint: Point): number {
    if (this.isIdeal() || otherPoint.isIdeal()) {
      return Infinity;
    }
    let b = this.getHyperbolicRadius();
    let c = otherPoint.getHyperbolicRadius();
    let alpha = this.getAngle() - otherPoint.getAngle();

    return Math.acosh(
      Math.cosh(b) * Math.cosh(c) -
        Math.sinh(b) * Math.sinh(c) * Math.cos(alpha),
    );
  }

  hyperbolicDistantPoint(distance: number, direction?: number): Point {
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

    if (Math.abs(c) < ZERO) {
      let point = this.clone();
      point.#setDirection(bearing);
      return point;
    }
    if (this.equals(Point.ORIGIN)) {
      let point = Point.givenHyperbolicPolarCoordinates(c, bearing);
      point.#setDirection(bearing);
      return point;
    }

    let aAngle = this.getAngle();
    let b = this.getHyperbolicRadius();

    if (Math.abs(aAngle - bearing) < ZERO) {
      let point = Point.givenHyperbolicPolarCoordinates(b + c, aAngle);
      point.#setDirection(bearing);
      return point;
    }

    let alpha = Math.abs(Math.PI - Math.abs(aAngle - bearing));

    if (alpha < ZERO) {
      let point = Point.givenHyperbolicPolarCoordinates(b - c, aAngle);
      point.#setDirection(bearing);
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
    let aAngleOpposite = Angle.opposite(aAngle);
    let dir =
      aAngle > aAngleOpposite
        ? bearing > aAngleOpposite && bearing < aAngle
          ? -1
          : 1
        : bearing > aAngle && bearing < aAngleOpposite
          ? 1
          : -1;
    let bAngle = Angle.normalize(aAngle + gamma * dir);
    let distantPoint = Point.givenHyperbolicPolarCoordinates(a, bAngle);

    // correct potential floating point error before calling acos
    let cosbeta = (cosha * coshc - coshb) / (sinha * sinhc);
    cosbeta = cosbeta > 1 ? 1 : cosbeta < -1 ? -1 : cosbeta;
    let beta = Math.acos(cosbeta);

    distantPoint.#setDirection(bAngle + beta * dir);

    return distantPoint;
  }

  isIdeal(): boolean {
    return (
      this.#euclideanRadius === 1 ||
      this.#hyperbolicRadius === Infinity ||
      this.getEuclideanRadius() === 1
    );
  }

  isOnPlane(): boolean {
    return (
      this.#euclideanRadius < 1 ||
      this.#hyperbolicRadius < Infinity ||
      this.getEuclideanRadius() < 1
    );
  }

  opposite(): Point {
    return Point.givenEuclideanPolarCoordinates(
      this.getEuclideanRadius(),
      Angle.opposite(this.getAngle()),
    );
  }

  quadrant(): Quadrant {
    return Math.floor(this.getAngle() / (Math.PI / 2) + 1) as Quadrant;
  }

  rotateAboutOrigin(angle: number): Point {
    return Point.givenEuclideanPolarCoordinates(
      this.getEuclideanRadius(),
      this.getAngle() + angle,
    );
  }

  #setDirection(direction: number): void {
    this.#direction = Angle.normalize(direction);
  }

  static euclideanBetween(p0: Point, p1: Point): Point {
    return new Point({
      x: (p0.getX() + p1.getX()) / 2,
      y: (p0.getY() + p1.getY()) / 2,
    });
  }

  static hyperbolicBetween(p0: Point, p1: Point): Point | false {
    if (!(p0.isOnPlane() && p1.isOnPlane())) {
      return false;
    }
    let d = p0.hyperbolicDistanceTo(p1);
    return p0.hyperbolicDistantPoint(d / 2, p0.hyperbolicAngleTo(p1));
  }

  static givenCoordinates(x: number, y: number): Point {
    return new Point({ x: x, y: y });
  }

  static givenEuclideanPolarCoordinates(radius: number, angle: number): Point {
    if (radius < 0) {
      angle += Math.PI;
      radius = Math.abs(radius);
    }

    return new Point({
      angle: Angle.normalize(angle),
      euclideanRadius: radius,
    });
  }

  static givenHyperbolicPolarCoordinates(radius: number, angle: number): Point {
    // returns NaN coordinates at distance > 709
    // at angle 0, indistinguishable from limit at distance > 36
    if (radius < 0) {
      angle += Math.PI;
      radius = Math.abs(radius);
    }

    return new Point({
      angle: Angle.normalize(angle),
      hyperbolicRadius: radius,
    });
  }

  static givenIdealAngle(angle: number): Point {
    return Point.givenEuclideanPolarCoordinates(1, angle);
  }

  static random(quadrant?: Quadrant): Point {
    return Point.givenEuclideanPolarCoordinates(
      Math.random(),
      Angle.random(quadrant),
    );
  }
}

Point.ORIGIN = Point.CENTER = new Point({ x: 0, y: 0 });

Point.ORIGIN.getAngle =
  Point.ORIGIN.getEuclideanRadius =
  Point.ORIGIN.getHyperbolicRadius =
  Point.ORIGIN.getX =
  Point.ORIGIN.getY =
    function () {
      return 0;
    };

Point.ORIGIN.euclideanAngleFrom = Point.ORIGIN.hyperbolicAngleFrom = function (
  otherPoint,
) {
  return Angle.opposite(this.euclideanAngleTo(otherPoint));
};

Point.ORIGIN.euclideanAngleTo = Point.ORIGIN.hyperbolicAngleTo = function (
  otherPoint,
) {
  return otherPoint.getAngle();
};

Point.ORIGIN.euclideanDistanceTo = function (otherPoint) {
  return otherPoint.getEuclideanRadius();
};

Point.ORIGIN.hyperbolicDistanceTo = function (otherPoint) {
  return otherPoint.getHyperbolicRadius();
};

Point.ORIGIN.euclideanDistantPoint = function (distance, direction) {
  return Point.givenEuclideanPolarCoordinates(
    distance,
    this.getDirection(direction),
  );
};

Point.ORIGIN.hyperbolicDistantPoint = function (distance, direction) {
  return Point.givenHyperbolicPolarCoordinates(
    distance,
    this.getDirection(direction),
  );
};
