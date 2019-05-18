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
