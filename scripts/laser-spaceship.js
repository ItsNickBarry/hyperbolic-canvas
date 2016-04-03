;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var randomColor = function () {
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
  };

  var script = function (canvas) {
    var keysDown = {};
    var keysUp = {};

    var ctx = canvas.getContext();
    var defaultProperties = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: 'white',
      strokeStyle: '#DD4814',
      fillStyle: '#333333',
    };

    canvas.setContextProperties(defaultProperties);

    var heading =  0;
    var headingIncrement = Math.TAU / 100;
    // why does initial velocity have to be > 0 to make bullets follow right heading?
    var velocity = .001;
    var velocityIncrement = .001;
    var maxVelocity = .05;

    var wingAngle = Math.TAU / 3;

    var bullets = [];

    var location = HyperbolicCanvas.Point.givenCoordinates(-.5, .5);
    var front;

    var drawShip = function () {
      front = location.distantPoint(.1, heading);
      var left = location.distantPoint(.05, heading + wingAngle);
      var right = location.distantPoint(.05, heading - wingAngle);

      // draw heading line
      ctx.setLineDash([5]);
      canvas.setContextProperties({
        lineWidth: 1,
        shadowBlur: 0,
        strokeStyle: 'white'
      });
      canvas.strokeLine(
        HyperbolicCanvas.Line.givenTwoPoints(front, location.distantPoint(30))
      );
      ctx.setLineDash([]);
      canvas.setContextProperties(defaultProperties);

      canvas.strokePolygon(HyperbolicCanvas.Polygon.givenVertices([
        front,
        left,
        location,
        right,
      ]));
    };

    var drawBullets = function () {
      for (var i in bullets) {
        var bullet = bullets[i];

        // use reach bullet's random color
        // canvas.setContextProperties({
        //   fillStyle: bullet.color
        // });

        canvas.fillCircle(
          HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(bullet, .01)
        );
      }
    };

    var render = function (event) {
      canvas.clear();
      drawShip();
      drawBullets();
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

      location = location.distantPoint(velocity, heading);
      heading = HyperbolicCanvas.Angle.normalize(location.direction);

      // update bullet locations
      var newBullets = [];
      for (var i in bullets) {
        var bullet = bullets[i];
        var newBullet = bullet.distantPoint(.1);
        newBullet.color = bullet.color;
        if (newBullet.getEuclideanRadius() < .99) {
          newBullets.push(newBullet);
        }
      }
      bullets = newBullets;

      render();
    };

    setInterval(fn, 60);

    addEventListener("keydown", function (e) {
      if (e.keyCode === 32) {
        // only fire on keydown, don't store in keysDown
        var bullet = HyperbolicCanvas.Point.givenCoordinates(
          front.getX(),
          front.getY()
        );
        bullet.direction = front.direction;
        bullet.color = randomColor();
        bullets.push(bullet);
      } else {
        keysDown[e.keyCode] = true;
      }
    }, false);

    addEventListener("keyup", function (e) {
      delete keysDown[e.keyCode];
    }, false);

    setInterval(render, 40);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'laser-spaceship');
  script(canvas);
})();
