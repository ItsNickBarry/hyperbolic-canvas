;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['web'] = function (canvas) {
    var unitCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(HyperbolicCanvas.Point.ORIGIN, .9999);

    var location = null;
    var angles = [];

    for (var i = 0; i < 30; i++) {
      angles.push(Math.random() * Math.TAU);
    }

    var step = function (event) {
      canvas.clear();

      if (location) {
        var path;
        angles.forEach(function (angle, index, array) {
          var point = unitCircle.euclideanPointAt(angle);
          var line = HyperbolicCanvas.Line.givenTwoPoints(location, point);
          path = canvas.pathForHyperbolic(line, { path2D: true, path: path, infinite: true });
          array[index] = array[index] + (Math.random()) * .1;
        });
        canvas.stroke(path);
      }
      requestAnimationFrame(step)
    };

    var resetLocation = function (event) {
      if (event) {
        x = event.clientX;
        y = event.clientY;
      }
      var point = canvas.at([x, y]);
      location = point.isOnPlane ? point : null;
    };

    canvas.getCanvasElement().addEventListener('mousemove', resetLocation);

    requestAnimationFrame(step);
  };
})();
