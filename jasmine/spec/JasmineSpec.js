describe('Jasmine', function () {
  var randomNumbers = {};
  var n;
  var testRunCount = Math.floor(Math.random() * (6)) + 5;
  beforeEach(function () {
    n = Math.random();
  });

  it('has defined random seed on the Math object', function () {
    expect(Math.seed).toBeDefined();
  }, true);

  it('has displaySymbols property', function () {
    expect(jasmine.displaySymbols).toBeA(Boolean);
  }, true);

  it('has testRunCount property', function () {
    expect(jasmine.runCount).toBeARealNumber();
  }, true);

  it('generates multiple unique numbers for a single spec', function () {
    expect(randomNumbers[n]).toBeUndefined();
    randomNumbers[n] = n;
  }, testRunCount);

  it('has generated ' + testRunCount + ' numbers with previous spec', function () {
    expect(Object.keys(randomNumbers).length).toBe(testRunCount);
  }, true);
});
