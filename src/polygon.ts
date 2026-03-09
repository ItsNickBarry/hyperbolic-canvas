import Angle from './angle.js';
import { HyperbolicCanvas } from './hyperbolic_canvas.js';
import Line from './line.js';
import Point from './point.js';

export default class Polygon {
  #vertices;
  #lines;

  constructor(options) {
    this.#vertices = options.vertices;
    this.#lines = options.lines;
  }

  getLines() {
    if (typeof this.#lines === 'undefined') {
      this.#lines = [];
      let vertices = this.getVertices();
      let n = vertices.length;
      for (let i = 0; i < vertices.length; i++) {
        this.#lines.push(
          Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]),
        );
      }
    }
    return this.#lines;
  }

  getVertices() {
    return this.#vertices;
  }

  static givenAnglesOfIdealVertices(angles) {
    if (angles.length < 3) {
      return false;
    }

    let vertices = [];

    angles.forEach(function (angle) {
      vertices.push(Point.givenIdealAngle(angle));
    });

    return Polygon.givenVertices(vertices);
  }

  static givenVertices(vertices) {
    if (vertices.length < 3) {
      return false;
    }

    return new Polygon({ vertices: vertices });
  }

  static givenEuclideanNCenterRadius(n, center, radius, rotation) {
    if (n < 3) {
      return false;
    }
    rotation = rotation ? Angle.normalize(rotation) : 0;

    let increment = Math.TAU / n;
    let vertices = [];

    for (let i = 0; i < n; i++) {
      vertices.push(center.euclideanDistantPoint(radius, rotation));
      rotation = Angle.normalize(rotation + increment);
    }

    return new Polygon({ vertices: vertices });
  }

  static givenHyperbolicNCenterRadius(n, center, radius, rotation) {
    if (n < 3) {
      return false;
    }
    if (!center.isOnPlane()) {
      return false;
    }
    rotation = rotation ? Angle.normalize(rotation) : 0;

    let increment = Math.TAU / n;
    let vertices = [];

    for (let i = 0; i < n; i++) {
      vertices.push(center.hyperbolicDistantPoint(radius, rotation));
      rotation = Angle.normalize(rotation + increment);
    }

    return new Polygon({ vertices: vertices });
  }
}

HyperbolicCanvas.Polygon = Polygon;
