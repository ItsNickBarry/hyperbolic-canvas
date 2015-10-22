;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  var Canvas = window.HyperbolicCanvas.Canvas;

  Math.TAU = 2 * Math.PI;
  if (typeof HyperbolicCanvas.scripts === "undefined") {
    window.HyperbolicCanvas.scripts = {};
  }

  window.HyperbolicCanvas.ready = function () {
    window.HyperbolicCanvas.canvases = {};
    Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
      var canvas = new Canvas({ el: el });

      // TODO if data-name is not specified on the element, store it with a generated name
      if (el.dataset.name) {
        window.HyperbolicCanvas.canvases[el.dataset.name] = canvas;
      }
    });
  };

  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }
})();
