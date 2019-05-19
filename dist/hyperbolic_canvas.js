(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./lib/hyperbolic_canvas.js');

},{"./lib/hyperbolic_canvas.js":5}],2:[function(require,module,exports){
const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Angle = HyperbolicCanvas.Angle = {};

Angle.normalize = function (angle) {
  if (angle < 0) {
    return Math.abs(Math.floor(angle / Math.TAU)) * Math.TAU + angle;
  } else if (angle >= Math.TAU) {
    return angle % Math.TAU;
  } else {
    return angle;
  }
};

Angle.fromDegrees = function (degrees) {
  return Angle.normalize(degrees * Angle.DEGREES_TO_RADIANS);
};

Angle.toDegrees = function (radians) {
  return (radians / Angle.DEGREES_TO_RADIANS) % 360;
};

Angle.opposite = function (angle) {
  return Angle.normalize(angle + Math.PI);
};

Angle.toSlope = function (angle) {
  // TODO should this return Infinity?
  return Math.tan(angle);
};

Angle.fromSlope = function (slope) {
  return Math.atan(slope);
};

Angle.random = function (quadrant) {
  let angle = Math.random() * Math.TAU;
  return quadrant ? angle / 4 + (Math.PI / 2 * ((quadrant - 1) % 4)) : angle;
};

Angle.DEGREES_TO_RADIANS = Math.PI / 180;

},{"./hyperbolic_canvas.js":5}],3:[function(require,module,exports){
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

},{"./hyperbolic_canvas.js":5}],4:[function(require,module,exports){
const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Circle = HyperbolicCanvas.Circle = function (options) {
  this._euclideanCenter = options.euclideanCenter;
  if (options.euclideanRadius < 0) {
    this._euclideanRadius = Math.abs(options.euclideanRadius);
  } else {
    this._euclideanRadius = options.euclideanRadius;
  }
  this._hyperbolicCenter = options.hyperbolicCenter;
  if (options.hyperbolicRadius < 0) {
    this._hyperbolicRadius = Math.abs(options.hyperbolicRadius);
  } else {
    this._hyperbolicRadius = options.hyperbolicRadius;
  }
};

Circle.prototype.getEuclideanArea = function () {
  if (typeof this._euclideanArea === 'undefined') {
    this._euclideanArea = Math.PI * Math.pow(this.getEuclideanRadius(), 2);
  }
  return this._euclideanArea;
};

Circle.prototype.getEuclideanCenter = function () {
  if (typeof this._euclideanCenter === 'undefined') {
    this._calculateEuclideanCenterRadius();
  }
  return this._euclideanCenter;
};

Circle.prototype.getEuclideanCircumference = function () {
  if (typeof this._euclideanCircumference === 'undefined') {
    this._euclideanCircumference = Math.TAU * this.getEuclideanRadius();
  }
  return this._euclideanCircumference;
};

Circle.prototype.getEuclideanDiameter = function () {
  return this.getEuclideanRadius() * 2;
};

Circle.prototype.getEuclideanRadius = function () {
  if (typeof this._euclideanRadius === 'undefined') {
    this._calculateEuclideanCenterRadius();
  }
  return this._euclideanRadius;
};

Circle.prototype.getHyperbolicArea = function () {
  if (typeof this._hyperbolicArea === 'undefined') {
    this._hyperbolicArea = Math.TAU *
                          (Math.cosh(this.getHyperbolicRadius()) - 1);
  }
  return this._hyperbolicArea;
};

Circle.prototype.getHyperbolicCenter = function () {
  if (typeof this._hyperbolicCenter === 'undefined') {
    this._calculateHyperbolicCenterRadius();
  }
  return this._hyperbolicCenter;
};

Circle.prototype.getHyperbolicCircumference = function () {
  if (typeof this._hyperbolicCircumference === 'undefined') {
    this._hyperbolicCircumference = Math.TAU *
                                    Math.sinh(this.getHyperbolicRadius());
  }
  return this._hyperbolicCircumference;
};

Circle.prototype.getHyperbolicDiameter = function () {
  return this.getHyperbolicRadius() * 2;
};

Circle.prototype.getHyperbolicRadius = function () {
  if (typeof this._hyperbolicRadius === 'undefined') {
    this._calculateHyperbolicCenterRadius();
  }
  return this._hyperbolicRadius;
};

Circle.prototype.getUnitCircleIntersects = function () {
  if (typeof this._unitCircleIntersects === 'undefined') {
    this._unitCircleIntersects = Circle.intersects(this, Circle.UNIT);
  }
  return this._unitCircleIntersects;
};

Circle.prototype.clone = function () {
  return Circle.givenEuclideanCenterRadius(
    this.getEuclideanCenter(),
    this.getEuclideanRadius()
  );
};

Circle.prototype.equals = function (otherCircle) {
  return this.getEuclideanCenter().equals(otherCircle.getEuclideanCenter()) &&
         Math.abs(
           this.getEuclideanRadius() - otherCircle.getEuclideanRadius()
         ) < HyperbolicCanvas.ZERO;
};

Circle.prototype.containsPoint = function (point) {
  return this.getEuclideanRadius() > point.euclideanDistanceTo(
    this.getEuclideanCenter()
  );
};

Circle.prototype.includesPoint = function (point) {
  return Math.abs(
    this.getEuclideanRadius() -
    point.euclideanDistanceTo(this.getEuclideanCenter())
  ) < HyperbolicCanvas.ZERO;
};

Circle.prototype.euclideanAngleAt = function (p) {
  let dx = p.getX() - this.getEuclideanCenter().getX();
  let dy = p.getY() - this.getEuclideanCenter().getY();
  return HyperbolicCanvas.Angle.normalize(Math.atan2(dy, dx));
};

Circle.prototype.euclideanPointAt = function (angle) {
  return HyperbolicCanvas.Point.givenCoordinates(
    this.getEuclideanRadius() * Math.cos(angle) +
      this.getEuclideanCenter().getX(),
    this.getEuclideanRadius() * Math.sin(angle) +
      this.getEuclideanCenter().getY()
  );
};

Circle.prototype.hyperbolicAngleAt = function (p) {
  return this.getHyperbolicCenter().hyperbolicAngleTo(p);
};

Circle.prototype.hyperbolicPointAt = function (angle) {
  return this.getHyperbolicCenter().hyperbolicDistantPoint(
    this.getHyperbolicRadius(),
    angle
  );
};

Circle.prototype.pointsAtX = function (x) {
  let values = this.yAtX(x);
  let points = [];
  values.forEach(function (y) {
    points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
  });
  return points;
};

Circle.prototype.pointsAtY = function (y) {
  let values = this.xAtY(y);
  let points = [];
  values.forEach(function (x) {
    points.push(HyperbolicCanvas.Point.givenCoordinates(x, y));
  });
  return points;
};

Circle.prototype.euclideanTangentAtAngle = function (angle) {
  return HyperbolicCanvas.Line.givenPointSlope(
    this.euclideanPointAt(angle),
    -1 / HyperbolicCanvas.Angle.toSlope(angle)
  );
};

Circle.prototype.euclideanTangentAtPoint = function (p) {
  // not very mathematical; point is not necessarily on circle
  return this.euclideanTangentAtAngle(this.euclideanAngleAt(p));
};

Circle.prototype.xAtY = function (y) {
  let center = this.getEuclideanCenter();
  let a = this._pythagoreanTheorem(y - center.getY());
  if (a) {
    return Math.abs(a) < HyperbolicCanvas.ZERO ? [center.getX()] : [center.getX() + a, center.getX() - a];
  } else {
    return a === 0 ? [center.getX()] : [];
  }
};

Circle.prototype.yAtX = function (x) {
  let center = this.getEuclideanCenter();
  let a = this._pythagoreanTheorem(x - center.getX());
  if (a) {
    return Math.abs(a) < HyperbolicCanvas.ZERO ? [center.getY()] : [center.getY() + a, center.getY() - a];
  } else {
    return a === 0 ? [center.getY()] : [];
  }
};

Circle.prototype._pythagoreanTheorem = function (b) {
  let c = this.getEuclideanRadius();
  let aSquared = Math.pow(c, 2) - Math.pow(b, 2);
  return Math.abs(aSquared) < HyperbolicCanvas.ZERO ? 0 : Math.sqrt(aSquared);
};

Circle.prototype._calculateEuclideanCenterRadius = function () {
  let center = this.getHyperbolicCenter();
  let farPoint = this.hyperbolicPointAt(
    center.getAngle()
  );
  let nearPoint = this.hyperbolicPointAt(
    HyperbolicCanvas.Angle.opposite(center.getAngle())
  );
  let diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
  this._euclideanCenter = diameter.getEuclideanMidpoint();
  this._euclideanRadius = diameter.getEuclideanLength() / 2;
};

Circle.prototype._calculateHyperbolicCenterRadius = function () {
  let center = this.getEuclideanCenter();

  if (center.getEuclideanRadius() + this.getEuclideanRadius() >= 1) {
    // TODO horocycles
    if (this.equals(Circle.UNIT)) {
      this._hyperbolicCenter = center;
      this._hyperbolicRadius = Infinity;
    } else {
      this._hyperbolicCenter = false;
      this._hyperbolicRadius = NaN;
    }
  } else {
    let farPoint = this.euclideanPointAt(
      center.getAngle()
    );
    let nearPoint = this.euclideanPointAt(
      HyperbolicCanvas.Angle.opposite(center.getAngle())
    );
    let diameter = HyperbolicCanvas.Line.givenTwoPoints(farPoint, nearPoint);
    this._hyperbolicCenter = diameter.getHyperbolicMidpoint();
    this._hyperbolicRadius = diameter.getHyperbolicLength() / 2;
  }
};

Circle.intersects = function (c0, c1) {
  // this function adapted from a post on Stack Overflow by 01AutoMonkey
  // and licensed CC BY-SA 3.0:
  // https://creativecommons.org/licenses/by-sa/3.0/legalcode
  let x0 = c0.getEuclideanCenter().getX();
  let y0 = c0.getEuclideanCenter().getY();
  let r0 = c0.getEuclideanRadius();
  let x1 = c1.getEuclideanCenter().getX();
  let y1 = c1.getEuclideanCenter().getY();
  let r1 = c1.getEuclideanRadius();

  let a, dx, dy, d, h, rx, ry;
  let x2, y2;

  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  dx = x1 - x0;
  dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  d = Math.sqrt((dy*dy) + (dx*dx));

  /* Check for solvability. */
  if (d > (r0 + r1)) {
    /* no solution. circles do not intersect. */
    return false;
  }
  if (d < Math.abs(r0 - r1)) {
    /* no solution. one circle is contained in the other */
    return false;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.
   */

  /* Determine the distance from point 0 to point 2. */
  a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

  /* Determine the coordinates of point 2. */
  x2 = x0 + (dx * a/d);
  y2 = y0 + (dy * a/d);

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  h = Math.sqrt((r0*r0) - (a*a));

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  rx = -dy * (h/d);
  ry = dx * (h/d);

  /* Determine the absolute intersection points. */
  let xi = x2 + rx;
  let xi_prime = x2 - rx;
  let yi = y2 + ry;
  let yi_prime = y2 - ry;

  let p0 = HyperbolicCanvas.Point.givenCoordinates(xi, yi);
  let p1 = HyperbolicCanvas.Point.givenCoordinates(xi_prime, yi_prime);
  return p0.equals(p1) ? [p0] : [p0, p1];
};

Circle.givenEuclideanCenterRadius = function (center, radius) {
  return new Circle({ euclideanCenter: center, euclideanRadius: radius });
};

Circle.givenHyperbolicCenterRadius = function (center, radius) {
  if (!center.isOnPlane()) {
    return false;
  }
  return new Circle({ hyperbolicCenter: center, hyperbolicRadius: radius });
};

Circle.givenTwoPoints = function (p0, p1) {
  let l = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
  return new Circle({
    euclideanCenter: l.getEuclideanMidpoint(),
    euclideanRadius: l.getEuclideanLength() / 2
  });
};

Circle.givenThreePoints = function (p0, p1, p2) {
  if (!(p0 && p1 && p2)) {
    //not all points exist
    return false;
  }
  if (p0.equals(p1) || p0.equals(p2) || p1.equals(p2)) {
    // points are not unique
    return false;
  }
  let b0 = HyperbolicCanvas.Line.givenTwoPoints(p0, p1);
  let b1 = HyperbolicCanvas.Line.givenTwoPoints(p1, p2);
  if (b0.equals(b1)) {
    // all three points are colinear
    return false;
  }
  let center = HyperbolicCanvas.Line.euclideanIntersect(
    b0.euclideanPerpindicularBisector(),
    b1.euclideanPerpindicularBisector()
  );
  let radius = HyperbolicCanvas.Line.givenTwoPoints(
    p0,
    center
  ).getEuclideanLength();
  return new Circle({ euclideanCenter: center, euclideanRadius: radius });
};

Circle.UNIT = new Circle({});

Circle.UNIT.getEuclideanArea = function () { return Math.PI; };

Circle.UNIT.getEuclideanCenter =
Circle.UNIT.getHyperbolicCenter = function () {
  return HyperbolicCanvas.Point.ORIGIN;
};

Circle.UNIT.getEuclideanCircumference = function () { return Math.TAU; };

Circle.UNIT.getEuclideanDiameter = function () { return 2; };

Circle.UNIT.getEuclideanRadius = function () { return 1; };

Circle.UNIT.getHyperbolicArea =
Circle.UNIT.getHyperbolicCircumference =
Circle.UNIT.getHyperbolicDiameter =
Circle.UNIT.getHyperbolicRadius = function () { return Infinity; };

Circle.UNIT.hyperbolicAngleAt =
Circle.UNIT.euclideanAngleAt = function (point) {
  return point.getAngle();
};

Circle.UNIT.hyperbolicPointAt =
Circle.UNIT.euclideanPointAt = function (angle) {
  return HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(1, angle);
};

},{"./hyperbolic_canvas.js":5}],5:[function(require,module,exports){
(function (global){
const HyperbolicCanvas = module.exports = global.HyperbolicCanvas = {};

// modules attach themselves to HyperbolicCanvas and do not include exports
require('./angle.js');
require('./point.js');
require('./line.js');
require('./circle.js');
require('./polygon.js');
require('./canvas.js');

HyperbolicCanvas.create = function (selector) {
  return new HyperbolicCanvas.Canvas({
    el: document.querySelector(selector) || document.createElement('div'),
  });
};

HyperbolicCanvas.INFINITY = 1e12;
HyperbolicCanvas.ZERO = 1e-6;

Math.TAU = 2 * Math.PI;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./angle.js":2,"./canvas.js":3,"./circle.js":4,"./line.js":6,"./point.js":7,"./polygon.js":8}],6:[function(require,module,exports){
const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Line = HyperbolicCanvas.Line = function (options) {
  this._p0 = options.p0;
  this._p1 = options.p1;
  this._m = options.m === -Infinity ? Infinity : options.m;
  this._euclideanUnitCircleIntersects = options.euclideanUnitCircleIntersects;
  this._idealPoints = options.idealPoints;
};

Line.prototype.getHyperbolicGeodesic = function () {
  if (typeof this._geodesic === 'undefined') {
    if (this.getP0().isIdeal() || this.getP1().isIdeal()) {
      if (this.getP0().isIdeal() && this.getP1().isIdeal()) {
        // both points are ideal
        this._calculateGeodesicThroughTwoIdealPoints();
      } else {
        // one point is on plane
        this._calculateGeodesicThroughOnePointOnPlane();
      }
    } else if (!this.isOnPlane()) {
      // either Point is not well defined, so geodesic is not defined
      this._geodesic = false;
    } else if (
      this.getP0().equals(HyperbolicCanvas.Point.ORIGIN) ||
      this.getP1().equals(HyperbolicCanvas.Point.ORIGIN)
    ) {
      // either Point is at origin, so geodesic is a Line
      this._geodesic = this;
    } else {
      // both Points are on plane; only need one
      this._calculateGeodesicThroughOnePointOnPlane();
    }
  }
  return this._geodesic;
};

Line.prototype.getEuclideanLength = function () {
  if (typeof this._euclideanLength === 'undefined') {
    this._euclideanLength = this.getP0().euclideanDistanceTo(this.getP1());
  }
  return this._euclideanLength;
};

Line.prototype.getEuclideanMidpoint = function () {
  if (typeof this._euclideanMidpoint === 'undefined') {
    this._euclideanMidpoint = HyperbolicCanvas.Point.euclideanBetween(
      this.getP0(),
      this.getP1()
    );
  }
  return this._euclideanMidpoint;
};

Line.prototype.getHyperbolicLength = function () {
  if (typeof this._hyperbolicLength === 'undefined') {
    this._hyperbolicLength = this.getP0().hyperbolicDistanceTo(this.getP1());
  }
  return this._hyperbolicLength;
};

Line.prototype.getHyperbolicMidpoint = function () {
  if (typeof this._hyperbolicMidpoint === 'undefined') {
    if (this.isOnPlane()) {
      this._hyperbolicMidpoint = this.getP0().hyperbolicDistantPoint(
        this.getHyperbolicLength() / 2,
        this.getP0().hyperbolicAngleTo(this.getP1())
      );
    } else {
      this._hyperbolicMidpoint = false;
    }
  }
  return this._hyperbolicMidpoint;
};

Line.prototype.getIdealLine = function () {
  if (typeof this._idealLine === 'undefined') {
    this._idealLine = Line.givenTwoPoints(
      this.getIdealPoints()[0],
      this.getIdealPoints()[1]
    );
  }
  return this._idealLine;
};

Line.prototype.getIdealPoints = function () {
  if (typeof this._idealPoints === 'undefined') {
    let g = this.getHyperbolicGeodesic();
    if (g === false) {
      this._idealPoints = false;
    } else if (g === this) {
      this._idealPoints = this.getEuclideanUnitCircleIntersects();
    } else {
      this._idealPoints = g.getUnitCircleIntersects();
    }
  }
  return this._idealPoints;
};

Line.prototype.getP0 = function () {
  return this._p0;
};

Line.prototype.getP1 = function () {
  if (typeof this._p1 === 'undefined') {
    let x, y;
    let p = this.getP0();
    let m = this.getSlope();
    if (m === Infinity) {
      x = p.getX();
      y = p.getY() ? p.getY() * 2 : p.getY() + 1;
    } else if (m === 0) {
      x = p.getX() ? p.getX() * 2 : p.getX() + 1;
      y = p.getY();
    } else {
      x = 0;
      y = p.getY() - m * p.getX();
    }
    this._p1 = HyperbolicCanvas.Point.givenCoordinates(x, y);
  }
  return this._p1;
};

Line.prototype.getSlope = function () {
  if (typeof this._m === 'undefined') {
    this._m = (this.getP0().getY() - this.getP1().getY()) /
                  (this.getP0().getX() - this.getP1().getX());
    if (Math.abs(this._m) > HyperbolicCanvas.INFINITY) {
      this._m = Infinity;
    }
  }
  return this._m;
};

Line.prototype.getEuclideanUnitCircleIntersects = function () {
  if (typeof this._euclideanUnitCircleIntersects === 'undefined') {
    let m = this.getSlope();

    if (m > HyperbolicCanvas.INFINITY) {
      let x0, x1, y0, y1;
      x0 = x1 = this.getP0().getX();
      y0 = Math.sqrt(1 - x0 * x0);
      y1 = -1 * y0;
      return [
        HyperbolicCanvas.Point.givenCoordinates(x0, y0),
        HyperbolicCanvas.Point.givenCoordinates(x1, y1)
      ];
    }

    //quadratic formula
    let a = Math.pow(m, 2) + 1;

    // calculate discriminant
    let x = this.getP0().getX();
    let y = this.getP0().getY();

    let b = m * 2 * (y - m * x);
    let c = Math.pow(y, 2) + Math.pow(x * m, 2) - (2 * m * x * y) - 1;

    let discriminant = b * b - (4 * a * c);

    if (discriminant < 0) {
      return false;
    }

    let x0 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);
    let y0 = this.euclideanYAtX(x0);
    let p0 = HyperbolicCanvas.Point.givenCoordinates(x0, y0);

    if (discriminant === 0) {
      return [p0];
    }

    let x1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
    let y1 = this.euclideanYAtX(x1);

    let p1 = HyperbolicCanvas.Point.givenCoordinates(x1, y1);

    this._euclideanUnitCircleIntersects = [p0, p1];
  }
  return this._euclideanUnitCircleIntersects;
};

Line.prototype.clone = function () {
  return Line.givenTwoPoints(this.getP0(), this.getP1());
};

Line.prototype.euclideanIncludesPoint = function (point) {
  if (this.getSlope() === Infinity) {
    return this.getP0().getX() === point.getX();
  }
  return Math.abs(
    (point.getY() - this.getP0().getY()) -
    (this.getSlope() * (point.getX() - this.getP0().getX()))
  ) < HyperbolicCanvas.ZERO;
};

Line.prototype.hyperbolicIncludesPoint = function (point) {
  if (!(point.isOnPlane() ^ point.isIdeal())) {
    return false;
  }
  let g = this.getHyperbolicGeodesic();
  if (g instanceof HyperbolicCanvas.Circle) {
    return g.includesPoint(point);
  } else if (g instanceof Line) {
    return this.euclideanIncludesPoint(point);
  } else {
    return false;
  }
};

Line.prototype.equals = function (otherLine) {
  return this.isEuclideanParallelTo(otherLine) &&
         this.euclideanIncludesPoint(otherLine.getP0());
};

Line.prototype.hyperbolicEquals = function (otherLine) {
  let g = this.getHyperbolicGeodesic();
  let otherG = otherLine.getHyperbolicGeodesic();
  if (
    g instanceof HyperbolicCanvas.Circle &&
    otherG instanceof HyperbolicCanvas.Circle
  ) {
    return g.equals(otherG);
  } else if (g instanceof Line && otherG instanceof Line) {
    return g.equals(otherG);
  } else {
    return false;
  }
};

Line.prototype.euclideanIntersectsWithCircle = function (circle) {
  // rotate circle and line by same amount about origin such that line
  // becomes the x-axis

  let angleOffset = HyperbolicCanvas.Angle.fromSlope(this.getSlope()) * -1;

  let offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
    circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
    circle.getEuclideanRadius()
  );

  // distance from line to origin
  let lineOffset = Line.euclideanIntersect(
    this,
    this.euclideanPerpindicularLineAt(HyperbolicCanvas.Point.ORIGIN)
  ).euclideanDistanceTo(HyperbolicCanvas.Point.ORIGIN);

  // line passes above or below origin
  lineOffset *= this.euclideanYAtX(0) > 0 ? 1 : -1;

  let offsetIntersects = offsetCircle.pointsAtY(lineOffset);
  let intersects = [];
  for (let i = 0; i < offsetIntersects.length; i++) {
    intersects.push(offsetIntersects[i].rotateAboutOrigin(angleOffset * -1));
  }
  return intersects;
};

Line.prototype.hyperbolicIntersectsWithCircle = function (circle) {
  let g = this.getHyperbolicGeodesic();

  if (g instanceof HyperbolicCanvas.Circle) {
    return HyperbolicCanvas.Circle.intersects(g, circle);
  } else if (g instanceof Line) {
    return this.euclideanIntersectsWithCircle(circle);
  } else {
    return false;
  }
};

Line.prototype.euclideanXAtY = function (y) {
  if (this.getSlope() === 0) {
    // TODO use Infinity/undefined instead of true/false ?
    return y === this.getP0().getY();
  } else {
    return (y - this.getP0().getY()) / this.getSlope() + this.getP0().getX();
  }
};

Line.prototype.euclideanYAtX = function (x) {
  if (this.getSlope() === Infinity) {
    return x === this.getP0().getX();
  } else {
    return (x - this.getP0().getX()) * this.getSlope() + this.getP0().getY();
  }
};

Line.prototype.isIdeal = function () {
  return this.getP0().isIdeal() || this.getP1().isIdeal();
};

Line.prototype.isOnPlane = function () {
  return this.getP0().isOnPlane() && this.getP1().isOnPlane();
};

Line.prototype.isEuclideanParallelTo = function (otherLine) {
  return Math.abs(this.getSlope() - otherLine.getSlope()) < HyperbolicCanvas.ZERO;
};

Line.prototype.isHyperbolicParallelTo = function (otherLine) {
  return Line.hyperbolicIntersect(this, otherLine) === false;
};

Line.prototype.euclideanPerpindicularBisector = function () {
  return this.euclideanPerpindicularLineAt(this.getEuclideanMidpoint());
};

Line.prototype.euclideanPerpindicularLineAt = function (point) {
  return Line.givenPointSlope(point, this.euclideanPerpindicularSlope());
};

Line.prototype.euclideanPerpindicularSlope = function () {
  let slope = this.getSlope();
  if (slope === Infinity) {
    return 0;
  } else if (slope === 0) {
    return Infinity;
  } else {
    return -1 / slope;
  }
};

Line.prototype.pointAtEuclideanX = function (x) {
  let y = this.euclideanYAtX(x);
  if (typeof y === 'boolean') {
    if (y) { y = 0; } else { return y; }
  }
  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.prototype.pointAtEuclideanY = function (y) {
  let x = this.euclideanXAtY(y);
  if (typeof x === 'boolean') {
    if (x) { x = 0; } else { return x; }
  }
  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.prototype._calculateGeodesicThroughTwoIdealPoints = function () {
  let a0 = this.getP0().getAngle();
  let a1 = this.getP1().getAngle();
  if (Math.abs(a0 - HyperbolicCanvas.Angle.opposite(a1)) < HyperbolicCanvas.ZERO) {
    this._geodesic = this;
  } else {
    let t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      this.getP0()
    );
    let t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
      this.getP1()
    );
    let center = Line.euclideanIntersect(t0, t1);
    this._geodesic = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      center,
      center.euclideanDistanceTo(this.getP0())
    );
  }
};

Line.prototype._calculateGeodesicThroughOnePointOnPlane = function () {
  let l0 = Line.givenTwoPoints(this.getP0(), HyperbolicCanvas.Point.ORIGIN);
  let l1 = Line.givenTwoPoints(this.getP1(), HyperbolicCanvas.Point.ORIGIN);

  if (l0.equals(l1)) {
    // both points are colinear with origin, so geodesic is a Line, itself
    return this._geodesic = this;
  }

  // get the line through point on plane, which is perpindicular to origin
  // get intersects of that line with unit circle
  let intersects;

  if (this.getP0().isIdeal()) {
    intersects = l1.euclideanPerpindicularLineAt(
      this.getP1()
    ).getEuclideanUnitCircleIntersects();
  } else {
    intersects = l0.euclideanPerpindicularLineAt(
      this.getP0()
    ).getEuclideanUnitCircleIntersects();
  }

  if (!intersects || intersects.length < 2) {
    // line is outside of or tangent to unit circle
    return this._geodesic = false;
  }

  let t0 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
    intersects[0]
  );
  let t1 = HyperbolicCanvas.Circle.UNIT.euclideanTangentAtPoint(
    intersects[1]
  );

  let c = Line.euclideanIntersect(t0, t1);

  this._geodesic = HyperbolicCanvas.Circle.givenThreePoints(
    this.getP0(),
    this.getP1(),
    c
  );
};

Line.euclideanIntersect = function (l0, l1) {
  let x, y;

  let l0m = l0.getSlope();
  let l1m = l1.getSlope();

  if (l0m === l1m) {
    // lines are parallel; lines may also be the same line
    return false;
  }

  let l0x = l0.getP0().getX();
  let l1x = l1.getP0().getX();
  let l0y = l0.getP0().getY();
  let l1y = l1.getP0().getY();

  if (l0m === Infinity) {
    x = l0x;
  } else if (l1m === Infinity) {
    x = l1x;
  } else {
    x = (l0x * l0m - l1x * l1m + l1y - l0y) / (l0m - l1m);
  }

  if (l0m === 0) {
    y = l0y;
  } else if (l1m === 0) {
    y = l1y;
  } else {
    y = l0m === Infinity ?
      l1m * (x - l1x) + l1y
      :
      l0m * (x - l0x) + l0y
    ;
  }

  return HyperbolicCanvas.Point.givenCoordinates(x, y);
};

Line.hyperbolicIntersect = function (l0, l1) {
  if (!(l0.isOnPlane() && l1.isOnPlane())) {
    return false;
  }
  let g0 = l0.getHyperbolicGeodesic();
  let g1 = l1.getHyperbolicGeodesic();

  let g0IsLine = g0 instanceof Line;
  let g1IsLine = g1 instanceof Line;

  if (g0IsLine || g1IsLine) {
    if (g0IsLine && g1IsLine) {
      return HyperbolicCanvas.Point.ORIGIN;
    }
    let circle = g0IsLine ? g1 : g0;
    let line = g0IsLine ? g0 : g1;

    let angleOffset = HyperbolicCanvas.Angle.fromSlope(line.getSlope()) * -1;

    let offsetCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(
      circle.getEuclideanCenter().rotateAboutOrigin(angleOffset),
      circle.getEuclideanRadius()
    );

    let offsetIntersects = offsetCircle.pointsAtY(0);
    let intersects = [];
    for (let i = 0; i < offsetIntersects.length; i++) {
      intersects.push(
        offsetIntersects[i].rotateAboutOrigin(angleOffset * -1)
      );
    }

    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].isOnPlane()) {
        return intersects[i];
      }
    }
    return false;
  }

  let intersects = HyperbolicCanvas.Circle.intersects(g0, g1);

  if (!intersects) {
    return false;
  }

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].isOnPlane()) {
      return intersects[i];
    }
  }
  // this should never happen
  return false;
};

