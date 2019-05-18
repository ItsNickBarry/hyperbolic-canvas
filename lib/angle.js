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
