# API

## Exposed Variables and Constants

An object containing all Canvas objects is exposed through the `HyperbolicCanvas` namespace.

```javascript
HyperbolicCanvas.canvases;
```

Approximations of `Infinity` and `0` are defined for use in internal comparisons:

```javascript
HyperbolicCanvas.INFINITY;
HyperbolicCanvas.ZERO;
```

The constant [Tau][manifesto] is defined on the Math object as `2 * Math.PI`:

```javascript
Math.TAU;
// 6.283185307179586
// you're welcome
```

[manifesto]: http://tauday.com/tau-manifesto

## Geometric Object Classes and Their Functions

The hyperbolic canvas makes use of several geometric object classes, defined relative to the Euclidean plane.

When instantiating objects, it is **not recommended to call the constructor directly**. Instead, use the provided factory methods.

### Angle

A non-function object which contains convenience functions related to angles.

Functions:

```javascript
Angle.normalize(angle);
// return the equivalent angle a where 0 < a < Tau

Angle.fromDegrees(degrees);
Angle.toDegrees(radians);
// convert between primary- and secondary-school mathematics

Angle.opposite(angle);

Angle.toSlope(angle);
Angle.fromSlope(slope);
// convert between angle and slope of Line

Angle.random(quadrant);
// return a random angle, optionally within a given quadrant [1 - 4]
```

### Point

A representation of a point on the Canvas, where the center is defined as (0, 0) and the radius is defined as 1, and the y axis is not inverted.

Constants:

```javascript
Point.ORIGIN;
Point.CENTER;
// the point at the center of the canvas, (0,0)
```

Factory methods:

```javascript
Point.givenCoordinates(x, y);
// generate a point given x and y coordinates, relative to the center of the unit circle

Point.givenEuclideanPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle

Point.givenHyperbolicPolarCoordinates(radius, angle);
// generate a point given polar coodinates, relative to the center of the unit circle, where the given distance is hyperbolic

Point.givenIdealAngle(angle);
// generate an ideal point at the given angle, relative to the unit circle

Point.euclideanBetween(somePoint, someOtherPoint);
// generate the point between two other Points, in a Euclidean sense

Point.hyperbolicBetween(somePoint, someOtherPoint);
// generate the point between tow other Points, in a hyperbolic sense
// will return false if either Point is not on the hyperbolic plane
```

Instance functions:

```javascript
Point.prototype.equals(otherPoint);
// determine whether x and y properties of the point match those of another point

Point.prototype.getAngle();
// calculate the angle at which the point is located relative to the unit circle

Point.prototype.getDirection();
// if this Point was calculated as a result of hyperbolicDistantPoint, return the angle of continued travel along the same geodesic, otherwise return the result of getAngle

Point.prototype.getEuclideanRadius();
// calculate the Euclidean distance of the point from the center of the canvas

Point.prototype.getHyperbolicRadius();
// calculate the hyperbolic distance of the point from the center of the canvas

Point.prototype.getX();

Point.prototype.getY();

Point.prototype.euclideanAngleTo(otherPoint);
Point.prototype.euclideanAngleFrom(otherPoint);
// calculate the angle towards or from another Point, along a Euclidean geodesic

Point.prototype.hyperbolicAngleTo(otherPoint);
Point.prototype.hypebrolicAngleFrom(otherPoint);
// calculate the angle towards or from another Point, along a hyperbolic geodesic

Point.prototype.euclideanDistanceTo(otherPoint);
Point.prototype.hyperbolicDistanceTo(ohterPoint);
// calculate the Euclidean or hyperbolic distance to another Point

Point.prototype.euclideanDistantPoint(distance, direction);
// calculate the point's relative point a given Euclidean distance away at a given angle, along a Euclidean geodesic

Point.prototype.hyperbolicDistantPoint(distance, direction);
// calculate the point's relative point a given hyperbolic distance away at a given angle, along a hyperbolic geodesic
// the returned distant point has an additional property "direction" which indicates the angle one would be facing, having traveled from the point to the distant point
// if this function is called without a "direction" argument, the point is checked for a "direction" attribute
// if neither a "direction" argument nor attribute exists, the point's angle() is used

Point.prototype.isIdeal();
// determine whether the point lies on the boundary of the unit circle

Point.prototype.isOnPlane();
// determine whether the point lies within the bounds of the unit circle

Point.prototype.opposite();
// return the Point rotated PI radians about the origin
```

