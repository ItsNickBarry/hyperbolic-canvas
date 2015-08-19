;
(function () {
  var fn = function () {
    var canvas = HyperbolicCanvas.canvases['mouse-interaction'];

    var maxN = 12;
    var n = 3;
    var location = HyperbolicCanvas.Point.CENTER;
    var rotation = 0;
    var rotationInterval = Math.TAU / 800;
    var radius = 1;

    canvas.setFillStyle('#DD4814');

    var render = function (event) {
      canvas.clear();

      var polygon = HyperbolicCanvas.Polygon.givenNCenterRadius(n, location, radius, rotation);

      if (polygon) {
        canvas.fillPolygon(polygon);
        canvas.strokePolygonBoundaries(polygon);
      }
      rotation += rotationInterval;
      if (rotation > Math.TAU) {
        rotation -= Math.TAU;
      }
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

    canvas.canvas.addEventListener('click', incrementN);
    canvas.canvas.addEventListener('mousemove', resetLocation);
    document.addEventListener('wheel', scroll);

    setInterval(render, 40);
  };

  if (document.readyState != 'loading'){
    render();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})();
