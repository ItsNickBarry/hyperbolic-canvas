;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }


    /*
    * test variables
    */
    window.p1 = new HyperbolicCanvas.Point(.5, .5);
    window.p2 = new HyperbolicCanvas.Point(.5, -.7);
    window.p3 = new HyperbolicCanvas.Point(-.3, -.2);
    window.p4 = new HyperbolicCanvas.Point(-.3, .5);
    window.p5 = new HyperbolicCanvas.Point(.9, 0);
    window.p6 = new HyperbolicCanvas.Point(0, .9);
    window.l1 = HyperbolicCanvas.Line.pointPoint(p1, p2);
    window.l2 = HyperbolicCanvas.Line.pointPoint(p3, p2);
    window.l3 = HyperbolicCanvas.Line.pointPoint(p3, p4);
    window.l4 = HyperbolicCanvas.Line.pointPoint(p1, p4);
    window.l5 = HyperbolicCanvas.Line.pointPoint(p6, p5);
    window.c = canvases[0];

    [l1,l2,l3,l4].forEach(function (l) {
      c.drawLine(l);
    });

    window.Point = window.HyperbolicCanvas.Point;
    window.Line = window.HyperbolicCanvas.Line;
    window.Circle = window.HyperbolicCanvas.Circle;


  window.circleTest = function () {
    for (var i = 0; i < 1000; i++) {
      var points = [];
      for (var j = 0; j < 3; j++) {
        var x = 1 - Math.random() * 2;
        var y = Math.sqrt( 1 - x * x);
        y = Math.random() > .5 ? y : y * -1;
        points.push(new Point(x, y));
      }
      var center = Circle.pointPointPoint(points[0], points[1], points[2]).center;
      if (center === false) {
        return false;
      }
      console.log(i);
      console.log(points[0])
      console.log("d:" + Line.pointPoint(center, points[0]).euclideanDistance());
      console.log(points[1])
      console.log("d:" + Line.pointPoint(center, points[1]).euclideanDistance());
      console.log(points[2])
      console.log("d:" + Line.pointPoint(center, points[2]).euclideanDistance());
      console.log(center);
    }
    return true;
  };
})();
