;
(function () {
  "use strict";
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  HyperbolicCanvas.canvases = {};

  Math.TAU = 2 * Math.PI;

  HyperbolicCanvas.create = function (selector, name) {
    name = name || 'canvas' + Object.keys(HyperbolicCanvas.canvases).length;
    return HyperbolicCanvas.canvases[name] = new HyperbolicCanvas.Canvas({
      el: document.querySelector(selector) || document.createElement('div')
    });
  };
})();
