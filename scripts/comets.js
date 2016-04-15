;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    comets = [];
    var spawnDistance = .99;

    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var step = function (event) {
      canvas.clear();

      var oldComets = comets;
      var newComets = [];

      var path = new Path2D();

      for (var i = 0; i < oldComets.length; i++) {
        comet = oldComets[i];
        if (comet.getEuclideanRadius() <= spawnDistance) {
          var distance = comet.distance || (Math.random() * .05 + .01);
          var newComet = comet.hyperbolicDistantPoint(distance);
          newComet.distance = distance;

          newComets.push(newComet);
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(newComet, .02);
          path = canvas.pathForHyperbolic(circle, { basePath: path });
        }
      }
      canvas.fillAndStroke(path);

      comets = newComets;
      requestAnimationFrame(step);
    };

    var onClick = function (event) {
      if (event) {
        x = event.clientX;
        y = event.clientY;
        var point = canvas.at([x, y]);
        point.setDirection(HyperbolicCanvas.Angle.opposite(point.getAngle()));
        if (point.isOnPlane) {
          comets.push(point);
        }
      }
    };

    canvas.getCanvasElement().addEventListener('click', onClick);

    requestAnimationFrame(step);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'comets');
  script(canvas);
})();
