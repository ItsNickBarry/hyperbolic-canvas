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
    } else if (this.p1 && this.p2 && true) {
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
  }

  Line.prototype.bisector = function () {
    return new Line({ p1: Point.between(this.p1, this.p2), slope: this.perpindicularSlope() })
  };

  Line.slope = function (p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.pointSlope = function (p, m) {
    return new Line({ p1: p, slope: m });
  };

  Line.pointPoint = function (p1, p2) {
    return new Line({ p1: p1, p2: p2 });
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
})();
