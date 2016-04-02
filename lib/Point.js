;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point = function (options) {
    this._angle = options.angle;
    this._euclideanRadius = options.euclideanRadius;
    this._hyperbolicRadius = options.hyperbolicRadius;
    this._x = options.x;
    this._y = options.y;
  };

  Point.prototype.getAngle = function () {
    if (typeof this._angle === 'undefined') {
      this._angle = HyperbolicCanvas.Circle.UNIT.angleAt(this);
    }
    return this._angle;
  };

  Point.prototype.getEuclideanRadius = function () {
    if (typeof this._euclideanRadius === 'undefined') {
      this._euclideanRadius = Math.sqrt(
        Math.pow(this.getX(), 2) +
        Math.pow(this.getY(), 2)
      );
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
    return this._x;
  };

  Point.prototype.getY = function () {
    return this._y;
  };

  Point.prototype.equals = function (otherPoint) {
    return this.getX() === otherPoint.getX() && this.getY() === otherPoint.getY();
  };

  Point.prototype.angleFrom = function (otherPoint) {
    return otherPoint.angleTo(this);
  };

  Point.prototype.angleTo = function (otherPoint) {
    var c = HyperbolicCanvas.Line.givenTwoPoints(this, otherPoint).getArc();

    if (c) {
      var t = c.tangentAtPoint(this);
      var l = HyperbolicCanvas.Line.givenTwoPoints(otherPoint, c.getCenter());
      var intersect = HyperbolicCanvas.Line.intersect(t, l);
    } else {
      var intersect = otherPoint;
    }

    return Math.atan2(intersect.getY() - this.getY(), intersect.getX() - this.getX());
  };

  Point.prototype.distantPoint = function (distance, direction) {
    var angle = (typeof direction === "undefined" ? (typeof this.direction === "undefined" ? this.getAngle() : this.direction) : direction);
    angle = HyperbolicCanvas.Angle.normalize(angle);
    if (distance === 0) {
      var point = Point.givenCoordinates(this.getX(), this.getY());
      point.direction = angle;
      return point;
    }
    if (this.equals(Point.ORIGIN)) {
      var point = Point.givenHyperbolicPolarCoordinates(distance, angle);
      point.direction = angle;
      return point;
    }

    var thisAngle = this.getAngle();

    if (thisAngle === angle) {
      var point = Point.givenHyperbolicPolarCoordinates(this.getHyperbolicRadius() + distance, thisAngle);
      point.direction = angle;
      return point;
    }

    if (Math.abs(thisAngle - angle) === Math.PI) {
      var point = Point.givenHyperbolicPolarCoordinates(this.getHyperbolicRadius() - distance, thisAngle);
      point.direction = angle;
      return point;
    }

    var a, b, c, alpha, beta, gamma;

    var thisOpposite = HyperbolicCanvas.Angle.normalize(thisAngle + Math.PI);
    var dir;

    if (thisAngle > thisOpposite) {
      if (angle > thisOpposite && angle < thisAngle) {
        dir = -1;
      } else {
        dir = 1;
      }
    } else {
      if (angle > thisAngle && angle < thisOpposite) {
        dir = 1;
      } else {
        dir = -1;
      }
    }

    b = this.getHyperbolicRadius();
    c = distance;
    alpha = Math.abs(Math.PI - Math.abs(thisAngle - angle));

    a = Math.acosh(Math.cosh(b) * Math.cosh(c) - Math.sinh(b) * Math.sinh(c) * Math.cos(alpha));

    var cosgamma = (Math.cosh(a) * Math.cosh(b) - Math.cosh(c)) / (Math.sinh(a) * Math.sinh(b));
    if (cosgamma < -1) {
      // never seems to happen
      cosgamma = -1;
    } else if (cosgamma > 1) {
      // correct floating point error
      cosgamma = 1;
    }
    gamma = Math.acos(cosgamma);

    var bAngle = HyperbolicCanvas.Angle.normalize(thisAngle + gamma * dir);
    var distantPoint = Point.givenHyperbolicPolarCoordinates(a, bAngle);

    var cosbeta = (Math.cosh(a) * Math.cosh(c) - Math.cosh(b) / (Math.sinh(a) * Math.sinh(c)));
    if (cosbeta < -1) {
      // never seems to happen
      cosbeta = -1;
    } else if (cosbeta > 1) {
      // correct floating point error
      cosbeta = 1;
    }
    beta = Math.acos(cosbeta);

    distantPoint.direction = bAngle + beta * dir;
    return distantPoint;
  };

  Point.prototype.isOnPlane = function () {
    return Math.pow(this.getX(), 2) + Math.pow(this.getY(), 2) < 1;
  };

  Point.givenCoordinates = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.givenPolarCoordinates = function (radius, angle, inverted) {
    if (radius < 0) {
      angle += Math.PI;
      radius = Math.abs(radius);
    }
    angle = HyperbolicCanvas.Angle.normalize(inverted ? -1 * angle : angle);
    return new Point({
      angle: angle,
      euclideanRadius: radius,
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  };

  Point.givenHyperbolicPolarCoordinates = function (radius, angle, inverted) {
    // returns NaN coordinates at distance > 709
    // at angle 0, indistinguishable from limit at distance > 36
    if (radius < 0) {
      angle += Math.PI;
      radius = Math.abs(radius);
    }
    angle = HyperbolicCanvas.Angle.normalize(inverted ? -1 * angle : angle);

    var euclideanRadius = (Math.exp(radius) - 1) / (Math.exp(radius) + 1);
    return new Point({
      angle: angle,
      euclideanRadius: euclideanRadius,
      hyperbolicRadius: radius,
      x: euclideanRadius * Math.cos(angle),
      y: euclideanRadius * Math.sin(angle)
    });
  };

  Point.between = function (p0, p1) {
    return new Point({
      x: (p0.getX() + p1.getX()) / 2,
      y: (p0.getY() + p1.getY()) / 2
    });
  };

  Point.ORIGIN = new Point({ x: 0, y: 0 });
})();
