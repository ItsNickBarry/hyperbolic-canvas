(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Canvas = window.HyperbolicCanvas.Canvas = function (el) {
    this.el = el;
    this.appendChildren();
  };

  Canvas.prototype.appendChildren = function () {
    this.viewport = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.viewport.className = 'viewport';
    this.el.appendChild(this.viewport);
    this.viewport.appendChild(this.canvas);
  };


  // fill a canvases array with new instances of the Canvas object
  var canvases = [];
  Array.prototype.forEach.call(document.getElementsByClassName("hyperbolic-canvas"), function (el) {
    canvases.push(new Canvas(el));
  });

  var addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
  };

  var resizeViewport = function () {
    viewport.style["max-width"] = viewport.style["max-height"] = null;
    var w = viewport.clientWidth;
    var h = viewport.clientHeight;
    var diameter = w > h ? h : w;
    canvas.width = canvas.height = diameter;
    viewport.style["max-width"] = viewport.style["max-height"] = "" + diameter + "px";
    canvas.style["border-radius"] = "" + Math.floor(diameter / 2) + "px";
  };

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
