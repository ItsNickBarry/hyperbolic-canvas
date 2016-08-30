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
      expect(el).toBeA(HTMLElement);
    }, true);

    it('should have one child div element', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild).toBeA(HTMLDivElement);
    }, true);
  });

  describe('backdrop element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getBackdropElement();
    });

    it('should be div element', function () {
      expect(el).toBeA(HTMLDivElement);
    }, true);

    it('should have one child div element', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild).toBeA(HTMLDivElement);
    }, true);

    it('should have "backdrop" class', function () {
      expect(el.className).toBe('backdrop');
    }, true);
  });

  describe('underlay element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getUnderlayElement();
    });

    it('should be div element', function () {
      expect(el).toBeA(HTMLDivElement);
    }, true);

    it('should have "underlay" class', function () {
      expect(el.className).toBe('underlay');
    }, true);

    it('should have border-radius style', function () {
      expect(el.style['border-radius']).not.toBe('');
    }, true);

    it('should have one child canvas element', function () {
      expect(el.children.length).toBe(1);
      expect(el.firstChild).toBeA(HTMLCanvasElement);
    }, true);
  });

  describe('canvas element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getCanvasElement();
    });

    it('should be canvas element', function () {
      expect(el).toBeA(HTMLCanvasElement);
    }, true);

    it('should have "hyperbolic" class', function () {
      expect(el.className).toBe('hyperbolic');
    }, true);

    it('should have absolute position style', function () {
      expect(el.style['position']).toBe('absolute');
    }, true);
  });

  it('should have a radius and diameter', function () {
    expect(canvas.getRadius()).toBeARealNumber();
    expect(canvas.getDiameter()).toBeARealNumber();
    expect(canvas.getDiameter()).toBe(canvas.getRadius() * 2);
  }, true);

  it('should have a canvas context', function () {
    expect(canvas.getContext()).toBeA(CanvasRenderingContext2D);
  }, true);

  it('should set multiple context properties', function () {
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
  }, true);

  it('should set single context property', function () {
    var ctx = canvas.getContext();
    var properties = {
      lineJoin: 'round',
      lineWidth: 2,
      shadowBlur: 20,
      shadowColor: '#ffffff',
      strokeStyle: '#dd4814',
      fillStyle: '#333333',
    };
    for (var property in properties) {
      canvas.setContextProperty(property, properties[property]);
      expect(ctx[property]).toBe(properties[property]);
    }
  }, true);

  describe('when converting canvas coordinates to a Point', function () {
    it('should return a Point', function () {
      var coordinates = [
        canvas.getRadius() * Math.random(),
        canvas.getRadius() * Math.random()
      ];
      var point = canvas.at(coordinates);
      expect(point).toBeA(HyperbolicCanvas.Point);
    });
  });

  describe('when converting a Point to canvas coordinates', function () {
    it('should return an Array with length of 2', function () {
      var point = HyperbolicCanvas.Point.random();
      var coordinates = canvas.at(point);
      expect(coordinates).toBeA(Array);
      expect(coordinates.length).toBe(2);
      coordinates.forEach(function (n) {
        expect(n).toBeGreaterThan(0);
        expect(n).toBeLessThan(canvas.getDiameter());
      });
    });
  });

  describe('when generating path', function () {
    var object;
    beforeEach(function () {
      object = HyperbolicCanvas.Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random()
      );
    });

    it('should return CanvasRenderingContext2D by default', function () {
      expect(
        canvas.pathForEuclidean(object)
      ).toBeA(CanvasRenderingContext2D);
      expect(
        canvas.pathForHyperbolic(object)
      ).toBeA(CanvasRenderingContext2D);
    }, true);

    describe('with Path2D available to current browser', function () {
      it('should return input if given', function () {
        var options = { path2D: true, path: new Path2D() };
        expect(
          canvas.pathForEuclidean(object, options)
        ).toBe(options.path);
        expect(
          canvas.pathForHyperbolic(object, options)
        ).toBe(options.path);
      }, true);

      it('should return Path2D if requested', function () {
        var options = { path2D: true, path: false };
        expect(
          canvas.pathForEuclidean(object, options)
        ).toBeA(Path2D);
        expect(
          canvas.pathForHyperbolic(object, options)
        ).toBeA(Path2D);
      }, true);
    });

    describe('with Path2D unavailable to current browser', function () {
      var _Path2D;
      beforeAll(function () {
        _Path2D = window.Path2D;
        window.Path2D = undefined;
      });

      afterAll(function () {
        window.Path2D = _Path2D;
      });

      it('should return input if given', function () {
        var options = { path2D: false, path: canvas.getContext() };
        expect(
          canvas.pathForEuclidean(object, options)
        ).toBe(options.path);
        expect(
          canvas.pathForHyperbolic(object, options)
        ).toBe(options.path);
      }, true);

      it('should return CanvasRenderingContext2D if Path2D is requested', function () {
        var options = { path2D: true, path: false };
        expect(
          canvas.pathForEuclidean(object, options)
        ).toBeA(CanvasRenderingContext2D);
        expect(
          canvas.pathForHyperbolic(object, options)
        ).toBeA(CanvasRenderingContext2D);
      }, true);
    });
  });
});
