;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === "undefined") {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['hexagons'] = function (canvas) {
    canvas.setFillStyle('#DD4814');

    var sideCount = 6;
    var radius = 1;
    var count = 4;
    var rotation = 0;
    var rotationInterval = Math.TAU / (Math.pow(sideCount, 4) * 2)

    var fn = function () {
      var polygons = [];
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < sideCount; j++) {
          var center = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(i * radius * 2, Math.TAU / sideCount * j + (i % 2 === 0 ? rotation : rotation * -1));
          var gon = HyperbolicCanvas.Polygon.givenNCenterRadius(sideCount, center, radius, Math.TAU / sideCount * j + Math.PI * i + rotation);
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
})();
