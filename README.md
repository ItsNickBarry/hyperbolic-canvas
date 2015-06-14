> > **For God's sake, please give it up. Fear it no less than the sensual passion, because it, too, may take up all your time and deprive you of your health, peace of mind, and happiness in life.**
>
> [Farkas Bolyai][farkas], to his son [János Bolyai][jános], on [hyperbolic geometry][hyperbolicgeometry]

[farkas]: https://en.wikipedia.org/wiki/Farkas_Bolyai
[jános]: https://en.wikipedia.org/wiki/J%C3%A1nos_Bolyai
[hyperbolicgeometry]: https://en.wikipedia.org/wiki/Hyperbolic_geometry

# Warning
This repository is incomplete.

Due to the less-than-infinite precision of floating point numbers, bad things can happen, especially as points approach the border of the plane.

Certain browsers do not provide support for the hyperbolic functions.  Check comptatibility [here][comptatibility].

[comptatibility]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh#Browser_compatibility

# Hyperbolic Canvas
A Javascript implementation of the [Poincaré disk model][diskmodel] of the hyperbolic plane, on an HTML canvas.

Capable of:

- [x] Draw hyperbolic line between points
- [ ] Calculate hyperbolic distance between points (maybe ?  not sure if results are accurate)
- [x] Draw polygon
- [x] Generate and draw regular n-gon
- [ ] Tesselate the plane with n-gons
- [x] It's not done yet, and neither is the readme
- [ ] ...

[diskmodel]: https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model

## Demonstrations
* [Example][example] (a few regular congruent hexagons; they rotate when clicked)
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

#### Angle
A non-function object which contains convenience functions related to angles.

Functions:

```javascript
Angle.normalize(angle);

Angle.fromDegrees(degrees);

Angle.toDegrees(radians);
```

#### Point
A representation of a point on the Canvas, where the center is defined as (0, 0) and the radius is defined as 1, and the y axis is not inverted.

Constants:

```javascript
Point.CENTER;
// the point at the center of the canvas, (0,0)
```

Factory methods:

```javascript
Point.fromCoordinates(x, y);
// generate a point given x and y coordinates, relative to the center of the unit circle

Point.fromPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle

Point.fromHyperbolicPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle, where the given distance is hyperbolic

Point.between(somePoint, someOtherPoint);
// generate the point between two other Points, in a Euclidean sense
```

Instance functions:

```javascript
TODO
```

#### Line
The relationship between two Points.  Contains various functions which act on either the Euclidean or the hyperbolic plane.

Factory methods:

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
// the unit circle; center (0,0), radius 1
```

Factory methods:

```javascript
Circle.fromCenterRadius(center, radius);
// generate a circle with a given center point and Euclidean radius

Circle.fromHyperbolicCenterRadius(center, radius);
// generate a circle with a given center point and hyperbolic radius

Circle.fromTwoPoints(somePoint, someOtherPoint);
// generate a circle given two diametrically opposed points

Circle.fromThreePoints(somePoint, someOtherPoint, someOtherOtherPoint);
// generate a circle given three points
```

Instance functions:

```javascript
TODO
```

#### Polygon
An ordered collection of Points.

Factory methods:

```javascript
Polygon.fromVertices(vertices);
// generate a polygon from a given ordered array of Point objects

Polygon.fromNCenterRadius(n, center, radius);
// generate a regular polygon with n sides, where each vertex is radius distance from the center Point
```

<!-- Class functions:

```javascript

``` -->

Instance functions:

```javascript
TODO
```

### The Canvas Class and Its Functions
The canvas class is used to draw hyperbolic lines and shapes.

Instance functions:

```javascript
canvas.at(coordinates);
// generate a Point given an array of coordinates [x, y] relative to the HTML canvas

canvas.at(point);
// generate an array of coordinates [x, y] relative to the HTML canvas given a Point

TODO
```

## Issues and Features
<!-- // "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math -->

To report problems, or request features, please open a new [issue][issue].

[issue]: ./../../issues
