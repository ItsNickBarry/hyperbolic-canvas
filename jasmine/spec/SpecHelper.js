// display visualization of specs at top of page or not
jasmine.displaySymbols = jasmine.runCount <= 10;

beforeEach(function () {
  jasmine.addMatchers({
    toApproximate: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: actual === expected ||
                  Math.abs(actual - expected) < HyperbolicCanvas.ZERO ||
                  isNaN(actual) && isNaN(expected)
          }
        }
      }
    },
    toBeA: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: actual instanceof Object
                  ?
                  actual instanceof expected
                  :
                  actual.__proto__ === expected.prototype
          }
        }
      }
    },
    toBeARealNumber: function () {
      return {
        compare: function (actual) {
          return {
            pass: typeof actual === 'number' &&
                  !isNaN(actual) &&
                  actual !== Infinity &&
                  actual !== -Infinity
          }
        }
      }
    },
  });
});
