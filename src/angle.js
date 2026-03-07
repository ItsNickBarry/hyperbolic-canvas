import { HyperbolicCanvas } from './hyperbolic_canvas.js';

const DEGREES_TO_RADIANS = Math.PI / 180;

class Angle {
  static normalize(angle) {
    if (angle < 0) {
      return Math.abs(Math.floor(angle / Math.TAU)) * Math.TAU + angle;
    } else if (angle >= Math.TAU) {
      return angle % Math.TAU;
    } else {
      return angle;
    }
  }

  static fromDegrees(degrees) {
    return Angle.normalize(degrees * DEGREES_TO_RADIANS);
  }

  static toDegrees(radians) {
    return (radians / DEGREES_TO_RADIANS) % 360;
  }

  static opposite(angle) {
    return Angle.normalize(angle + Math.PI);
  }

  static toSlope(angle) {
    // TODO should this return Infinity?
    return Math.tan(angle);
  }

  static fromSlope(slope) {
    return Math.atan(slope);
  }

  static random(quadrant) {
    let angle = Math.random() * Math.TAU;
    return quadrant ? angle / 4 + (Math.PI / 2) * ((quadrant - 1) % 4) : angle;
  }
}

HyperbolicCanvas.Angle = Angle;
