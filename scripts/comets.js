;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    comets = [];
    var spawnDistance = .99;

    canvas.setFillStyle('#DD4814');

    var step = function (event) {
      canvas.clear();
      canvas.strokeGrid(2);

      var oldComets = comets;
      var newComets = [];

      for (var i = 0; i < oldComets.length; i++) {
        comet = oldComets[i];
        if (comet.getEuclideanRadius() <= spawnDistance) {
          var newComet = comet.distantPoint(.05);

          newComets.push(newComet);
          canvas.fillAndStrokeCircle(HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(newComet, .02));
        }
      }

      comets = newComets;
    };

    var onClick = function (event) {
      if (event) {
        x = event.clientX;
        y = event.clientY;
      }
      var point = canvas.at([x, y]);
      point.direction = point.getAngle() + Math.PI;
      if (point.isOnPlane) {
        comets.push(point);
      }
    };

    canvas.getCanvasElement().addEventListener('click', onClick);

    setInterval(step, 50);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'comets');
  script(canvas);
})();
