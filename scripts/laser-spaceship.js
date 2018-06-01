;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  var randomColor = function () {
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
  };

  HyperbolicCanvas.scripts['laser-spaceship'] = function (canvas) {
    var keysDown = {};
    var keysUp = {};

    var ctx = canvas.getContext();
    var defaultProperties = {
      lineDash: [],
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: 'white',
      strokeStyle: '#DD4814',
      fillStyle: '#333333',
    };

    canvas.setContextProperties(defaultProperties);

    var heading = HyperbolicCanvas.Angle.random();
    var headingIncrement = Math.TAU / 100;
    var velocity = 0;
    var velocityIncrement = .002;
    var maxVelocity = .05;

    var wingAngle = Math.TAU / 3;

    var bullets = [];
    var framesSinceBullet = 0;
    var bulletFrameCooldown = 1;
    var lastBulletTime = new Date();
    var bulletCooldown = 200;


    var location = HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
      .5,
      HyperbolicCanvas.Angle.opposite(heading)
    );
    var front;

    var drawShip = function () {
      front = location.hyperbolicDistantPoint(.1, heading);
      var left = location.hyperbolicDistantPoint(.05, heading + wingAngle);
      var right = location.hyperbolicDistantPoint(.05, heading - wingAngle);

      // draw heading line
      canvas.setContextProperties({
        lineDash: [5],
        lineWidth: 1,
        shadowBlur: 0,
        strokeStyle: 'white'
      });
      var path = canvas.pathForHyperbolic(
        HyperbolicCanvas.Line.givenTwoPoints(front, location.hyperbolicDistantPoint(30))
      );
      canvas.stroke(path);
      canvas.setContextProperties(defaultProperties);

      // draw ship
      path = canvas.pathForHyperbolic(HyperbolicCanvas.Polygon.givenVertices([
        front,
        left,
        location,
        right,
      ]));
      canvas.stroke(path);
    };

    var drawBullets = function () {
      var path;
      for (var i in bullets) {
        var bullet = bullets[i];

        // use reach bullet's random color
        // canvas.setContextProperties({
        //   fillStyle: bullet.color
        // });

        path = canvas.pathForHyperbolic(
          HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(bullet, .01),
          { path2D: true, path: path }
        );
      }
      if(path){
        canvas.fill(path);
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
        canvas.setContextProperties({
          lineDash: [circle.getEuclideanCircumference() * .1, circle.getEuclideanCircumference() * .9]
        });
        canvas.stroke(canvas.pathForHyperbolic(circle));
      }
      for (var i = 0; i < 3; i++) {
        circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(location, i + .5);
        canvas.setContextProperties({
          lineDash: [circle.getEuclideanCircumference() * .1, circle.getEuclideanCircumference() * 9.9]
        });
        canvas.stroke(canvas.pathForHyperbolic(circle));
      }

      canvas.setContextProperties(defaultProperties);
    };

    var render = function (event) {
      canvas.clear();
      drawShip();
      drawBullets();
      drawRangeCircles();
    };

    var shouldRender = true;
    var fn = function () {
      if (shouldRender) {
        shouldRender ^= true;
        requestAnimationFrame(fn);
        return;
      }
      shouldRender ^= true;
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
        bullet._setDirection(front.getDirection() + (Math.random() -.5) * Math.TAU / 100);
        bullet.color = randomColor();
        bullets.push(bullet);

        // lastBulletTime = now;
        framesSinceBullet = 0;
      } else {
        framesSinceBullet +=1;
      }

      location = location.hyperbolicDistantPoint(velocity, heading);
      heading = location.getDirection();
      velocity *= .99;

      // update bullet locations
      var newBullets = [];
      for (var i in bullets) {
        var bullet = bullets[i];
        var newBullet = bullet.hyperbolicDistantPoint(.1);
        newBullet.color = bullet.color;
        if (newBullet.getEuclideanRadius() < .99) {
          newBullets.push(newBullet);
        }
      }
      bullets = newBullets;

      render();
      requestAnimationFrame(fn);
    };

    fn();

    addEventListener('keydown', function (e) {
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
      //   bullet._setDirection(front.getDirection());
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

    addEventListener('keyup', function (e) {
      delete keysDown[e.keyCode];
    }, false);
  };
})();
