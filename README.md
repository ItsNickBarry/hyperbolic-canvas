> > **For God's sake, please give it up. Fear it no less than the sensual passion, because it, too, may take up all your time and deprive you of your health, peace of mind, and happiness in life.**
>
> [Farkas Bolyai][farkas], to his son [János Bolyai][jános], on [hyperbolic geometry][hyperbolicgeometry]

[farkas]: https://en.wikipedia.org/wiki/Farkas_Bolyai
[jános]: https://en.wikipedia.org/wiki/J%C3%A1nos_Bolyai
[hyperbolicgeometry]: https://en.wikipedia.org/wiki/Hyperbolic_geometry

# Hyperbolic Canvas
A Javascript implementation of the [Poincaré disk model][diskmodel] of the hyperbolic plane, on an HTML canvas.

Capable of:

- [x] Draw hyperbolic line between points
- [x] Calculate hyperbolic distance between points (maybe ?  not sure if results are accurate)
- [ ] Calculate Euclidean arclength between a point and a destination point given hyperbolic distance and hyperbolic line.
- [x] Draw polygon from path
- [x] Draw regular n-gon
- [ ] Tesselate the plane with n-gons
- [x] It's not done yet, and neither is the readme
- [ ] ...

[diskmodel]: https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model

## Demonstrations
* [Example][example]
* two
* probably not three
* let me know if you use this in a project, so I can populate this list

[example]: http://ItsNickBarry.github.io/hyperbolic-canvas/example.html

## Usage
### Simple Installation
Add one or more divs with the class "hyperbolic-canvas" to an HTML document, and load [HyperbolicCanvas.js][HyperbolicCanvas.js].  A Canvas object will be automatically created to correspond with each such div.  Width and height styling must be specified.  Absolute px values in a 1:1 ratio are recommended:

```html
<div class="hyperbolic-canvas" style="width: 600px; height: 600px;"></div>
<div class="hyperbolic-canvas" style="width: 400px; height: 400px;"></div>

<script type="application/javascript" src="lib/HyperbolicCanvas.js"></script>
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
See the [example HTML][html] and [example CSS][css] for a demonstration.

[html]: ./example.html
[css]: ./example.css

### Exposed Variables and Constants
An array of all Canvas objects is exposed through the HyperbolicCanvas namespace:

```javascript
window.HyperbolicCanvas.canvases
```

The constant [Tau][manifesto] is defined on the Math object as `2 * Math.PI`:

```javascript
Math.TAU;
// 6.283185307179586
// you're welcome
```

[manifesto]: http://tauday.com/tau-manifesto

### Object Classes and Their Functions
The hyperbolic canvas makes use of four geometric object classes, defined relative to the Euclidean plane.
// TODO explain how constructor functions work

#### Point
A representation of a point on the Canvas, where the center is defined as (0, 0) and the radius is defined as 1, and the y axis is not inverted.

Constants:

```javascript
Point.CENTER;
```

Constructors:

```javascript
Point.fromCoordinates(x, y);

Point.fromPolarCoordinates(radius, angle);

Point.fromHyperbolicPolarCoordinates(radius, angle);

Point.between(somePoint, someOtherPoint);
```

Instance functions:

```javascript

```

#### Line
The relationship between two Points.  Contains various functions which act on either the Euclidean or the hyperbolic plane.

Constructors:

```javascript
Line.fromPointSlope(point, slope);

Line.fromTwoPoints(somePoint, someOtherPoint);
```

Instance functions:

```javascript

```

#### Circle
A center Point and a radius.  Used mostly internally for the purpose of drawing hyperbolic lines.

Constants:

```javascript
Circle.UNIT;
```

Constructors:

```javascript
Circle.fromCenterRadius(center, radius);

Circle.fromHyperbolicCenterRadius(center, radius);

Circle.fromTwoPoints(somePoint, someOtherPoint);

Circle.fromThreePoints(somePoint, someOtherPoint, someOtherOtherPoint);
```

Instance functions:

```javascript

```

#### Polygon
An ordered collection of Points.

Constructors:

```javascript
Polygon.fromVertices(verticesArray);

Polygon.fromNCenterRadius(nSides, centerPoint, radius);
```

Instance functions:

```javascript

```

### The Canvas Class and Its Functions

## Issues and Features
<!-- // TODO "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math -->

To report problems, or request features, please open a new [issue][issue].

[issue]: ./../../issues
