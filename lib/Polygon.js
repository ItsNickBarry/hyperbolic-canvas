;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Point = window.HyperbolicCanvas.Point;
  var Line = window.HyperbolicCanvas.Line;
  var Circle = window.HyperbolicCanvas.Circle;

  var Polygon = window.HyperbolicCanvas.Polygon = function (options) {
    this.vertices = options.vertices;
  };

  Polygon.fromVertices = function (vertices) {
    return new Polygon({ vertices: vertices });
  };

  Polygon.fromNCenterRadius = function (n, center, radius, rotation, inverse) {
    // TODO make a non-hyperbolic radius version?
    // TODO are the vertices determined correctly?
    if (n < 3){
      return false;
    }
    var direction = rotation * (inverse ? -1 : 1) || 0;
    var increment = Math.TAU / n;
    console.log("creating polygon at: " + center.x + ', ' + center.y)
    console.log("first point at " + direction)
    var vertices = [] ;
    for (var i = 0; i < n; i++) {
      vertices.push(center.distantPoint(radius, direction))
      direction += increment;
    }
    return new Polygon({ vertices: vertices });
  };
})();
