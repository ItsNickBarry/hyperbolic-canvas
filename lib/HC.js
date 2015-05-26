;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point = function (x, y, inverse) {
    this.x = x;
    this.y = inverse ? 1 - y : y;
  };

  var PI = Math.PI;
  var TAU = window.HyperbolicCanvas.TAU = 2 * PI;
  if (typeof Math.TAU === "undefined") {
    Math.TAU = TAU;
  }

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

  Canvas.prototype.drawPolygon = function () {
    // TODO use a single method to call drawNGon or drawPolygonFromPoints depending on arguments
  }

  Canvas.prototype.drawNGon = function (n, center, rotation) {
    // TODO draw regular polygon with n vertices
    //      optional rotation
  };

  Canvas.prototype.drawPolygonFromPoints = function (vertices) {
    // TODO draw arcs between all vertices in vertices array
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




  window.HyperbolicCanvas.ready = function () {
    var canvases = window.HyperbolicCanvas.canvases = [];
    Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
      canvases.push(new Canvas(el));
    });
  }

  // TODO ask someone if this is the right thing to do.  ready function must wait until ResizeSensor is loaded.
  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }
})();
