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
        var tempVertices = [];
        vertices.forEach(function (v) {
          tempVertices.push(v);
        });
        tempVertices.push(point);

        var polygon = HyperbolicCanvas.Polygon.givenVertices(tempVertices);
        canvas.fillPolygon(polygon);
        canvas.strokePolygonBoundaries(polygon);
      } else if (vertices.length == 1) {
        var line = HyperbolicCanvas.Line.givenTwoPoints(vertices[0], point);
        canvas.strokeHyperbolicLine(line);
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
