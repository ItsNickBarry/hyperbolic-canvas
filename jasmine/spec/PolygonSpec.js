describe('Polygon', function () {
  var Polygon = HyperbolicCanvas.Polygon;
  var polygon;

  describe('given n vertices', function () {
    var vertices;
    var n;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      vertices = [];
      for (var i = 0; i < n; i++) {
        vertices.push(HyperbolicCanvas.Point.random());
      }
      polygon = Polygon.givenVertices(vertices);
    });

    it('should have n vertices', function () {
      expect(polygon.getVertices()).toBeDefined();
      expect(polygon.getVertices().length).toBe(n);
    });
  });

  describe('given side count, center, radius', function () {
    // TODO euclidean version
    var n;
    var center;
    var radius;
    beforeEach(function () {
      n = Math.floor(Math.random() * 10) + 3;
      center = HyperbolicCanvas.Point.random();
      radius = Math.random() * 10;
      polygon = Polygon.givenNCenterRadius(n, center, radius);
    });

    it('should have n vertices', function () {
      expect(polygon.getVertices()).toBeDefined();
      expect(polygon.getVertices().length).toBe(n);
    });

    it('should be regular', function () {
      for (var vertex in polygon.getVertices()) {
        // TODO
      }
    });
  });
});
