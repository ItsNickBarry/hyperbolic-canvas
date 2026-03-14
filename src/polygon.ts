import Angle from './angle.js';
import { TAU } from './constants.js';
import Line from './line.js';
import Point from './point.js';

interface PolygonOptions {
  vertices: Point[];
  lines?: Line[];
}

export default class Polygon {
  #vertices: Point[];
  #lines?: Line[];

  constructor(options: PolygonOptions) {
    this.#vertices = options.vertices;
    this.#lines = options.lines;
  }

  getLines(): Line[] {
    if (typeof this.#lines === 'undefined') {
      this.#lines = [];
      const vertices = this.getVertices();
      const n = vertices.length;
      for (let i = 0; i < vertices.length; i++) {
        this.#lines.push(
          Line.givenTwoPoints(vertices[i], vertices[(i + 1) % n]),
        );
      }
    }
    return this.#lines;
  }

  getVertices(): Point[] {
    return this.#vertices;
  }

  static givenAnglesOfIdealVertices(angles: number[]): Polygon {
    if (angles.length < 3) {
      throw new Error('At least 3 angles are required');
    }

    const vertices: Point[] = [];

    angles.forEach(function (angle) {
      vertices.push(Point.givenIdealAngle(angle));
    });

    return Polygon.givenVertices(vertices);
  }

  static givenVertices(vertices: Point[]): Polygon {
    if (vertices.length < 3) {
      throw new Error('At least 3 vertices are required');
    }

    return new Polygon({ vertices: vertices });
  }

  static givenEuclideanNCenterRadius(
    n: number,
    center: Point,
    radius: number,
    rotation: number,
  ): Polygon {
    if (n < 3) {
      throw new Error('Side count must be at least 3');
    }
    rotation = rotation ? Angle.normalize(rotation) : 0;

    const increment = TAU / n;
    const vertices: Point[] = [];

    for (let i = 0; i < n; i++) {
      vertices.push(center.euclideanDistantPoint(radius, rotation));
      rotation = Angle.normalize(rotation + increment);
    }

    return new Polygon({ vertices: vertices });
  }

  static givenHyperbolicNCenterRadius(
    n: number,
    center: Point,
    radius: number,
    rotation: number,
  ): Polygon {
    if (n < 3) {
      throw new Error('Side count must be at least 3');
    }
    if (!center.isOnPlane()) {
      throw new Error('Center must be on hyperbolic plane');
    }
    rotation = rotation ? Angle.normalize(rotation) : 0;

    const increment = TAU / n;
    const vertices: Point[] = [];

    for (let i = 0; i < n; i++) {
      vertices.push(center.hyperbolicDistantPoint(radius, rotation));
      rotation = Angle.normalize(rotation + increment);
    }

    return new Polygon({ vertices: vertices });
  }
}
