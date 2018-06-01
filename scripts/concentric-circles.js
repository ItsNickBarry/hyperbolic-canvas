;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
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

  HyperbolicCanvas.scripts['concentric-circles'] = function (canvas) {
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

      for (var i = 26; i > 0; i--) {
        canvas.setContextProperties({ fillStyle: colors[i] });
        var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
          location,
          i * .5
        );
        if (circle) {
          var path = canvas.pathForHyperbolic(circle);
          canvas.fill(path);
        }
      }
    };

    var onClick = function (event) {
      canvas.getCanvasElement().removeEventListener('click', onClick);
      incrementColor(1);
    };

    var incrementColor = function (ms) {
      colors.unshift(colors.pop());
      requestAnimationFrame(render);
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
        location = HyperbolicCanvas.Point.givenEuclideanPolarCoordinates(
          .9999,
          location.getAngle()
        );
      }
      requestAnimationFrame(render);
    };

    var onScroll = function (event) {
      if (event.deltaY < 0) {
        colors.unshift(colors.pop());
      } else if (event.deltaY > 0) {
        colors.push(colors.shift());
      }
      requestAnimationFrame(render);
    };

    canvas.getCanvasElement().addEventListener('click', onClick);
    canvas.getContainerElement().addEventListener('mousemove', onMouseMove);
    document.addEventListener('wheel', onScroll);
  };
})();
