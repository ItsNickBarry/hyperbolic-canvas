;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    var keysDown = {};
    var keysUp = {};

    var ctx = canvas.getContext();

    canvas.setContextProperties({
      lineWidth: 3,
      shadowBlur: 20,
      shadowColor: '#DD4814',
      strokeStyle: '#DD4814'
    });

    var heading =  0;
    var headingIncrement = Math.TAU / 100;
    var velocity = 0;
    var velocityIncrement = .005;
    var maxVelocity = .05;

    var wingAngle = Math.TAU / 3;

    var location = HyperbolicCanvas.Point.givenCoordinates(-.5, .5);

    var drawShip = function () {
      var front = location.distantPoint(.3, heading);
      var left = location.distantPoint(.15, heading + wingAngle);
      var right = location.distantPoint(.15, heading - wingAngle);

      var lines = [
        HyperbolicCanvas.Line.givenTwoPoints(front, left),
        HyperbolicCanvas.Line.givenTwoPoints(front, right),
        HyperbolicCanvas.Line.givenTwoPoints(left, right),
        HyperbolicCanvas.Line.givenTwoPoints(location, left),
        HyperbolicCanvas.Line.givenTwoPoints(location, right),
        HyperbolicCanvas.Line.givenTwoPoints(location, front),
      ];

      for (var i = 0; i < lines.length; i++) {
        canvas.strokeLine(lines[i]);
      }

      // draw heading line
      ctx.setLineDash([5]);
      canvas.strokeLine(
        HyperbolicCanvas.Line.givenTwoPoints(location, front),
        true
      );
      ctx.setLineDash([]);
    };

    var render = function (event) {
      canvas.clear();
      drawShip();
    };

    var fn = function () {

  		if (37 in keysDown || 65 in keysDown) {
        heading += headingIncrement;
      }
  		if (39 in keysDown || 68 in keysDown) {
        heading -= headingIncrement;
      }

  		if (38 in keysDown || 87 in keysDown) {
  			if (velocity < maxVelocity) {
          velocity += velocityIncrement;
        }
  		}
  		if (40 in keysDown || 83 in keysDown) {
  			if (velocity > 0) {
          velocity -= velocityIncrement;
          if (velocity < 0) {
            velocity = 0;
          }
        }
  		}

      if (32 in keysDown) {
        //laser
      }

      location = location.distantPoint(velocity, heading);
      heading = HyperbolicCanvas.Angle.normalize(location.direction);

      render();
    };

    setInterval(fn, 60);

    // canvas.getCanvasElement().addEventListener('click', onClick);
    // document.addEventListener('wheel', scroll);

    addEventListener("keydown", function (e) {
      keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
      delete keysDown[e.keyCode];
    }, false);

    setInterval(render, 40);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'laser-spaceship');
  script(canvas);
})();
