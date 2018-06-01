;
(function () {
  if (typeof HyperbolicCanvas === 'undefined') {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === 'undefined') {
    window.HyperbolicCanvas.scripts = {};
  }

  HyperbolicCanvas.scripts['hand-drawn-polygon'] = function (canvas) {
    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var vertices = [];
    var lines = [];

    var render = function (event) {
      canvas.clear();

      var point = canvas.at([event.clientX, event.clientY]);

      if (vertices.length >= 2) {
        vertices.push(point);
        lines.push(HyperbolicCanvas.Line.givenTwoPoints(
          vertices[vertices.length - 2],
          point
        ));
        lines.push(HyperbolicCanvas.Line.givenTwoPoints(
          point,
          vertices[0]
        ));

        var polygon = HyperbolicCanvas.Polygon.givenVertices(vertices);
        polygon._lines = lines;
        var path = canvas.pathForHyperbolic(polygon);
        canvas.fill(path);

        path = canvas.pathForHyperbolic(polygon, { infinite: true });
        canvas.stroke(path);

        vertices.pop();
        lines.pop();
        lines.pop();

      } else if (vertices.length == 1) {
        var line = HyperbolicCanvas.Line.givenTwoPoints(vertices[0], point);
        var path = canvas.pathForHyperbolic(line);
        canvas.stroke(path);
      }
    };

    var addVertex = function (event) {
      var point = canvas.at([event.clientX, event.clientY]);
      if (!(vertices.length > 0 && point.equals(vertices[vertices.length - 1]))) {
        vertices.push(point);

        if (vertices.length > 1) {
          lines.push(HyperbolicCanvas.Line.givenTwoPoints(
            vertices[vertices.length - 2],
            point
          ));
        }
      }
    };

    var onMouseMove = function (event) {
      requestAnimationFrame(function () {
        render(event);
      });
    };

    canvas.getCanvasElement().addEventListener('click', addVertex);
    canvas.getCanvasElement().addEventListener('mousemove', onMouseMove);
  };
})();
