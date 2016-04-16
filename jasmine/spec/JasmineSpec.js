describe('Jasmine', function () {
  var randomNumbers = {};
  var n;
  beforeEach(function () {
    n = Math.random();
  });

  it('should have displaySymbols property', function () {
    expect(jasmine.displaySymbols).toBeDefined();
    expect(jasmine.displaySymbols).toBeA(Boolean);
  }, true);

  it('should have repeat property', function () {
    expect(jasmine.repeat).toBeDefined();
    expect(jasmine.repeat).toBeA(Boolean);
  }, true);

  it('should have testRunCount property', function () {
    expect(jasmine.testRunCount).toBeDefined();
    expect(jasmine.testRunCount).toBeARealNumber();
  }, true);

  it('should generate multiple unique numbers for a single spec', function () {
    expect(randomNumbers[n]).toBeUndefined();
    randomNumbers[n] = n;
  });

  it('should have generated testRunCount numbers', function () {
    expect(Object.keys(randomNumbers).length).toBe(jasmine.testRunCount);
  }, true);
});
