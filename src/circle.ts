import Angle from './angle.js';
import { ZERO } from './constants.js';
import Line from './line.js';
import Point from './point.js';

export default class Circle {
  static UNIT: Circle;
  #euclideanCenter: Point;
  #euclideanRadius: number;
  #hyperbolicCenter: Point | false;
  #hyperbolicRadius: number;
  #euclideanArea: number;
  #euclideanCircumference: number;
  #hyperbolicArea: number;
  #hyperbolicCircumference: number;
  #unitCircleIntersects: Point[] | false;

  constructor(options) {
    this.#euclideanCenter = options.euclideanCenter;
    if (options.euclideanRadius < 0) {
      this.#euclideanRadius = Math.abs(options.euclideanRadius);
    } else {
      this.#euclideanRadius = options.euclideanRadius;
    }
    this.#hyperbolicCenter = options.hyperbolicCenter;
    if (options.hyperbolicRadius < 0) {
      this.#hyperbolicRadius = Math.abs(options.hyperbolicRadius);
    } else {
      this.#hyperbolicRadius = options.hyperbolicRadius;
    }
  }

  getEuclideanArea(): number {
    if (typeof this.#euclideanArea === 'undefined') {
      this.#euclideanArea = Math.PI * Math.pow(this.getEuclideanRadius(), 2);
    }
    return this.#euclideanArea;
  }

  getEuclideanCenter(): Point {
    if (typeof this.#euclideanCenter === 'undefined') {
      this.#calculateEuclideanCenterRadius();
    }
    return this.#euclideanCenter;
  }

  getEuclideanCircumference(): number {
    if (typeof this.#euclideanCircumference === 'undefined') {
      this.#euclideanCircumference = Math.TAU * this.getEuclideanRadius();
    }
    return this.#euclideanCircumference;
  }

  getEuclideanDiameter(): number {
    return this.getEuclideanRadius() * 2;
  }

  getEuclideanRadius(): number {
    if (typeof this.#euclideanRadius === 'undefined') {
      this.#calculateEuclideanCenterRadius();
    }
    return this.#euclideanRadius;
  }

  getHyperbolicArea(): number {
    if (typeof this.#hyperbolicArea === 'undefined') {
      this.#hyperbolicArea =
        Math.TAU * (Math.cosh(this.getHyperbolicRadius()) - 1);
    }
    return this.#hyperbolicArea;
  }

  getHyperbolicCenter(): Point | false {
    if (typeof this.#hyperbolicCenter === 'undefined') {
      this.#calculateHyperbolicCenterRadius();
    }
    return this.#hyperbolicCenter;
  }

  getHyperbolicCircumference(): number {
    if (typeof this.#hyperbolicCircumference === 'undefined') {
      this.#hyperbolicCircumference =
        Math.TAU * Math.sinh(this.getHyperbolicRadius());
    }
    return this.#hyperbolicCircumference;
  }

  getHyperbolicDiameter(): number {
    return this.getHyperbolicRadius() * 2;
  }

  getHyperbolicRadius(): number {
    if (typeof this.#hyperbolicRadius === 'undefined') {
      this.#calculateHyperbolicCenterRadius();
    }
    return this.#hyperbolicRadius;
  }

  getUnitCircleIntersects(): Point[] | false {
    if (typeof this.#unitCircleIntersects === 'undefined') {
      this.#unitCircleIntersects = Circle.intersects(this, Circle.UNIT);
    }
    return this.#unitCircleIntersects;
  }

  clone(): Circle {
    return Circle.givenEuclideanCenterRadius(
      this.getEuclideanCenter(),
      this.getEuclideanRadius(),
    );
  }

  equals(otherCircle: Circle): boolean {
    return (
      this.getEuclideanCenter().equals(otherCircle.getEuclideanCenter()) &&
      Math.abs(this.getEuclideanRadius() - otherCircle.getEuclideanRadius()) <
        ZERO
    );
  }

  containsPoint(point: Point): boolean {
    return (
      this.getEuclideanRadius() >
      point.euclideanDistanceTo(this.getEuclideanCenter())
    );
  }

  includesPoint(point: Point): boolean {
    return (
      Math.abs(
        this.getEuclideanRadius() -
          point.euclideanDistanceTo(this.getEuclideanCenter()),
      ) < ZERO
    );
  }

