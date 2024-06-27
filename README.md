# Hyperbolic Canvas

A Javascript implementation of the [Poincaré disk model](https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model) of the hyperbolic plane, on an HTML canvas.

Usage examples can be found on the [project site](https://ItsNickBarry.github.io/hyperbolic-canvas).

## Installation

### Via NPM

```
npm install --save hyperbolic-canvas
```

### In-Browser

```html
<script type="application/javascript" src="dist/hyperbolic_canvas.js"></script>
```

## Usage

Pass a unique selector of a div element, to the function `HyperbolicCanvas.create`.  Nonzero width and height styling must be specified.  Absolute px values in a 1:1 ratio are recommended:

```html
<div id="hyperbolic-canvas" style="width: 600px; height: 600px;"></div>
```

```javascript
let canvas = HyperbolicCanvas.create('#hyperbolic-canvas');
```

### API

See `API.md` for a list of functions and their descriptions.

## Scope

This library prioritizes the visualization of hyperbolic geometry over precise mathematical calculation.  Due to the less-than-infinite precision of floating-point numbers, and because certain trigonometric functions are [ill-conditioned](https://en.wikipedia.org/wiki/Condition_number), these goals are often at odds.

### Accuracy Thresholds

The arbitrary constants `HyperbolicCanvas.INFINITY` and `HyperbolicCanvas.ZERO` have been defined for use in internal comparisons in place of `Infinity` and `0`, respectively.  Their values may be overridden, but increased accuracy will tend to lead to more unpredictable behavior.

### Jasmine Specs

This library uses [Jasmine specs][jasmine] to validate the code and prevent regressions.

The specs have been written to use random input values.  While this approach is unconventional, it provides more confidence than would an attempt to test an effectively infinite number of edge cases<!-- ha!  Get it? -->.  Some specs do occasionally fail; the frequency at which this occurs is determined by the accuracy of the constants `HyperbolicCanvas.INFINITY` and `HyperbolicCanvas.ZERO`.

The Jasmine library itself has been modified to run each spec multiple times, and a random number seed is used so that errors may be reproduced.  The seed and the spec run count can be set in the options menu on the [SpecRunner][jasmine] page.

[jasmine]: https://ItsNickBarry.github.io/hyperbolic-canvas/jasmine/SpecRunner.html

### Browser Support

Certain browsers do not provide support for the hyperbolic trigonometric functions. Polyfills are available.

## Development

Install dependencies via Yarn:

```bash
yarn install
```

Setup Husky to format code on commit:

```bash
yarn prepare
```
