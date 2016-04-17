describe('HyperbolicCanvas', function () {
  it('should define the natural and just constant tau', function () {
    expect(Math.TAU).toBe(Math.PI * 2);
  }, true);

  describe('when creating a Canvas', function () {
    it('should create a Canvas', function () {
      expect(HyperbolicCanvas.create()).toBeA(HyperbolicCanvas.Canvas);
    }, true);

    it('should store reference to unnamed Canvas', function () {
      expect(
        HyperbolicCanvas.canvases['canvas0']
      ).toBeA(HyperbolicCanvas.Canvas);
    }, true);

    it('should store reference to named Canvas', function () {
      // create without specifying selector
      HyperbolicCanvas.create(undefined, 'asdf');
      expect(
        HyperbolicCanvas.canvases['asdf']
      ).toBeA(HyperbolicCanvas.Canvas);
    }, true);
  });
});
