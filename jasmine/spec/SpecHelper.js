// display visualization of specs at top of page or not
jasmine.displaySymbols = false;
// number of times to run specs if set to repeat
jasmine.testRunCount = 10;
// whether to repeat by default (repeat if `repeat ^ overrideRepeat`)
jasmine.repeat = true;

const EXPECTED_ACCURACY = 1e-6;

beforeEach(function () {
  jasmine.precision = 6;
  jasmine.addMatchers({
    toApproximate: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: Math.abs(actual - expected) < EXPECTED_ACCURACY ||
                  isNaN(actual) && isNaN(expected)
          }
        }
      }
    },
    toBeA: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: actual.__proto__ === expected.prototype
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
