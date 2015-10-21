;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === "undefined") {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['web'] = function (canvas) {
    var fn = function () {
      var unitCircle = HyperbolicCanvas.Circle.givenCenterRadius(HyperbolicCanvas.Point.CENTER, .9999);

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
            var line = window.HyperbolicCanvas.Line.givenTwoPoints(location, point);
            canvas.strokeLine(line, true);
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

      canvas.canvas.addEventListener('mousemove', resetLocation);

      setInterval(step, 66);
    };

    fn();
  };
})();
