;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var sideCount = 6;
    var radius = .9;
    var ringCount = 4;
    var rotation = 0;
    var rotationDenominator = Math.pow(sideCount, 4) * 3;
    var rotationInterval = Math.TAU / rotationDenominator;

    var fn = function () {
      var polygons = [];
      for (var i = 0; i < ringCount; i++) {
        for (var j = 0; j < sideCount; j++) {
          var center = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(
            i * radius * 2,
            Math.TAU / sideCount * j + (i % 2 === 0 ? rotation : rotation * -1)
          );
          var gon = HyperbolicCanvas.Polygon.givenNCenterRadius(
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
      polygons.forEach(function (polygon) {
        canvas.fillPolygon(polygon);
      });
    };
    fn();
    setInterval(fn, 100);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'hexagons');
  script(canvas);
})();
