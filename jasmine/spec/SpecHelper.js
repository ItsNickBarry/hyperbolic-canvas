beforeEach(function () {
  jasmine.addMatchers({
    toApproximate: function () {
      return {
        compare: function (actual, expected) {
          return {
            pass: Math.abs(actual - expected) < 1e-6
          }
        }
      }
    }
  });
});
