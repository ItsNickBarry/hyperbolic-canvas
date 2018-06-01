;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['comets'] = function (canvas) {
    comets = [];
    var spawnDistance = .99;

    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var step = function (event) {
      canvas.clear();

      var oldComets = comets;
      var newComets = [];

      var path;

      for (var i = 0; i < oldComets.length; i++) {
        comet = oldComets[i];
        if (comet.getEuclideanRadius() <= spawnDistance) {
          var distance = comet.distance || (Math.random() * .05 + .01);
          var newComet = comet.hyperbolicDistantPoint(distance);
          newComet.distance = distance;

          newComets.push(newComet);
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(newComet, .02);
          path = canvas.pathForHyperbolic(circle, { path2D: true, path: path });
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
        point._setDirection(HyperbolicCanvas.Angle.opposite(point.getAngle()));
        if (point.isOnPlane) {
          comets.push(point);
        }
      }
    };

    canvas.getCanvasElement().addEventListener('click', onClick);

    requestAnimationFrame(step);
  };
})();
