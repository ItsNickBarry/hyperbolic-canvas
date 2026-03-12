import Angle from './angle.js';
import Circle from './circle.js';
import { INFINITY, ZERO } from './constants.js';
import Point from './point.js';

interface LineOptions {
  p0: Point;
  p1?: Point;
  m?: number;
  euclideanUnitCircleIntersects?: Point[];
  idealPoints?: Point[];
}

export default class Line {
  #p0: Point;
  #p1?: Point;
  #m?: number;
  #euclideanUnitCircleIntersects?: Point[] | false;
  #idealPoints?: Point[] | false;
  #geodesic?: Circle | Line;
  #euclideanLength?: number;
  #euclideanMidpoint?: Point;
  #hyperbolicLength?: number;
  #hyperbolicMidpoint?: Point;

  // Lazy initialization of constants is required because they reference
  // Point.ORIGIN, which is defined in point.ts. Due to circular
  // dependencies, Point may not be fully loaded when this module is
  // evaluated. By using lazy getters, we defer the reference until first
  // access, ensuring all classes are fully initialized.
  static #xAxis?: Line;
  static #yAxis?: Line;

  constructor(options: LineOptions) {
    this.#p0 = options.p0;
    this.#p1 = options.p1;
    this.#m = options.m === -Infinity ? Infinity : options.m;
    this.#euclideanUnitCircleIntersects = options.euclideanUnitCircleIntersects;
    this.#idealPoints = options.idealPoints;
  }

  getHyperbolicGeodesic(): Circle | Line {
    if (typeof this.#geodesic === 'undefined') {
      if (this.getP0().isIdeal() || this.getP1().isIdeal()) {
        if (this.getP0().isIdeal() && this.getP1().isIdeal()) {
          // both points are ideal
          this.#calculateGeodesicThroughTwoIdealPoints();
        } else {
          // one point is on plane
          this.#calculateGeodesicThroughOnePointOnPlane();
        }
      } else if (!this.isOnPlane()) {
        throw new Error('Hyperbolic geodesic is undefined: line must be on the hyperbolic plane');
      } else if (
        this.getP0().equals(Point.ORIGIN) ||
        this.getP1().equals(Point.ORIGIN)
      ) {
        // either Point is at origin, so geodesic is a Line
        this.#geodesic = this;
      } else {
        // both Points are on plane; only need one
        this.#calculateGeodesicThroughOnePointOnPlane();
      }
    }
    return this.#geodesic!;
  }

  getEuclideanLength(): number {
    if (typeof this.#euclideanLength === 'undefined') {
      this.#euclideanLength = this.getP0().euclideanDistanceTo(this.getP1());
    }
    return this.#euclideanLength;
  }

