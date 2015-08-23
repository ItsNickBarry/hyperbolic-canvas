;
(function () {
  var fn = function () {
    var canvas = HyperbolicCanvas.canvases['comets'];

    var location = null;
    var comets = [];
    var maxComets = 10;
    var spawnDistance = 3;

    canvas.setFillStyle('#DD4814');

    var step = function (event) {
      console.log('step')
      canvas.clear();

      if (location && comets.length < maxComets && Math.random() > .01) {
        var spawnPoint = location.distantPoint(.0001, Math.random() * Math.TAU);
        comets.push(spawnPoint);
        // console.log(spawnPoint);
        // console.log(location);
        // debugger
      }

      var oldComets = comets;
      var newComets = [];

      oldComets.forEach(function (comet) {
        if (comet.distanceFromCenter() <= spawnDistance) {
          var newComet = comet.distantPoint(.05);
          newComets.push(newComet);
          canvas.fillCircle(window.HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(newComet, .1));
        }
      });

      comets = newComets;
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

    setInterval(step, 200);
  };

  if (document.readyState != 'loading'){
    render();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})();
