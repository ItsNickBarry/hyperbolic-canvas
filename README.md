> > **For God's sake, please give it up. Fear it no less than the sensual passion, because it, too, may take up all your time and deprive you of your health, peace of mind, and happiness in life.**
>
> Farkas Bolyai, to his son János Bolyai, on hyperbolic geometry

# Hyperbolic Canvas
A Javascript implementation of the Poincaré disk model of the hyperbolic plane, on an HTML canvas.

Capable of:

- [x] Draw hyperbolic line between points
- [x] Calculate hyperbolic distance between points (maybe ?  not sure if results are accurate)
- [ ] Calculate Euclidean arclength between a point and a destination point given hyperbolic distance and hyperbolic line.
- [ ] Draw polygon from path
- [ ] Draw regular n-gon
- [ ] Tesselate the plane with n-gons
- [x] Not very much, really
- [x] It's not done yet, and neither is the readme
- [ ] ...

## Demonstrations
* one
* two
* probably not three
* let me know if you use this in a project, so I can populate this list

## Usage
### Simple Installation
Add one or more divs with the class "hyperbolic-canvas" to an HTML document, and load [HC.js][HC.js].  A Canvas object will be automatically created to correspond with each such div.  Width and height styling must be specified.  A ratio of 1:1 and absolute px values are recommended:

```html
<div class="hyperbolic-canvas" style="width: 600px; height: 600px;"></div>
<div class="hyperbolic-canvas" style="width: 400px; height: 400px;"></div>

<script type="application/javascript" src="lib/HC.js"></script>
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

### Exposed Variables and Constants
An array of all Canvas objects is exposed through the HyperbolicCanvas namespace:

```javascript
window.HyperbolicCanvas.canvases
```

### Object Classes and Their Functions
The hyperbolic canvas makes use of three geometric object classes, defined relative to the Euclidean plane.

#### Point
A representation of a point on the Canvas, where the center is defined as (0, 0) and the radius is defined as 1, and the y axis is not inverted.

#### Line
The relationship between two Points.  Contains various functions which act on either the Euclidean or the hyperbolic plane.

#### Circle
A center Point and a radius.  Used mostly internally for the purpose of drawing hyperbolic lines.

### The Canvas Class and Its Functions

## Issues
I don't know how geometry works.  I don't know how math works.  I don't know how Javascript works.  Does anyone, really?  If you do, and you notice an oversight, please open a new issue.
