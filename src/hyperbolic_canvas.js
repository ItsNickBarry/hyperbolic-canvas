// This module creates and exports the HyperbolicCanvas namespace object.
// Other modules import this object and attach their classes to it.
// This module does not import other modules to avoid circular dependencies.

const HyperbolicCanvas = {};

HyperbolicCanvas.INFINITY = 1e12;
HyperbolicCanvas.ZERO = 1e-6;

Math.TAU = 2 * Math.PI;

export default HyperbolicCanvas;
export { HyperbolicCanvas };
