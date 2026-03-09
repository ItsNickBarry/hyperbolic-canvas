// This module creates and exports the HyperbolicCanvas namespace object.
// Other modules import this object and attach their classes to it.
// This module does not import other modules to avoid circular dependencies.
import { INFINITY, ZERO } from './constants.js';

declare global {
  interface Math {
    TAU: number;
  }
}

const HyperbolicCanvas: any = {};

HyperbolicCanvas.INFINITY = INFINITY;
HyperbolicCanvas.ZERO = ZERO;

Math.TAU = 2 * Math.PI;

export default HyperbolicCanvas;
export { HyperbolicCanvas };
