describe('Polygon', function () {
  var Polygon = HyperbolicCanvas.Polygon;
  var polygon;

  describe('given n vertices', function () {
    var vertices, n;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      vertices = [];
      for (var i = 0; i < n; i++) {
        vertices.push(HyperbolicCanvas.Point.random());
      }
      polygon = Polygon.givenVertices(vertices);
    });

    it('has n vertices of type Point', function () {
      var vertices = polygon.getVertices();
      expect(vertices).toBeA(Array);
      expect(vertices.length).toBe(n);
      vertices.forEach(function (vertex) {
        expect(vertex).toBeA(HyperbolicCanvas.Point);
      });
    });

    it('has n lines of type Line', function () {
      var lines = polygon.getLines();
      expect(lines.length).toBe(n);
      expect(lines).toBeA(Array);
      lines.forEach(function (line) {
        expect(line).toBeA(HyperbolicCanvas.Line);
      });
    });
  });

  describe('given n angles of ideal points', function () {
    var n;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      var baseAngles = [];
      var total = 0;
      for (var i = 0; i < n; i++) {
        var angle = HyperbolicCanvas.Angle.random();
        baseAngles.push(angle);
        total += angle;
      }
      var angles = [];
      var currentAngle = 0;
      for (var i = 0; i < baseAngles.length; i++) {
        var angle = baseAngles[i] * Math.TAU / total;
        angles.push(currentAngle += angle);
      }
      polygon = Polygon.givenAnglesOfIdealVertices(angles);
    });

    it('has n lines of infinite hyperbolic length', function () {
      var lines = polygon.getLines();
      expect(lines).toBeA(Array);
      lines.forEach(function (line) {
        expect(line).toBeA(HyperbolicCanvas.Line);
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });
    });
  });

  describe('given side count, center, radius', function () {
    var n, center, radius, rotation;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      center = HyperbolicCanvas.Point.random();
      rotation = HyperbolicCanvas.Angle.random();
    });

    describe('in Euclidean context', function () {
      beforeEach(function () {
        radius = Math.random();
        polygon = Polygon.givenEuclideanNCenterRadius(
          n,
          center,
          radius,
          rotation
        );
      });

      it('has n vertices of type Point', function () {
        var vertices = polygon.getVertices();
        expect(vertices).toBeA(Array);
        expect(vertices.length).toBe(n);
        vertices.forEach(function (vertex) {
          expect(vertex).toBeA(HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        expect(
          polygon.getVertices()[0].euclideanAngleFrom(center)
        ).toApproximate(rotation);
      });

      it('has n lines of type Line', function () {
        var lines = polygon.getLines();
        expect(lines.length).toBe(n);
        expect(lines).toBeA(Array);
        lines.forEach(function (line) {
          expect(line).toBeA(HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal Euclidean length', function () {
        var lengths = [];
        polygon.getLines().forEach(function (line) {
          lengths.push(line.getEuclideanLength());
        });
        var n = lengths.length;
        for (var i = 0; i < n; i++) {
          expect(lengths[i]).toApproximate(lengths[(i + 1) % n]);
        }
      });
    });

    describe('in hyperbolic context', function () {
      beforeEach(function () {
        radius = Math.random() * 10;
        polygon = Polygon.givenHyperbolicNCenterRadius(
          n,
          center,
          radius,
          rotation
        );
      });

      it('has n vertices of type Point', function () {
        var vertices = polygon.getVertices();
        expect(vertices).toBeA(Array);
        expect(vertices.length).toBe(n);
        vertices.forEach(function (vertex) {
          expect(vertex).toBeA(HyperbolicCanvas.Point);
        });
      });

      it('has first vertex at given rotation angle', function () {
        expect(
          polygon.getVertices()[0].hyperbolicAngleFrom(center)
        ).toApproximate(rotation);
      });

      it('has n lines of type Line', function () {
        var lines = polygon.getLines();
        expect(lines.length).toBe(n);
        expect(lines).toBeA(Array);
        lines.forEach(function (line) {
          expect(line).toBeA(HyperbolicCanvas.Line);
        });
      });

      it('has lines of equal hyperbolic length', function () {
        var lengths = [];
        polygon.getLines().forEach(function (line) {
          lengths.push(line.getHyperbolicLength());
        });
        var n = lengths.length;
        for (var i = 0; i < n; i++) {
          expect(lengths[i]).toApproximate(lengths[(i + 1) % n]);
        }
      });
    });
  });
});
