;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  /*
  * Point object relative to the unit circle.
  * Y axis is NOT inverted
  * (0, 0) is the center of the canvas
  */
  var Point = window.HyperbolicCanvas.Point = function (x, y, inverse) {
    this.x = x;
    this.y = inverse ? 1 - y : y;
  };

  Point.prototype.equals = function (otherPoint) {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  };

  Point.prototype.scale = function (canvas, inverse) {
    return canvas.scalePoint(this, inverse);
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
})();
