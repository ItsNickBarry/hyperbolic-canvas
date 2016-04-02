;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

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
      ];

      maxRadius = 6;

      var render = function (event) {
        canvas.clear();

        circles = [];

        for (var i = 0; i < colors.length; i++) {
          canvas.setFillStyle(colors[i]);
          var circle = HyperbolicCanvas.Circle.givenHyperbolicCenterRadius(
            location,
            maxRadius / i
          );
          if (circle) {
            canvas.fillCircle(circle);
          }
        }
      };

      var onClick = function (event) {
        console.log('click')
        colors.unshift(colors.pop());
        render();
      };

      var onMouseMove = function (event) {
        if (event) {
          x = event.clientX;
          y = event.clientY;
        }
        location = canvas.at([x, y]);
        render();
      };

      var scroll = function (event) {
        // radius += event.deltaY * .01;
        // if (radius < .05) {
        //   radius = .05;
        // } else if (radius > 20) {
        //   radius = 20;
        // }
      };

      canvas.getCanvasElement().addEventListener('click', onClick);
      canvas.getCanvasElement().addEventListener('mousemove', onMouseMove);
      document.addEventListener('wheel', scroll);

      // setInterval(render, 40);
    };

    fn();
  };

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'concentric-circles');
  script(canvas);
})();
