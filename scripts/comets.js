;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var maxComets = 0;
  var put = function(n){ comets.push(HyperbolicCanvas.Point.givenPolarCoordinates(.5, n));}
  var script = function (canvas) {
    var fn = function () {
      var location = null;
      comets = [];
      var spawnDistance = 3;

      canvas.setFillStyle('#DD4814');

      var step = function (event) {
        console.log('step')
        canvas.clear();

        if (location && comets.length < maxComets && Math.random() > .01) {
          // var spawnPoint = location.distantPoint(.0001, Math.random() * Math.TAU);
          comets.push(location);
          // console.log(spawnPoint);
          // console.log(location);
          // debugger
        }

        var oldComets = comets;
        var newComets = [];

        oldComets.forEach(function (comet) {
          if (comet.getHyperbolicRadius() <= spawnDistance) {
            var newComet = comet.distantPoint(.05);
            newComets.push(newComet);
            canvas.fillCircle(window.HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(newComet, .1));
          } else {
            maxComets -= 1;
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
        // location = point.isOnPlane ? point : null;
        if (point.isOnPlane) {
          location = point;
          maxComets += 1;
        } else {
          location = null;
        }
      };

      canvas.getCanvasElement().addEventListener('click', resetLocation);

      setInterval(step, 50);
    };

    fn();
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'comets');
  script(canvas);
})();
