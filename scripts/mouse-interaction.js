;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    var maxN = 12;
    var n = 3;
    var location = HyperbolicCanvas.Point.ORIGIN;
    var rotation = 0;
    var rotationInterval = Math.TAU / 800;
    var radius = 1;

    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var render = function (event) {
      canvas.clear();

      var polygon = HyperbolicCanvas.Polygon.givenNCenterRadius(n, location, radius, rotation);

      if (polygon) {
        var path = canvas.pathForHyperbolic(polygon);
        canvas.fill(path);
        // path = canvas.pathForHyperbolic(polygon, { extendBoundaries: true });
        canvas.stroke(path);
      }
      rotation += rotationInterval;
      if (rotation > Math.TAU) {
        rotation -= Math.TAU;
      }
      requestAnimationFrame(render);
    };

    var resetLocation = function (event) {
      if (event) {
        x = event.clientX;
        y = event.clientY;
      }
      location = canvas.at([x, y]);
    };

    var incrementN = function () {
      n += 1;
      n %= maxN;
      n = n < 3 ? 3 : n;
    };

    var scroll = function (event) {
      radius += event.deltaY * .01;
      if (radius < .05) {
        radius = .05;
      } else if (radius > 20) {
        radius = 20;
      }
    };

    canvas.getCanvasElement().addEventListener('click', incrementN);
    canvas.getCanvasElement().addEventListener('mousemove', resetLocation);
    document.addEventListener('wheel', scroll);

    requestAnimationFrame(render);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'mouse-interaction');
  script(canvas);
})();