  getEuclideanMidpoint(): Point {
    if (typeof this.#euclideanMidpoint === 'undefined') {
      this.#euclideanMidpoint = Point.euclideanBetween(
        this.getP0(),
        this.getP1(),
      );
    }
    return this.#euclideanMidpoint;
  }

  getHyperbolicLength(): number {
    if (typeof this.#hyperbolicLength === 'undefined') {
      this.#hyperbolicLength = this.getP0().hyperbolicDistanceTo(this.getP1());
    }
    return this.#hyperbolicLength;
  }

  getHyperbolicMidpoint(): Point {
    if (typeof this.#hyperbolicMidpoint === 'undefined') {
      if (this.isOnPlane()) {
        this.#hyperbolicMidpoint = this.getP0().hyperbolicDistantPoint(
          this.getHyperbolicLength() / 2,
          this.getP0().hyperbolicAngleTo(this.getP1()),
        );
      } else {
        throw new Error('Line must be on the hyperbolic plane');
      }
    }
    return this.#hyperbolicMidpoint;
  }

  getIdealPoints(): Point[] | false {
    if (typeof this.#idealPoints === 'undefined') {
      const g = this.getHyperbolicGeodesic();
      if (g === this) {
        this.#idealPoints = this.getEuclideanUnitCircleIntersects();
      } else {
        this.#idealPoints = (g as Circle).getUnitCircleIntersects();
      }
    }
    return this.#idealPoints!;
  }

  getP0(): Point {
    return this.#p0;
  }

  getP1(): Point {
    if (typeof this.#p1 === 'undefined') {
      let x, y;
      const p = this.getP0();
      const m = this.getSlope();
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
      this.#p1 = Point.givenCoordinates(x, y);
    }
    return this.#p1;
  }

  getSlope(): number {
    if (typeof this.#m === 'undefined') {
      this.#m =
        (this.getP0().getY() - this.getP1().getY()) /
        (this.getP0().getX() - this.getP1().getX());
      if (Math.abs(this.#m) > INFINITY) {
        this.#m = Infinity;
      }
    }
    return this.#m;
  }

  getEuclideanUnitCircleIntersects(): Point[] | false {
    if (typeof this.#euclideanUnitCircleIntersects === 'undefined') {
      const m = this.getSlope();

      if (m > INFINITY) {
        let x0: number, x1: number, y0: number, y1: number;
        x0 = x1 = this.getP0().getX();
        y0 = Math.sqrt(1 - x0 * x0);
        y1 = -1 * y0;
        return [Point.givenCoordinates(x0, y0), Point.givenCoordinates(x1, y1)];
      }

      //quadratic formula
      const a = Math.pow(m, 2) + 1;

      // calculate discriminant
      const x = this.getP0().getX();
      const y = this.getP0().getY();

      const b = m * 2 * (y - m * x);
      const c = Math.pow(y, 2) + Math.pow(x * m, 2) - 2 * m * x * y - 1;

      const discriminant = b * b - 4 * a * c;

      if (discriminant < -ZERO) {
        return false;
      }

      // Treat near-zero discriminant as zero (tangent case)
      const x0 = (-1 * b - Math.sqrt(Math.abs(discriminant))) / (2 * a);
      // TODO: cast should be safe because discriminant is not negative
      const y0 = this.euclideanYAtX(x0) as number;
      const p0 = Point.givenCoordinates(x0, y0);

      if (Math.abs(discriminant) < ZERO) {
        return [p0];
      }

      const x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
      const y1 = this.euclideanYAtX(x1);

      // TODO: verify cast
      const p1 = Point.givenCoordinates(x1, y1 as number);

      this.#euclideanUnitCircleIntersects = [p0, p1];
    }
    return this.#euclideanUnitCircleIntersects;
  }

  clone(): Line {
    return Line.givenTwoPoints(this.getP0(), this.getP1());
  }

  euclideanIncludesPoint(point: Point): boolean {
    if (this.getSlope() === Infinity) {
      return this.getP0().getX() === point.getX();
    }
    return (
      Math.abs(
        point.getY() -
          this.getP0().getY() -
          this.getSlope() * (point.getX() - this.getP0().getX()),
      ) < ZERO
    );
  }

  hyperbolicIncludesPoint(point: Point): boolean {
    if (point.isOnPlane() === point.isIdeal()) {
      return false;
    }
    const g = this.getHyperbolicGeodesic();
    if (g instanceof Circle) {
      return g.includesPoint(point);
    } else if (g instanceof Line) {
      return this.euclideanIncludesPoint(point);
    } else {
      return false;
    }
  }

  equals(otherLine: Line): boolean {
    return (
      this.isEuclideanParallelTo(otherLine) &&
      this.euclideanIncludesPoint(otherLine.getP0())
    );
  }

  hyperbolicEquals(otherLine: Line): boolean {
    const g = this.getHyperbolicGeodesic();
    const otherG = otherLine.getHyperbolicGeodesic();
    if (g instanceof Circle && otherG instanceof Circle) {
      return g.equals(otherG);
    } else if (g instanceof Line && otherG instanceof Line) {
      return g.equals(otherG);
    } else {
      return false;
    }
  }

  euclideanIntersectsWithCircle(circle: Circle): Point[] {
    // rotate circle and line by same amount about origin such that line
    // becomes parallel to the x-axis

    const angleOffset = Angle.fromSlope(this.getSlope()) * -1;

    const offsetCircle = Circle.givenEuclideanCenterRadius(
      circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
      circle.getEuclideanRadius(),
    );

    // distance from line to origin
    // TODO: fix cast
    let lineOffset = (
      Line.euclideanIntersect(
        this,
        this.euclideanPerpindicularLineAt(Point.ORIGIN),
      ) as Point
    ).euclideanDistanceTo(Point.ORIGIN);

    if (lineOffset > 0) {
      // line passes above or below origin
      lineOffset *= (this.euclideanYAtX(0) as number) > 0 ? 1 : -1;
    }

    const offsetIntersects = offsetCircle.pointsAtY(lineOffset);
    const intersects: Point[] = [];
    for (let i = 0; i < offsetIntersects.length; i++) {
      intersects.push(offsetIntersects[i].rotateAboutOrigin(angleOffset * -1));
    }
    return intersects;
  }

  hyperbolicIntersectsWithCircle(circle: Circle): Point[] | false {
    const g = this.getHyperbolicGeodesic();

    if (g instanceof Circle) {
      return Circle.intersects(g, circle);
    } else if (g instanceof Line) {
      return this.euclideanIntersectsWithCircle(circle);
    } else {
      return false;
    }
  }

  euclideanXAtY(y: number): number | boolean {
    if (this.getSlope() === 0) {
      // TODO use Infinity/undefined instead of true/false ?
      return y === this.getP0().getY();
    } else {
      return (y - this.getP0().getY()) / this.getSlope() + this.getP0().getX();
    }
  }

  euclideanYAtX(x: number): number | boolean {
    if (this.getSlope() === Infinity) {
      return x === this.getP0().getX();
    } else {
      return (x - this.getP0().getX()) * this.getSlope() + this.getP0().getY();
    }
  }

  isIdeal(): boolean {
    return this.getP0().isIdeal() || this.getP1().isIdeal();
  }

  isOnPlane(): boolean {
    return this.getP0().isOnPlane() && this.getP1().isOnPlane();
  }

  isEuclideanParallelTo(otherLine: Line): boolean {
    return Math.abs(this.getSlope() - otherLine.getSlope()) < ZERO;
  }

  isHyperbolicParallelTo(otherLine: Line): boolean {
    return Line.hyperbolicIntersect(this, otherLine) === false;
  }

  euclideanPerpindicularBisector(): Line {
    return this.euclideanPerpindicularLineAt(this.getEuclideanMidpoint());
  }

  euclideanPerpindicularLineAt(point: Point): Line {
    return Line.givenPointSlope(point, this.euclideanPerpindicularSlope());
  }

  euclideanPerpindicularSlope(): number {
    const slope = this.getSlope();
    if (slope === Infinity) {
      return 0;
    } else if (slope === 0) {
      return Infinity;
    } else {
      return -1 / slope;
    }
  }

  pointAtEuclideanX(x: number): Point | boolean {
    let y = this.euclideanYAtX(x);
    if (typeof y === 'boolean') {
      if (y) {
        y = 0;
      } else {
        return y;
      }
    }
    return Point.givenCoordinates(x, y);
  }

  pointAtEuclideanY(y: number): Point | boolean {
    let x = this.euclideanXAtY(y);
    if (typeof x === 'boolean') {
      if (x) {
        x = 0;
      } else {
        return x;
      }
    }
    return Point.givenCoordinates(x, y);
  }

  #calculateGeodesicThroughTwoIdealPoints(): void {
    const a0 = this.getP0().getAngle();
    const a1 = this.getP1().getAngle();
    if (Math.abs(a0 - Angle.opposite(a1)) < ZERO) {
      this.#geodesic = this;
    } else {
      const t0 = Circle.UNIT.euclideanTangentAtPoint(this.getP0());
      const t1 = Circle.UNIT.euclideanTangentAtPoint(this.getP1());
      // TODO: ensure safety of cast
      const center = Line.euclideanIntersect(t0, t1) as Point;
      this.#geodesic = Circle.givenEuclideanCenterRadius(
        center,
        center.euclideanDistanceTo(this.getP0()),
      );
    }
  }

  #calculateGeodesicThroughOnePointOnPlane(): void {
    const l0 = Line.givenTwoPoints(this.getP0(), Point.ORIGIN);
    const l1 = Line.givenTwoPoints(this.getP1(), Point.ORIGIN);

    if (l0.equals(l1)) {
      // both points are colinear with origin, so geodesic is a Line, itself
      this.#geodesic = this;
      return;
    }

    // get the line through point on plane, which is perpindicular to origin
    // get intersects of that line with unit circle
    let intersects;

    if (this.getP0().isIdeal()) {
      intersects = l1
        .euclideanPerpindicularLineAt(this.getP1())
        .getEuclideanUnitCircleIntersects();
    } else {
      intersects = l0
        .euclideanPerpindicularLineAt(this.getP0())
        .getEuclideanUnitCircleIntersects();
    }

    if (!intersects || intersects.length < 2) {
      // line is outside of or tangent to unit circle
      this.#geodesic = false;
      return;
    }

    const t0 = Circle.UNIT.euclideanTangentAtPoint(intersects[0]);
    const t1 = Circle.UNIT.euclideanTangentAtPoint(intersects[1]);

    const c = Line.euclideanIntersect(t0, t1);

    if (!c) {
      this.#geodesic = false;
      return;
    }

    this.#geodesic = Circle.givenThreePoints(this.getP0(), this.getP1(), c);
  }

  static euclideanIntersect(l0: Line, l1: Line): Point | false {
    let x: number;
    let y: number;

    const l0m = l0.getSlope();
    const l1m = l1.getSlope();

    if (l0m === l1m) {
      // lines are parallel; lines may also be the same line
      // TODO: return true if lines are same line?
      return false;
    }

    const l0x = l0.getP0().getX();
    const l1x = l1.getP0().getX();
    const l0y = l0.getP0().getY();
    const l1y = l1.getP0().getY();

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
      y = l0m === Infinity ? l1m * (x - l1x) + l1y : l0m * (x - l0x) + l0y;
    }

    return Point.givenCoordinates(x, y);
  }

  static hyperbolicIntersect(l0: Line, l1: Line): Point | false {
    if (!(l0.isOnPlane() && l1.isOnPlane())) {
      return false;
    }
    const g0 = l0.getHyperbolicGeodesic();
    const g1 = l1.getHyperbolicGeodesic();

    const g0IsLine = g0 instanceof Line;
    const g1IsLine = g1 instanceof Line;

    if (g0IsLine || g1IsLine) {
      if (g0IsLine && g1IsLine) {
        return Point.ORIGIN;
      }
      const circle = (g0IsLine ? g1 : g0) as Circle;
      const line = (g0IsLine ? g0 : g1) as Line;

      const angleOffset = Angle.fromSlope(line.getSlope()) * -1;

      const offsetCircle = Circle.givenEuclideanCenterRadius(
        circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
        circle.getEuclideanRadius(),
      );

      const offsetIntersects = offsetCircle.pointsAtY(0);
      const intersects: Point[] = [];
      for (let i = 0; i < offsetIntersects.length; i++) {
        intersects.push(
          offsetIntersects[i].rotateAboutOrigin(angleOffset * -1),
        );
      }

      for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].isOnPlane()) {
          return intersects[i];
        }
      }
      return false;
    }

    // TODO: cast is safe as long as geodesics are never false
    const intersects = Circle.intersects(g0 as Circle, g1 as Circle);

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
  }

  static randomSlope(): number {
    return Angle.toSlope(Angle.random());
  }

  static givenPointSlope(point: Point, slope: number) {
    return new Line({
      p0: point,
      m: Math.abs(slope) > INFINITY ? Infinity : slope,
    });
  }

  static givenTwoPoints(p0: Point, p1: Point) {
    return new Line({ p0: p0, p1: p1 });
  }

  static givenAnglesOfIdealPoints(a0: number, a1: number) {
    const points = [Point.givenIdealAngle(a0), Point.givenIdealAngle(a1)];
    return new Line({
      p0: points[0],
      p1: points[1],
      euclideanUnitCircleIntersects: points,
      idealPoints: points,
    });
  }

  static get X_AXIS(): Line {
    if (!Line.#xAxis) {
      Line.#xAxis = new Line({ p0: Point.ORIGIN, m: 0 });
    }
    return Line.#xAxis;
  }

  static get Y_AXIS(): Line {
    if (!Line.#yAxis) {
      Line.#yAxis = new Line({ p0: Point.ORIGIN, m: Infinity });
    }
    return Line.#yAxis;
  }
}
