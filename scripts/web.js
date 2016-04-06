;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    var fn = function () {
      var unitCircle = HyperbolicCanvas.Circle.givenCenterRadius(HyperbolicCanvas.Point.ORIGIN, .9999);

      var location = null;
      var angles = [];

      for (var i = 0; i < 30; i++) {
        angles.push(Math.random() * Math.TAU);
      }

      var step = function (event) {
        canvas.clear();

        if (location) {
          angles.forEach(function (angle, index, array) {
            var point = unitCircle.pointAt(angle);
            var line = HyperbolicCanvas.Line.givenTwoPoints(location, point);
            canvas.strokeHyperbolicLine(line, true);
            array[index] = array[index] + (Math.random()) * .1;
          });
        }
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

      setInterval(step, 66);
    };

    fn();
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'web');
  script(canvas);
})();
