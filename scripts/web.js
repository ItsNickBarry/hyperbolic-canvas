;
(function () {
  var fn = function () {
    var canvas = HyperbolicCanvas.canvases['web'];
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

  if (document.readyState != 'loading'){
    render();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})();
