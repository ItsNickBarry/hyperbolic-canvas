;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  HyperbolicCanvas.canvases = {};

  Math.TAU = 2 * Math.PI;

  HyperbolicCanvas.create = function (selector, name) {
    // TODO raise exception for bad arguments
    return HyperbolicCanvas.canvases[name] = new HyperbolicCanvas.Canvas({
      el: document.querySelector(selector)
    });
  };
})();
