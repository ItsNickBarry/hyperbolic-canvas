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
    var sides = 3;
    var rot = 0;
    // var radius = .5;

    window.q1 = Point.fromCoordinates(.5, .5);
    window.q2 = Point.fromCoordinates(-.5, .5);
    window.q3 = Point.fromCoordinates(-.5, -.5);
    window.q4 = Point.fromCoordinates(.5, -.5);

    window.xPlus = Point.fromCoordinates(.5, .0);
    window.xMinus = Point.fromCoordinates(-.5, .0);
    window.yPlus = Point.fromCoordinates(0, .5);
    window.yMinus = Point.fromCoordinates(0, -.5);


    var radius = xPlus.distanceFromCenter() / 2;

    window.polCenter = Polygon.fromNCenterRadius(sides, Point.CENTER, radius, rot)

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

    window.distanceTest = function () {
      var small = .001;
      var halfAxisDistance = xPlus.distanceFromCenter();

      var xPlusPlus = xPlus.distantPoint(halfAxisDistance * 2, 0);
      var xPlusMinus = xPlus.distantPoint(halfAxisDistance * 2, Math.PI);
      var yPlusPlus = yPlus.distantPoint(halfAxisDistance * 2, Math.PI / 2);
      var yPlusMinus = yPlus.distantPoint(halfAxisDistance * 2, 3 * Math.PI / 2);

      var xMinusPlus = xMinus.distantPoint(halfAxisDistance * 2, 0);
      var xMinusMinus = xMinus.distantPoint(halfAxisDistance * 2, Math.PI);
      var yMinusPlus = yMinus.distantPoint(halfAxisDistance * 2, Math.PI / 2);
      var yMinusMinus = yMinus.distantPoint(halfAxisDistance * 2, 3 * Math.PI / 2);

      var sameAxisPass = (
        Math.abs(xPlusPlus.y) < small &&
        Math.abs(xPlusMinus.y) < small &&
        Math.abs(yPlusPlus.x) < small &&
        Math.abs(yPlusMinus.x) < small &&
        Math.abs(xMinusPlus.y) < small &&
        Math.abs(xMinusMinus.y) < small &&
        Math.abs(yMinusPlus.x) < small &&
        Math.abs(yMinusMinus.x) < small
      )
      var otherSidePass = (
        xPlusMinus.x < 0 &&
        yPlusMinus.y < 0 &&
        xMinusPlus.x > 0 &&
        yMinusPlus.y > 0
      )
      var sameSidePass = (
        xPlusPlus.x > 0 &&
        yPlusPlus.y > 0 &&
        xMinusMinus.x < 0 &&
        yMinusMinus.y < 0
      )
      console.log("Same axis? " + sameAxisPass);
      console.log("Same side of other axis? " + sameSidePass);
      console.log("Other side of other axis? " + otherSidePass);
    }();

    c.setStrokeStyle('white');
    c.strokeGrid(2);
    c.ctx.fillStyle = '#DD4814';
    // c.ctx.strokeStyle = 'black';


    // c.strokePolygonBoundaries(polCenter);
    // c.strokePolygonBoundaries(polQ1);
    // c.strokePolygonBoundaries(polQ2);
    // c.strokePolygonBoundaries(polQ3);
    // c.strokePolygonBoundaries(polQ4);
    // c.strokePolygonBoundaries(polXPlus);
    // c.strokePolygonBoundaries(polXMinus);
    // c.strokePolygonBoundaries(polYPlus);
    // c.strokePolygonBoundaries(polYMinus);
    //
    // c.setFillStyle('black')
    // c.fillPolygon(polCenter);
    // c.fillPolygon(polQ1);
    // c.fillPolygon(polQ2);
    // c.fillPolygon(polQ3);
    // c.fillPolygon(polQ4);
    // c.fillPolygon(polXPlus);
    // c.fillPolygon(polXMinus);
    // c.fillPolygon(polYPlus);
    // c.fillPolygon(polYMinus);
    //
    // c.setStrokeStyle('black');
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q1, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q2, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q3, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(q4, radius));
    //
    // var xPlusCircle = Circle.fromHyperbolicCenterRadius(xPlus, radius);
    // c.strokeCircle(xPlusCircle);
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(xMinus, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(yPlus, radius));
    // c.strokeCircle(Circle.fromHyperbolicCenterRadius(yMinus, radius));

    var n = 6;
    var r = .1;
    var p = q2//Point.fromCoordinates(.0001, .0001);
    var count = 12;
    var rotation = 0;
    var fn = function () {
      if (!reRender) {
        return false;
      }
      var polygons = [];
      for (var i = 0; i < count; i++) {
        for (var j = 0; j < n; j++) {
          var p2 = p.distantPoint(i * r * 2, Math.TAU / n * j - rotation)
          var gon = Polygon.fromNCenterRadius(n, p2, r, Math.TAU / n * j + Math.PI * i + rotation)
          polygons.push(gon);
        }
      }
      rotation += Math.TAU / (n * n * 2);
      rotation %= Math.TAU;
      c.clear();
      polygons.forEach(c.fillPolygon.bind(c));
      polygons.forEach(function (p) {
        // c.strokePolygonBoundaries(p)
        // c.setStrokeStyle("#" + Math.floor(Math.random() * 1000000));
      });
      c.strokeGrid(2);
    };
    fn();
    reRender = false;
    setInterval(fn, 200);

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
