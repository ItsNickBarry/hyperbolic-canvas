;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var script = function (canvas) {
    canvas.setContextProperties({ fillStyle: '#DD4814' });

    var vertices = [];

    var render = function (event) {
      canvas.clear();

      var point = canvas.at([event.clientX, event.clientY]);

      if (vertices.length >= 2) {
        vertices.push(point);

        var polygon = HyperbolicCanvas.Polygon.givenVertices(vertices);
        var path = canvas.pathForHyperbolic(polygon);
        canvas.fill(path);

        path = canvas.pathForHyperbolic(polygon, { infinite: true });
        canvas.stroke(path);

        vertices.pop();

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

  var canvas = HyperbolicCanvas.create('#hyperbolic-canvas', 'hand-drawn-polygon');
  script(canvas);
})();