  isOnPlane(): boolean {
    return (
      this.getEuclideanCenter().getEuclideanRadius() + this.getEuclideanRadius() <
      1
    );
  }

  euclideanAngleAt(point: Point): number {
    const dx = point.getX() - this.getEuclideanCenter().getX();
    const dy = point.getY() - this.getEuclideanCenter().getY();
    return Angle.normalize(Math.atan2(dy, dx));
  }

  euclideanPointAt(angle: number): Point {
    return Point.givenCoordinates(
      this.getEuclideanRadius() * Math.cos(angle) +
        this.getEuclideanCenter().getX(),
      this.getEuclideanRadius() * Math.sin(angle) +
        this.getEuclideanCenter().getY(),
    );
  }

  hyperbolicAngleAt(point: Point): number {
    const hyperbolicCenter = this.getHyperbolicCenter();
    return hyperbolicCenter && hyperbolicCenter.hyperbolicAngleTo(point);
  }

  hyperbolicPointAt(angle: number): Point | false {
    const hyperbolicCenter = this.getHyperbolicCenter();
    return (
      hyperbolicCenter &&
      hyperbolicCenter.hyperbolicDistantPoint(this.getHyperbolicRadius(), angle)
    );
  }

  pointsAtX(x: number): Point[] {
    const values = this.yAtX(x);
    const points = [];
    values.forEach(function (y) {
      points.push(Point.givenCoordinates(x, y));
    });
    return points;
  }

  pointsAtY(y: number): Point[] {
    const values = this.xAtY(y);
    const points = [];
    values.forEach(function (x) {
      points.push(Point.givenCoordinates(x, y));
    });
    return points;
  }

  euclideanTangentAtAngle(angle: number): Line {
    return Line.givenPointSlope(
      this.euclideanPointAt(angle),
      -1 / Angle.toSlope(angle),
    );
  }

  euclideanTangentAtPoint(point: Point): Line {
    // not very mathematical; point is not necessarily on circle
    return this.euclideanTangentAtAngle(this.euclideanAngleAt(point));
  }

  xAtY(y: number): number[] {
    const center = this.getEuclideanCenter();
    const a = this.#pythagoreanTheorem(y - center.getY());
    if (a) {
      return Math.abs(a) < ZERO
        ? [center.getX()]
        : [center.getX() + a, center.getX() - a];
    } else {
      return a === 0 ? [center.getX()] : [];
    }
  }

  yAtX(x: number): number[] {
    const center = this.getEuclideanCenter();
    const a = this.#pythagoreanTheorem(x - center.getX());
    if (a) {
      return Math.abs(a) < ZERO
        ? [center.getY()]
        : [center.getY() + a, center.getY() - a];
    } else {
      return a === 0 ? [center.getY()] : [];
    }
  }

