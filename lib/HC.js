;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var canvases = window.HyperbolicCanvas.canvases = [];

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

    this.ctx = this.canvas.getContext('2d');

    if (this.hasClass('hyperbolic-canvas-autoresize')) {
      this.sensor = new ResizeSensor(this.el, this.resize.bind(this));
    }
  };

  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');

    this.viewport.className = 'viewport';
    this.viewport.style.height = this.viewport.style.width = '100%';
    this.canvas.style.display = 'block';
    this.canvas.width = this.canvas.height = 0;

    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
  };

  Canvas.prototype.hasClass = function (className) {
    if (this.el.classList) {
      return this.el.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.el.className);
    }
  };

  Canvas.prototype.resize = function () {
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = null;

    var w = this.viewport.clientWidth;
    var h = this.viewport.clientHeight;
    this.diameter = w > h ? h : w;
    this.radius =  this.diameter / 2;

    this.canvas.width = this.canvas.height = this.diameter;
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = "" + (this.diameter) + "px";
    this.canvas.style["border-radius"] = "" + Math.floor(this.radius) + "px";
  };

  /*
  *
  * ctx
  * operations
  *
  */

  Canvas.prototype.distanceFromCenter = function (x, y) {
    var r = this.euclideanDistance(x, this.radius, y, this.radius) / this.radius;
    console.log("Euclidean Distance: " + r);
    return Math.log((1 + r) / (1 - r));
  };

  Canvas.prototype.euclideanDistance = function (x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };

  Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
    canvases.push(new Canvas(el));
  });
})();
