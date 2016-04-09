describe('Canvas', function () {
  var Canvas = HyperbolicCanvas.Canvas;
  var canvas;

  beforeEach(function () {
    canvas = new Canvas({ el: document.createElement('div') });
    // fake the size
    var radius = 100;
    canvas._radius = radius;
    canvas._diameter = radius * 2;
  });

  describe('container element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getContainerElement();
    });

    it('should be defined', function () {
      expect(el).toBeDefined();
    });

    it('should have one child div', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('viewport element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getViewportElement();
    });

    it('should be defined', function () {
      expect(el).toBeDefined();
    });

    it('should have one child div', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild.tagName.toLowerCase()).toBe('div');
    });

    it('should have "viewport" class', function () {
      expect(el.className).toBe('viewport');
    });
  });

  describe('backdrop element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getBackdropElement();
    });

    it('should be defined', function () {
      expect(el).toBeDefined();
    });

    it('should have "backdrop" class', function () {
      expect(el.className).toBe('backdrop');
    });

    it('should have border-radius style', function () {
      expect(el.style['border-radius']).not.toBe('');
    });

    it('should have one child canvas', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild.tagName.toLowerCase()).toBe('canvas');
    });
  });

  describe('canvas element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getCanvasElement();
    });

    it('should be defined', function () {
      expect(el).toBeDefined();
    });

    it('should have "hyperbolic" class', function () {
      expect(el.className).toBe('hyperbolic');
    });

    it('should have absolute position style', function () {
      expect(el.style['position']).toBe('absolute');
    });
  });

  it('should have a radius and diameter', function () {
    expect(canvas.getRadius()).toBeDefined();
    expect(canvas.getDiameter()).toBeDefined();
    expect(canvas.getDiameter()).toBe(canvas.getRadius() * 2);
  });

  it('should have a canvas context', function () {
    expect(canvas.getContext()).toBeDefined();
  });

  it('should set context properties', function () {
    var ctx = canvas.getContext();
    var properties = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    canvas.setContextProperties(properties);

    for (var property in properties) {
      expect(ctx[property]).toBe(properties[property]);
    }
  });

  describe('when converting canvas coordinates to a Point', function () {
    it('should return a Point', function () {
      var coordinates = [canvas.getRadius() * 3 / 2, canvas.getRadius() / 2];
      var point = canvas.at(coordinates);
      expect(point).toBeDefined();
      expect(point).toBeA(HyperbolicCanvas.Point);
    });
  });

  describe('when converting a Point to canvas coordinates', function () {
    it('should return an Array with length of 2', function () {
      var point = HyperbolicCanvas.Point.givenCoordinates(.5, .5);
      var coordinates = canvas.at(point);
      expect(coordinates).toBeDefined();
      expect(coordinates).toBeA(Array);
      expect(coordinates.length).toBe(2);
    });
  });
});
