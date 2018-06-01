;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['mouse-interaction'] = function (canvas) {
    var maxN = 12;
    var n = 3;
    var location = HyperbolicCanvas.Point.ORIGIN;
    var rotation = 0;
    var rotationInterval = Math.TAU / 800;
    var radius = 1;

    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var render = function (event) {
      canvas.clear();

      var polygon = HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(n, location, radius, rotation);

      if (polygon) {
        var path = canvas.pathForHyperbolic(polygon);

        polygon.getVertices().forEach(function (v) {
          var angle = location.hyperbolicAngleTo(v);
          path = canvas.pathForHyperbolic(HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(
            n,
            location.hyperbolicDistantPoint(radius * 1.5, angle),
            radius / 2,
            angle + rotation
          ), { path2D: true, path: path });
        });

        canvas.fillAndStroke(path);
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
})();
