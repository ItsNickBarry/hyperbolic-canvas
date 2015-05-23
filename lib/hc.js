(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.autoresize();
    this.sensor = new ResizeSensor(this.el, this.autoresize.bind(this));
  };

  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.viewport.className = 'viewport';
    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
  };

  Canvas.prototype.autoresize = function () {
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = null;
    var r = this.radius();
    this.canvas.width = this.canvas.height = r * 2;
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = "" + (r * 2) + "px";
    this.canvas.style["border-radius"] = "" + Math.floor(r) + "px";
  };

  Canvas.prototype.radius = function () {
    var w = this.viewport.clientWidth;
    var h = this.viewport.clientHeight;
    var diameter = w > h ? h : w;
    return diameter / 2;
  };


  // fill a canvases array with new instances of the Canvas object
  var canvases = [];
  Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
    canvases.push(new Canvas(el));
  });

  // var canvas = document.getElementsByTagName("canvas")[0];
  // var viewport = document.getElementsByClassName("viewport")[0];
  //
  // addEvent(window, "resize", resizeViewport);
  // resizeViewport();
  //
  // var ctx = canvas.getContext("2d");
  // var game = new Asteroids.Game();
  // new Asteroids.GameView(canvas, game, ctx).start();
})();
