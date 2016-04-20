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

    it('should have n vertices of type Point', function () {
      var vertices = polygon.getVertices();
      expect(vertices).toBeA(Array);
      expect(vertices.length).toBe(n);
      vertices.forEach(function (vertex) {
        expect(vertex).toBeA(HyperbolicCanvas.Point);
      });
    });

    it('should have n lines of type Line', function () {
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

    it('should have n lines of infinite hyperbolic length', function () {
      var lines = polygon.getLines();
      expect(lines).toBeA(Array);
      lines.forEach(function (line) {
        expect(line).toBeA(HyperbolicCanvas.Line);
        expect(line.getHyperbolicLength()).toBe(Infinity);
      });
    });
  });

  describe('given side count, center, radius', function () {
    // TODO euclidean version
    var n, center, radius;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      center = HyperbolicCanvas.Point.random();
      radius = Math.random() * 10;
      polygon = Polygon.givenNCenterRadius(n, center, radius);
    });

    it('should have n vertices of type Point', function () {
      var vertices = polygon.getVertices();
      expect(vertices).toBeA(Array);
      expect(vertices.length).toBe(n);
      vertices.forEach(function (vertex) {
        expect(vertex).toBeA(HyperbolicCanvas.Point);
      });
    });

    it('should have lines of equal hyperbolic length', function () {
      var lengths = [];
      polygon.getLines().forEach(function (line) {
        lengths.push(line.getHyperbolicLength());
      });
      var n = lengths.length;
      for (var i = 0; i < n; i++) {
        expect(lengths[i]).toApproximate(lengths[(i + 1) % n]);
      }
    });

    it('should have n lines of type Line', function () {
      var lines = polygon.getLines();
      expect(lines.length).toBe(n);
      expect(lines).toBeA(Array);
      lines.forEach(function (line) {
        expect(line).toBeA(HyperbolicCanvas.Line);
      });
    });
  });
});
