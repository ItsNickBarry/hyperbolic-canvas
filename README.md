# Hyperbolic Canvas
A Javascript implementation of the Poincaré disk model of the hyperbolic plane, on an HTML canvas.

Capable of the following operations:
* Calculate hyperbolic distance of point from center
* Calculate hyperbolic distance between points
* Draw hyperbolic line between points
* Calculate Euclidean arclength between a point and a destination point given hyperbolic distance and hyperbolic line.

## Usage
### Simple Installation
Add one or more divs with the class "hyperbolic-canvas" to an HTML document, and load [HC.js][HC.js].  Width and height styling must be specified.  A ratio of 1:1 and absolute px values are recommended:

```html
<div class="hyperbolic-canvas" style="width: 600px; height: 600px;"></div>
<div class="hyperbolic-canvas" style="width: 400px; height: 400px;"></div>

<script type="application/javascript" src="lib/HC.js"></script>
```

Each of these divs will be be appended with its own hyperbolic Canvas object, all of which are exposed through the HyperbolicCanvas namespace:

```javascript
window.HyperbolicCanvas.canvases
```

Additional styling, such as the following CSS, is required to differentiate elements graphically:
```css
div.hyperbolic-canvas div.viewport canvas {
  background-color: #000080;
}

div.hyperbolic-canvas .viewport {
  background-color: #43464B;
}
```

### Autoresize
To allow the canvas to automatically resize to fill its containing div, use the "hyperbolic-canvas-autoresize" class, and load [ResizeSensor.js][ResizeSensor.js].  Width and height styling must be specified, in terms of percentage.  Parent element must, of course, have non-zero, non-fixed width and height:

```html
<div class="hyperbolic-canvas hyperbolic-canvas-autoresize" style="width: 100%; height: 100%;"></div>

<script type="application/javascript" src="lib/ResizeSensor.js"></script>
<script type="application/javascript" src="lib/HC.js"></script>
```

The canvas will be cleared each time a resize occurs.

The ResizeSensor class is provided by [Marc J. Schmidt][marcj] as a part of the [CSS Element Queries][elementqueries] library.

[HC.js]: ./lib/HC.js
[ResizeSensor.js]: ./lib/ResizeSensor.js
[marcj]: https://github.com/marcj
[elementqueries]: http://marcj.github.io/css-element-queries/

### Functions
* Calculate hyperbolic distance of point from center
* Calculate hyperbolic distance between points
* Draw hyperbolic line between points
* Calculate Euclidean arclength between a point and a destination point given hyperbolic distance and hyperbolic line.

## Issues
I don't know how geometry works.  I don't know how math works.  I don't know how Javascript works.  Does anyone, really?  If you do, and you notice an oversight, please open a new issue.