### Line

The relationship between two Points. Contains various functions which act on either the Euclidean or the hyperbolic plane. Can represent a line, line segment, or ray.

Constants:

```javascript
Line.X_AXIS;

Line.Y_AXIS;
```

Factory methods:

```javascript
Line.givenPointSlope(point, slope);
// generate a line given a point and a slope

Line.givenTwoPoints(somePoint, someOtherPoint);
// generate a line through two Points

Line.givenAnglesOfIdealPoints(someAngle, someOtherAngle);
// generate a line through two ideal Points at given angles
```

Class functions:

```javascript
Line.euclideanIntersect(someLine, someOtherLine);
// calculate the point of intersection of two Euclidean lines

Line.hyperbolicIntersect(someLine, someOtherLine);
// calculate the point of intersection of two hyperbolic lines
```

Instance functions:

```javascript
Line.prototype.getHyperbolicGeodesic();
// returns the circle whose arc matches the hyperbolic geodesic through the line's points

Line.prototype.euclideanIncludesPoint(point);
// determine whether a point lies on the Euclidean line

Line.prototype.equals(otherLine);
// determine whether the line's slope matches that of another line, and the line contains a point of another line

Line.prototype.hyperbolicEquals(otherLine);
// determine whether the Line shares a hyperbolic geodesic with given other Line

Line.prototype.xAtY(y);
// return the x coordinate of the point on the Euclidean line at a given y coordinate

Line.prototype.yAtX(x);
// return the y coordinate of the point on the Euclidean line at a given x coordinate

Line.prototype.euclideanPerpindicularBisector();
// return the line which is the perpindicular bisector of the Euclidean line segment

Line.prototype.euclideanPerpindicularSlope();
// return the opposite reciprocal of the slope of the Euclidean line

Line.prototype.getEuclideanMidpoint();
// return the point between the Euclidean line segment's two endpoints

Line.prototype.getEuclideanLength();
// calculate the length of the Euclidean line segment

Line.prototype.hyperbolicDistance();
// calculate the length of the hyperbolic line segment

Line.prototype.getEuclideanUnitCircleIntersects();
// calculate the Euclidean line's points of intersection with the unit circle
```

### Circle

A Euclidean center Point and a Euclidean radius; potentially also a hyperbolic center Point and a hyperbolic radius.

Constants:

```javascript
Circle.UNIT;
// the unit circle; center (0,0), Euclidean radius 1, hyperbolic radius Infinity
```

Factory methods:

```javascript
Circle.givenEuclideanCenterRadius(center, radius);
// generate a circle with a given center point and Euclidean radius

Circle.givenHyperbolicCenterRadius(center, radius);
// generate a circle with a given center point and hyperbolic radius

Circle.givenTwoPoints(somePoint, someOtherPoint);
// generate a circle given two diametrically opposed points

Circle.givenThreePoints(somePoint, someOtherPoint, someOtherOtherPoint);
// generate a circle given three points on its edge
```

Class functions:

```javascript
Circle.intersect(someCircle, someOtherCircle);
// calculate the points of intersection between two circles
```

Instance functions:

