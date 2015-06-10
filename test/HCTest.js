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
  var reRender = true;


  window.HyperbolicCanvas.toggle = function () {
    reRender ^= true;
  }
  window.HyperbolicCanvas.test = function () {
    var sides = 4;
    var rot = Math.PI;
    var radius = .5;

    window.q1 = Point.fromCoordinates(.5, .5);
    window.q2 = Point.fromCoordinates(-.5, .5);
    window.q3 = Point.fromCoordinates(-.5, -.5);
    window.q4 = Point.fromCoordinates(.5, -.5);

    window.xPlus = Point.fromCoordinates(.5, .0);
    window.xMinus = Point.fromCoordinates(-.5, .0);
    window.yPlus = Point.fromCoordinates(0, .5);
    window.yMinus = Point.fromCoordinates(0, -.5);

    window.polCenter = Polygon.fromNCenterRadius(sides, Point.CENTER, radius)

    window.polQ1 = Polygon.fromNCenterRadius(sides, q1, radius, rot);
    window.polQ2 = Polygon.fromNCenterRadius(sides, q2, radius, rot);
    window.polQ3 = Polygon.fromNCenterRadius(sides, q3, radius, rot);
    window.polQ4 = Polygon.fromNCenterRadius(sides, q4, radius, rot);

    window.polXPlus =  Polygon.fromNCenterRadius(sides, xPlus, radius, rot);
    window.polYPlus =  Polygon.fromNCenterRadius(sides, yPlus, radius, rot);
    window.polXMinus = Polygon.fromNCenterRadius(sides, xMinus, radius, rot);
    window.polYMinus = Polygon.fromNCenterRadius(sides, yMinus, radius, rot);

    window.c = HyperbolicCanvas.canvases[0];

    document.addEventListener('click', window.HyperbolicCanvas.toggle);

    // c.setStrokeStyle('white');
    // c.strokeGrid(2);
    // c.ctx.fillStyle = '#DD4814';
    // c.ctx.strokeStyle = '#DD4814';
    //
    //
    // c.strokePolygonBoundaries(polCenter);
    // // c.strokePolygonBoundaries(polQ1);
    // // c.strokePolygonBoundaries(polQ2);
    // // c.strokePolygonBoundaries(polQ3);
    // // c.strokePolygonBoundaries(polQ4);
    // c.strokePolygonBoundaries(polXPlus);
    // c.strokePolygonBoundaries(polXMinus);
    // c.strokePolygonBoundaries(polYPlus);
    // c.strokePolygonBoundaries(polYMinus);
    //
    // c.setFillStyle('black')
    // c.fillPolygon(polCenter);
    // // c.fillPolygon(polQ1);
    // // c.fillPolygon(polQ2);
    // // c.fillPolygon(polQ3);
    // // c.fillPolygon(polQ4);
    // c.fillPolygon(polXPlus);
    // c.fillPolygon(polXMinus);
    // c.fillPolygon(polYPlus);
    // c.fillPolygon(polYMinus);
    //
    // c.setStrokeStyle('black');
    // // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q1, .5));
    // // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q2, .5));
    // // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q3, .5));
    // // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q4, .5));
    //
    // var xPlusCircle = Circle.fromHyperbolicCenterRadius(xPlus, radius);
    // c.strokeCircle(xPlusCircle);
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(xMinus, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(yPlus, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(yMinus, radius));

    var falses = 0;
    var n = 6;
    var r = 1;
    var p = Point.CENTER;
    var count = 3;
    var rotation = 0.000001;
    var fn = function () {
      if (!reRender) {
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
      polygons.forEach(c.fillPolygon.bind(c));
      console.log("falses: " + falses);
      falses = 0;
    };
    fn();
    reRender = false;
    setInterval(fn, 1000);

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
    //   c.strokeLine(Line.fromTwoPoints(cent, cir.pointAt(i)));
    // }
  };
})();
