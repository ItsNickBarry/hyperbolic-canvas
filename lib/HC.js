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

  var Point = window.HyperbolicCanvas.Point;

  var Line = window.HyperbolicCanvas.Line;

  var Circle = window.HyperbolicCanvas.Circle;

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

  /*
  * returns the coordinates of a Point relative to the canvas
  */
  Canvas.prototype.scalePoint = function (point, inverse) {
    // TODO shouldn't this ALWAYS do inverse?
    // TODO should return a new Point probably
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

  Canvas.prototype.drawLine = function (l, infinite) {
    // TODO draw line through any 2 points, and extend to border if infinite === true

    // TODO move this to Line class
    //      or something
    // Canvas.prototype.drawLine = function (l, infinite)

    var m = Line.pointPoint(Point.CENTER, l.p1).perpindicularSlope();

    var l1 = Line.pointSlope(l.p1, m);

    var intersects = l1.unitCircleIntersects();

    var t1 = Circle.UNIT.tangentAt(intersects[0]);
    var t2 = Circle.UNIT.tangentAt(intersects[1]);

    var c = Line.intersect(t1, t2);

    var circle = Circle.pointPointPoint(l.p1, l.p2, c);

    // arc(x, y, radius, startAngle, endAngle, anticlockwise)
    var centerScaled = this.scalePoint(circle.center);
    this.ctx.strokeStyle = "black";
    this.ctx.arc(centerScaled[0], centerScaled[1], circle.radius * this.radius, 0, TAU);
    this.ctx.stroke();

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
      this.drawLine(Line.pointPoint(vertices[i], vertices[(i + 1) % n]));
    }
    return true;
  };

  // TODO ask someone if this is the right thing to do.  ready function must wait until ResizeSensor is loaded.
  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }

  window.circleTest = function () {
    for (var i = 0; i < 1000; i++) {
      var points = [];
      for (var j = 0; j < 3; j++) {
        var x = 1 - Math.random() * 2;
        var y = Math.sqrt( 1 - x * x);
        y = Math.random() > .5 ? y : y * -1;
        points.push(new Point(x, y));
      }
      var center = Circle.pointPointPoint(points[0], points[1], points[2]).center;
      if (center === false) {
        return false;
      }
      console.log(i);
      console.log(points[0])
      console.log("d:" + Line.pointPoint(center, points[0]).euclideanDistance());
      console.log(points[1])
      console.log("d:" + Line.pointPoint(center, points[1]).euclideanDistance());
      console.log(points[2])
      console.log("d:" + Line.pointPoint(center, points[2]).euclideanDistance());
      console.log(center);
    }
    return true;
  };
})();
