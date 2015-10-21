;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }
  if (typeof HyperbolicCanvas.scripts === "undefined") {
    window.HyperbolicCanvas.scripts = {};
  }


  HyperbolicCanvas.scripts['hand-drawn-polygon'] = function (canvas) {
    var fn = function () {
      canvas.setFillStyle('#DD4814');

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
          canvas.strokeLine(line);
        }
      };

      var addVertex = function (event) {
        var point = canvas.at([event.clientX, event.clientY]);
        if (!(vertices.length > 0 && point.equals(vertices[vertices.length - 1]))) {
          vertices.push(point);
        }
      };

      canvas.canvas.addEventListener('click', addVertex);
      canvas.canvas.addEventListener('mousemove', render);
    };

    fn();
  };
})();
