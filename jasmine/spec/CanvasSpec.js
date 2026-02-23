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

    it(
      'is defined',
      function () {
        expect(el).toBeA(HTMLElement);
      },
      true,
    );

    it(
      'has one child div element',
      function () {
        expect(el.children.length).toBe(1);
        expect(el.firstChild).toBeA(HTMLDivElement);
      },
      true,
    );
  });

  describe('backdrop element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getBackdropElement();
    });

    it(
      'is div element',
      function () {
        expect(el).toBeA(HTMLDivElement);
      },
      true,
    );

    it(
      'has one child div element',
      function () {
        expect(el.children.length).toBe(1);
        expect(el.firstChild).toBeA(HTMLDivElement);
      },
      true,
    );

    it(
      'has "backdrop" class',
      function () {
        expect(el.className).toBe('backdrop');
      },
      true,
    );
  });

  describe('underlay element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getUnderlayElement();
    });

    it(
      'is div element',
      function () {
        expect(el).toBeA(HTMLDivElement);
      },
      true,
    );

    it(
      'has "underlay" class',
      function () {
        expect(el.className).toBe('underlay');
      },
      true,
    );

    it(
      'has border-radius style',
      function () {
        expect(el.style['border-radius']).not.toBe('');
      },
      true,
    );

    it(
      'has one child canvas element',
      function () {
        expect(el.children.length).toBe(1);
        expect(el.firstChild).toBeA(HTMLCanvasElement);
      },
      true,
    );
  });

  describe('canvas element', function () {
    var el;
    beforeEach(function () {
      el = canvas.getCanvasElement();
    });

    it(
      'is canvas element',
      function () {
        expect(el).toBeA(HTMLCanvasElement);
      },
      true,
    );

    it(
      'has "hyperbolic" class',
      function () {
        expect(el.className).toBe('hyperbolic');
      },
      true,
    );

    it(
      'has absolute position style',
      function () {
        expect(el.style['position']).toBe('absolute');
      },
      true,
    );
  });

  describe('when generating path with Path2D available', function () {
    var object;
    beforeEach(function () {
      object = HyperbolicCanvas.Line.givenTwoPoints(
        HyperbolicCanvas.Point.random(),
        HyperbolicCanvas.Point.random(),
      );
    });

    it(
      'returns input if given',
      function () {
        var options = { path2D: true, path: new Path2D() };
        expect(canvas.pathForEuclidean(object, options)).toBe(options.path);
        expect(canvas.pathForHyperbolic(object, options)).toBe(options.path);
      },
      true,
    );

    it(
      'returns Path2D if requested',
      function () {
        var options = { path2D: true, path: false };
        expect(canvas.pathForEuclidean(object, options)).toBeA(Path2D);
        expect(canvas.pathForHyperbolic(object, options)).toBeA(Path2D);
      },
      true,
    );
  });
});
