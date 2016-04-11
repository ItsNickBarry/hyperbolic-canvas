;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    var unitCircle = HyperbolicCanvas.Circle.givenEuclideanCenterRadius(HyperbolicCanvas.Point.ORIGIN, .9999);

    var location = null;
    var angles = [];

    for (var i = 0; i < 30; i++) {
      angles.push(Math.random() * Math.TAU);
    }

    var step = function (event) {
      canvas.clear();

      if (location) {
        var path = new Path2D();
        angles.forEach(function (angle, index, array) {
          var point = unitCircle.euclideanPointAt(angle);
          var line = HyperbolicCanvas.Line.givenTwoPoints(location, point);
          path = canvas.pathForHyperbolic(line, { basePath: path, infinite: true });
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

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'web');
  script(canvas);
})();
