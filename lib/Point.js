;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  /*
  * Point object relative to the unit circle, where 0,0 is canvas center
  * coordinate parameters are presumed to be cartesian
  */
  var Point = window.HyperbolicCanvas.Point = function (x, y, noncartesian) {
    this.x = x;
    this.y = noncartesian ? 1 - y : y;
  };

  Point.prototype.equals = function (otherPoint) {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  };

  Point.prototype.scale = function (canvas, cartesian) {
    return canvas.at(this, cartesian);
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

  Point.between = function (p1, p2) {
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
  };

  Point.slopeBetween = function (p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
  };

  Point.perpindicularSlopeBetween = function (p1, p2) {
    return -1 / Point.slopeBetween(p1, p2);
  };

  Point.CENTER = new Point(0, 0);
})();
