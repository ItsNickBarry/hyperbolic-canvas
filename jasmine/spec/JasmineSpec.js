describe('Jasmine', function () {
  var randomNumbers = {};
  var n;
  beforeEach(function () {
    n = Math.random();
  });

  it('should have DISPLAY_SYMBOLS property', function () {
    expect(jasmine.DISPLAY_SYMBOLS).toBeDefined();
    expect(jasmine.DISPLAY_SYMBOLS).toBeA(Boolean);
  });

  it('should have TEST_RUN_COUNT property', function () {
    expect(jasmine.TEST_RUN_COUNT).toBeDefined();
    expect(jasmine.TEST_RUN_COUNT).toBeARealNumber();
  });

  it('should generate multiple unique numbers for a single spec', function () {
    expect(randomNumbers[n]).toBeUndefined();
    randomNumbers[n] = n;
  });

  it('should have generated TEST_RUN_COUNT numbers', function () {
    expect(Object.keys(randomNumbers).length).toBe(jasmine.TEST_RUN_COUNT);
  });
});
