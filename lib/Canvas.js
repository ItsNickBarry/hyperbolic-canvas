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
    // TODO maybe accept (number, number, boolean)
  };

  Canvas.prototype.polarAt = function () {

  };

  Canvas.prototype.drawLineThroughIdealPoints = function (t1, t2) {

  };

  Canvas.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.diameter, this.diameter);
  };

  Canvas.prototype.drawCircle = function (c) {
    var center = this.at(c.center);
    this.ctx.beginPath();
    this.ctx.arc(center[0], center[1], c.radius * this.radius, 0, Math.TAU);
    this.ctx.stroke();
    this.ctx.closePath();
  };

  Canvas.prototype.drawLine = function (l, infinite) {
    // TODO deal with points not in unit circle ?
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
      a0 = (-1 * (c.angleAt(l.p0)) + Math.TAU) % Math.TAU;
      a1 = (-1 * (c.angleAt(l.p1)) + Math.TAU) % Math.TAU;
    }
    this.ctx.beginPath();
    this.ctx.arc(centerScaled[0], centerScaled[1], c.radius * this.radius, a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > Math.PI);
    this.ctx.stroke();
    this.ctx.closePath();

    return true;
  };

  Canvas.prototype.drawPath = function (l) {
    var c = l.arcCircle();

    var p0 = this.at(l.p0);
    var p1 = this.at(l.p1);

    // TODO why is this lineTo necessary?
    this.ctx.lineTo(p0[0], p0[1])

    if (c) {
      var centerScaled = this.at(c.center);
      var a0 = (-1 * (c.angleAt(l.p0)) + Math.TAU) % Math.TAU;
      var a1 = (-1 * (c.angleAt(l.p1)) + Math.TAU) % Math.TAU;

      var control = this.at(Line.intersect(c.tangentAt(l.p0), c.tangentAt(l.p1)));
      this.ctx.arcTo(control[0], control[1], p1[0], p1[1], c.radius * this.radius);
    } else {
      this.ctx.lineTo(p1[0], p1[1]);
    }
  };

  Canvas.prototype.drawPolygon = function (p) {
    var vertices = p.vertices;
    var n = vertices.length;
    this.ctx.beginPath();
    var start = this.at(vertices[0])
    this.ctx.moveTo(start[0], start[1]);
    for (var i = 0; i < n; i++) {
      this.drawPath(Line.fromTwoPoints(vertices[i], vertices[(i + 1) % n]));
    }
    this.ctx.closePath();
    return true;
  };

  Canvas.prototype.fillPolygon = function (p) {
    this.drawPolygon(p);
    this.ctx.fill();
  };

  Canvas.prototype.strokePolygon = function (p) {
    this.drawPolygon(p);
    this.ctx.stroke();
  };

  // Canvas.prototype.drawPolygon = function (p) {
  //   var vertices = p.vertices;
  //   var n = vertices.length;
  //   if (n < 3){
  //     return false;
  //   }
  //   for (var i = 0; i < n; i++) {
  //     this.drawLine(Line.fromTwoPoints(vertices[i], vertices[(i + 1) % n]));
  //   }
  //   return true;
  // };

  Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
    // TODO tesselate the entire plane with n-gons
  };
})();
