# Hyperbolic Canvas
A Javascript implementation of the [Poincaré disk model][diskmodel] of the hyperbolic plane, on an HTML canvas.

Due to the less-than-infinite precision of floating point numbers, bad things can happen, especially as points approach the border of the plane.

Certain browsers do not provide support for the hyperbolic functions.

[diskmodel]: https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model

## Usage
### Simple Installation
Add one or more divs with the class "hyperbolic-canvas" to an HTML document, and load [HyperbolicCanvas.js][HyperbolicCanvas.js].  A Canvas object will be automatically created to correspond with each such div.  Width and height styling must be specified.  Absolute px values in a 1:1 ratio are recommended:

```html
<div class="hyperbolic-canvas" style="width: 600px; height: 600px;"></div>
<div class="hyperbolic-canvas" style="width: 400px; height: 400px;"></div>

<script type="application/javascript" src="lib/Angle.js"></script>
<script type="application/javascript" src="lib/Point.js"></script>
<script type="application/javascript" src="lib/Line.js"></script>
<script type="application/javascript" src="lib/Circle.js"></script>
<script type="application/javascript" src="lib/Polygon.js"></script>
<script type="application/javascript" src="lib/Canvas.js"></script>
<script type="application/javascript" src="lib/HyperbolicCanvas.js"></script>
```

See the [example HTML][html] and [example CSS][css] for a demonstration.

[html]: ./example.html
[css]: ./css/example.css

### Exposed Variables and Constants
An array of all Canvas objects is exposed through the `HyperbolicCanvas` namespace:

```javascript
window.HyperbolicCanvas.canvases;
```

The constant [Tau][manifesto] is defined on the Math object as `2 * Math.PI`:

```javascript
Math.TAU;
// 6.283185307179586
// you're welcome
```

[manifesto]: http://tauday.com/tau-manifesto

### Object Classes and Their Functions
The hyperbolic canvas makes use of several geometric object classes, defined relative to the Euclidean plane.

#### Angle
A non-function object which contains convenience functions related to angles.

Functions:

```javascript
Angle.normalize(angle);
// return the equivalent angle a where 0 < a < Tau

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
Point.givenCoordinates(x, y);
// generate a point given x and y coordinates, relative to the center of the unit circle

Point.givenPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle

Point.givenHyperbolicPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle, where the given distance is hyperbolic

Point.between(somePoint, someOtherPoint);
// generate the point between two other Points, in a Euclidean sense
```

Instance functions:

```javascript
Point.prototype.equals(otherPoint);
// determine whether x and y properties of the point match those of another point

Point.prototype.angle();
// calculate the angle at which the point is located relative to the unit circle

Point.prototype.distanceFromCenter();
// calculate the hyperbolic distance of the point from the center of the canvas

Point.prototype.distantPoint(distance, direction);
// calculate the point's relative point a given hyperbolic distance away at a given angle
// the returned distant point has an additional property "direction" which indicates the angle one would be facing, having traveled from the point to the distant point
// if this function is called without a "direction" argument, the point is checked for a "direction" attribute
// if neither a "direction" argument nor attribute exists, the point's angle() is used

Point.prototype.isOnPlane();
// determine whether the point lies within the bounds of the unit circle
```

#### Line
The relationship between two Points.  Contains various functions which act on either the Euclidean or the hyperbolic plane.  Can represent a line, line segment, or ray.

Factory methods:

```javascript
Line.givenPointSlope(point, slope);
// generate a line given a point and a slope

Line.givenTwoPoints(somePoint, someOtherPoint);
// generate a line through two Points
```

Class functions:
```javascript
Line.intersect(someLine, someOtherLine);
// calculate the point of intersection of two Euclidean lines

Line.hypebrolicIntersect(someLine, someOtherLine);
// calculate the point of intersection of two hyperbolic lines
```

Instance functions:

