;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = HyperbolicCanvas.Point = function (options) {
    this._angle = options.angle;
    this._euclideanRadius = options.euclideanRadius;
    this._direction = options.direction;
    this._hyperbolicRadius = options.hyperbolicRadius;
    this._x = options.x;
    this._y = options.y;
  };

  Point.prototype.getAngle = function () {
    if (typeof this._angle === 'undefined') {
      this._angle = HyperbolicCanvas.Circle.UNIT.euclideanAngleAt(this);
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

  Point.prototype.setDirection = function (direction) {
    this._direction = HyperbolicCanvas.Angle.normalize(direction);
  };

  Point.prototype.getEuclideanRadius = function () {
    if (typeof this._euclideanRadius === 'undefined') {
      if (typeof this._x === 'undefined' || this._y === 'undefined') {
        this._euclideanRadius = (Math.exp(this.getHyperbolicRadius()) - 1) /
                                (Math.exp(this.getHyperbolicRadius()) + 1);
      } else {
        this._euclideanRadius = Math.sqrt(
          Math.pow(this.getX(), 2) +
          Math.pow(this.getY(), 2)
        );
      }
    }
    return this._euclideanRadius;
  };

  Point.prototype.getHyperbolicRadius = function () {
    if (typeof this._hyperbolicRadius === 'undefined') {
      this._hyperbolicRadius = 2 * Math.atanh(this.getEuclideanRadius());
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
    return Math.abs(this.getX() - otherPoint.getX()) < 1e-6 &&
           Math.abs(this.getY() - otherPoint.getY()) < 1e-6;
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

  Point.prototype.hyperbolicAngleFrom = function (otherPoint) {
    return otherPoint.hyperbolicAngleTo(this);
  };

  Point.prototype.hyperbolicAngleTo = function (otherPoint) {
    // TODO problem
    // p0 = HyperbolicCanvas.Point.givenCoordinates(-0.9107607891553183, 0.3050690864754191);
    // p1 = HyperbolicCanvas.Point.givenCoordinates(-0.9725203552620837, 0.03528882039594751);
    //
    // wrong direction
    var c = HyperbolicCanvas.Line.givenTwoPoints(this, otherPoint).getArc();

    if (c) {
      var t = c.tangentAtPoint(this);
      var l = HyperbolicCanvas.Line.givenTwoPoints(otherPoint, c.getEuclideanCenter());
      var intersect = HyperbolicCanvas.Line.euclideanIntersect(t, l);
    } else {
      var intersect = otherPoint;
    }

    return HyperbolicCanvas.Angle.normalize(Math.atan2(
      intersect.getY() - this.getY(),
      intersect.getX() - this.getX()
    ));
  };

  Point.prototype.hyperbolicDistanceTo = function (otherPoint) {
    // TODO for lines outside of plane?
    var b = this.getHyperbolicRadius();
    var c = otherPoint.getHyperbolicRadius();
    var alpha = this.getAngle() - otherPoint.getAngle();

    return Math.acosh(
      Math.cosh(b) * Math.cosh(c) -
      Math.sinh(b) * Math.sinh(c) * Math.cos(alpha)
    );
  };

  Point.prototype.distantPoint = function (distance, direction) {
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
    var bearing = this.getDirection(direction);

    var c = distance;

    if (c === 0 || Math.abs(c) < 1e-6) {
      // TODO ridiculous
      var point = this.clone();
      point.setDirection(bearing);
      return point;
    }
    if (this.equals(Point.ORIGIN)) {
      var point = Point.givenHyperbolicPolarCoordinates(c, bearing);
      point.setDirection(bearing);
      return point;
    }

    var aAngle = this.getAngle();
    var b = this.getHyperbolicRadius();

    if (Math.abs(aAngle - bearing) < 1e-6) {
      var point = Point.givenHyperbolicPolarCoordinates(b + c, aAngle);
      point.setDirection(bearing);
      return point;
    }

    var alpha = Math.abs(Math.PI - Math.abs(aAngle - bearing));

    if (alpha < 1e-6) {
      var point = Point.givenHyperbolicPolarCoordinates(b - c, aAngle);
      point.setDirection(bearing);
      return point;
    }

    // save hyperbolic functions which are called more than once
    var coshb = Math.cosh(b);
    var coshc = Math.cosh(c);
    var sinhb = Math.sinh(b);
    var sinhc = Math.sinh(c);

    var a = Math.acosh(coshb * coshc - sinhb * sinhc * Math.cos(alpha));

    var cosha = Math.cosh(a);
    var sinha = Math.sinh(a);

    // correct potential floating point error before calling acos
    var cosgamma = (cosha * coshb - coshc) / (sinha * sinhb);
    cosgamma = cosgamma > 1 ? 1 : cosgamma < -1 ? -1 : cosgamma;
    var gamma = Math.acos(cosgamma);

    // determine whether aAngle is +/- gamma
    var aAngleOpposite = HyperbolicCanvas.Angle.opposite(aAngle);
    var dir = aAngle > aAngleOpposite ?
                bearing > aAngleOpposite && bearing < aAngle ? -1 : 1
              :
                bearing > aAngle && bearing < aAngleOpposite ? 1 : -1
              ;

    var bAngle = HyperbolicCanvas.Angle.normalize(aAngle + gamma * dir);
    var distantPoint = Point.givenHyperbolicPolarCoordinates(a, bAngle);

    // TODO find the direction of the next point more efficiently
    //
    // var cosbeta = (cosha * coshc - coshb) / (sinha * sinhc);
    // cosbeta = cosbeta > 1 ? 1 : cosbeta < -1 ? -1 : cosbeta;
    // var beta = Math.acos(cosbeta);
    //
    // var bAngleOpposite = HyperbolicCanvas.Angle.opposite(bAngle);
    // var bDir = bAngle > bAngleOpposite ?
    //             bearing > bAngleOpposite && bearing < bAngle ? -1 : 1
    //           :
    //             bearing > bAngle && bearing < bAngleOpposite ? 1 : -1
    //           ;
    // bDir *= -1;

    distantPoint.setDirection(
      HyperbolicCanvas.Angle.opposite(distantPoint.hyperbolicAngleTo(this))
    );

    return distantPoint;
  };

  Point.prototype.isOnPlane = function () {
    return Math.pow(this.getX(), 2) + Math.pow(this.getY(), 2) < 1;
  };

  Point.prototype.quadrant = function () {
    return Math.floor(this.getAngle() / (Math.PI / 2) + 1);
  };

  Point.euclideanBetween = function (p0, p1) {
    return new Point({
      x: (p0.getX() + p1.getX()) / 2,
      y: (p0.getY() + p1.getY()) / 2
    });
  };

  Point.hyperbolicBetween = function (p0, p1) {
    var d = p0.hyperbolicDistanceTo(p1);
    return p0.distantPoint(d / 2, p0.hyperbolicAngleTo(p1));
  };

  Point.givenCoordinates = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.givenEuclideanPolarCoordinates = function (euclideanRadius, angle, inverted) {
    if (euclideanRadius < 0) {
      angle += Math.PI;
      euclideanRadius = Math.abs(euclideanRadius);
    }

    return new Point({
      angle: HyperbolicCanvas.Angle.normalize(inverted ? -1 * angle : angle),
      euclideanRadius: euclideanRadius
    });
  };

  Point.givenHyperbolicPolarCoordinates = function (hyperbolicRadius, angle, inverted) {
    // returns NaN coordinates at distance > 709
    // at angle 0, indistinguishable from limit at distance > 36
    if (hyperbolicRadius < 0) {
      angle += Math.PI;
      hyperbolicRadius = Math.abs(hyperbolicRadius);
    }

    return new Point({
      angle: HyperbolicCanvas.Angle.normalize(inverted ? -1 * angle : angle),
      hyperbolicRadius: hyperbolicRadius
    });
  };

  Point.random = function (quadrant) {
    return Point.givenEuclideanPolarCoordinates(
      Math.random(),
      HyperbolicCanvas.Angle.random(quadrant)
    );
  };

  Point.ORIGIN = new Point({ x: 0, y: 0 });

  // TODO override functions for origin
})();
