;
(function () {
  'use strict';
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }

  HyperbolicCanvas.canvases = {};

  HyperbolicCanvas.create = function (selector, name) {
    name = name || 'canvas' + Object.keys(HyperbolicCanvas.canvases).length;
    return HyperbolicCanvas.canvases[name] = new HyperbolicCanvas.Canvas({
      el: document.querySelector(selector) || document.createElement('div')
    });
  };

  HyperbolicCanvas.INFINITY = 1e12;
  HyperbolicCanvas.ZERO = 1e-6;

  Math.TAU = 2 * Math.PI;
})();
