;
(function () {
  var reRender = true;

  var render = function () {

    var canvas = HyperbolicCanvas.canvases['hexagons'];

    canvas.setFillStyle('#DD4814');

    var sideCount = 6;
    var radius = 1;
    var count = 12;
    var rotation = 0;

    var fn = function () {
      if (!reRender) {
        return false;
      }
      var polygons = [];
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < sideCount; j++) {
          var center = HyperbolicCanvas.Point.givenHyperbolicPolarCoordinates(i * radius * 2, Math.TAU / sideCount * j - rotation);
          var gon = HyperbolicCanvas.Polygon.givenNCenterRadius(sideCount, center, radius, Math.TAU / sideCount * j + Math.PI * i + rotation);
          polygons.push(gon);
        }
      }
      rotation += Math.TAU / (sideCount * sideCount * 2);
      canvas.clear();
      polygons.forEach(function (polygon) {
        canvas.fillPolygon(polygon);
      });
    };
    fn();
    setInterval(fn, 700);
  };

  var toggleRender = function () {
    reRender ^= true;
  };

  document.addEventListener('click', toggleRender);

  if (document.readyState != 'loading'){
    render();
  } else {
    document.addEventListener('DOMContentLoaded', render);
  }
})();
