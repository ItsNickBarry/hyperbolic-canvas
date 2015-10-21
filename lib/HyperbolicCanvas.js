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
      if (el.id.length === 0) {
        throw "hyperbolic canvas tag must be given an id"
      } else {
        window.HyperbolicCanvas.canvases[el.id] = new Canvas({ el: el });
      }
    });
  };

  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }
})();
