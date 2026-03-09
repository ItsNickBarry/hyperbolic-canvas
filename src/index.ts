// This is the main entry point for the library.
// It imports the HyperbolicCanvas namespace object first, then imports all
// other modules which attach themselves to it. This works because
// hyperbolic_canvas.js does not import any other module.
import Angle from './angle.js';
import Canvas from './canvas.js';
import Circle from './circle.js';
import { HyperbolicCanvas } from './hyperbolic_canvas.js';
import Line from './line.js';
import Point from './point.js';
import Polygon from './polygon.js';

export default HyperbolicCanvas;
export { HyperbolicCanvas, Angle, Canvas, Circle, Line, Point, Polygon };
