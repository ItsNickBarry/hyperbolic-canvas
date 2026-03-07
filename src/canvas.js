import { HyperbolicCanvas } from './hyperbolic_canvas.js';

// TODO store polygons and circles as hit regions

class Canvas {
  constructor(ctx) {
    this._ctx = ctx;
    let canvas = ctx.canvas;
    let d = (this._diameter =
      canvas.width > canvas.height ? canvas.height : canvas.width);
    this._radius = d / 2;
    this._clip();
  }

  getBackdropElement() {
    return this._backdrop;
  }

  getContainerElement() {
    return this._el;
  }

  getCanvasElement() {
    return this._canvas;
  }

  getUnderlayElement() {
    return this._underlay;
  }

  getContext() {
    return this._ctx;
  }

  getRadius() {
    return this._radius;
  }

  getDiameter() {
    return this._diameter;
  }

  setContextProperties(options) {
    for (let attribute in options) {
      this.setContextProperty(attribute, options[attribute]);
    }
  }

  setContextProperty(property, value) {
    let ctx = this.getContext();
    if (property === 'lineDash') {
      ctx.setLineDash(value);
    }
    ctx[property] = value;
  }

  at(loc) {
    if (loc.__proto__ === HyperbolicCanvas.Point.prototype) {
      // scale up
      let x = (loc.getX() + 1) * this.getRadius();
      let y = (loc.getY() + 1) * this.getRadius();
      return [x, this.getDiameter() - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new HyperbolicCanvas.Point({
        x: loc[0] / this.getRadius() - 1,
        y: (this.getDiameter() - loc[1]) / this.getRadius() - 1,
      });
    }
  }

  clear() {
    this.getContext().clearRect(0, 0, this.getDiameter(), this.getDiameter());
  }

  _clip() {
    let ctx = this.getContext();
    let r = this.getRadius();
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.TAU);
    ctx.clip();
  }

  fill(path) {
    if (path && typeof Path2D !== 'undefined' && path instanceof Path2D) {
      this.getContext().fill(path);
    } else {
      path = path || this.getContext();
      path.fill();
    }
  }

  fillAndStroke(path) {
    if (path && typeof Path2D !== 'undefined' && path instanceof Path2D) {
      this.getContext().fill(path);
      this.getContext().stroke(path);
    } else {
      path = path || this.getContext();
      path.fill();
      path.stroke();
    }
  }

  stroke(path) {
    if (path && typeof Path2D !== 'undefined' && path instanceof Path2D) {
      this.getContext().stroke(path);
    } else {
      path = path || this.getContext();
      path.stroke();
    }
  }

  pathForReferenceAngles(n, rotation, options) {
    let path = this._getPathOrContext(options || {});
    let angle = rotation || 0;
    let r = this.getRadius();
    let difference = Math.TAU / n;
    for (let i = 0; i < n; i++) {
      let idealPoint = this.at(
        HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle),
      );
      path.moveTo(r, r);
      path.lineTo(idealPoint[0], idealPoint[1]);
      angle += difference;
    }
    return path;
  }

  pathForReferenceGrid(n, options) {
    let path = this._getPathOrContext(options || {});
    for (let i = 1; i < n; i++) {
      // x axis
      path.moveTo((this.getDiameter() * i) / n, 0);
      path.lineTo((this.getDiameter() * i) / n, this.getDiameter());
      // y axis
      path.moveTo(0, (this.getDiameter() * i) / n);
      path.lineTo(this.getDiameter(), (this.getDiameter() * i) / n);
    }
    return path;
  }

  pathForReferenceRings(n, r, options) {
    let path = this._getPathOrContext(options || {});
    for (let i = 0; i < n; i++) {
      this._pathForCircle(
        HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
          HyperbolicCanvas.Point.ORIGIN,
          r * (i + 1),
        ),
        path,
      );
    }
    return path;
  }

  pathForEuclidean(object, options) {
    options = options || {};
    return this._pathFunctionForEuclidean(object)(
      object,
      this._getPathOrContext(options),
      options,
    );
  }

  pathForHyperbolic(object, options) {
    options = options || {};
    return this._pathFunctionForHyperbolic(object)(
      object,
      this._getPathOrContext(options),
      options,
    );
  }

  _pathForCircle(c, path) {
    let center = this.at(c.getEuclideanCenter());
    let start = this.at(c.euclideanPointAt(0));

    path.moveTo(start[0], start[1]);

    path.arc(
      center[0],
      center[1],
      c.getEuclideanRadius() * this.getRadius(),
      0,
      Math.TAU,
    );
    return path;
  }

  _pathForEuclideanLine(l, path, options) {
    let p1 = this.at(l.getP1());

    if (!options.connected) {
      let p0 = this.at(l.getP0());
      path.moveTo(p0[0], p0[1]);
    }
    path.lineTo(p1[0], p1[1]);
    return path;
  }

  _pathForEuclideanPoint(p, path) {
    let point = this.at(p);
    path.lineTo(point[0], point[1]);
    return path;
  }

  _pathForEuclideanPolygon(p, path) {
    let start = this.at(p.getVertices()[0]);
    path.moveTo(start[0], start[1]);

    let lines = p.getLines();
    for (let i = 0; i < lines.length; i++) {
      this._pathForEuclideanLine(lines[i], path, { connected: true });
    }
    return path;
  }

  _pathForHyperbolicLine(l, path, options) {
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

      let control = this.at(
        HyperbolicCanvas.Line.euclideanIntersect(
          geodesic.euclideanTangentAtPoint(l.getP0()),
          geodesic.euclideanTangentAtPoint(l.getP1()),
        ),
      );

      if (control) {
        path.arcTo(
          control[0],
          control[1],
          p1[0],
          p1[1],
          geodesic.getEuclideanRadius() * this.getRadius(),
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
  }

  _pathForHyperbolicPolygon(p, path, options) {
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
  }

  _pathFunctionForEuclidean(object) {
    let fn;
    switch (object.__proto__) {
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
  }

  _pathFunctionForHyperbolic(object) {
    let fn;
    switch (object.__proto__) {
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
  }

  _getPathOrContext(options) {
    // options:
    //   path2D: [boolean] -> use Path2D instead of CanvasRenderingContext2D
    //   path:   [Path2D]  -> Path2D to add to
    if (options.path) {
      return options.path;
    } else if (options.path2D && typeof Path2D !== 'undefined') {
      return new Path2D();
    } else {
      this.getContext().beginPath();
      return this.getContext();
    }
  }
}

HyperbolicCanvas.Canvas = Canvas;
