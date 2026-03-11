import type { Quadrant } from './types.js';

const DEGREES_TO_RADIANS = Math.PI / 180;

export default class Angle {
  static normalize(radians: number): number {
    if (radians < 0) {
      return Math.abs(Math.floor(radians / Math.TAU)) * Math.TAU + radians;
    } else if (radians >= Math.TAU) {
      return radians % Math.TAU;
    } else {
      return radians;
    }
  }

  static fromDegrees(degrees: number): number {
    return Angle.normalize(degrees * DEGREES_TO_RADIANS);
  }

  static toDegrees(radians: number): number {
    return (radians / DEGREES_TO_RADIANS) % 360;
  }

  static opposite(radians: number): number {
    return Angle.normalize(radians + Math.PI);
  }

  static toSlope(radians: number): number {
    // TODO should this return Infinity?
    return Math.tan(radians);
  }

  static fromSlope(slope: number): number {
    return Math.atan(slope);
  }

  static random(quadrant?: Quadrant) {
    const angle = Math.random() * Math.TAU;
    return quadrant ? angle / 4 + (Math.PI / 2) * ((quadrant - 1) % 4) : angle;
  }
}
