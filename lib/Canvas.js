;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;
  var Line = window.HyperbolicCanvas.Line;
  var Circle = window.HyperbolicCanvas.Circle;
  var Polygon = window.HyperbolicCanvas.Polygon;

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');

    this.filledPolygons = [];
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

  // Canvas.prototype.hasClass = function (className) {
  //   if (this.el.classList) {
  //     return this.el.classList.contains(className);
  //   } else {
  //     return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.el.className);
  //   }
  // };

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

  Canvas.prototype.setFillStyle = function (style) {
    this.ctx.fillStyle = style;
  };

  Canvas.prototype.setStrokeStyle = function (style) {
    this.ctx.strokeStyle = style;
  };

  Canvas.prototype.at = function (loc) {
    if (loc.__proto__ === Point.prototype) {
      // scale up
      var x = (loc.x + 1) * this.radius;
      var y = (loc.y + 1) * this.radius;
      return [x, this.diameter - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new Point({ x: loc[0] / this.radius - 1, y: (this.diameter - loc[1]) / this.radius - 1 });
    }
  };

  Canvas.prototype.polarAt = function () {

  };

  Canvas.prototype.strokeLineThroughIdealPoints = function (t0, t1) {

  };

  Canvas.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.diameter, this.diameter);
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
    // TODO deal with points not in unit circle ?
    // TODO breaks on line from q4 to center
    var c = l.arcCircle();

    if (!c) {
      var p0 = this.at(l.p0);
      var p1 = this.at(l.p1);
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
      a0 = -1 * c.angleAt(l.p0);
      a1 = -1 * c.angleAt(l.p1);
    }
    this.ctx.beginPath();
    this.ctx.arc(centerScaled[0], centerScaled[1], c.radius * this.radius, a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > Math.PI);
    this.ctx.stroke();
    this.ctx.closePath();

    return true;
  };

  Canvas.prototype.drawPath = function (l) {
    // TODO what to return if something goes wrong?
    var c = l.arcCircle();

    var p0 = this.at(l.p0);
    var p1 = this.at(l.p1);

    // TODO why is this lineTo necessary?
    this.ctx.lineTo(p0[0], p0[1]);

    if (c) {
      var centerScaled = this.at(c.center);
      var a0 = -1 * c.angleAt(l.p0);
      var a1 = -1 * c.angleAt(l.p1);

      var control = this.at(Line.intersect(c.tangentAtPoint(l.p0), c.tangentAtPoint(l.p1)));
      if (control) {
        this.ctx.arcTo(control[0], control[1], p1[0], p1[1], c.radius * this.radius);
      } else {
        // TODO need this?
        this.ctx.lineTo(p1[0], p1[1]);
      }
    } else {
      this.ctx.lineTo(p1[0], p1[1]);
    }
  };

  Canvas.prototype.drawPolygon = function (p, options) {
    var vertices = p.vertices;
    if(vertices==undefined)return false;//fix, so the browser doesn't give an error when the polygon off the screen
    var n = vertices.length;
    this.ctx.beginPath();
    var start = this.at(vertices[0])
    this.ctx.moveTo(start[0], start[1]);
    for (var i = 0; i < n; i++) {
      this.drawPath(Line.fromTwoPoints(vertices[i], vertices[(i + 1) % n]));
    }
    this.ctx.closePath();
    if (options.fill) {
      this.ctx.fill();
      this.filledPolygons.push(p);
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
      this.strokeLine(Line.fromTwoPoints(vertices[i], vertices[(i + 1) % n]), true);
    }
    // TODO what to return if one of the lines is false?  would that happen?
    return true;
  };

  Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
    // TODO tesselate the entire plane with n-gons
  };
})();
