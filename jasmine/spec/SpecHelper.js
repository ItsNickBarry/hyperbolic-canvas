jasmine.TEST_RUN_COUNT = 9;

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
