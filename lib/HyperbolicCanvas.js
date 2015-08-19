;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  var Canvas = window.HyperbolicCanvas.Canvas;

  Math.TAU = 2 * Math.PI;

  window.HyperbolicCanvas.canvases = [];

  window.HyperbolicCanvas.ready = function () {
    Array.prototype.forEach.call(document.getElementsByTagName("hyperbolic-canvas"), function (el) {
      var classes = el.className.split(' ');
      new Canvas(el);
    });
  };

  if (document.readyState != 'loading'){
    window.HyperbolicCanvas.ready();
  } else {
    document.addEventListener('DOMContentLoaded', window.HyperbolicCanvas.ready);
  }
})();
