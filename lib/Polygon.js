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

  Polygon.prototype.rotate = function (angle) {
    var newVertices = [];
    this.vertices.forEach(function (v) {
      var distance = Line.fromTwoPoints(Point.CENTER, v).euclideanDistance();
      var angle = Circle.UNIT.angleAt(v) + angle;
      newVertices.push(Point.fromPolarCoordinates(distance, angle));
    });
    return Polygon.fromVertices(newVertices);
  };

  Polygon.fromVertices = function (vertices) {
    if (vertices.length < 3) {
      return false;
    }

    return new Polygon({ vertices: vertices });
  };

  Polygon.fromNCenterRadius = function (n, center, radius, rotation, inverse) {
    if (n < 3){
      return false;
    }

    var direction = rotation ? rotation * (inverse ? -1 : 1) : 0;
    var increment = Math.TAU / n;
    var vertices = [] ;

    for (var i = 0; i < n; i++) {
      vertices.push(center.distantPoint(radius, direction))
      direction += increment;
    }

    return new Polygon({ vertices: vertices });
  };
})();
