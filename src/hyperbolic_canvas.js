const HyperbolicCanvas = (module.exports = {});

// modules attach themselves to HyperbolicCanvas and do not include exports
require('./angle.js');
require('./point.js');
require('./line.js');
require('./circle.js');
require('./polygon.js');
require('./canvas.js');

HyperbolicCanvas.create = function (selector) {
  let el = document.querySelector(selector) || document.createElement('div');

  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }

  let backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  let underlay = document.createElement('div');
  underlay.className = 'underlay';
  underlay.style.display = 'block';
  let canvasEl = document.createElement('canvas');
  canvasEl.className = 'hyperbolic';
  canvasEl.style.position = 'absolute';

  el.appendChild(backdrop);
  backdrop.appendChild(underlay);
  underlay.appendChild(canvasEl);

  let w = el.clientWidth;
  let h = el.clientHeight;
  let d = w > h ? h : w;
  let r = d / 2;
  underlay.style.width = underlay.style.height = d + 'px';
  backdrop.style.width = backdrop.style.height = d + 'px';
  underlay.style['border-radius'] = Math.floor(r) + 'px';
  canvasEl.style['border-radius'] = Math.floor(r) + 'px';
  canvasEl.width = canvasEl.height = d;

  let ctx = canvasEl.getContext('2d');
  let canvas = new HyperbolicCanvas.Canvas(ctx);

  canvas._el = el;
  canvas._backdrop = backdrop;
  canvas._underlay = underlay;
  canvas._canvas = canvasEl;

  return canvas;
};

HyperbolicCanvas.INFINITY = 1e12;
HyperbolicCanvas.ZERO = 1e-6;

Math.TAU = 2 * Math.PI;
