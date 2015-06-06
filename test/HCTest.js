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
  var bool = true;
  window.HyperbolicCanvas.toggle = function () {
    bool ^= true;
  }
  window.HyperbolicCanvas.test = function () {
    window.p1 = Point.fromCoordinates(.5, .5);
    window.p2 = Point.fromCoordinates(.5, -.7);
    window.p3 = Point.fromCoordinates(-.3, -.2);
    window.p4 = Point.fromCoordinates(-.3, .5);
    window.p5 = Point.fromCoordinates(.9, 0);
    window.p6 = Point.fromCoordinates(0, .9);
    window.l1 = Line.fromTwoPoints(p1, p2);
    window.l2 = Line.fromTwoPoints(p3, p2);
    window.l3 = Line.fromTwoPoints(p3, p4);
    window.l4 = Line.fromTwoPoints(p1, p4);
    window.l5 = Line.fromTwoPoints(p6, p5);
    window.c = HyperbolicCanvas.canvases[0];
    c.ctx.fillStyle = '#DD4814';
    c.ctx.strokeStyle = '#DD4814';

    document.addEventListener('click', window.HyperbolicCanvas.toggle);

    var falses = 0;
    var n = 6;
    var r = 1;
    var p = Point.CENTER;
    var count = 3;
    var rotation = 0.000001;
    var fn = function () {
      if (!bool) {
        return false;
      }
      var polygons = [];
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < n; j++) {
          var p2 = p.distantPoint(i * r * 2, Math.TAU / n * j - rotation)
          if (p2 === false) {
            falses +=1;
            continue;
          }
          var gon = Polygon.fromNCenterRadius(n, p2, r, Math.TAU / n * j + Math.PI * i + rotation);
          polygons.push(gon);
        }
      }
      rotation += Math.TAU / (n * n * 2);
      rotation %= Math.TAU;
      c.ctx.clearRect(0, 0, c.diameter, c.diameter);
      // c.setFillStyle("#" + Math.floor(Math.random() * 1000000));
      polygons.forEach(c.strokePolygon.bind(c));
      console.log("falses: " + falses);
      falses = 0;
    };
    fn();
    bool = false;
    setInterval(fn, 1000);

    // c.fillPolygon(Polygon.fromNCenterRadius(5, Point.fromCoordinates(.5,.5), 2))

    // c.setStrokeStyle('black');
    // c.setFillStyle('black');

    // var p = c.at(Point.fromCoordinates(.2, -.5))
    // c.ctx.beginPath();
    // c.ctx.arc(c.radius,c.radius,c.radius,0,Math.TAU)
    // c.ctx.stroke();
    // c.ctx.fillRect(p[0], p[1], 3, 3);
    // c.ctx.fillText("A",p[0] + 5, p[1] + 15)
    // c.ctx.fill();

    // var cent = Point.fromCoordinates(.5, -.5);
    // var cir = Circle.fromHyperbolicCenterRadius(cent, 2);
    // c.drawCircle(cir);
    // for (var i = 0; i < Math.TAU; i += (Math.TAU / 12)) {
    //   c.drawLine(Line.fromTwoPoints(cent, cir.pointAt(i)));
    // }
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
      var center = Circle.fromThreePoints(points[0], points[1], points[2]).center;
      if (center === false) {
        return false;
      }
      console.log(i);
      console.log(points[0])
      console.log("d:" + Line.fromTwoPoints(center, points[0]).euclideanDistance());
      console.log(points[1])
      console.log("d:" + Line.fromTwoPoints(center, points[1]).euclideanDistance());
      console.log(points[2])
      console.log("d:" + Line.fromTwoPoints(center, points[2]).euclideanDistance());
      console.log(center);
    }
    return true;
  };
})();
