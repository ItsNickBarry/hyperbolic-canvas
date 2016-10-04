;
(function () {
  "use strict";
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

  Canvas.prototype.getBackdropElement = function () {
    return this._backdrop;
  };

  Canvas.prototype.getContainerElement = function () {
    return this._el;
  };

  Canvas.prototype.getCanvasElement = function () {
    return this._canvas;
  };

  Canvas.prototype.getUnderlayElement = function () {
    return this._underlay;
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
      this.setContextProperty(attribute, options[attribute])
    }
  };

  Canvas.prototype.setContextProperty = function (property, value) {
    var ctx = this.getContext();
    if (property === 'lineDash') {
      ctx.setLineDash(value);
    }
    ctx[property] = value;
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

  Canvas.prototype.fill = function (path) {
    if (path && Path2D && path instanceof Path2D) {
      this.getContext().fill(path);
    } else {
      path = path || this.getContext();
      path.fill();
    }
  };

  Canvas.prototype.fillAndStroke = function (path) {
    if (path && Path2D && path instanceof Path2D) {
      this.getContext().fill(path);
      this.getContext().stroke(path);
    } else {
      path = path || this.getContext();
      path.fill();
      path.stroke();
    }
  };

  Canvas.prototype.stroke = function (path) {
    if (path && Path2D && path instanceof Path2D) {
      this.getContext().stroke(path);
    } else {
      path = path || this.getContext();
      path.stroke();
    }
  };

  Canvas.prototype.pathForReferenceAngles = function (n, rotation, options) {
    var path = this._getPathOrContext(options || {});
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
    var path = this._getPathOrContext(options || {});
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

  Canvas.prototype.pathForReferenceRings = function (n, r, options) {
    var path = this._getPathOrContext(options || {});
    for (var i = 0; i < n; i++) {
      this._pathForCircle(
        HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
          HyperbolicCanvas.Point.ORIGIN,
          r * (i + 1)
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
      this._getPathOrContext(options),
      options
    );
  };

  Canvas.prototype.pathForHyperbolic = function (object, options) {
    options = options || {};
    return this._pathFunctionForHyperbolic(object)(
      object,
      this._getPathOrContext(options),
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
    var geodesic = l.getHyperbolicGeodesic();

    if (geodesic instanceof HyperbolicCanvas.Circle) {
      var p0 = this.at(l.getP0());
      var p1 = this.at(l.getP1());

      if (options.connected) {
        // not clear why this is necessary
        path.lineTo(p0[0], p0[1]);
      } else {
        // do not connect line to previous point on path
        path.moveTo(p0[0], p0[1]);
      }

      var centerScaled = this.at(geodesic.getEuclideanCenter());

      var control = this.at(HyperbolicCanvas.Line.euclideanIntersect(
        geodesic.euclideanTangentAtPoint(l.getP0()),
        geodesic.euclideanTangentAtPoint(l.getP1())
      ));

      if (control) {
        path.arcTo(
          control[0],
          control[1],
          p1[0],
          p1[1],
          geodesic.getEuclideanRadius() * this.getRadius()
        );
      } else {
        path.lineTo(p1[0], p1[1]);
      }
      return path;
    } else if (geodesic instanceof HyperbolicCanvas.Line) {
      return this._pathForEuclideanLine(geodesic, path, options);
    } else {
      return false;
    }
  };

  Canvas.prototype._pathForHyperbolicPolygon = function (p, path, options) {
    var lines = p.getLines();
    var start = this.at(p.getVertices()[0]);
    if (options.infinite) {
      for (var i = 0; i < lines.length; i++) {
        this._pathForHyperbolicLine(lines[i].getIdealLine(), path, options);
      }
    } else {
      path.moveTo(start[0], start[1]);

      for (var i = 0; i < lines.length; i++) {
        this._pathForHyperbolicLine(lines[i], path, { connected: true });
      }
    }
    return path;
  };

  Canvas.prototype._pathFunctionForEuclidean = function (object) {
    var fn;
    switch(object.__proto__) {
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
    var fn;
    switch(object.__proto__) {
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

  Canvas.prototype._getPathOrContext = function (options) {
    // options:
    //   path2D: [boolean] -> use Path2D instead of CanvasRenderingContext2D
    //   path:   [Path2D]  -> Path2D to add to
    if (options.path) {
      return options.path;
    } else if (options.path2D && Path2D) {
      return new Path2D();
    } else {
      this.getContext().beginPath();
      return this.getContext();
    }
  };

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
