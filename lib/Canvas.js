;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  // TODO standardize return values; some return true/false, some return undefined/false

  var Canvas = HyperbolicCanvas.Canvas = function (options) {
    this._setupElements(options);
    this._setupSize();
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

  Canvas.prototype.setContextProperties = function (options) {
    for (var attribute in options) {
      this.getContext()[attribute] = options[attribute];
    }
  };

  Canvas.prototype.at = function (loc) {
    if (loc.__proto__ === HyperbolicCanvas.Point.prototype) {
      // scale up
      var x = (loc.getX() + 1) * this.getRadius();
      var y = (loc.getY() + 1) * this.getRadius();
      return [x, this.getDiameter() - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new HyperbolicCanvas.Point({
        x: loc[0] / this.getRadius() - 1,
        y: (this.getDiameter() - loc[1]) / this.getRadius() - 1
      });
    }
  };

  Canvas.prototype.strokeHyperbolicLineThroughIdealPoints = function (a0, a1) {
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

    var p0 = HyperbolicCanvas.Circle.UNIT.euclideanPointAt(a0);
    var p1 = HyperbolicCanvas.Circle.UNIT.euclideanPointAt(a1);

    var l0 = HyperbolicCanvas.Line.givenPointSlope(
      p0,
      -1 / HyperbolicCanvas.Angle.toSlope(a0)
    );
    var l1 = HyperbolicCanvas.Line.givenPointSlope(
      p1,
      -1 / HyperbolicCanvas.Angle.toSlope(a1)
    );

    var center = HyperbolicCanvas.Line.intersect(l0, l1);
    var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      center,
      HyperbolicCanvas.Line.givenTwoPoints(p0, center).getEuclideanDistance()
    );

    this.strokeCircle(circle);
  };

  Canvas.prototype.clear = function () {
    this.getContext().clearRect(0, 0, this.getDiameter(), this.getDiameter());
  };

  Canvas.prototype.strokeAngles = function (n, rotation) {
    var angle = rotation || 0;
    difference = Math.TAU / n;
    for (var i = 0; i < n; i++) {
      var idealPoint = this.at(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      );
      this.getContext().moveTo(this.getRadius(), this.getRadius());
      this.getContext().lineTo(idealPoint[0], idealPoint[1]);
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
      var ring = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
        HyperbolicCanvas.Point.ORIGIN,
        d * i
      );
      this.strokeCircle(ring);
    }
  };

  Canvas.prototype.fillAndStrokeCircle = function (c) {
    return this._drawEuclideanCircle(c, { fill: true, stroke: true });
  };

  Canvas.prototype.fillCircle = function (c) {
    return this._drawEuclideanCircle(c, { fill: true });
  };

  Canvas.prototype.strokeCircle = function (c) {
    return this._drawEuclideanCircle(c, { stroke: true });
  };

  Canvas.prototype.strokeEuclideanLine = function (l, infinite) {
    var p0, p1;
    if (infinite) {
      if (l.getSlope() === Infinity) {
        p0 = l.pointAtEuclideanY(-1);
        p1 = l.pointAtEuclideanY( 1);
      } else {
        p0 = l.pointAtEuclideanX(-1);
        p1 = l.pointAtEuclideanX( 1);
      }
    } else {
      p0 = l.getP0();
      p1 = l.getP1();
    }
    p0 = this.at(p0);
    p1 = this.at(p1);
    var ctx = this.getContext();
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
    ctx.closePath();
    return true;
  };

  Canvas.prototype.strokeHyperbolicLine = function (l, infinite) {
    // TODO does not work near-diametric lines due to floating point error;  use arcTo instead?
    //      would still yield incorrect results, but they would at least appear on screen
    if (!l.isOnPlane()) {
      return false;
    }
    var c = l.getArc();

    if (!c) {
      return this.strokeEuclideanLine(l, infinite);
    }
    var centerScaled = this.at(c.getEuclideanCenter());
    var a0, a1;

    if (infinite) {
      a0 = 0;
      a1 = Math.TAU;
    } else {
      a0 = -1 * c.euclideanAngleAt(l.getP0());
      a1 = -1 * c.euclideanAngleAt(l.getP1());
    }
    var ctx = this.getContext();
    ctx.beginPath();
    ctx.arc(
      centerScaled[0],
      centerScaled[1],
      c.getEuclideanRadius() * this.getRadius(),
      a0 < a1 ? a0 : a1, a0 < a1 ? a1 : a0,
      Math.abs(a0 - a1) > Math.PI
    );
    ctx.stroke();
    ctx.closePath();

    return true;
  };

  Canvas.prototype.fillAndStrokePolygon = function (p) {
    return this._drawHyperbolicPolygon(p, { fill: true, stroke: true });
  };

  Canvas.prototype.fillPolygon = function (p) {
    return this._drawHyperbolicPolygon(p, { fill: true });
  };

  Canvas.prototype.strokePolygon = function (p) {
    return this._drawHyperbolicPolygon(p, { stroke: true });
  };

  Canvas.prototype.strokePolygonBoundaries = function (p) {
    var vertices = p.getVertices();
    var n = vertices.length;
    if (n < 3){
      return false;
    }
    for (var i = 0; i < n; i++) {
      this.strokeHyperbolicLine(HyperbolicCanvas.Line.givenTwoPoints(
        vertices[i],
        vertices[(i + 1) % n]),
        true
      );
    }
    return true;
  };

  // Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
  //   // TODO tesselate the entire plane with n-gons
  // };

  Canvas.prototype._drawEuclideanCircle = function (c, options) {
    if (!c) {
      return false;
    }
    var ctx = this.getContext();

    var center = this.at(c.getEuclideanCenter());

    ctx.beginPath();
    ctx.arc(
      center[0],
      center[1],
      c.getEuclideanRadius() * this.getRadius(),
      0,
      Math.TAU
    );
    ctx.closePath();

    if (options.fill) {
      ctx.fill();
    }
    if (options.stroke) {
      ctx.stroke();
    }
  };

  Canvas.prototype._drawHyperbolicPath = function (l) {
    if (!l.isOnPlane()) {
      return false;
    }

    var ctx = this.getContext();

    var c = l.getArc();

    var p0 = this.at(l.getP0());
    var p1 = this.at(l.getP1());

    // TODO is this still necessary?
    ctx.lineTo(p0[0], p0[1]);

    if (c) {
      var centerScaled = this.at(c.getEuclideanCenter());

      var control = this.at(HyperbolicCanvas.Line.intersect(
        c.tangentAtPoint(l.getP0()),
        c.tangentAtPoint(l.getP1())
      ));

      if (control) {
        ctx.arcTo(
          control[0],
          control[1],
          p1[0],
          p1[1],
          c.getEuclideanRadius() * this.getRadius()
        );
      } else {
        ctx.lineTo(p1[0], p1[1]);
      }
    } else {
      ctx.lineTo(p1[0], p1[1]);
    }
    return true;
  };

  Canvas.prototype._drawHyperbolicPolygon = function (p, options) {
    var vertices = p.getVertices();
    if(typeof vertices === 'undefined') {
      // TODO should check instead for the polygon itself, which should not exist without vertices
      // this check should be on other methods, as well
      return false;
    }

    var ctx = this.getContext();

    var n = vertices.length;
    var start = this.at(vertices[0]);

    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);

    for (var i = 0; i < n; i++) {
      this._drawHyperbolicPath(HyperbolicCanvas.Line.givenTwoPoints(
        vertices[i],
        vertices[(i + 1) % n]
      ));
    }

    ctx.closePath();

    if (options.fill) {
      ctx.fill();
    }
    if (options.stroke) {
      ctx.stroke();
    }
    return true;
  };

  Canvas.prototype._setupElements = function (options) {
    var el = this._el = options.el;
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }

    var viewport = this._viewport = document.createElement('div');
    viewport.className = 'viewport';

    var canvas = this._canvas = document.createElement('canvas');
    canvas.className = 'hyperbolic';
    canvas.style.display = 'block';

    this._ctx = canvas.getContext('2d');

    el.appendChild(viewport);
    viewport.appendChild(canvas);
  };

  Canvas.prototype._setupSize = function () {
    var container = this.getContainerElement();
    var canvas = this.getCanvasElement();
    var viewport = this.getViewportElement();
    // viewport.style["height"] = viewport.style["width"] = '100%';

    // var w = viewport.clientWidth;
    // var h = viewport.clientHeight;
    var w = container.clientWidth;
    var h = container.clientHeight;
    this._radius = (this._diameter = w > h ? h : w) / 2;

    canvas.width = canvas.height = this.getDiameter();
    canvas.style["border-radius"] = "" + Math.floor(this.getRadius()) + "px";
    viewport.style["width"] = viewport.style["height"] = "" + this.getDiameter() + "px";
  };
})();
