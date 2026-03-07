// This is the main entry point for the library.
// It imports the HyperbolicCanvas namespace object first, then imports all
// other modules which attach themselves to it. This works because
// hyperbolic_canvas.js does not import any other module.

import { HyperbolicCanvas } from './hyperbolic_canvas.js';

import './angle.js';
import './point.js';
import './line.js';
import './circle.js';
import './polygon.js';
import './canvas.js';

export default HyperbolicCanvas;
export { HyperbolicCanvas };
