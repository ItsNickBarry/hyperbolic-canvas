import { HyperbolicCanvas } from './hyperbolic_canvas.js';

class Circle {
  #euclideanCenter;
  #euclideanRadius;
  #hyperbolicCenter;
  #hyperbolicRadius;
  #euclideanArea;
  #euclideanCircumference;
  #hyperbolicArea;
  #hyperbolicCircumference;
  #unitCircleIntersects;

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

  getEuclideanArea() {
    if (typeof this.#euclideanArea === 'undefined') {
      this.#euclideanArea = Math.PI * Math.pow(this.getEuclideanRadius(), 2);
    }
    return this.#euclideanArea;
  }

  getEuclideanCenter() {
    if (typeof this.#euclideanCenter === 'undefined') {
      this.#calculateEuclideanCenterRadius();
    }
    return this.#euclideanCenter;
  }

  getEuclideanCircumference() {
    if (typeof this.#euclideanCircumference === 'undefined') {
      this.#euclideanCircumference = Math.TAU * this.getEuclideanRadius();
    }
    return this.#euclideanCircumference;
  }

  getEuclideanDiameter() {
    return this.getEuclideanRadius() * 2;
  }

  getEuclideanRadius() {
    if (typeof this.#euclideanRadius === 'undefined') {
      this.#calculateEuclideanCenterRadius();
    }
    return this.#euclideanRadius;
  }

  getHyperbolicArea() {
    if (typeof this.#hyperbolicArea === 'undefined') {
      this.#hyperbolicArea =
        Math.TAU * (Math.cosh(this.getHyperbolicRadius()) - 1);
    }
    return this.#hyperbolicArea;
  }

  getHyperbolicCenter() {
    if (typeof this.#hyperbolicCenter === 'undefined') {
      this.#calculateHyperbolicCenterRadius();
    }
    return this.#hyperbolicCenter;
  }

  getHyperbolicCircumference() {
    if (typeof this.#hyperbolicCircumference === 'undefined') {
      this.#hyperbolicCircumference =
        Math.TAU * Math.sinh(this.getHyperbolicRadius());
    }
    return this.#hyperbolicCircumference;
  }

  getHyperbolicDiameter() {
    return this.getHyperbolicRadius() * 2;
  }

  getHyperbolicRadius() {
    if (typeof this.#hyperbolicRadius === 'undefined') {
      this.#calculateHyperbolicCenterRadius();
    }
    return this.#hyperbolicRadius;
  }

  getUnitCircleIntersects() {
    if (typeof this.#unitCircleIntersects === 'undefined') {
      this.#unitCircleIntersects = Circle.intersects(this, Circle.UNIT);
    }
    return this.#unitCircleIntersects;
  }

  clone() {
    return Circle.givenEuclideanCenterRadius(
      this.getEuclideanCenter(),
      this.getEuclideanRadius(),
    );
  }

  equals(otherCircle) {
    return (
      this.getEuclideanCenter().equals(otherCircle.getEuclideanCenter()) &&
      Math.abs(this.getEuclideanRadius() - otherCircle.getEuclideanRadius()) <
        HyperbolicCanvas.ZERO
    );
  }

  containsPoint(point) {
    return (
      this.getEuclideanRadius() >
      point.euclideanDistanceTo(this.getEuclideanCenter())
    );
  }

  includesPoint(point) {
    return (
      Math.abs(
        this.getEuclideanRadius() -
          point.euclideanDistanceTo(this.getEuclideanCenter()),
      ) < HyperbolicCanvas.ZERO
    );
  }

  euclideanAngleAt(p) {
    let dx = p.getX() - this.getEuclideanCenter().getX();
    let dy = p.getY() - this.getEuclideanCenter().getY();
    return HyperbolicCanvas.Angle.normalize(Math.atan2(dy, dx));
  }

  euclideanPointAt(angle) {
    return HyperbolicCanvas.Point.givenCoordinates(
      this.getEuclideanRadius() * Math.cos(angle) +
        this.getEuclideanCenter().getX(),
      this.getEuclideanRadius() * Math.sin(angle) +
        this.getEuclideanCenter().getY(),
    );
  }

  hyperbolicAngleAt(p) {
    return this.getHyperbolicCenter().hyperbolicAngleTo(p);
  }

  hyperbolicPointAt(angle) {
    return this.getHyperbolicCenter().hyperbolicDistantPoint(
      this.getHyperbolicRadius(),
      angle,
    );
  }

  pointsAtX(x) {
    let values = this.yAtX(x);
    let points = [];
    values.forEach(function (y) {
      points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
    });
    return points;
  }

  pointsAtY(y) {
    let values = this.xAtY(y);
    let points = [];
    values.forEach(function (x) {
      points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
    });
    return points;
  }

  euclideanTangentAtAngle(angle) {
    return HyperbolicCanvas.Line.givenPointSlope(
      this.euclideanPointAt(angle),
      -1 / HyperbolicCanvas.Angle.toSlope(angle),
    );
  }

