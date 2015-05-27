;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;

  /*
  * Line object
  * constructor maybe should not be called directly; use factory methods instead
  */
  var Line = window.HyperbolicCanvas.Line = function (options) {
    var error;
    this.p1 = options.p1;
    this.p2 = options.p2;
    this.slope = options.slope;

    if (!this.p1 ^ !this.p2) {
      if (this.slope) {
        this.p1 = this.p1 || this.p2;
        this.p2 = new Point(0, this.p1.y - this.slope * this.p1.x);
      } else {
        error = "one point defined, but no slope";
      }
    } else if (this.p1 && this.p2) {
      if (this.p1.equals(this.p2)) {
        error = "points are the same";
      } else {
        this.slope = Line.slope(this.p1, this.p2);
      }
    } else {
      error = "neither point defined";
    }

    if (error) {
      console.log(options);
      throw error;
    }
  };

  Line.prototype.atX = function (x) {
    // TODO get y for a given x on line
  };

  Line.prototype.atY = function (y) {
    // TODO get x for given y on line
  };

  Line.prototype.bisector = function () {
    return new Line({ p1: Point.between(this.p1, this.p2), slope: this.perpindicularSlope() })
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2));
  };

  Line.prototype.hyperbolicDistance = function (p1, p2) {
    // TODO distance between 2 points
    // rename to "distance" ?

  };

  Line.slope = function (p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.prototype.unitCircleIntersects = function () {

    // y = m * x - m * this.p1.x + this.p1.y

    // x^2 + y^2 = 1
    // y = Math.sqrt( 1 - x^2 )

    // TODO pretty sure this won't work; missed a +/- somewhere

    //quadratic formula
    var a = Math.pow(this.slope, 2) + 1;
    var b = this.slope * 2 * (this.p1.y - this.slope * this.p1.x);
    var c = Math.pow(this.p1.y, 2) + Math.pow(this.p1.x * this.slope, 2) - (2 * this.slope * this.p1.x * this.p1.y) - 1;
    // the +/- part on top
    var root = Math.sqrt(b * b - (4 * a * c))

    var x1 = (-1 * b - root) / (2 * a);
    var x2 = (-1 * b + root) / (2 * a);

    var y1 = this.atX(x1);
    var y2 = this.atX(x2);

















  };

  Line.intersect = function (l1, l2) {
    var x, y;
    if (l1.slope === l2.slope) {
      // points are all in a line
      // TODO throw exception ?
      return false;
    }

    if (l1.slope === Infinity || l1.slope === -Infinity) {
      x = l1.p1.x;
    } else if (l2.slope === Infinity || l2.slope === -Infinity) {
      x = l2.p1.x;
    }

    if (l1.slope === 0) {
      y = l1.p1.y;
    } else if (l2.slope === 0) {
      y = l2.p1.y;
    }

    x = x || (l1.p1.x * l1.slope - l2.p1.x * l2.slope + l2.p1.y - l1.p1.y) / (l1.slope - l2.slope);
    if (l1.slope === Infinity || l1.slope === -Infinity) {
      y = y || l2.slope * (x - l2.p1.x) + l2.p1.y;
    } else {
      y = y || l1.slope * (x - l1.p1.x) + l1.p1.y;
    }
    return new Point(x, y);
  };

  Line.pointSlope = function (p, m) {
    return new Line({ p1: p, slope: m });
  };

  Line.pointPoint = function (p1, p2) {
    return new Line({ p1: p1, p2: p2 });
  };
})();
