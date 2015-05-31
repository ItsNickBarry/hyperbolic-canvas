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

  // TODO factory method naming?
  Polygon.fromVertices = function (vertices) {
    return new Polygon({ vertices: vertices });
  };

  // Polygon.fromN = function (n, center, radius, rotation) {
  //   if (n < 3){
  //     return false;
  //   }
  //   var direction = rotation || 0;
  //   var increment =Math.TAU / n;
  //   var vertices = [] ;
  //   for (var i = 0; i < n; i++) {
  //     // TODO don't use distantPoint, instead save the circle
  //     vertices.push(center.distantPoint(radius, direction));
  //     direction += increment;
  //   }
  //   return new Polygon({ vertices: vertices });
  // };

  Polygon.fromN = function (n, center, radius, rotation) {
    // TODO add inverse rotation ?
    if (n < 3){
      return false;
    }
    var direction = rotation || 0;
    var increment = Math.TAU / n;
    var vertices = [] ;
    var c = Circle.hyperbolicCenterRadius(center, radius);
    for (var i = 0; i < n; i++) {
      vertices.push(c.pointAt(direction));
      direction += increment;
    }
    return new Polygon({ vertices: vertices });
  };
})();
