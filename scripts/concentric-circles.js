;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var curry = function (fn, obj, numArgs) {
    var firstArgs = Array.prototype.slice.call(arguments, 3);

    return function curriedFunction () {

      var args = firstArgs.concat(Array.prototype.slice.call(arguments));

      if (args.length >= numArgs) {
        return fn.apply(obj, args);
      } else {
        return curriedFunction;
      }
    }
  };

  var script = function (canvas) {
    var fn = function () {
      var location = HyperbolicCanvas.Point.ORIGIN;

      colors = [
        '#DD4814',
        '#E05A2B',
        '#E36C43',
        '#E77E5A',
        '#EA9172',
        '#EEA389',
        '#EFAC95',
        '#F1B5A1',
        '#F3BEAC',
        '#F4C8B8',
        '#F6D1C4',
        '#F8DAD0',
        '#F9E3DB',
        '#FBECE7',
        // reverse
        '#F9E3DB',
        '#F8DAD0',
        '#F6D1C4',
        '#F4C8B8',
        '#F3BEAC',
        '#F1B5A1',
        '#EFAC95',
        '#EEA389',
        '#EA9172',
        '#E77E5A',
        '#E36C43',
        '#E05A2B',
      ];

      maxRadius = 6;

      var render = function (event) {
        canvas.clear();

        circles = [];

        for (var i = 0; i < 14; i++) {
          canvas.setFillStyle(colors[i]);
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            location,
            maxRadius / (i + 1)
          );
          if (circle) {
            canvas.fillCircle(circle);
          }
        }
      };

      var onClick = function (event) {
        canvas.getCanvasElement().removeEventListener('click', onClick);
        incrementColor(1);
      };

      var incrementColor = function (ms) {
        colors.unshift(colors.pop());
        render();
        ms += 1;
        if (ms < 75) {
          setTimeout(curry(incrementColor, null, 1, ms), ms);
        } else {
          canvas.getCanvasElement().addEventListener('click', onClick);
        }
      };

      var onMouseMove = function (event) {
        if (event) {
          x = event.clientX;
          y = event.clientY;
        }
        location = canvas.at([x, y]);
        if (!location.isOnPlane()) {
          location = HyperbolicCanvas.Point.givenPolarCoordinates(
            .9999,
            location.getAngle()
          );
        }
        render();
      };

      var onScroll = function (event) {
        if (event.deltaY < 0) {
          colors.unshift(colors.pop());
        } else if (event.deltaY > 0) {
          colors.push(colors.shift());
        }
        render();
      };

      canvas.getCanvasElement().addEventListener('click', onClick);
      canvas.getContainerElement().addEventListener('mousemove', onMouseMove);
      document.addEventListener('wheel', onScroll);

      // setInterval(render, 40);
    };

    fn();
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'concentric-circles');
  script(canvas);
})();