  euclideanTangentAtPoint(p) {
    // not very mathematical; point is not necessarily on circle
    return this.euclideanTangentAtAngle(this.euclideanAngleAt(p));
  }

  xAtY(y) {
    let center = this.getEuclideanCenter();
    let a = this.#pythagoreanTheorem(y - center.getY());
    if (a) {
      return Math.abs(a) < HyperbolicCanvas.ZERO
        ? [center.getX()]
        : [center.getX() + a, center.getX() - a];
    } else {
      return a === 0 ? [center.getX()] : [];
    }
  }

  yAtX(x) {
    let center = this.getEuclideanCenter();
    let a = this.#pythagoreanTheorem(x - center.getX());
    if (a) {
      return Math.abs(a) < HyperbolicCanvas.ZERO
        ? [center.getY()]
        : [center.getY() + a, center.getY() - a];
    } else {
      return a === 0 ? [center.getY()] : [];
    }
  }

  #pythagoreanTheorem(b) {
    let c = this.getEuclideanRadius();
    let aSquared = Math.pow(c, 2) - Math.pow(b, 2);
    return Math.abs(aSquared) < HyperbolicCanvas.ZERO ? 0 : Math.sqrt(aSquared);
  }

  #calculateEuclideanCenterRadius() {
    let center = this.getHyperbolicCenter();
    let farPoint = this.hyperbolicPointAt(center.getAngle());
    let nearPoint = this.hyperbolicPointAt(
      HyperbolicCanvas.Angle.opposite(center.getAngle()),
    );
    let diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
    this.#euclideanCenter = diameter.getEuclideanMidpoint();
    this.#euclideanRadius = diameter.getEuclideanLength() / 2;
  }

  #calculateHyperbolicCenterRadius() {
    let center = this.getEuclideanCenter();

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
      let farPoint = this.euclideanPointAt(center.getAngle());
      let nearPoint = this.euclideanPointAt(
        HyperbolicCanvas.Angle.opposite(center.getAngle()),
      );
      let diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
      this.#hyperbolicCenter = diameter.getHyperbolicMidpoint();
      this.#hyperbolicRadius = diameter.getHyperbolicLength() / 2;
    }
  }

  static intersects(c0, c1) {
    // this function adapted from a post on Stack Overflow by 01AutoMonkey
    // and licensed CC BY-SA 3.0:
    // https://creativecommons.org/licenses/by-sa/3.0/legalcode
    let x0 = c0.getEuclideanCenter().getX();
    let y0 = c0.getEuclideanCenter().getY();
    let r0 = c0.getEuclideanRadius();
    let x1 = c1.getEuclideanCenter().getX();
    let y1 = c1.getEuclideanCenter().getY();
    let r1 = c1.getEuclideanRadius();

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
    if (d < HyperbolicCanvas.ZERO) {
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
    let xi = x2 + rx;
    let xi_prime = x2 - rx;
    let yi = y2 + ry;
    let yi_prime = y2 - ry;

    let p0 = HyperbolicCanvas.Point.givenCoordinates(xi, yi);
    let p1 = HyperbolicCanvas.Point.givenCoordinates(xi_prime, yi_prime);
    return p0.equals(p1) ? [p0] : [p0, p1];
  }

  static givenEuclideanCenterRadius(center, radius) {
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  }

  static givenHyperbolicCenterRadius(center, radius) {
    if (!center.isOnPlane()) {
      return false;
    }
    return new Circle({ hyperbolicCenter: center, hyperbolicRadius: radius });
  }

  static givenTwoPoints(p0, p1) {
    let l = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    return new Circle({
      euclideanCenter: l.getEuclideanMidpoint(),
      euclideanRadius: l.getEuclideanLength() / 2,
    });
  }

  static givenThreePoints(p0, p1, p2) {
    if (!(p0 && p1 && p2)) {
      //not all points exist
      return false;
    }
    if (p0.equals(p1) || p0.equals(p2) || p1.equals(p2)) {
      // points are not unique
      return false;
    }
    let b0 = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
    let b1 = HyperbolicCanvas.Line.givenTwoPoints(p1, p2);
    if (b0.equals(b1)) {
      // all three points are colinear
      return false;
    }
    let center = HyperbolicCanvas.Line.euclideanIntersect(
      b0.euclideanPerpindicularBisector(),
      b1.euclideanPerpindicularBisector(),
    );
    let radius = HyperbolicCanvas.Line.givenTwoPoints(
      p0,
      center,
    ).getEuclideanLength();
    return new Circle({ euclideanCenter: center, euclideanRadius: radius });
  }
}

Circle.UNIT = new Circle({});

Circle.UNIT.getEuclideanArea = function () {
  return Math.PI;
};

Circle.UNIT.getEuclideanCenter = Circle.UNIT.getHyperbolicCenter = function () {
  return HyperbolicCanvas.Point.ORIGIN;
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
  return HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle);
};

HyperbolicCanvas.Circle = Circle;
