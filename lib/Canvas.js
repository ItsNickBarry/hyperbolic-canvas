;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle;
  var Point = window.HyperbolicCanvas.Point;
  var Line = window.HyperbolicCanvas.Line;
  var Circle = window.HyperbolicCanvas.Circle;
  var Polygon = window.HyperbolicCanvas.Polygon;

  var Canvas = window.HyperbolicCanvas.Canvas = function (options) {
    this.el = options.el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');

    // this.runScript();
  };

  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');

    this.viewport.className = 'viewport';
    this.viewport.style.height = this.viewport.style.width = '100%';
    this.canvas.className = 'hyperbolic';
    this.canvas.style.display = 'block';
    this.canvas.width = this.canvas.height = 0;

    while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
    }
    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
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

  // Canvas.prototype.runScript = function () {
  //   // TODO better way to store the scripts?
  //   var script = HyperbolicCanvas.scripts[this.el.dataset.script];
  //   return script ? script(this) : false;
  // };

  Canvas.prototype.getContext = function () {
    return this.ctx;
  };

  Canvas.prototype.setFillStyle = function (style) {
    this.ctx.fillStyle = style;
  };

  Canvas.prototype.setStrokeStyle = function (style) {
    this.ctx.strokeStyle = style;
  };

  Canvas.prototype.at = function (loc) {
    if (loc.__proto__ === Point.prototype) {
      // scale up
      var x = (loc.getX() + 1) * this.radius;
      var y = (loc.getY() + 1) * this.radius;
      return [x, this.diameter - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new Point({ x: loc[0] / this.radius - 1, y: (this.diameter - loc[1]) / this.radius - 1 });
    }
  };

  Canvas.prototype.strokeLineThroughIdealPoints = function (a0, a1) {

    // TODO something bad hapens when passed (PI, 5 * PI / 4)

    if (Math.abs(a0 - a1) === Math.PI) {
      var p0Scaled = this.at(p0);
      var p1Scaled = this.at(p1);

      this.ctx.beginPath();
      this.ctx.moveTo(p0Scaled[0], p0Scaled[1]);
      this.ctx.lineTo(p1Scaled[0], p1Scaled[1]);
      this.ctx.stroke();
      this.ctx.closePath();
    }

    var p0 = Circle.UNIT.pointAt(a0);
    var p1 = Circle.UNIT.pointAt(a1);

    var l0 = Line.givenPointSlope(p0, -1 / Angle.toSlope(a0));
    var l1 = Line.givenPointSlope(p1, -1 / Angle.toSlope(a1));

    var center = Line.intersect(l0, l1);
    var circle = Circle.givenCenterRadius(center, Line.givenTwoPoints(p0, center).getEuclideanDistance());
    this.strokeCircle(circle);
  };

  Canvas.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.diameter, this.diameter);
  };

  Canvas.prototype.strokeAngles = function (n, rotation) {
    var angle = rotation || 0;
    difference = Math.TAU / n;
    for (var i = 0; i < n; i++) {
      var point = this.at(Point.givenPolarCoordinates(1, angle));
      this.ctx.moveTo(this.radius, this.radius);
      this.ctx.lineTo(point[0], point[1]);
      this.ctx.stroke();
      angle += difference;
    }
  };

  Canvas.prototype.strokeGrid = function (n) {
    this.ctx.beginPath();

    for (var i = 1; i < n; i++) {
      // x axis
      this.ctx.moveTo(this.diameter * i / n, 0);
      this.ctx.lineTo(this.diameter * i / n, this.diameter);
      // y axis
      this.ctx.moveTo(0, this.diameter * i / n);
      this.ctx.lineTo(this.diameter, this.diameter * i / n);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  };

  Canvas.prototype.strokeRings = function (d, n) {
    for (var i = 0; i < n; i++) {
      var ring = Circle.givenHyperbolicCenterRadius(Point.ORIGIN, d * i);
      this.strokeCircle(ring);
    }
  };

  Canvas.prototype.drawCircle = function (c, options) {
    if (c.center == undefined)return false;
    var center = this.at(c.center);
    this.ctx.beginPath();
    this.ctx.arc(center[0], center[1], c.radius * this.radius, 0, Math.TAU);
    this.ctx.closePath();
    if (options.fill) {
      this.ctx.fill();
    }
    if (options.stroke) {
      this.ctx.stroke();
    }
  };

  Canvas.prototype.fillAndStrokeCircle = function (c) {
    return this.drawCircle(c, { fill: true, stroke: true });
  };

  Canvas.prototype.fillCircle = function (c) {
    return this.drawCircle(c, { fill: true });
  };

  Canvas.prototype.strokeCircle = function (c) {
    return this.drawCircle(c, { stroke: true });
  };

  Canvas.prototype.strokeLine = function (l, infinite) {
    // TODO does not work near-diametric lines due to floating point error;  use arcTo instead?
    //      would still yield incorrect results, but they would at least appear on screen
    if (!l.isOnPlane()) {
      return false;
    }
    var c = l.getArc();

    if (!c) {
      var p0 = this.at(l.getP0());
      var p1 = this.at(l.getP1());
      this.ctx.beginPath();
      this.ctx.moveTo(p0[0], p0[1]);
      this.ctx.lineTo(p1[0], p1[1]);
      this.ctx.stroke();
      this.ctx.closePath();
      return true;
    }
    var centerScaled = this.at(c.center);
    var a0, a1;

    if (infinite) {
      a0 = 0;
      a1 = Math.TAU;
    } else {
      a0 = -1 * c.angleAt(l.getP0());
      a1 = -1 * c.angleAt(l.getP1());
    }
    this.ctx.beginPath();
    this.ctx.arc(centerScaled[0], centerScaled[1], c.radius * this.radius, a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > Math.PI);
    this.ctx.stroke();
    this.ctx.closePath();

    return true;
  };

  Canvas.prototype.drawPath = function (l) {
    if (!l.isOnPlane()) {
      return false;
    }
    var c = l.getArc();

    var p0 = this.at(l.getP0());
    var p1 = this.at(l.getP1());

    // this doesn't seem necessary, but it is
    this.ctx.lineTo(p0[0], p0[1]);

    if (c) {
      var centerScaled = this.at(c.center);

      var control = this.at(Line.intersect(c.tangentAtPoint(l.getP0()), c.tangentAtPoint(l.getP1())));
      if (control) {
        this.ctx.arcTo(control[0], control[1], p1[0], p1[1], c.radius * this.radius);
      } else {
        this.ctx.lineTo(p1[0], p1[1]);
      }
    } else {
      this.ctx.lineTo(p1[0], p1[1]);
    }
    return true;
  };

  Canvas.prototype.drawPolygon = function (p, options) {
    var vertices = p.vertices;
    if(vertices==undefined)return false;//fix, so the browser doesn't give an error when the polygon off the screen
    var n = vertices.length;
    this.ctx.beginPath();
    var start = this.at(vertices[0])
    this.ctx.moveTo(start[0], start[1]);
    for (var i = 0; i < n; i++) {
      this.drawPath(Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]));
    }
    this.ctx.closePath();
    if (options.fill) {
      this.ctx.fill();
    }
    if (options.stroke) {
      this.ctx.stroke();
    }
    return true;
  };

  Canvas.prototype.fillAndStrokePolygon = function (p) {
    return this.drawPolygon(p, { fill: true, stroke: true });
  };

  Canvas.prototype.fillPolygon = function (p) {
    return this.drawPolygon(p, { fill: true });
  };

  Canvas.prototype.strokePolygon = function (p) {
    return this.drawPolygon(p, { stroke: true });
  };

  Canvas.prototype.strokePolygonBoundaries = function (p) {
    var vertices = p.vertices;
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    for (var i = 0; i < n; i++) {
      this.strokeLine(Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]), true);
    }
    return true;
  };

  Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
    // TODO tesselate the entire plane with n-gons
  };
})();
