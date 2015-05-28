;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  window.HyperbolicCanvas.ready = function () {
    var canvases = window.HyperbolicCanvas.canvases = [];
    Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
      new Canvas(el);
    });


    /*
    * test variables
    */
    window.p1 = new HyperbolicCanvas.Point(.5, .5);
    window.p2 = new HyperbolicCanvas.Point(.5, -.7);
    window.p3 = new HyperbolicCanvas.Point(-.3, -.2);
    window.p4 = new HyperbolicCanvas.Point(-.3, .5);
    window.p5 = new HyperbolicCanvas.Point(.9, 0);
    window.p6 = new HyperbolicCanvas.Point(0, .9);
    window.l1 = HyperbolicCanvas.Line.pointPoint(p1, p2);
    window.l2 = HyperbolicCanvas.Line.pointPoint(p3, p2);
    window.l3 = HyperbolicCanvas.Line.pointPoint(p3, p4);
    window.l4 = HyperbolicCanvas.Line.pointPoint(p1, p4);
    window.l5 = HyperbolicCanvas.Line.pointPoint(p6, p5);
    window.c = canvases[0];

    [l1,l2,l3,l4].forEach(function (l) {
      c.drawLine(l);
    });

    window.Point = window.HyperbolicCanvas.Point;
    window.Line = window.HyperbolicCanvas.Line;
    window.Circle = window.HyperbolicCanvas.Circle;
  };

  // Math convenience variables
  // TODO standardize
  var PI = Math.PI;
  var TAU = Math.TAU = window.HyperbolicCanvas.TAU = 2 * PI;

  var Point = window.HyperbolicCanvas.Point;

  var Line = window.HyperbolicCanvas.Line;

  var Circle = window.HyperbolicCanvas.Circle;

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');
    this.fillStyle = 'black';
    this.strokeStyle = 'black';

    // if (this.hasClass('hyperbolic-canvas-autoresize')) {
    //   this.sensor = new ResizeSensor(this.el, this.resize.bind(this));
    // }

    HyperbolicCanvas.canvases.push(this);
  };

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
  * TODO manage ctx styling
  *      either like this, or with Canvas.setFillStyle() and canvas.setStrokeStyle()
  */
  Canvas.prototype.applyStyle = function () {
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.strokeStyle = this.strokeStyle;
  };

  Canvas.prototype.at = function () {
    var coordinates = arguments[0];
    var cartesian = arguments[1];
    if (coordinates.__proto__ === Point.prototype) {
      // scale up
      var x = (coordinates.x + 1) * this.radius;
      var y = (coordinates.y + 1) * this.radius;
      return [x, cartesian ? y : this.diameter - y];
    } else if (coordinates.__proto__ === Array.prototype) {
      // scale down
      return new Point(coordinates[0] / this.radius - 1, coordinates[1] / this.radius - 1, cartesian);
    }
    // TODO maybe accept (number, number, boolean)
  };

  Canvas.prototype.polarAt = function () {

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
    var c = l.arcCircle();

    if (!c) {
      // TODO draw a straight line instead
      var p0 = this.at(l.p0);
      var p1 = this.at(l.p1);
      this.ctx.beginPath();
      this.ctx.moveTo(p0[0], p0[1]);
      this.ctx.lineTo(p1[0], p1[1]);
      this.ctx.stroke();
      this.ctx.closePath();
    }
    var centerScaled = this.at(c.center);
    var a0, a1;

    if (infinite) {
      a0 = 0;
      a1 = TAU;
    } else {
      a0 = (-1 * (c.angleAt(l.p0)) + TAU) % TAU;
      a1 = (-1 * (c.angleAt(l.p1)) + TAU) % TAU;
    }
    this.ctx.beginPath();
    this.ctx.arc(centerScaled[0], centerScaled[1], c.radius * this.radius, a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > PI);
    this.ctx.stroke();
    this.ctx.closePath();
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

  Canvas.prototype.drawCircle = function (c, r) {
    // TODO hyperbolic circle (has center offset)
    //find point c
    //find point r closer and r farther from Circle.UNIT.center
    //average those 2 points, get center
  };

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
