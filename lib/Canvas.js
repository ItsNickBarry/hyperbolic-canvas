;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Canvas = window.HyperbolicCanvas.Canvas = function (options) {
    this._el = options.el;
    this.appendChildren();
    this.resize();
  };

  Canvas.prototype.getContainerElement = function () {
    return this._el;
  };

  Canvas.prototype.getCanvasElement = function () {
    return this._canvas;
  };

  Canvas.prototype.getViewportElement = function () {
    return this._viewport;
  };

  Canvas.prototype.getContext = function () {
    return this._ctx;
  };

  Canvas.prototype.getRadius = function () {
    return this._radius;
  };

  Canvas.prototype.getDiameter = function () {
    return this._diameter;
  };

  Canvas.prototype.appendChildren = function () {
    var viewport = this._viewport = document.createElement('div');
    var canvas = this._canvas = document.createElement('canvas');
    this._ctx = canvas.getContext('2d');

    viewport.className = 'viewport';
    viewport.style.height = viewport.style.width = '100%';
    canvas.className = 'hyperbolic';
    canvas.style.display = 'block';
    canvas.width = canvas.height = 0;

    var el = this.getContainerElement();
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
    el.appendChild(viewport);
    viewport.appendChild(canvas);
  };

  Canvas.prototype.resize = function () {
    var viewport = this.getViewportElement();
    viewport.style["max-width"] = viewport.style["max-height"] = null;

    var w = viewport.clientWidth;
    var h = viewport.clientHeight;
    this._radius = (this._diameter = w > h ? h : w) / 2;

    var canvas = this.getCanvasElement();
    canvas.width = canvas.height = this.getDiameter();
    viewport.style["max-width"] = viewport.style["max-height"] = "" + (this.getDiameter()) + "px";
    canvas.style["border-radius"] = "" + Math.floor(this.getRadius()) + "px";
  };

  Canvas.prototype.setFillStyle = function (style) {
    this.getContext().fillStyle = style;
  };

  Canvas.prototype.setStrokeStyle = function (style) {
    this.getContext().strokeStyle = style;
  };

  Canvas.prototype.at = function (loc) {
    if (loc.__proto__ === HyperbolicCanvas.Point.prototype) {
      // scale up
      var x = (loc.getX() + 1) * this.getRadius();
      var y = (loc.getY() + 1) * this.getRadius();
      return [x, this.getDiameter() - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new HyperbolicCanvas.Point({ x: loc[0] / this.getRadius() - 1, y: (this.getDiameter() - loc[1]) / this.getRadius() - 1 });
    }
  };

  Canvas.prototype.strokeLineThroughIdealPoints = function (a0, a1) {

    // TODO something bad hapens when passed (PI, 5 * PI / 4)

    if (Math.abs(a0 - a1) === Math.PI) {
      var p0Scaled = this.at(p0);
      var p1Scaled = this.at(p1);

      this.getContext().beginPath();
      this.getContext().moveTo(p0Scaled[0], p0Scaled[1]);
      this.getContext().lineTo(p1Scaled[0], p1Scaled[1]);
      this.getContext().stroke();
      this.getContext().closePath();
    }

    var p0 = HyperbolicCanvas.Circle.UNIT.pointAt(a0);
    var p1 = HyperbolicCanvas.Circle.UNIT.pointAt(a1);

    var l0 = HyperbolicCanvas.Line.givenPointSlope(p0, -1 / HyperbolicCanvas.Angle.toSlope(a0));
    var l1 = HyperbolicCanvas.Line.givenPointSlope(p1, -1 / HyperbolicCanvas.Angle.toSlope(a1));

    var center = HyperbolicCanvas.Line.intersect(l0, l1);
    var circle = HyperbolicCanvas.Circle.givenCenterRadius(center, HyperbolicCanvas.Line.givenTwoPoints(p0, center).getEuclideanDistance());
    this.strokeCircle(circle);
  };

  Canvas.prototype.clear = function () {
    this.getContext().clearRect(0, 0, this.getDiameter(), this.getDiameter());
  };

  Canvas.prototype.strokeAngles = function (n, rotation) {
    var angle = rotation || 0;
    difference = Math.TAU / n;
    for (var i = 0; i < n; i++) {
      var point = this.at(HyperbolicCanvas.Point.givenPolarCoordinates(1, angle));
      this.getContext().moveTo(this.getRadius(), this.getRadius());
      this.getContext().lineTo(point[0], point[1]);
      this.getContext().stroke();
      angle += difference;
    }
  };

  Canvas.prototype.strokeGrid = function (n) {
    this.getContext().beginPath();

    for (var i = 1; i < n; i++) {
      // x axis
      this.getContext().moveTo(this.getDiameter() * i / n, 0);
      this.getContext().lineTo(this.getDiameter() * i / n, this.getDiameter());
      // y axis
      this.getContext().moveTo(0, this.getDiameter() * i / n);
      this.getContext().lineTo(this.getDiameter(), this.getDiameter() * i / n);
    }
    this.getContext().stroke();
    this.getContext().closePath();
  };

  Canvas.prototype.strokeRings = function (d, n) {
    for (var i = 0; i < n; i++) {
      var ring = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(HyperbolicCanvas.Point.ORIGIN, d * i);
      this.strokeCircle(ring);
    }
  };

  Canvas.prototype.drawCircle = function (c, options) {
    // TODO when does this happen?
    if (c.getCenter() == undefined)return false;
    var center = this.at(c.getCenter());
    this.getContext().beginPath();
    this.getContext().arc(center[0], center[1], c.getRadius() * this.getRadius(), 0, Math.TAU);
    this.getContext().closePath();
    if (options.fill) {
      this.getContext().fill();
    }
    if (options.stroke) {
      this.getContext().stroke();
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
    var ctx = this.getContext();

    if (!c) {
      var p0 = this.at(l.getP0());
      var p1 = this.at(l.getP1());
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
      ctx.closePath();
      return true;
    }
    var centerScaled = this.at(c.getCenter());
    var a0, a1;

    if (infinite) {
      a0 = 0;
      a1 = Math.TAU;
    } else {
      a0 = -1 * c.angleAt(l.getP0());
      a1 = -1 * c.angleAt(l.getP1());
    }
    ctx.beginPath();
    ctx.arc(centerScaled[0], centerScaled[1], c.getRadius() * this.getRadius(), a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0, Math.abs(a0 - a1) > Math.PI);
    ctx.stroke();
    ctx.closePath();

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
    this.getContext().lineTo(p0[0], p0[1]);

    if (c) {
      var centerScaled = this.at(c.getCenter());

      var control = this.at(HyperbolicCanvas.Line.intersect(c.tangentAtPoint(l.getP0()), c.tangentAtPoint(l.getP1())));
      if (control) {
        this.getContext().arcTo(control[0], control[1], p1[0], p1[1], c.getRadius() * this.getRadius());
      } else {
        this.getContext().lineTo(p1[0], p1[1]);
      }
    } else {
      this.getContext().lineTo(p1[0], p1[1]);
    }
    return true;
  };

  Canvas.prototype.drawPolygon = function (p, options) {
    var vertices = p.getVertices();
    if(vertices==undefined)return false;//fix, so the browser doesn't give an error when the polygon off the screen
    var n = vertices.length;
    this.getContext().beginPath();
    var start = this.at(vertices[0])
    this.getContext().moveTo(start[0], start[1]);
    for (var i = 0; i < n; i++) {
      this.drawPath(HyperbolicCanvas.Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]));
    }
    this.getContext().closePath();
    if (options.fill) {
      this.getContext().fill();
    }
    if (options.stroke) {
      this.getContext().stroke();
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
    var vertices = p.getVertices();
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    for (var i = 0; i < n; i++) {
      this.strokeLine(HyperbolicCanvas.Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]), true);
    }
    return true;
  };

  // Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
  //   // TODO tesselate the entire plane with n-gons
  // };
})();
