import Circle from './circle.js';
import Line from './line.js';
import Point from './point.js';
import Polygon from './polygon.js';

// TODO store polygons and circles as hit regions

export default class Canvas {
  #ctx;
  #diameter;
  #radius;

  constructor(ctx) {
    this.#ctx = ctx;
    const canvas = ctx.canvas;
    const d = (this.#diameter =
      canvas.width > canvas.height ? canvas.height : canvas.width);
    this.#radius = d / 2;
    this.#clip();
  }

  getContext() {
    return this.#ctx;
  }

  getRadius() {
    return this.#radius;
  }

  getDiameter() {
    return this.#diameter;
  }

  setContextProperties(options) {
    for (let attribute in options) {
      this.setContextProperty(attribute, options[attribute]);
    }
  }

  setContextProperty(property, value) {
    const ctx = this.getContext();
    if (property === 'lineDash') {
      ctx.setLineDash(value);
    }
    ctx[property] = value;
  }

  at(loc) {
    if (loc.__proto__ === Point.prototype) {
      // scale up
      const x = (loc.getX() + 1) * this.getRadius();
      const y = (loc.getY() + 1) * this.getRadius();
      return [x, this.getDiameter() - y];
    } else if (loc.__proto__ === Array.prototype) {
      // scale down
      return new Point({
        x: loc[0] / this.getRadius() - 1,
        y: (this.getDiameter() - loc[1]) / this.getRadius() - 1,
      });
    }
  }

  clear() {
    this.getContext().clearRect(0, 0, this.getDiameter(), this.getDiameter());
  }

  #clip() {
    const ctx = this.getContext();
    const r = this.getRadius();
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
    const path = this.#getPathOrContext(options || {});
    let angle = rotation || 0;
    const r = this.getRadius();
    const difference = Math.TAU / n;
    for (let i = 0; i < n; i++) {
      const idealPoint = this.at(Point.givenEuclideanPolarCoordinates(1, angle));
      path.moveTo(r, r);
      path.lineTo(idealPoint[0], idealPoint[1]);
      angle += difference;
    }
    return path;
  }

  pathForReferenceGrid(n, options) {
    const path = this.#getPathOrContext(options || {});
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
    const path = this.#getPathOrContext(options || {});
    for (let i = 0; i < n; i++) {
      this.#pathForCircle(
        Circle.givenHyperbolicCenterRadius(Point.ORIGIN, r * (i + 1)),
        path,
      );
    }
    return path;
  }

  pathForEuclidean(object, options?) {
    options = options || {};
    return this.#pathFunctionForEuclidean(object)(
      object,
      this.#getPathOrContext(options),
      options,
    );
  }

  pathForHyperbolic(object, options?) {
    options = options || {};
    return this.#pathFunctionForHyperbolic(object)(
      object,
      this.#getPathOrContext(options),
      options,
    );
  }

  #pathForCircle(c, path) {
    const center = this.at(c.getEuclideanCenter());
    const start = this.at(c.euclideanPointAt(0));

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

  #pathForEuclideanLine(l, path, options) {
    const p1 = this.at(l.getP1());

    if (!options.connected) {
      const p0 = this.at(l.getP0());
      path.moveTo(p0[0], p0[1]);
    }
    path.lineTo(p1[0], p1[1]);
    return path;
  }

  #pathForEuclideanPoint(p, path) {
    const point = this.at(p);
    path.lineTo(point[0], point[1]);
    return path;
  }

  #pathForEuclideanPolygon(p, path) {
    const start = this.at(p.getVertices()[0]);
    path.moveTo(start[0], start[1]);

    const lines = p.getLines();
    for (let i = 0; i < lines.length; i++) {
      this.#pathForEuclideanLine(lines[i], path, { connected: true });
    }
    return path;
  }

  #pathForHyperbolicLine(l, path, options) {
    const geodesic = l.getHyperbolicGeodesic();

    if (geodesic instanceof Circle) {
      const p0 = this.at(l.getP0());
      const p1 = this.at(l.getP1());

      if (options.connected) {
        // not clear why this is necessary
        path.lineTo(p0[0], p0[1]);
      } else {
        // do not connect line to previous point on path
        path.moveTo(p0[0], p0[1]);
      }

      const control = this.at(
        Line.euclideanIntersect(
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
    } else if (geodesic instanceof Line) {
      return this.#pathForEuclideanLine(geodesic, path, options);
    } else {
      return false;
    }
  }

  #pathForHyperbolicPolygon(p, path, options) {
    const lines = p.getLines();
    const start = this.at(p.getVertices()[0]);
    if (options.infinite) {
      for (let i = 0; i < lines.length; i++) {
        this.#pathForHyperbolicLine(lines[i].getIdealLine(), path, options);
      }
    } else {
      path.moveTo(start[0], start[1]);

      for (let i = 0; i < lines.length; i++) {
        this.#pathForHyperbolicLine(lines[i], path, { connected: true });
      }
    }
    return path;
  }

  #pathFunctionForEuclidean(object) {
    let fn;
    switch (object.__proto__) {
      case Line.prototype:
        fn = this.#pathForEuclideanLine;
        break;
      case Circle.prototype:
        fn = this.#pathForCircle;
        break;
      case Polygon.prototype:
        fn = this.#pathForEuclideanPolygon;
        break;
      case Point.prototype:
        fn = this.#pathForEuclideanPoint;
        break;
      default:
        fn = function () {
          return false;
        };
        break;
    }
    return fn.bind(this);
  }

  #pathFunctionForHyperbolic(object) {
    let fn;
    switch (object.__proto__) {
      case Circle.prototype:
        fn = this.#pathForCircle;
        break;
      case Line.prototype:
        fn = this.#pathForHyperbolicLine;
        break;
      case Polygon.prototype:
        fn = this.#pathForHyperbolicPolygon;
        break;
      default:
        fn = function () {
          return false;
        };
        break;
    }
    return fn.bind(this);
  }

  #getPathOrContext(options) {
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
