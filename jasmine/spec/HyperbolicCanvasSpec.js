describe('HyperbolicCanvas', function () {
  it(
    'creates a Canvas',
    function () {
      expect(HyperbolicCanvas.create()).toBeA(HyperbolicCanvas.Canvas);
    },
    true,
  );
});
