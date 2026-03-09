# Hyperbolic Canvas

A Javascript implementation of the [Poincaré disk model](https://en.wikipedia.org/wiki/Poincar%C3%A9_disk_model) of the hyperbolic plane, on an HTML canvas.

Usage examples can be found on the [project site](https://ItsNickBarry.github.io/hyperbolic-canvas).

## Installation

### Via NPM

```
npm install --save hyperbolic-canvas
```

## Usage

Create an HTML canvas element and obtain its 2D rendering context. Pass the context to the `Canvas` constructor:

```html
<canvas id="hyperbolic-canvas" width="600" height="600"></canvas>
```

```javascript
import { Canvas } from 'hyperbolic-canvas';

const ctx = document.getElementById('hyperbolic-canvas').getContext('2d');
let canvas = new Canvas(ctx);
```

### API

See `API.md` for a list of functions and their descriptions.

## Scope

This library prioritizes the visualization of hyperbolic geometry over precise mathematical calculation. Due to the less-than-infinite precision of floating-point numbers, and because certain trigonometric functions are [ill-conditioned](https://en.wikipedia.org/wiki/Condition_number), these goals are often at odds.

### Accuracy Thresholds

The arbitrary constants `INFINITY` and `ZERO` have been defined for use in internal comparisons in place of `Infinity` and `0`, respectively. Their values may be overridden, but increased accuracy will tend to lead to more unpredictable behavior.

### Browser Support

Certain browsers do not provide support for the hyperbolic trigonometric functions. Polyfills are available.

## Development

Install dependencies via pnpm:

```bash
pnpm install
```

Setup Husky to format code on commit:

```bash
pnpm prepare
```
