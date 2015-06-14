;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }

  var Angle = window.HyperbolicCanvas.Angle = {};

  Angle.normalize = function (angle) {
    if (angle < 0) {
      return Math.abs(Math.floor(angle / Math.TAU)) * Math.TAU + angle;
    } else if (angle >= Math.TAU) {
      return angle % Math.TAU;
    } else {
      return angle;
    }
  };
})();
