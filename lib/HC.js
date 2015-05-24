(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  console.log('load hc.js')
  var canvases = window.HyperbolicCanvas.canvases = [];

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
    this.resize();

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

  Canvas.prototype.resize = function () {
    console.log('resizing');
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = null;
    var r = this.radius();
    this.canvas.width = this.canvas.height = r * 2;
    this.viewport.style["max-width"] = this.viewport.style["max-height"] = "" + (r * 2) + "px";
    this.canvas.style["border-radius"] = "" + Math.floor(r) + "px";
  };

  Canvas.prototype.hasClass = function (className) {
    if (this.el.classList) {
      return this.el.classList.contains(className);
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.el.className);
    }
  };

  Canvas.prototype.radius = function () {
    var w = this.viewport.clientWidth;
    var h = this.viewport.clientHeight;
    var diameter = w > h ? h : w;
    return diameter / 2;
  };

  Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
    canvases.push(new Canvas(el));
  });
})();
