describe('HyperbolicCanvas', function () {
  it('defines the natural and just constant tau', function () {
    expect(Math.TAU).toBe(Math.PI * 2);
  }, true);

  it('defines the threshold for effective zero values', function () {
    expect(HyperbolicCanvas.ZERO).toBeA(Number);
  }, true);

  it('defines the threshold for effective infinity values', function () {
    expect(HyperbolicCanvas.INFINITY).toBeA(Number);
  }, true);

  describe('when creating a Canvas', function () {
    it('creates a Canvas', function () {
      expect(HyperbolicCanvas.create()).toBeA(HyperbolicCanvas.Canvas);
    }, true);

    it('stores reference to unnamed Canvas', function () {
      expect(
        HyperbolicCanvas.canvases['canvas0']
      ).toBeA(HyperbolicCanvas.Canvas);
    }, true);

    it('stores reference to named Canvas', function () {
      // create without specifying selector
      HyperbolicCanvas.create(undefined, 'asdf');
      expect(
        HyperbolicCanvas.canvases['asdf']
      ).toBeA(HyperbolicCanvas.Canvas);
    }, true);
  });
});
