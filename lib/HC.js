;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  window.HyperbolicCanvas.ready = function () {
    var canvases = window.HyperbolicCanvas.canvases = [];
    Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
      canvases.push(new Canvas(el));
    });
  };

  // Math convenience variables
  var PI = Math.PI;
  var TAU = window.HyperbolicCanvas.TAU = 2 * PI;
  if (typeof Math.TAU === "undefined") {
    Math.TAU = TAU;
  }

  /*
  * Point object relative to the unit circle.
  * Y axis is NOT inverted
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




  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');

    if (this.hasClass('hyperbolic-canvas-autoresize')) {
      this.sensor = new ResizeSensor(this.el, this.resize.bind(this));
    }
  };

  /*
  * DOM modifications
  */
  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');

    this.viewport.className = 'viewport';
    this.viewport.style.height = this.viewport.style.width = '100%';
    this.canvas.style.display = 'block';
    this.canvas.width = this.canvas.height = 0;

    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
  };

  Canvas.prototype.hasClass = function (className) {
    if (this.el.classList) {
      return this.el.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.el.className);
    }
  };

  Canvas.prototype.resize = function () {
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = null;

    var w = this.viewport.clientWidth;
    var h = this.viewport.clientHeight;
    this.diameter = w > h ? h : w;
    this.radius =  this.diameter / 2;

    this.canvas.width = this.canvas.height = this.diameter;
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = "" + (this.diameter) + "px";
    this.canvas.style["border-radius"] = "" + Math.floor(this.radius) + "px";
  };


 /*
 * returns a Point object with attributes x and y, relative to canvas center
 *
 * can be called with (number, number, boolean) or (array, boolean)
 */
  Canvas.prototype.pointAt = function (x, y, inverse) {
    // this should allow function to be called with (array, boolean) as well
    if (typeof x === typeof []) {
      cartesian = y;
      y = x[1];
      x = x[0];
    }
    return new Point(x / this.radius - 1, y / this.radius - 1, inverse);
  };

  Canvas.prototype.scalePoint = function (point, inverse) {
    var x = (point.x + 1) * this.radius;
    var y = (point.y + 1) * this.radius;
    return [x, inverse ? this.diameter - y : y];
  };







  Canvas.prototype.drawLineThroughIdealPoints = function (t1, t2) {
    // TODO special case where t1 + t2 === TAU
    //      tangent lines are parallel, and never intersect
    //      hyp === 1 / 0 === Infinity === bad
    //
    //      just draw a straight line?  Does the line exist?
    var diff = t1 > t2 ? t1 - t2 : t2 - t1;
    var halfDiff = diff / 2;
    var farSide = Math.sin(halfDiff); // ?
    var hyp = 1 / Math.sin((PI / 2) - halfDiff);
    // hyp is distance to center of circle whose arc is the line in question

  };

  Canvas.prototype.drawLine = function (p1, p2, infinite) {
    // TODO draw line through any 2 points, and extend to border if infinite === true

    // find slope of line from center to p1
    // find perpindicular line through p1
    // perpindicular line intersects unit circle at X and Y
    // tangents of unit circle at X and Y meet at c

    //get point c

    //circle
    var center = this.centerOfCircleFromThreePoints(p1, p2, c);

    // if infinite === true
    // find ideal points
    // or just draw whole circle... it has border radius
  };

  Canvas.prototype.drawNGon = function (n, center, radius, rotation) {
    // TODO make sure math is correct
    if (n < 3){
      return false;
    }
    var direction = rotation || 0;
    var increment = TAU / n;
    var vertices = [];
    for (var i = 0; i < n; i++) {
      vertices.push(this.findDistantPoint(center, radius, direction));
      direction += increment;
    }
    return this.drawPolygon(vertices);
  };

  Canvas.prototype.drawPolygon = function (vertices) {
    // TODO using drawLine to make polygons does not allow application of fillStyle
    //      arcTo instead?
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    for (var i = 0; i < n; i++) {
      this.drawLine(vertices[i], vertices[(i + 1) % n]);
    }
    return true;
  };

  Canvas.prototype.findDistantPoint = function (point, distance, direction) {
    // TODO return the Point relative to point
  };

  Canvas.prototype.distanceFromCenter = function (p) {
    // TODO "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math
    var r = this.euclideanDistance(p, new Point(0, 0));
    // TODO is this the right base to use?  is base related to curvature?
    var base = 1.1;
    return Math.log((1 + r) / (1 - r)) / Math.log(base);
  };

  Canvas.prototype.euclideanDistance = function (p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  Canvas.prototype.hyperbolicDistance = function (p1, p2) {
    // TODO distance between 2 points
    // rename to "distance" ?

  };

  Canvas.prototype.centerOfCircleFromThreePoints = function (p1, p2, p3) {
    // TODO make someone else check this
    if (p1.equals(p2) || p1.equals(p3) || p2.equals(p3)) {
      // points are not unique
      // TODO throw exception ?
      return false;
    }
    var x, y;
    // center points of chords
    var c1 = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    var c2 = new Point((p3.x + p2.x) / 2, (p3.y + p2.y) / 2);
    // slopes of chord bisectors
    var m1 = -1 * (p1.x - p2.x) / (p1.y - p2.y);
    var m2 = -1 * (p3.x - p2.x) / (p3.y - p2.y);

    if (m1 === m2) {
      // points are all in a line
      // TODO throw exception ?
      return false;
    }

    if (m1 === Infinity || m1 === -Infinity) {
      x = c1.x;
    } else if (m2 === Infinity || m2 === -Infinity) {
      x = c2.x;
    }

    if (m1 === 0) {
      y = c1.y;
    } else if (m2 === 0) {
      y = c2.y;
    }

    x = x || (c1.x * m1 - c2.x * m2 + c2.y - c1.y) / (m1 - m2);
    if (m1 === Infinity || m1 === -Infinity) {
      y = y || m2 * (x - c2.x) + c2.y;
    } else {
      y = y || m1 * (x - c1.x) + c1.y;
    }
    return new Point(x, y);
  };





  // TODO ask someone if this is the right thing to do.  ready function must wait until ResizeSensor is loaded.
  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }

  // window.circleTest = function () {
  //   var canvas = HyperbolicCanvas.Canvas.prototype;
  //   var zero = new Point(0,0);
  //   for (var i = 0; i < 1000; i++) {
  //     var points = [];
  //     for (var j = 0; j < 3; j++) {
  //       var x = 1 - Math.random() * 2;
  //       var y = Math.sqrt( 1 - x * x);
  //       y = Math.random() > .5 ? y : y * -1;
  //       points.push(new Point(x, y));
  //     }
  //     var center = canvas.centerOfCircleFromThreePoints(points[0], points[1], points[2]);
  //     if (center === false) {
  //       return false;
  //     }
  //     console.log(i);
  //     console.log(points[0])
  //     console.log("d:" + canvas.euclideanDistance(points[0], center));
  //     console.log(points[1])
  //     console.log("d:" + canvas.euclideanDistance(points[1], center));
  //     console.log(points[2])
  //     console.log("d:" + canvas.euclideanDistance(points[2], center));
  //     console.log(center);
  //   }
  //   return true;
  // };
})();
