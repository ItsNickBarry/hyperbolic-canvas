;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle;
  /*
  * Point object relative to the unit circle, where 0,0 is canvas center
  */
  var Point = window.HyperbolicCanvas.Point = function (options) {
    this.x = options.x;
    this.y = options.y;
  };

  Point.prototype.angle = function () {
    return Circle.UNIT.angleAt(this);
  };

  Point.prototype.equals = function (otherPoint) {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  };

  Point.prototype.distanceFromCenter = function () {
    var r = HyperbolicCanvas.Line.fromTwoPoints(Point.CENTER, this).euclideanDistance();
    return 2 * Math.atanh(r);
  };

  Point.fromCoordinates = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.fromPolarCoordinates = function (radius, angle, inverted) {
    return new Point({ x: radius * Math.cos(angle), y: radius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.fromHyperbolicPolarCoordinates = function (radius, angle, inverted) {
    // returns NaN coordinates at distance > 709
    // at angle 0, indistinguishable from limit at distance > 36

    // TODO not sure why this isn't necessary
    // if (radius < 0) {
    //   radius *= -1;
    //   angle += Math.PI;
    // }
    var euclideanRadius = (Math.exp(radius) - 1) / (Math.exp(radius) + 1);
    return new Point({ x: euclideanRadius * Math.cos(angle), y: euclideanRadius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.between = function (p0, p1) {
    return new Point({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });
  };

  Point.CENTER = new Point({ x: 0, y: 0 });






















  Point.prototype.distantPoint = function (distance, angle) {
    return this.distantPointWithArccosine(distance, angle);
    // return this.distantPointWithArcsin(distance, angle);
  };

  Point.prototype.distantPointWithArccosine = function (distance, angle) {
    angle = Angle.normalize(angle);
    if (distance === 0) {
      return this;
    }
    if (this.equals(Point.CENTER)) {
      return Point.fromHyperbolicPolarCoordinates(distance, angle);
    }

    var thisAngle = this.angle();

    if (thisAngle === angle) {
      return Point.fromHyperbolicPolarCoordinates(this.distanceFromCenter() + distance, thisAngle);
    }
    if (Math.abs(thisAngle - angle) === Math.PI) {
      return Point.fromHyperbolicPolarCoordinates(this.distanceFromCenter() - distance, thisAngle);
    }

    var thisOpposite = Angle.normalize(thisAngle + Math.PI);

    var a, b, c, alpha, beta, gamma;
    var dir;
    // var smaller = thisAngle > thisOpposite ? thisOpposite : thisAngle;
    // var larger = thisAngle > thisOpposite ? thisAngle : thisOpposite;

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

    b = this.distanceFromCenter();
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

    return Point.fromHyperbolicPolarCoordinates(a, Angle.normalize(thisAngle + gamma * dir));
  };

  Point.prototype.distantPointWithArcsin = function (distance, angle) {

    // TODO almost certainly wont' work


    // cosh(a) = cosh(b)cosh(c) - sinh(b)sinh(c)cos(A)
    // for triangle ABC where C is center of unit circle, A is starting point, C is destination point
    // c is distance travelled, b is distance of start from center, a is distance of destination from center
    // alpha is angle at A, beta is angle at B, gamma is angle at C
    if (distance === 0) {
      return this;
    }
    if (this.equals(Point.CENTER)) {
      return Point.fromHyperbolicPolarCoordinates(distance, angle);
    }

    var thisAngle = this.angle();

    if (thisAngle === angle) {
      return Point.fromHyperbolicPolarCoordinates(this.distanceFromCenter() + distance, thisAngle);
    }
    if (Math.abs(thisAngle - angle) === Math.PI) {
      return Point.fromHyperbolicPolarCoordinates(this.distanceFromCenter() - distance, thisAngle);
    }

    var a, b, c, alpha, beta, gamma;

    b = this.distanceFromCenter();
    c = distance;

    // var difference = thisAngle - angle;
    alpha = Math.abs(Math.PI - thisAngle + angle);

    a = Math.acosh(Math.cosh(b) * Math.cosh(c) - Math.sinh(b) * Math.sinh(c) * Math.cos(alpha));

    // beta =  Math.asin(Math.sin(alpha) * Math.sinh(b) / Math.sinh(a));
    gamma = Math.asin(Math.sin(alpha) * Math.sinh(c) / Math.sinh(a));


    // gamma = Math.acos((Math.cosh(a) * Math.cosh(b) - Math.cosh(c)) / (Math.sinh(a) * Math.sinh(b)))
    if (isNaN(gamma)) {
      gamma = 0;
    }

    var newAngle = thisAngle + gamma //* (difference < 0 ? 1 : -1);

    var point = Point.fromHyperbolicPolarCoordinates(a, newAngle);
    if (isNaN(point.x) || isNaN(point.y)) {
      debugger
    }
    return point;
  };
})();
