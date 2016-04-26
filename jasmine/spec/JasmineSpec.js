describe('Jasmine', function () {
  var randomNumbers = {};
  var n;
  var testRunCount = Math.floor(Math.random() * (6)) + 5;
  beforeEach(function () {
    n = Math.random();
  });

  it('should have defined random seed on the Math object', function () {
    expect(Math.seed).toBeDefined();
  }, true);

  it('should have displaySymbols property', function () {
    expect(jasmine.displaySymbols).toBeA(Boolean);
  }, true);

  it('should have testRunCount property', function () {
    expect(jasmine.runCount).toBeARealNumber();
  }, true);

  it('should generate multiple unique numbers for a single spec', function () {
    expect(randomNumbers[n]).toBeUndefined();
    randomNumbers[n] = n;
  }, testRunCount);

  it('should have generated ' + testRunCount + ' numbers with previous spec', function () {
    expect(Object.keys(randomNumbers).length).toBe(testRunCount);
  }, true);
});
