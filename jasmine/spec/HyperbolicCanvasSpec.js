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

  it('creates a Canvas', function () {
    expect(HyperbolicCanvas.create()).toBeA(HyperbolicCanvas.Canvas);
  }, true);
});
