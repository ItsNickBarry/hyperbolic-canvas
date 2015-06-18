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
    // TODO save lines ?
    var lines = [];

    for (var i = 0; i < this.vertices.length; i++) {
      lines.push(Line.givenTwoPoints(this.vertices[i], this.vertices[(i + 1) % vertices.length]));
    }

    // draw ray from Point p to somewhere off the canvas
    // count intersections
    
  };

  Polygon.prototype.rotate = function (angle) {
    var newVertices = [];
    this.vertices.forEach(function (v) {
      var distance = Line.givenTwoPoints(Point.CENTER, v).euclideanDistance();
      var angle = Circle.UNIT.angleAt(v) + angle;
      newVertices.push(Point.givenPolarCoordinates(distance, angle));
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
