;
(function () {
  if (typeof HyperbolicCanvas === "undefined") {
    window.HyperbolicCanvas = {};
  }


  var Point = window.Point = window.HyperbolicCanvas.Point;
  var Line = window.Line = window.HyperbolicCanvas.Line;
  var Circle = window.Circle = window.HyperbolicCanvas.Circle;
  var Polygon = window.Polygon = window.HyperbolicCanvas.Polygon;
  var Canvas = window.Canvas = window.HyperbolicCanvas.Canvas;


  window.HyperbolicCanvas.test = function () {
    window.p1 = Point.xY(.5, .5);
    window.p2 = Point.xY(.5, -.7);
    window.p3 = Point.xY(-.3, -.2);
    window.p4 = Point.xY(-.3, .5);
    window.p5 = Point.xY(.9, 0);
    window.p6 = Point.xY(0, .9);
    window.l1 = Line.pointPoint(p1, p2);
    window.l2 = Line.pointPoint(p3, p2);
    window.l3 = Line.pointPoint(p3, p4);
    window.l4 = Line.pointPoint(p1, p4);
    window.l5 = Line.pointPoint(p6, p5);
    window.c = HyperbolicCanvas.canvases[0];
    c.ctx.fillStyle = '#DD4814';
    c.ctx.strokeStyle = '#DD4814';


    // c.fillPolygon([p1,p2,p3,p4]);

    // c.ctx.strokeStyle = 'black';
    // c.drawPolygon([p1,p2,p3,p4]);

    // [l1,l2,l3,l4].forEach(function (l) {
    //   c.drawLine(l);
    // });
    var v = Polygon.fromN(5, Point.CENTER, 3, .000001)
    c.fillPolygon(v);
    var v = Polygon.fromN(5, Point.CENTER, 2, .000001)
    c.ctx.fillStyle = 'red';
    c.fillPolygon(v);
    var v = Polygon.fromN(5, Point.CENTER, 1, .000001)
    c.ctx.fillStyle = 'yellow';
    c.fillPolygon(v);
  };

  window.circleTest = function () {
    for (var i = 0; i < 1000; i++) {
      var points = [];
      for (var j = 0; j < 3; j++) {
        var x = 1 - Math.random() * 2;
        var y = Math.sqrt( 1 - x * x);
        y = Math.random() > .5 ? y : y * -1;
        points.push(new Point({ x: x, y: y }));
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
