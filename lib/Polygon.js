;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle;
  var Point = window.HyperbolicCanvas.Point;
  var Line = window.HyperbolicCanvas.Line;
  var Circle = window.HyperbolicCanvas.Circle;

  var Polygon = window.HyperbolicCanvas.Polygon = function (options) {
    this.vertices = options.vertices;
  };

  Polygon.prototype.containsPoint = function (p) {
    var windingNumber = null; // TODO calculate winding number

    return windingNumber > 0; // TODO what about polygons that cross into themselves?
  };

  Polygon.prototype.rotate = function (angle) {
    var newVertices = [];
    this.vertices.forEach(function (v) {
      var distance = Line.givenTwoPoints(Point.CENTER, v).euclideanDistance();
      newVertices.push(Point.givenPolarCoordinates(distance, v.angle() + angle));
    });
    return Polygon.givenVertices(newVertices);
  };

  Polygon.givenVertices = function (vertices) {
    if (vertices.length < 3) {
      return false;
    }

    for (var i = 0; i < vertices.length; i++) {
      if (!vertices[i].isOnPlane()) {
        return false;
      }
    }

    return new Polygon({ vertices: vertices });
  };

  Polygon.givenNCenterRadius = function (n, center, radius, rotation, inverse) {
    if (n < 3){
      return false;
    }
    if (!center.isOnPlane()) {
      return false;
    }
    rotation = Angle.normalize(rotation);

    var direction = rotation ? rotation * (inverse ? -1 : 1) : 0;
    var increment = Math.TAU / n;
    var vertices = [] ;

    for (var i = 0; i < n; i++) {
      vertices.push(center.distantPoint(radius, direction))
      direction += increment;
      direction = Angle.normalize(direction);
    }

    return new Polygon({ vertices: vertices });
  };
})();
