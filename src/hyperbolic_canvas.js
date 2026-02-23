const HyperbolicCanvas = (module.exports = {});

// modules attach themselves to HyperbolicCanvas and do not include exports
require('./angle.js');
require('./point.js');
require('./line.js');
require('./circle.js');
require('./polygon.js');
require('./canvas.js');

HyperbolicCanvas.INFINITY = 1e12;
HyperbolicCanvas.ZERO = 1e-6;

Math.TAU = 2 * Math.PI;