```javascript
Line.prototype.arcCircle();
// returns the circle whose arc matches the hyperbolic geodesic through the line's points

Line.prototype.containsPoint(point);
// determine whether a point lies on the Euclidean line

Line.prototype.equals(otherLine);
// determine whether the line's slope matches that of another line, and the line contains a point of another line

Line.prototype.xAtY(y);
// return the x coordinate of the point on the Euclidean line at a given y coordinate

Line.prototype.yAtX(x);
// return the y coordinate of the point on the Euclidean line at a given x coordinate

Line.prototype.perpindicularBisector();
// return the line which is the perpindicular bisector of the Euclidean line segment

Line.prototype.perpindicularSlope();
// return the opposite reciprocal of the slope of the Euclidean line

Line.prototype.midpoint();
// return the point between the Euclidean line segment's two endpoints

Line.prototype.euclideanDistance();
// calculate the length of the Euclidean line segment

Line.prototype.hyperbolicDistance();
// calculate the length of the hyperbolic line segment

Line.prototype.unitCircleIntersects();
// calculate the Euclidean line's points of intersection with the unit circle
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
Circle.givenCenterRadius(center, radius);
// generate a circle with a given center point and Euclidean radius

Circle.givenHyperbolicCenterRadius(center, radius);
// generate a circle with a given center point and hyperbolic radius

Circle.givenTwoPoints(somePoint, someOtherPoint);
// generate a circle given two diametrically opposed points

Circle.givenThreePoints(somePoint, someOtherPoint, someOtherOtherPoint);
// generate a circle given three points
```

Class functions:

```javascript
Circle.intersect(someCircle, someOtherCircle);
// calculate the points of intersection beween two circles
```

Instance functions:

```javascript
Circle.prototype.equals(otherCircle);
// determine whether the circle's center and radius match those of another circle

Circle.prototype.angleAt(point);
// calculate the angle of a point relative to the circle's center

Circle.prototype.pointAt(angle);
// calculate the point on a circle at a given angle relative to its center

Circle.prototype.xAtY(y);
// calculate the x coordinates of the points on the circle with a given y coordinate

Circle.prototype.yAtX(x);
// calculate the y coordinates of the points on the circle with a given x coordinate

Circle.prototype.tangentAtAngle(angle);
// calculate the tangent line to the circle at a given angle

Circle.prototype.tangentAtPoint(point);
// calculate the line which passes through a given point and is perpindicular to the line through the point and the circle's center

Circle.prototype.unitCircleIntersects();
// calculate the circle's points of intersection with the unit circle
```

#### Polygon
An ordered collection of Points.

Factory methods:

```javascript
Polygon.givenVertices(vertices);
// generate a polygon from a given ordered array of Point objects

Polygon.givenNCenterRadius(n, center, radius);
// generate a regular polygon with n sides, where each vertex is radius distance from the center Point
```

<!-- Class functions:

```javascript

``` -->

Instance functions:

```javascript
Polygon.prototype.rotate(angle);
// return the rotation of the polygon the given angle about the center of the unit circle
```

### The Canvas Class and Its Functions
The canvas class is used to draw hyperbolic lines and shapes.

Instance functions:

```javascript
Canvas.prototype.at(coordinates);
// generate a Point given an array of coordinates [x, y] relative to the HTML canvas

Canvas.prototype.at(point);
// generate an array of coordinates [x, y] relative to the HTML canvas given a Point

Canvas.prototype.getContext();
// return the 2d context of the underlying HTML canvas

Canvas.prototype.strokeLineThroughIdealPoints(someAngle, someOtherAngle);
// stroke the line through the ideal points at given angles

Canvas.prototype.clear();
// clear the canvas

Canvas.prototype.strokeGrid(n);
// stroke a grid on the canvas with n divisions of each axis

Canvas.prototype.fillCircle(circle);
Canvas.prototype.fillAndStrokeCircle(circle);
Canvas.prototype.strokeCircle(circle);
Canvas.prototype.fillPolygon(polygon);
Canvas.prototype.fillAndStrokePolygon(polygon);
Canvas.prototype.strokePolygon(polygon);
// fill and/or stroke the given object

Canvas.prototype.strokeLine(line, infinite);
// stroke the hyperbolic line, extending to the edges of the canvas if the boolean infinite is true

Canvas.prototype.strokePolygonBoundaries(polygon);
// stroke the ideal hyperbolic lines which bind a given polygon.
```

## Issues and Features
<!-- // "edge cases" (ha!) in which a point sufficiently close to boundary is NaN due to floating point math -->

To report problems, or request features, please open a new [issue][issue].

[issue]: ./../../issues
