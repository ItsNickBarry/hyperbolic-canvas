;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  /*
  * Point object relative to the unit circle, where 0,0 is canvas center
  */
  var Point = window.HyperbolicCanvas.Point = function (options) {
    this.x = options.x;
    this.y = options.y;
  };

  Point.prototype.equals = function (otherPoint) {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  };

  Point.prototype.distanceFromCenter = function () {
    if (this.equals(Point.CENTER)) {
      return 0;
    }
    // TODO "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math
    var r = HyperbolicCanvas.Line.fromTwoPoints(Point.CENTER, this).euclideanDistance();
    // TODO is this the right base to use?  is base related to curvature?
    // var base = 1.1;
    var base = Math.E;
    return Math.log((1 + r) / (1 - r)) / Math.log(base);

    // TODO use return 2 * Math.atanh(r);
  };

  // Point.prototype.distantPoint = function (distance, angle, inverse) {
  //   // TODO the result becomes indistinguishable from infinity way too quickly (Distance > ~10)
  //   // TODO is c.pointAt going to give the correct result?
  //   var c = Circle.fromHyperbolicCenterRadius(this, distance);
  //   return c.pointAt(angle * (inverse ? -1 : 1));
  //   // return Point.fromCoordinates(distance * Math.cosh(angle) + this.x, distance * Math.sinh(angle) + this.y);
  //
  // };

  Point.prototype.distantPoint = function (distance, angle) {
    if (distance === 0) {
      return this;
    }
    if (this.equals(Point.CENTER)) {
      return Point.fromHyperbolicPolarCoordinates(distance, angle);
    }
    if (Math.atan(Line.fromTwoPoints(Point.CENTER, this).slope) % Math.PI === angle % Math.PI) {
      debugger
    }
    var range = Circle.fromHyperbolicCenterRadius(this, distance);
    var tangentSlope = Math.tan(angle);
    var lineH = Line.fromPointSlope(range.center, tangentSlope);
    var lineG = Line.fromPointSlope(this, lineH.perpindicularSlope());
    var intersect = Line.intersect(lineH, lineG);
    var newLineG = Line.fromTwoPoints(this, intersect);
    var newLineH = Line.fromTwoPoints(range.center, intersect);
    var r0 = range.radius;
    var g = newLineG.euclideanDistance();
    var h = newLineH.euclideanDistance();
    var r1 = (Math.pow(r0, 2) - Math.pow(h, 2) - Math.pow(g, 2)) / (2 * g);
    // very hacky
    var center = Circle.fromCenterRadius(this, r1).pointAt(Math.atan(newLineG.slope));
    var arcCirc = Circle.fromCenterRadius(center, r1);

    var intersects = Circle.intersects(range, arcCirc);
    // choose from the intersects

    if (intersects === false) {
      debugger
    }

    // very bad TODO works for points < x = y approximately
    var checkPoint = Point.fromCoordinates(arcCirc.center.x + Math.cos(angle), arcCirc.center.y + Math.sin(angle));
    var d0 = Line.fromTwoPoints(intersects[0], checkPoint).euclideanDistance();
    var d1 = Line.fromTwoPoints(intersects[1], checkPoint).euclideanDistance();
    // var thisAngle = Circle.UNIT.angleAt(this);
    // if
    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Point.fromCoordinates = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.fromPolarCoordinates = function (radius, angle, inverted) {
    return new Point({ x: radius * Math.cos(angle), y: radius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.fromHyperbolicPolarCoordinates = function (radius, angle, inverted) {
    var euclideanRadius = (Math.exp(radius) - 1) / (Math.exp(radius) + 1);
    return new Point({ x: euclideanRadius * Math.cos(angle), y: euclideanRadius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.between = function (p0, p1) {
    return new Point({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });
  };

  Point.CENTER = new Point({ x: 0, y: 0 });
})();
