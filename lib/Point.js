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
    // TODO "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math
    var r = HyperbolicCanvas.Line.pointPoint(Point.CENTER, this).euclideanDistance();
    // TODO is this the right base to use?  is base related to curvature?
    // var base = 1.1;
    var base = Math.E;
    return Math.log((1 + r) / (1 - r)) / Math.log(base);
  };

  Point.prototype.distantPoint = function (distance, direction) {
    // TODO return the Point relative to point
  };

  Point.between = function (p0, p1) {
    return new Point({ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 });
  };

  Point.radiusAngle = function (radius, angle, inverted) {
    return new Point({ x: radius * Math.cos(angle), y: radius * Math.sin(inverted ? -1 * angle : angle) });
  };

  Point.xY = function (x, y) {
    return new Point({ x: x, y: y });
  };

  Point.CENTER = new Point({ x: 0, y: 0 });
})();
