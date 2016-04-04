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
    var framesSinceBullet = 0;
    var bulletFrameCooldown = 1;
    var lastBulletTime = new Date();
    var bulletCooldown = 200;


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
      canvas.setContextProperties(defaultProperties);
      ctx.setLineDash([]);

      canvas.strokePolygon(HyperbolicCanvas.Polygon.givenVertices([
        front,
        left,
        location,
        right,
      ]));

      // canvas.setContextProperties({
      //   strokeStyle: 'teal',
      //   lineWidth: 2,
      // });
      // canvas.strokeCircle(HyperbolicCanvas.Circle.givenThreePoints(
      //   front, left, right
      // ));
      // canvas.setContextProperties(defaultProperties);
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

    var drawRangeCircles = function () {
      // draw range circles
      canvas.setContextProperties({
        strokeStyle: 'black'
      });
      var circle;

      for (var i = 0; i < 3; i++) {
        circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(location, i + 1);
        ctx.setLineDash([circle.getCircumference() * .1, circle.getCircumference() * .9]);
        canvas.strokeCircle(circle);
      }
      for (var i = 0; i < 3; i++) {
        circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(location, i + .5);
        ctx.setLineDash([circle.getCircumference() * .1, circle.getCircumference() * 9.9]);
        canvas.strokeCircle(circle);
      }

      ctx.setLineDash([]);
      canvas.setContextProperties(defaultProperties);
    };

    var render = function (event) {
      canvas.clear();
      drawShip();
      drawBullets();
      drawRangeCircles();
    };

    var fn = function () {
      boost = 16 in keysDown ? 3 : 1;

  		if (37 in keysDown || 65 in keysDown) {
        heading += headingIncrement * boost;
      }
  		if (39 in keysDown || 68 in keysDown) {
        heading -= headingIncrement * boost;
      }

  		if (38 in keysDown || 87 in keysDown) {
  			if (velocity < maxVelocity) {
          velocity += velocityIncrement * boost;
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

      // var now = new Date()
      // if (32 in keysDown && now - lastBulletTime > bulletCooldown) {
      if (32 in keysDown && framesSinceBullet > bulletFrameCooldown) {
        // fire
        var bullet = HyperbolicCanvas.Point.givenCoordinates(
          front.getX(),
          front.getY()
        );
        bullet.setDirection(front.getDirection() + (Math.random() -.5) * Math.TAU / 100);
        bullet.color = randomColor();
        bullets.push(bullet);

        // lastBulletTime = now;
        framesSinceBullet = 0;
      } else {
        framesSinceBullet +=1;
      }

      location = location.distantPoint(velocity, heading);
      heading = location.getDirection();
      velocity *= .99;

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

    setInterval(fn, 100);

    addEventListener("keydown", function (e) {
      // if (e.keyCode === 32) {
      //   var now = new Date();
      //   if (now - lastBulletTime < bulletCooldown) {
      //     return;
      //   }
      //   lastBulletTime = now;
      //   // only fire on keydown, don't store in keysDown
      //   var bullet = HyperbolicCanvas.Point.givenCoordinates(
      //     front.getX(),
      //     front.getY()
      //   );
      //   bullet.setDirection(front.getDirection());
      //   bullet.color = randomColor();
      //   bullets.push(bullet);
      //
      //     var audioName = 'mod blaster';
      //     var audio = new Audio('https://github.com/endless-sky/endless-sky/raw/master/sounds/' + audioName +'.wav');
      //     audio.play();ss
      // } else {
      //   keysDown[e.keyCode] = true;
      // }
      keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
      delete keysDown[e.keyCode];
    }, false);
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'laser-spaceship');
  script(canvas);
})();
