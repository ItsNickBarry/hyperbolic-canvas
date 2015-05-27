;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }


  var Point = window.HyperbolicCanvas.Point;

  // var Circle = window.HyperbolicCanvas.Circle;

  /*
  * Line object
  * constructor maybe should not be called directly; use factory methods instead
  */
  var Line = window.HyperbolicCanvas.Line = function (options) {
    // TODO allow functions to save their results as instance variables
    var error;
    this.p1 = options.p1;
    this.p2 = options.p2;
    this.slope = options.slope;

    if (!this.p1 ^ !this.p2) {
      if (this.slope != undefined) {
        this.p1 = this.p1 || this.p2;
        // TODO does not work for vertical lines !
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

  Line.prototype.arcCircle = function () {
    var m = Line.pointPoint(Point.CENTER, this.p1).perpindicularSlope();

    var l1 = Line.pointSlope(this.p1, m);

    var intersects = l1.unitCircleIntersects();

    var t1 = window.HyperbolicCanvas.Circle.UNIT.tangentAt(intersects[0]);
    var t2 = window.HyperbolicCanvas.Circle.UNIT.tangentAt(intersects[1]);

    var c = Line.intersect(t1, t2);

    return HyperbolicCanvas.Circle.pointPointPoint(this.p1, this.p2, c);
  };

  Line.prototype.atX = function (x) {
    return (x - this.p1.x) * this.slope + this.p1.y;
  };

  Line.prototype.atY = function (y) {
    return (y - this.p1.y) / this.slope + this.p1.x;
  };

  Line.prototype.bisector = function () {
    return new Line({ p1: Point.between(this.p1, this.p2), slope: this.perpindicularSlope() })
  };

  Line.prototype.euclideanDistance = function () {
    return Math.sqrt(Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2));
  };

  Line.prototype.hyperbolicDistance = function () {
    // TODO distance between 2 points
    var circle = this.arcCircle();

    // TODO if circle.radius is NaN, use Point.distanceFromCenter instead ?
    var intersects = circle.unitCircleIntersects();
    var ap = circle.arcLength(this.p1, intersects[0]);
    var bq = circle.arcLength(this.p2, intersects[1]);
    var aq = circle.arcLength(this.p1, intersects[1]);
    var bp = circle.arcLength(this.p2, intersects[0]);

    var crossRatio = (ap * bq) / (aq * bp);

    // Math.abs twice?

    return Math.abs(Math.log(Math.abs(crossRatio)));

  };

  Line.slope = function (p1, p2) {
    return (p1.y - p2.y) / (p1.x - p2.x);
  };

  Line.prototype.perpindicularSlope = function () {
    return -1 / this.slope;
  };

  Line.prototype.unitCircleIntersects = function () {
    // TODO make sure intersection happens at all; use the "discriminant" or something

    // TODO make someone else check this

    // TODO does not work for vertical lines !

    //quadratic formula
    var a = Math.pow(this.slope, 2) + 1;
    var b = this.slope * 2 * (this.p1.y - this.slope * this.p1.x);
    var c = Math.pow(this.p1.y, 2) + Math.pow(this.p1.x * this.slope, 2) - (2 * this.slope * this.p1.x * this.p1.y) - 1;
    // the +/- part on top
    var discriminant = Math.sqrt(b * b - (4 * a * c));

    var x1 = (-1 * b - discriminant) / (2 * a);
    var x2 = (-1 * b + discriminant) / (2 * a);

    var y1 = this.atX(x1);
    var y2 = this.atX(x2);

    return [new Point(x1, y1), new Point(x2, y2)];
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
