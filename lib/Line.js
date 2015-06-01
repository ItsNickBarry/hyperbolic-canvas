;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;

  var Line = window.HyperbolicCanvas.Line = function (options) {
    // TODO allow functions to save their results as instance variables
    var error;
    this.p0 = options.p0;
    this.p1 = options.p1;
    this.slope = options.slope;

    if (!this.p0 ^ !this.p1) {
      if (this.slope != undefined) {
        this.p0 = this.p0 || this.p1;
        // TODO does not work for vertical lines !
        this.p1 = Point.fromCoordinates(0, this.p0.y - this.slope * this.p0.x);
      } else {
        error = "one point defined, but no slope";
      }
    } else if (this.p0 && this.p1) {
      if (this.p0.equals(this.p1)) {
        error = "points are the same";
      } else {
        this.slope = Line.slope(this.p0, this.p1);
      }
    } else {
      error = "neither point defined";
    }

    if (error) {
      throw error;
    }
  };

  Line.prototype.arcCircle = function () {
    if (Line.fromTwoPoints(this.p0, HyperbolicCanvas.Circle.UNIT.center).slope === Line.fromTwoPoints(this.p1, HyperbolicCanvas.Circle.UNIT.center).slope) {
      return false;
    }
    var m = Line.fromTwoPoints(Point.CENTER, this.p0).perpindicularSlope();

    var l1 = Line.fromPointSlope(this.p0, m);

    var intersects = l1.unitCircleIntersects();

    var t1 = window.HyperbolicCanvas.Circle.UNIT.tangentAt(intersects[0]);
    var t2 = window.HyperbolicCanvas.Circle.UNIT.tangentAt(intersects[1]);

    var c = Line.intersect(t1, t2);

    // // TODO floating point math might screw this comparison up; some circles which should not exist might be returned
    // // does it matter?  line will be effectively straight, and that's what this comparisison is meant to indicate
    // if ((this.p0.x === c.x && this.p1.x === c.x) || (this.p0.y === this.c.y && this.p1.y === c.y)) {
    //   return false;
    // }
    return HyperbolicCanvas.Circle.fromThreePoints(this.p0, this.p1, c);
  };

  Line.prototype.atX = function (x) {
    return (x - this.p0.x) * this.slope + this.p0.y;
  };

  Line.prototype.atY = function (y) {
    return (y - this.p0.y) / this.slope + this.p0.x;
  };

  Line.prototype.bisector = function () {
    return new Line({ p1: this.midpoint(), slope: this.perpindicularSlope() })
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p0.x - this.p1.x, 2) + Math.pow(this.p0.y - this.p1.y, 2));
  };

  Line.prototype.hyperbolicDistance = function () {
    // TODO TODO broken probably
    var circle = this.arcCircle();

    if (!circle) {
      // TODO use distanceFromCenter on each Point
      //      determine whether to add or subtract them
      return
    }

    // TODO if circle.radius is NaN, use Point.distanceFromCenter instead ?
    var intersects = circle.unitCircleIntersects();
    var ap = circle.arcLength(this.p0, intersects[0]);
    var bq = circle.arcLength(this.p1, intersects[1]);
    var aq = circle.arcLength(this.p0, intersects[1]);
    var bp = circle.arcLength(this.p1, intersects[0]);

    var crossRatio = (ap * bq) / (aq * bp);

    return Math.abs(Math.log(crossRatio));
  };

  Line.prototype.midpoint = function () {
    return Point.between(this.p0, this.p1);
  };

  Line.slope = function (p0, p1) {
    return (p0.y - p1.y) / (p0.x - p1.x);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.prototype.unitCircleIntersects = function () {
    // TODO make sure intersection happens at all; use the "discriminant" or something

    // TODO does not work for vertical lines !

    //quadratic formula
    var a = Math.pow(this.slope, 2) + 1;
    var b = this.slope * 2 * (this.p0.y - this.slope * this.p0.x);
    var c = Math.pow(this.p0.y, 2) + Math.pow(this.p0.x * this.slope, 2) - (2 * this.slope * this.p0.x * this.p0.y) - 1;
    // the +/- part on top
    var discriminant = Math.sqrt(b * b - (4 * a * c));

    var x0 = (-1 * b - discriminant) / (2 * a);
    var x1 = (-1 * b + discriminant) / (2 * a);

    var y0 = this.atX(x0);
    var y1 = this.atX(x1);

    return [new Point({ x: x0, y: y0 }), new Point({ x: x1, y: y1 })];
  };

  Line.intersect = function (l0, l1) {
    var x, y;
    if (l0.slope === l1.slope) {
      return false;
    }

    if (l0.slope === Infinity || l0.slope === -Infinity) {
      x = l0.p0.x;
    } else if (l1.slope === Infinity || l1.slope === -Infinity) {
      x = l1.p0.x;
    }

    if (l0.slope === 0) {
      y = l0.p0.y;
    } else if (l1.slope === 0) {
      y = l1.p0.y;
    }

    x = x || (l0.p0.x * l0.slope - l1.p0.x * l1.slope + l1.p0.y - l0.p0.y) / (l0.slope - l1.slope);
    if (l0.slope === Infinity || l0.slope === -Infinity) {
      y = y || l1.slope * (x - l1.p0.x) + l1.p0.y;
    } else {
      y = y || l0.slope * (x - l0.p0.x) + l0.p0.y;
    }
    return new Point({ x: x, y: y });
  };

  Line.hyperbolicIntersect = function (l0, l1) {
    var intersects = Circle.intersects(l0.arcCircle(), l1.arcCircle());
    if (!intersects) {
      return false;
    }
    var d0 = Line.fromTwoPoints(intersects[0], Point.CENTER).euclideanDistance();
    var d1 = Line.fromTwoPoints(intersects[1], Point.CENTER).euclideanDistance();
    return d0 < d1 ? intersects[0] : intersects[1];
  };

  Line.fromPointSlope = function (p, m) {
    return new Line({ p0: p, slope: m });
  };

  Line.fromTwoPoints = function (p0, p1) {
    return new Line({ p0: p0, p1: p1 });
  };
})();