  #pythagoreanTheorem(b: number): number {
    const c = this.getEuclideanRadius();
    const aSquared = Math.pow(c, 2) - Math.pow(b, 2);
    return Math.abs(aSquared) < ZERO ? 0 : Math.sqrt(aSquared);
  }

  #calculateEuclideanCenterRadius(): void {
    const center = this.getHyperbolicCenter();
    if (!center) throw 'TODO: verify not possible';
    const farPoint = this.hyperbolicPointAt(center.getAngle());
    if (!farPoint) throw 'TODO: verify not possible';
    const nearPoint = this.hyperbolicPointAt(Angle.opposite(center.getAngle()));
    if (!nearPoint) throw 'TODO: verify not possible';
    const diameter = Line.givenTwoPoints(farPoint, nearPoint);
    this.#euclideanCenter = diameter.getEuclideanMidpoint();
    this.#euclideanRadius = diameter.getEuclideanLength() / 2;
  }

  #calculateHyperbolicCenterRadius(): void {
    const center = this.getEuclideanCenter();

    if (center.getEuclideanRadius() + this.getEuclideanRadius() >= 1) {
      // TODO horocycles
      if (this.equals(Circle.UNIT)) {
        this.#hyperbolicCenter = center;
        this.#hyperbolicRadius = Infinity;
      } else {
        this.#hyperbolicCenter = false;
        this.#hyperbolicRadius = NaN;
      }
    } else {
      const farPoint = this.euclideanPointAt(center.getAngle());
      const nearPoint = this.euclideanPointAt(Angle.opposite(center.getAngle()));
      const diameter = Line.givenTwoPoints(farPoint, nearPoint);
      this.#hyperbolicCenter = diameter.getHyperbolicMidpoint();
      this.#hyperbolicRadius = diameter.getHyperbolicLength() / 2;
    }
  }

  static intersects(c0: Circle, c1: Circle): Point[] | false {
    // this function adapted from a post on Stack Overflow by 01AutoMonkey
    // and licensed CC BY-SA 3.0:
    // https://creativecommons.org/licenses/by-sa/3.0/legalcode
    const x0 = c0.getEuclideanCenter().getX();
    const y0 = c0.getEuclideanCenter().getY();
    const r0 = c0.getEuclideanRadius();
    const x1 = c1.getEuclideanCenter().getX();
    const y1 = c1.getEuclideanCenter().getY();
    const r1 = c1.getEuclideanRadius();

    let a, dx, dy, d, h, rx, ry;
    let x2, y2;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt(dy * dy + dx * dx);

    /* Check for solvability. */
    if (d > r0 + r1) {
      /* no solution. circles do not intersect. */
      return false;
    }
    if (d < Math.abs(r0 - r1)) {
      /* no solution. one circle is contained in the other */
      return false;
    }
    if (d < ZERO) {
      /* circles are concentric (same center) */
      return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */

    /* Determine the distance from point 0 to point 2. */
    a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a) / d;
    y2 = y0 + (dy * a) / d;

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt(r0 * r0 - a * a);

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h / d);
    ry = dx * (h / d);

    /* Determine the absolute intersection points. */
    const xi = x2 + rx;
    const xi_prime = x2 - rx;
    const yi = y2 + ry;
    const yi_prime = y2 - ry;

    const p0 = Point.givenCoordinates(xi, yi);
    const p1 = Point.givenCoordinates(xi_prime, yi_prime);
    return p0.equals(p1) ? [p0] : [p0, p1];
  }

  static givenEuclideanCenterRadius(center: Point, radius: number): Circle {
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  }

  static givenHyperbolicCenterRadius(
    center: Point,
    radius: number,
  ): Circle {
    if (!center.isOnPlane()) {
      throw new Error('Center must be on hyperbolic plane');
    }
    return new Circle({ hyperbolicCenter: center, hyperbolicRadius: radius });
  }

  static givenTwoPoints(p0: Point, p1: Point): Circle {
    const l = Line.givenTwoPoints(p0, p1);
    return new Circle({
      euclideanCenter: l.getEuclideanMidpoint(),
      euclideanRadius: l.getEuclideanLength() / 2,
    });
  }

  static givenThreePoints(p0: Point, p1: Point, p2: Point): Circle {
    if (!(p0 && p1 && p2)) {
      throw new Error('All three points must be defined');
    }
    if (p0.equals(p1) || p0.equals(p2) || p1.equals(p2)) {
      throw new Error('Points must be unique');
    }
    const b0 = Line.givenTwoPoints(p0, p1);
    const b1 = Line.givenTwoPoints(p1, p2);
    if (b0.equals(b1)) {
      throw new Error('Points must not be colinear');
    }
    const center = Line.euclideanIntersect(
      b0.euclideanPerpindicularBisector(),
      b1.euclideanPerpindicularBisector(),
    ) as Point;
    const radius = Line.givenTwoPoints(p0, center).getEuclideanLength();
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  }
}

Circle.UNIT = new Circle({});

Circle.UNIT.getEuclideanArea = function () {
  return Math.PI;
};

Circle.UNIT.getEuclideanCenter = Circle.UNIT.getHyperbolicCenter = function () {
  return Point.ORIGIN;
};

Circle.UNIT.getEuclideanCircumference = function () {
  return Math.TAU;
};

Circle.UNIT.getEuclideanDiameter = function () {
  return 2;
};

Circle.UNIT.getEuclideanRadius = function () {
  return 1;
};

Circle.UNIT.getHyperbolicArea =
  Circle.UNIT.getHyperbolicCircumference =
  Circle.UNIT.getHyperbolicDiameter =
  Circle.UNIT.getHyperbolicRadius =
    function () {
      return Infinity;
    };

Circle.UNIT.hyperbolicAngleAt = Circle.UNIT.euclideanAngleAt = function (
  point,
) {
  return point.getAngle();
};

Circle.UNIT.hyperbolicPointAt = Circle.UNIT.euclideanPointAt = function (
  angle,
) {
  return Point.givenEuclideanPolarCoordinates(1, angle);
};
