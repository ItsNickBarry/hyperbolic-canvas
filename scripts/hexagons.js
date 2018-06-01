;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['hexagons'] = function (canvas) {
    var counter = 0;
    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var sideCount = 6;
    var radius = .9;
    var ringCount = 4;
    var rotation = 0;
    var rotationDenominator = Math.pow(sideCount, 4) * 6;
    var rotationInterval = Math.TAU / rotationDenominator;

    var render = function () {
      if (counter < 4) {
        counter += 1;
        requestAnimationFrame(render);
        return;
      }
      counter = 0;
      var polygons = [];
      for (var i = 0; i < ringCount; i++) {
        for (var j = 0; j < sideCount; j++) {
          var center = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(
            i * radius * 2,
            Math.TAU / sideCount * j + (i % 2 === 0 ? rotation : rotation * -1)
          );
          var gon = HyperbolicCanvas.Polygon.givenHyperbolicNCenterRadius(
            sideCount,
            center,
            radius,
            (Math.TAU / sideCount * j + rotation) * (i + 1) // + Math.PI * i // if sideCount is odd
          );
          polygons.push(gon);
        }
      }
      rotation += rotationInterval;

      canvas.clear();

      var path;
      polygons.forEach(function (polygon) {
        path = canvas.pathForHyperbolic(polygon, { path2D: true, path: path });
      });
      canvas.fill(path);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };
})();
