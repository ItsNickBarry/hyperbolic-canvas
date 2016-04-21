;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  // TODO canvas layers

  // TODO integer coordinates mode

  // TODO store polygons and circles as hit regions

  var Canvas = HyperbolicCanvas.Canvas = function (options) {
    this._setupElements(options);
    this._setupSize();
  };

  Canvas.prototype.getUnderlayElement = function () {
    return this._underlay;
  };

  Canvas.prototype.getContainerElement = function () {
    return this._el;
  };

  Canvas.prototype.getCanvasElement = function () {
    return this._canvas;
  };

  Canvas.prototype.getBackdropElement = function () {
    return this._backdrop;
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
    var ctx = this.getContext();
    if (options.lineDash) {
      ctx.setLineDash(options.lineDash);
    }
    for (var attribute in options) {
      ctx[attribute] = options[attribute];
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

  Canvas.prototype.clear = function () {
    this.getContext().clearRect(0, 0, this.getDiameter(), this.getDiameter());
  };

  Canvas.prototype.fill = function (path, properties) {
    this.getContext().fill(path);
  };

  Canvas.prototype.fillAndStroke = function (path, properties) {
    this.getContext().fill(path);
    this.getContext().stroke(path);
  };

  Canvas.prototype.stroke = function (path, properties) {
    if (path) {
      this.getContext().stroke(path);
    } else {
      this.getContext().stroke();
    }
  };

  // Canvas.prototype.tesselate = function (order, n, center, radius, rotation, inverse) {
  //   // TODO tesselate the entire plane with n-gons
  // };




  Canvas.prototype.pathForReferenceAngles = function (n, rotation, options) {
    var path = this._copyPathOrGetContext(options);
    var angle = rotation || 0;
    var r = this.getRadius();
    var difference = Math.TAU / n;
    for (var i = 0; i < n; i++) {
      var idealPoint = this.at(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
      );
      path.moveTo(r, r);
      path.lineTo(idealPoint[0], idealPoint[1]);
      angle += difference;
    }
    return path;
  };

  Canvas.prototype.pathForReferenceGrid = function (n, options) {
    var path = this._copyPathOrGetContext(options);
    for (var i = 1; i < n; i++) {
      // x axis
      path.moveTo(this.getDiameter() * i / n, 0);
      path.lineTo(this.getDiameter() * i / n, this.getDiameter());
      // y axis
      path.moveTo(0, this.getDiameter() * i / n);
      path.lineTo(this.getDiameter(), this.getDiameter() * i / n);
    }
    return path;
  };

  Canvas.prototype.pathForReferenceRings = function (d, n, options) {
    var path = this._copyPathOrGetContext(options);
    for (var i = 0; i < n; i++) {
      this._pathForCircle(
        HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
          HyperbolicCanvas.Point.ORIGIN,
          d * i
        ),
        path
      );
    }
    return path;
  };

  Canvas.prototype.pathForEuclidean = function (object, options) {
    options = options || {};
    return this._pathFunctionForEuclidean(object)(
      object,
      this._copyPathOrGetContext(options),
      options
    );
  };

  Canvas.prototype.pathForHyperbolic = function (object, options) {
    options = options || {};
    return this._pathFunctionForHyperbolic(object)(
      object,
      this._copyPathOrGetContext(options),
      options
    );
  };

  Canvas.prototype._pathForCircle = function (c, path) {

    var center = this.at(c.getEuclideanCenter());
    var start = this.at(c.euclideanPointAt(0));

    path.moveTo(start[0], start[1]);

    path.arc(
      center[0],
      center[1],
      c.getEuclideanRadius() * this.getRadius(),
      0,
      Math.TAU
    );
    return path;
  };

  Canvas.prototype._pathForEuclideanLine = function (l, path, options) {
    var p1 = this.at(l.getP1());

    if (!options.connected) {
      var p0 = this.at(l.getP0());
      path.moveTo(p0[0], p0[1]);
    }
    path.lineTo(p1[0], p1[1]);
    return path;
  };

  Canvas.prototype._pathForEuclideanPoint = function (p, path) {
    var p = this.at(p);
    path.lineTo(p[0], p[1]);
    return path;
  };

  Canvas.prototype._pathForEuclideanPolygon = function (p, path) {
      var start = this.at(p.getVertices()[0]);
      path.moveTo(start[0], start[1]);

      var lines = p.getLines();
      for (var i = 0; i < lines.length; i++) {
        this._pathForEuclideanLine(lines[i], path, { connected: true });
      }
      return path;
  };

  Canvas.prototype._pathForHyperbolicLine = function (l, path, options) {
    var c = l.getArc();

    if (c instanceof HyperbolicCanvas.Line) {
      return this._pathForEuclideanLine(c, path, options);
    }

    var p0 = this.at(l.getP0());
    var p1 = this.at(l.getP1());

    if (options.connected) {
      // not clear why this is necessary
      path.lineTo(p0[0], p0[1]);
    } else {
      // do not connect line to previous point on path
      path.moveTo(p0[0], p0[1]);
    }

    if (c) {
      var centerScaled = this.at(c.getEuclideanCenter());

      var control = this.at(HyperbolicCanvas.Line.euclideanIntersect(
        c.tangentAtPoint(l.getP0()),
        c.tangentAtPoint(l.getP1())
      ));

      if (control) {
        path.arcTo(
          control[0],
          control[1],
          p1[0],
          p1[1],
          c.getEuclideanRadius() * this.getRadius()
        );
      } else {
        path.lineTo(p1[0], p1[1]);
      }
    } else {
      path.lineTo(p1[0], p1[1]);
    }
    return path;
  };

  Canvas.prototype._pathForHyperbolicLineInfinite = function (l, path, options) {
    // TODO what is different between arc, used here, and arcTo?
    // TODO contrary to what the name implies, this requires options.infinite to
    //      be true in order to draw infinite lines
    if (!l.isOnPlane()) {
      return false;
    }
    var c = l.getArc();

    if (!c) {
      return this._pathForEuclideanLine(l, path, { infinite: true });
    }
    var centerScaled = this.at(c.getEuclideanCenter());
    var a0, a1;

    if (options.infinite) {
      a0 = 0;
      a1 = Math.TAU;
    } else {
      a0 = -1 * c.euclideanAngleAt(l.getP0());
      a1 = -1 * c.euclideanAngleAt(l.getP1());
    }

    var startAngle = a0 < a1 ? a0 : a1;
    var startPoint = this.at(c.euclideanPointAt(startAngle));
    path.moveTo(startPoint[0], startPoint[1]);
    path.arc(
      centerScaled[0],
      centerScaled[1],
      c.getEuclideanRadius() * this.getRadius(),
      startAngle,
      a0 < a1 ? a1 : a0,
      Math.abs(a0 - a1) > Math.PI
    );

    return path;
  };

  // Canvas.prototype._pathForHyperbolicPoint = function (p, path) {
  //   // TODO
  // };

  Canvas.prototype._pathForHyperbolicPolygon = function (p, path, options) {
    var lines = p.getLines();
    var start = this.at(p.getVertices()[0]);
    if (options.extendBoundaries) {
      for (var i = 0; i < lines.length; i++) {
        this._pathForHyperbolicLineInfinite(lines[i], path, { infinite: true });
      }
    } else {
      path.moveTo(start[0], start[1]);

      for (var i = 0; i < lines.length; i++) {
        this._pathForHyperbolicLine(lines[i], path, { connected: true });
      }
    }
    return path;
  };

  Canvas.prototype._pathForHyperbolicPolygonBoundaries = function (p, path) {
    var lines = p.getLines();

    if (lines.length < 3){
      return false;
    }

    for (var i = 0; i < lines.length; i++) {
      path = this._pathForHyperbolicLineInfinite(lines[i], path, { infinite: true });
    }
    return path;
  };

  Canvas.prototype._pathFunctionForEuclidean = function (object) {
    var fn;
    switch(object.__proto__) {
      // cases listed in probable order of frequency of use
      case HyperbolicCanvas.Line.prototype:
        fn = this._pathForEuclideanLine;
        break;
      case HyperbolicCanvas.Circle.prototype:
        fn = this._pathForCircle;
        break;
      case HyperbolicCanvas.Polygon.prototype:
        fn = this._pathForEuclideanPolygon;
        break;
      case HyperbolicCanvas.Point.prototype:
        fn = this._pathForEuclideanPoint;
        break;
      default:
        fn = function () {
          return false;
        };
        break;
    }
    return fn.bind(this);
  };

  Canvas.prototype._pathFunctionForHyperbolic = function (object) {
    // TODO _pathForHyperbolicPoint
    var fn;
    switch(object.__proto__) {
      // cases listed in probable order of frequency of use
      case HyperbolicCanvas.Circle.prototype:
        fn = this._pathForCircle;
        break;
      case HyperbolicCanvas.Line.prototype:
        fn = this._pathForHyperbolicLine;
        break;
      case HyperbolicCanvas.Polygon.prototype:
        fn = this._pathForHyperbolicPolygon;
        break;
      default:
        fn = function () {
          return false;
        };
        break;
    }
    return fn.bind(this);
  };

  Canvas.prototype._copyPathOrGetContext = function (options) {
    // TODO beginPath?
    // TODO document options
    if (options.copyPath) {
      return options.basePath;
    } else {
      // if (TODO Path2D is available on current browser) {
        return new Path2D(options.basePath);
      // } else {
      //   // TODO should beginPath() be called on the context?
      //   return this.getContext();
      // }
    }
  };

  // Canvas.prototype.strokeHyperbolicLineThroughIdealPoints = function (a0, a1) {
  //   // TODO something bad hapens when passed (PI, 5 * PI / 4)
  //
  //   if (Math.abs(a0 - a1) === Math.PI) {
  //     var p0Scaled = this.at(p0);
  //     var p1Scaled = this.at(p1);
  //
  //     this.getContext().beginPath();
  //     this.getContext().moveTo(p0Scaled[0], p0Scaled[1]);
  //     this.getContext().lineTo(p1Scaled[0], p1Scaled[1]);
  //     this.getContext().stroke();
  //     this.getContext().closePath();
  //   }
  //
  //   var p0 = HyperbolicCanvas.Point.givenIdealAngle(a0);
  //   var p1 = HyperbolicCanvas.Point.givenIdealAngle(a1);
  //
  //   var l0 = HyperbolicCanvas.Line.givenPointSlope(
  //     p0,
  //     -1 / HyperbolicCanvas.Angle.toSlope(a0)
  //   );
  //   var l1 = HyperbolicCanvas.Line.givenPointSlope(
  //     p1,
  //     -1 / HyperbolicCanvas.Angle.toSlope(a1)
  //   );
  //
  //   var center = HyperbolicCanvas.Line.euclideanIntersect(l0, l1);
  //   var circle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
  //     center,
  //     HyperbolicCanvas.Line.givenTwoPoints(p0, center).getEuclideanLength()
  //   );
  //
  //   this.strokeCircle(circle);
  // };

  Canvas.prototype._setupElements = function (options) {
    var el = this._el = options.el;
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }

    var backdrop = this._backdrop = document.createElement('div');
    backdrop.className = 'backdrop';

    var underlay = this._underlay = document.createElement('div');
    underlay.className = 'underlay';
    underlay.style.display ='block';

    var canvas = this._canvas = document.createElement('canvas');
    canvas.className = 'hyperbolic';
    // canvas.style.display = 'block';
    canvas.style.position = 'absolute';

    this._ctx = canvas.getContext('2d', options.contextAttributes);

    el.appendChild(backdrop);
    backdrop.appendChild(underlay);
    underlay.appendChild(canvas);
  };

  Canvas.prototype._setupSize = function () {
    var container = this.getContainerElement();
    var underlay = this.getUnderlayElement();
    var canvas = this.getCanvasElement();
    var backdrop = this.getBackdropElement();

    var w = container.clientWidth;
    var h = container.clientHeight;
    var d = this._diameter = w > h ? h : w
    var r = this._radius = d / 2;

    underlay.style["width"] = underlay.style["height"] = "" + d + "px";
    underlay.style["border-radius"] = "" + Math.floor(r) + "px";

    canvas.width = canvas.height = d;
    canvas.style["border-radius"] = "" + Math.floor(r) + "px";
    backdrop.style["width"] = backdrop.style["height"] = "" + d + "px";
  };
})();
