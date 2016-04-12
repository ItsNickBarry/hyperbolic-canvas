beforeEach(function () {
  jasmine.precision = 6;
  jasmine.addMatchers({
    toApproximate: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: Math.abs(actual - expected) < 1e-6 ||
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
  });
});
