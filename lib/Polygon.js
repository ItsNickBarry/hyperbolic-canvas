;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Polygon = HyperbolicCanvas.Polygon = function (options) {
    this._vertices = options.vertices;
  };

  Polygon.prototype.getLines = function () {
    if (typeof this._lines === 'undefined') {
      this._lines = [];
      var vertices = this.getVertices();
      var n = vertices.length;
      for (var i = 0; i < vertices.length; i++) {
        this._lines.push(HyperbolicCanvas.Line.givenTwoPoints(
          vertices[i],
          vertices[(i + 1) % n]
        ));
      }
    }
    return this._lines;
  };

  Polygon.prototype.getVertices = function () {
    return this._vertices;
  };

  // Polygon.prototype.containsPoint = function (p) {
  //   var windingNumber = null; // TODO calculate winding number
  //
  //   return windingNumber > 0; // TODO what about polygons that cross into themselves?
  // };

  // Polygon.prototype.rotateAboutOrigin = function (angle) {
  //   var newVertices = [];
  //   this.getVertices().forEach(function (v) {
  //     var distance = Line.givenTwoPoints(Point.ORIGIN, v).getEuclideanLength();
  //     newVertices.push(Point.givenEuclideanPolarCoordinates(distance, v.getAngle() + angle));
  //   });
  //   return Polygon.givenVertices(newVertices);
  // };

  Polygon.givenAnglesOfIdealVertices = function (angles) {
    if (angles.length < 3) {
      return false;
    }

     var vertices = [];

     angles.forEach(function (angle) {
       vertices.push(HyperbolicCanvas.Point.givenIdealAngle(angle));
     });

     return Polygon.givenVertices(vertices);
  };

  Polygon.givenVertices = function (vertices) {
    if (vertices.length < 3) {
      return false;
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
    rotation = HyperbolicCanvas.Angle.normalize(rotation);

    var direction = rotation ? rotation * (inverse ? -1 : 1) : 0;
    var increment = Math.TAU / n;
    var vertices = [];

    for (var i = 0; i < n; i++) {
      vertices.push(center.hyperbolicDistantPoint(radius, direction))
      direction += increment;
      direction = HyperbolicCanvas.Angle.normalize(direction);
    }

    return new Polygon({ vertices: vertices });
  };
})();
