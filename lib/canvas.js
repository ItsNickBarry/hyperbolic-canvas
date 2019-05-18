const HyperbolicCanvas = require('./hyperbolic_canvas.js');

// TODO store polygons and circles as hit regions

let Canvas = HyperbolicCanvas.Canvas = function (options) {
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
  for (let attribute in options) {
    this.setContextProperty(attribute, options[attribute]);
  }
};

Canvas.prototype.setContextProperty = function (property, value) {
  let ctx = this.getContext();
  if (property === 'lineDash') {
    ctx.setLineDash(value);
  }
  ctx[property] = value;
};

Canvas.prototype.at = function (loc) {
  if (loc.__proto__ === HyperbolicCanvas.Point.prototype) {
    // scale up
    let x = (loc.getX() + 1) * this.getRadius();
    let y = (loc.getY() + 1) * this.getRadius();
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
  let path = this._getPathOrContext(options || {});
  let angle = rotation || 0;
  let r = this.getRadius();
  let difference = Math.TAU / n;
  for (let i = 0; i < n; i++) {
    let idealPoint = this.at(
      HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle)
    );
    path.moveTo(r, r);
    path.lineTo(idealPoint[0], idealPoint[1]);
    angle += difference;
  }
  return path;
};

Canvas.prototype.pathForReferenceGrid = function (n, options) {
  let path = this._getPathOrContext(options || {});
  for (let i = 1; i < n; i++) {
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
  let path = this._getPathOrContext(options || {});
  for (let i = 0; i < n; i++) {
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

  let center = this.at(c.getEuclideanCenter());
  let start = this.at(c.euclideanPointAt(0));

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
  let p1 = this.at(l.getP1());

  if (!options.connected) {
    let p0 = this.at(l.getP0());
    path.moveTo(p0[0], p0[1]);
  }
  path.lineTo(p1[0], p1[1]);
  return path;
};

Canvas.prototype._pathForEuclideanPoint = function (p, path) {
  let point = this.at(p);
  path.lineTo(point[0], point[1]);
  return path;
};

Canvas.prototype._pathForEuclideanPolygon = function (p, path) {
  let start = this.at(p.getVertices()[0]);
  path.moveTo(start[0], start[1]);

  let lines = p.getLines();
  for (let i = 0; i < lines.length; i++) {
    this._pathForEuclideanLine(lines[i], path, { connected: true });
  }
  return path;
};

Canvas.prototype._pathForHyperbolicLine = function (l, path, options) {
  let geodesic = l.getHyperbolicGeodesic();

  if (geodesic instanceof HyperbolicCanvas.Circle) {
    let p0 = this.at(l.getP0());
    let p1 = this.at(l.getP1());

    if (options.connected) {
      // not clear why this is necessary
      path.lineTo(p0[0], p0[1]);
    } else {
      // do not connect line to previous point on path
      path.moveTo(p0[0], p0[1]);
    }

    let control = this.at(HyperbolicCanvas.Line.euclideanIntersect(
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
  let lines = p.getLines();
  let start = this.at(p.getVertices()[0]);
  if (options.infinite) {
    for (let i = 0; i < lines.length; i++) {
      this._pathForHyperbolicLine(lines[i].getIdealLine(), path, options);
    }
  } else {
    path.moveTo(start[0], start[1]);

    for (let i = 0; i < lines.length; i++) {
      this._pathForHyperbolicLine(lines[i], path, { connected: true });
    }
  }
  return path;
};

Canvas.prototype._pathFunctionForEuclidean = function (object) {
  let fn;
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
  let fn;
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
  let el = this._el = options.el;
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }

  let backdrop = this._backdrop = document.createElement('div');
  backdrop.className = 'backdrop';

  let underlay = this._underlay = document.createElement('div');
  underlay.className = 'underlay';
  underlay.style.display ='block';

  let canvas = this._canvas = document.createElement('canvas');
  canvas.className = 'hyperbolic';
  canvas.style.position = 'absolute';

  this._ctx = canvas.getContext('2d', options.contextAttributes);

  el.appendChild(backdrop);
  backdrop.appendChild(underlay);
  underlay.appendChild(canvas);
};

Canvas.prototype._setupSize = function () {
  let container = this.getContainerElement();
  let underlay = this.getUnderlayElement();
  let canvas = this.getCanvasElement();
  let backdrop = this.getBackdropElement();

  let w = container.clientWidth;
  let h = container.clientHeight;
  let d = this._diameter = w > h ? h : w;
  let r = this._radius = d / 2;

  underlay.style['width'] = underlay.style['height'] = '' + d + 'px';
  backdrop.style['width'] = backdrop.style['height'] = '' + d + 'px';
  underlay.style['border-radius'] = '' + Math.floor(r) + 'px';
  canvas.style['border-radius']   = '' + Math.floor(r) + 'px';
  canvas.width = canvas.height = d;
};