```javascript
Circle.prototype.equals(otherCircle);
// determine whether the circle's center and radius match those of another circle

Circle.prototype.getEuclideanArea();
Circle.prototype.getHyperbolicArea();
Circle.prototype.getEuclideanCenter();
Circle.prototype.getHyperbolicCenter();
Circle.prototype.getEuclideanCircumference();
Circle.prototype.getHyperbolicCircumference();
Circle.prototype.getEuclideanDiameter();
Circle.prototype.getHyperbolicDiameter();
// return the Euclidean or hyperbolic property of the circle

Circle.prototype.containsPoint(point);
// determine whether the circle contains the given point within its bounds

Circle.prototype.includesPoint(point);
// determine whether the given point lies on the edge of the circle

Circle.prototype.euclideanAngleAt(point);
Circle.prototype.hyperbolicAngleAt(point);
// calculate the angle of a point relative to the circle's center, in a Euclidean or hyperbolic context

Circle.prototype.euclideanPointAt(angle);
Circle.prototype.hyperbolicPointAt(angle);
// calculate the point on a circle at a given angle relative to its center, in a Euclidean or hyperbolic context

Circle.prototype.pointsAtX(x);
Circle.prototype.pointsAtY(y);
// return the point or points on the edge of the circle with the given x or y coordinate

Circle.prototype.xAtY(y);
Circle.prototype.yAtX(x);
// calculate the x or y coordinate of the points on the edge of the circle with a given y or x coordinate, respectively

Circle.prototype.euclideanTangentAtAngle(angle);
// calculate the tangent line to the circle at a given angle

Circle.prototype.euclideanTangentAtPoint(point);
// calculate the line which passes through a given point and is perpindicular to the line through the point and the circle's center

Circle.prototype.getUnitCircleIntersects();
// calculate the circle's points of intersection with the unit circle
```

### Polygon

An ordered collection of Points.

Factory methods:

```javascript
Polygon.givenVertices(vertices);
// generate a polygon from a given ordered array of Point objects

Polygon.givenAnglesOfIdealVertices(angles);
// generate an ideal polygon with vertices at the given angles, relative to the unit circle

Polygon.givenEuclideanNCenterRadius(n, center, radius);
// generate a regular polygon with n sides, where each vertex is radius Euclidean distance from the center Point

Polygon.givenHyperbolicNCenterRadius(n, center, radius);
// generate a regular polygon with n sides, where each vertex is radius hyperbolic distance from the center Point
```

<!-- Class functions:

```javascript

``` -->

Instance functions:

```javascript
Polygon.prototype.getLines();
// return the lines between the polygon's vertices

Polygon.prototype.getVertices();
// return the polygon's vertices
```

## The Canvas Class and Its Functions

The canvas class is used to draw hyperbolic lines and shapes.

Instance functions:

```javascript
Canvas.prototype.getUnderlayElement();
// return the div behind the canvas element, which is used to visually delineate
// the hyperbolic plane

Canvas.prototype.getContainerElement();
// return the element which contains all Hyperbolic Canvas elements

Canvas.prototype.getCanvasElement();
// return the HTML canvas element

Canvas.prototype.getBackdropElement();
// return the div which is the direct parent of the canvas element

Canvas.prototype.getContext();
// return the CanvasRenderingContext2D of the underlying canvas

Canvas.prototype.getRadius();
// return the radius of the HTML canvas

Canvas.prototype.getDiameter();
// return the diameter of the HTML canvas

Canvas.prototype.setContextProperties(properties);
Canvas.prototype.setContextProperty(property, value);
// set the properties of the 2d context of the underlying HTML canvas
// lineDash is also supported

Canvas.prototype.at(coordinates);
// generate a Point given an array of coordinates [x, y] relative to the HTML canvas

Canvas.prototype.at(point);
// generate an array of coordinates [x, y] relative to the HTML canvas given a Point

Canvas.prototype.clear();
// clear the canvas

Canvas.prototype.fill(path);
Canvas.prototype.stroke(path);
Canvas.prototype.fillAndStroke(path);
// call fill() and/or stroke() on the context of the underlying canvas
// optionally with a Path2D

Canvas.prototype.pathForReferenceAngles(n, rotation, options);
// generate path for lines on the canvas betwen n radial slices, offset by rotation

Canvas.prototype.pathForReferenceGrid(n, options);
// generate path for a grid on the canvas with n divisions of each axis

Canvas.prototype.pathForReferenceRings(n, d, options);
// generate path for n rings on the canvas with increasing radius in increments of r

Canvas.prototype.pathForEuclidean(object, options);
Canvas.prototype.pathForHyperbolic(object, options);
// generate Euclidean or hyperbolic path for a given object
```