Line.randomSlope = function () {
  return HyperbolicCanvas.Angle.toSlope(HyperbolicCanvas.Angle.random());
};

Line.givenPointSlope = function (p, slope) {
  return new Line({ p0: p, m: Math.abs(slope) > HyperbolicCanvas.INFINITY ? Infinity : slope });
};

Line.givenTwoPoints = function (p0, p1) {
  return new Line({ p0: p0, p1: p1 });
};

Line.givenAnglesOfIdealPoints = function (a0, a1) {
  let points = [
    HyperbolicCanvas.Point.givenIdealAngle(a0),
    HyperbolicCanvas.Point.givenIdealAngle(a1)
  ];
  return new Line({
    p0: points[0],
    p1: points[1],
    euclideanUnitCircleIntersects: points,
    idealPoints: points
  });
};

Line.X_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: 0 });

Line.Y_AXIS = new Line({ p0: HyperbolicCanvas.Point.ORIGIN, m: Infinity });

},{"./hyperbolic_canvas.js":5}],7:[function(require,module,exports){
const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Point = HyperbolicCanvas.Point = function (options) {
  this._angle = options.angle;
  this._euclideanRadius = options.euclideanRadius;
  this._direction = options.direction;
  this._hyperbolicRadius = options.hyperbolicRadius;
  this._x = options.x;
  this._y = options.y;
};

Point.prototype.getAngle = function () {
  if (typeof this._angle === 'undefined') {
    this._angle = HyperbolicCanvas.Angle.normalize(Math.atan2(
      this.getY(),
      this.getX()
    ));
  }
  return this._angle;
};

Point.prototype.getDirection = function (direction) {
  if (typeof direction !== 'undefined') {
    return HyperbolicCanvas.Angle.normalize(direction);
  }
  if (typeof this._direction !== 'undefined') {
    return this._direction;
  }
  return this.getAngle();
};

Point.prototype.getEuclideanRadius = function () {
  if (typeof this._euclideanRadius === 'undefined') {
    if (typeof this._x === 'undefined' || this._y === 'undefined') {
      if (this.getHyperbolicRadius() === Infinity) {
        this._euclideanRadius = 1;
      } else {
        this._euclideanRadius = (Math.exp(this.getHyperbolicRadius()) - 1) /
                                (Math.exp(this.getHyperbolicRadius()) + 1);
      }
    } else {
      this._euclideanRadius = Math.sqrt(
        Math.pow(this.getX(), 2) +
        Math.pow(this.getY(), 2)
      );
    }
    if (Math.abs(this._euclideanRadius - 1) < HyperbolicCanvas.ZERO) {
      this._euclideanRadius = 1;
    }
  }
  return this._euclideanRadius;
};

Point.prototype.getHyperbolicRadius = function () {
  if (typeof this._hyperbolicRadius === 'undefined') {
    if (this.isIdeal()) {
      this._hyperbolicRadius = Infinity;
    } else {
      this._hyperbolicRadius = 2 * Math.atanh(this.getEuclideanRadius());
    }
  }
  return this._hyperbolicRadius;
};

Point.prototype.getX = function () {
  if (typeof this._x === 'undefined') {
    this._x = this.getEuclideanRadius() * Math.cos(this.getAngle());
  }
  return this._x;
};

Point.prototype.getY = function () {
  if (typeof this._y === 'undefined') {
    this._y = this.getEuclideanRadius() * Math.sin(this.getAngle());
  }
  return this._y;
};

Point.prototype.equals = function (otherPoint) {
  return Math.abs(this.getX() - otherPoint.getX()) < HyperbolicCanvas.ZERO &&
         Math.abs(this.getY() - otherPoint.getY()) < HyperbolicCanvas.ZERO;
};

Point.prototype.clone = function () {
  return new Point({
    angle: this._angle,
    direction: this._direction,
    euclideanRadius: this._euclideanRadius,
    hyperbolicRadius: this._hyperbolicRadius,
    x: this._x,
    y: this._y
  });
};

Point.prototype.euclideanAngleFrom = function (otherPoint) {
  return otherPoint.euclideanAngleTo(this);
};

Point.prototype.euclideanAngleTo = function (otherPoint) {
  return HyperbolicCanvas.Angle.normalize(Math.atan2(
    otherPoint.getY() - this.getY(),
    otherPoint.getX() - this.getX()
  ));
};

Point.prototype.euclideanDistanceTo = function (otherPoint) {
  return Math.sqrt(
    Math.pow(this.getX() - otherPoint.getX(), 2) +
    Math.pow(this.getY() - otherPoint.getY(), 2)
  );
};

Point.prototype.euclideanDistantPoint = function (distance, direction) {
  let bearing = this.getDirection(direction);
  let distantPoint = Point.givenCoordinates(
    this.getX() + Math.cos(bearing) * distance,
    this.getY() + Math.sin(bearing) * distance
  );
  distantPoint._setDirection(bearing);
  return distantPoint;
};

Point.prototype.hyperbolicAngleFrom = function (otherPoint) {
  return otherPoint.hyperbolicAngleTo(this);
};

Point.prototype.hyperbolicAngleTo = function (otherPoint) {
  let geodesic = HyperbolicCanvas.Line.givenTwoPoints(
    this,
    otherPoint
  ).getHyperbolicGeodesic();

  let intersect;

  if (geodesic instanceof HyperbolicCanvas.Circle) {
    let t0 = geodesic.euclideanTangentAtPoint(this);
    let t1 = geodesic.euclideanTangentAtPoint(otherPoint);
    intersect = HyperbolicCanvas.Line.euclideanIntersect(t0, t1);
  } else {
    intersect = otherPoint;
  }
  return this.euclideanAngleTo(intersect);
};

Point.prototype.hyperbolicDistanceTo = function (otherPoint) {
  if (this.isIdeal() || otherPoint.isIdeal()) {
    return Infinity;
  }
  let b = this.getHyperbolicRadius();
  let c = otherPoint.getHyperbolicRadius();
  let alpha = this.getAngle() - otherPoint.getAngle();

  return Math.acosh(
    Math.cosh(b) * Math.cosh(c) -
    Math.sinh(b) * Math.sinh(c) * Math.cos(alpha)
  );
};

Point.prototype.hyperbolicDistantPoint = function (distance, direction) {
  /*
    Hyperbolic Law of Cosines
    cosh(a) === cosh(b)cosh(c) - sinh(b)sinh(c)cos(alpha)

    A: this point
    B: distant point
    C: origin
    a: hyperbolic radius of distant point
    b: hyperbolic radius of this point
    c: distance from this point to distant point
    alpha, beta, gamma: angles of triangle ABC at A, B, and C, respectively

    bearing: direction from this point to distant point
    aAngle: direction from origin to this point
    bAngle: direction from origin to distant point
  */
  // TODO hyperbolic law of haversines
  // TODO throw exception if direction is not provided or stored; do not default to this.getAngle()
  // TODO allow distance of Infinity, return ideal Point
  let bearing = this.getDirection(direction);

  let c = distance;

  if (Math.abs(c) < HyperbolicCanvas.ZERO) {
    let point = this.clone();
    point._setDirection(bearing);
    return point;
  }
  if (this.equals(Point.ORIGIN)) {
    let point = Point.givenHyperbolicPolarCoordinates(c, bearing);
    point._setDirection(bearing);
    return point;
  }

  let aAngle = this.getAngle();
  let b = this.getHyperbolicRadius();

  if (Math.abs(aAngle - bearing) < HyperbolicCanvas.ZERO) {
    let point = Point.givenHyperbolicPolarCoordinates(b + c, aAngle);
    point._setDirection(bearing);
    return point;
  }

  let alpha = Math.abs(Math.PI - Math.abs(aAngle - bearing));

  if (alpha < HyperbolicCanvas.ZERO) {
    let point = Point.givenHyperbolicPolarCoordinates(b - c, aAngle);
    point._setDirection(bearing);
    return point;
  }

  // save hyperbolic functions which are called more than once
  let coshb = Math.cosh(b);
  let coshc = Math.cosh(c);
  let sinhb = Math.sinh(b);
  let sinhc = Math.sinh(c);

  let a = Math.acosh(coshb * coshc - sinhb * sinhc * Math.cos(alpha));

  let cosha = Math.cosh(a);
  let sinha = Math.sinh(a);

  // correct potential floating point error before calling acos
  let cosgamma = (cosha * coshb - coshc) / (sinha * sinhb);
  cosgamma = cosgamma > 1 ? 1 : cosgamma < -1 ? -1 : cosgamma;
  let gamma = Math.acos(cosgamma);

  // determine whether aAngle is +/- gamma
  let aAngleOpposite = HyperbolicCanvas.Angle.opposite(aAngle);
  let dir = aAngle > aAngleOpposite ?
    bearing > aAngleOpposite && bearing < aAngle ? -1 : 1
    :
    bearing > aAngle && bearing < aAngleOpposite ? 1 : -1
  ;

  let bAngle = HyperbolicCanvas.Angle.normalize(aAngle + gamma * dir);
  let distantPoint = Point.givenHyperbolicPolarCoordinates(a, bAngle);

  // correct potential floating point error before calling acos
  let cosbeta = (cosha * coshc - coshb) / (sinha * sinhc);
  cosbeta = cosbeta > 1 ? 1 : cosbeta < -1 ? -1 : cosbeta;
  let beta = Math.acos(cosbeta);

  distantPoint._setDirection(bAngle + beta * dir);

  return distantPoint;
};

Point.prototype.isIdeal = function () {
  return this._euclideanRadius === 1 ||
         this._hyperbolicRadius === Infinity ||
         this.getEuclideanRadius() === 1;
};

Point.prototype.isOnPlane = function () {
  return this._euclideanRadius < 1 ||
         this._hyperbolicRadius < Infinity ||
         this.getEuclideanRadius() < 1;
};

Point.prototype.opposite = function () {
  return Point.givenEuclideanPolarCoordinates(
    this.getEuclideanRadius(),
    HyperbolicCanvas.Angle.opposite(this.getAngle())
  );
};

Point.prototype.quadrant = function () {
  return Math.floor(this.getAngle() / (Math.PI / 2) + 1);
};

Point.prototype.rotateAboutOrigin = function (angle) {
  return Point.givenEuclideanPolarCoordinates(
    this.getEuclideanRadius(),
    this.getAngle() + angle
  );
};

Point.prototype._setDirection = function (direction) {
  this._direction = HyperbolicCanvas.Angle.normalize(direction);
};

Point.euclideanBetween = function (p0, p1) {
  return new Point({
    x: (p0.getX() + p1.getX()) / 2,
    y: (p0.getY() + p1.getY()) / 2
  });
};

Point.hyperbolicBetween = function (p0, p1) {
  if (!(p0.isOnPlane() && p1.isOnPlane())) {
    return false;
  }
  let d = p0.hyperbolicDistanceTo(p1);
  return p0.hyperbolicDistantPoint(d / 2, p0.hyperbolicAngleTo(p1));
};

Point.givenCoordinates = function (x, y) {
  return new Point({ x: x, y: y });
};

Point.givenEuclideanPolarCoordinates = function (radius, angle) {
  if (radius < 0) {
    angle += Math.PI;
    radius = Math.abs(radius);
  }

  return new Point({
    angle: HyperbolicCanvas.Angle.normalize(angle),
    euclideanRadius: radius
  });
};

Point.givenHyperbolicPolarCoordinates = function (radius, angle) {
  // returns NaN coordinates at distance > 709
  // at angle 0, indistinguishable from limit at distance > 36
  if (radius < 0) {
    angle += Math.PI;
    radius = Math.abs(radius);
  }

  return new Point({
    angle: HyperbolicCanvas.Angle.normalize(angle),
    hyperbolicRadius: radius
  });
};

Point.givenIdealAngle = function (angle) {
  return Point.givenEuclideanPolarCoordinates(1, angle);
};

Point.random = function (quadrant) {
  return Point.givenEuclideanPolarCoordinates(
    Math.random(),
    HyperbolicCanvas.Angle.random(quadrant)
  );
};

Point.ORIGIN = Point.CENTER = new Point({ x: 0, y: 0 });

Point.ORIGIN.getAngle =
Point.ORIGIN.getEuclideanRadius =
Point.ORIGIN.getHyperbolicRadius =
Point.ORIGIN.getX =
Point.ORIGIN.getY = function () { return 0; };

Point.ORIGIN.euclideanAngleFrom =
Point.ORIGIN.hyperbolicAngleFrom = function (otherPoint) {
  return HyperbolicCanvas.Angle.opposite(this.euclideanAngleTo(otherPoint));
};

Point.ORIGIN.euclideanAngleTo =
Point.ORIGIN.hyperbolicAngleTo = function (otherPoint) {
  return otherPoint.getAngle();
};

Point.ORIGIN.euclideanDistanceTo = function (otherPoint) {
  return otherPoint.getEuclideanRadius();
};

Point.ORIGIN.hyperbolicDistanceTo = function (otherPoint) {
  return otherPoint.getHyperbolicRadius();
};

Point.ORIGIN.euclideanDistantPoint = function (distance, direction) {
  return Point.givenEuclideanCenterRadius(
    distance,
    this.getDirection(direction)
  );
};

Point.ORIGIN.hyperbolicDistantPoint = function (distance, direction) {
  return Point.givenHyperbolicPolarCoordinates(
    distance,
    this.getDirection(direction)
  );
};

},{"./hyperbolic_canvas.js":5}],8:[function(require,module,exports){
const HyperbolicCanvas = require('./hyperbolic_canvas.js');

let Polygon = HyperbolicCanvas.Polygon = function (options) {
  this._vertices = options.vertices;
  this._lines = options.lines;
};

Polygon.prototype.getLines = function () {
  if (typeof this._lines === 'undefined') {
    this._lines = [];
    let vertices = this.getVertices();
    let n = vertices.length;
    for (let i = 0; i < vertices.length; i++) {
      this._lines.push(HyperbolicCanvas.Line.givenTwoPoints(
        vertices[i],
        vertices[(i + 1) % n]
      ));
    }
  }
  return this._lines;
};

Polygon.prototype.getVertices = function () {
  return this._vertices;
};

Polygon.givenAnglesOfIdealVertices = function (angles) {
  if (angles.length < 3) {
    return false;
  }

  let vertices = [];

  angles.forEach(function (angle) {
    vertices.push(HyperbolicCanvas.Point.givenIdealAngle(angle));
  });

  return Polygon.givenVertices(vertices);
};

Polygon.givenVertices = function (vertices) {
  if (vertices.length < 3) {
    return false;
  }

  return new Polygon({ vertices: vertices });
};

Polygon.givenEuclideanNCenterRadius = function (n, center, radius, rotation) {
  if (n < 3) {
    return false;
  }
  rotation = rotation ? HyperbolicCanvas.Angle.normalize(rotation) : 0;

  let increment = Math.TAU / n;
  let vertices = [];

  for (let i = 0; i < n; i++) {
    vertices.push(center.euclideanDistantPoint(radius, rotation));
    rotation = HyperbolicCanvas.Angle.normalize(rotation + increment);
  }

  return new Polygon({ vertices: vertices });
};

Polygon.givenHyperbolicNCenterRadius = function (n, center, radius, rotation) {
  if (n < 3) {
    return false;
  }
  if (!center.isOnPlane()) {
    return false;
  }
  rotation = rotation ? HyperbolicCanvas.Angle.normalize(rotation) : 0;

  let increment = Math.TAU / n;
  let vertices = [];

  for (let i = 0; i < n; i++) {
    vertices.push(center.hyperbolicDistantPoint(radius, rotation));
    rotation = HyperbolicCanvas.Angle.normalize(rotation + increment);
  }

  return new Polygon({ vertices: vertices });
};

},{"./hyperbolic_canvas.js":5}]},{},[1]);
