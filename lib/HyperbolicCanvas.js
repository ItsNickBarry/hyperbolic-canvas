;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  window.HyperbolicCanvas.canvases = {};

  Math.TAU = 2 * Math.PI;

  window.HyperbolicCanvas.create = function (selector, name) {
    // TODO raise exception for bad arguments
    var canvas = new HyperbolicCanvas.Canvas({ el: document.querySelector(selector) });
    window.HyperbolicCanvas.canvases[name] = canvas;
    return canvas;
  };
})();
