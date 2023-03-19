var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.toString = function () {
        return "x " + this.x + " y " + this.y;
    };
    return Point;
}());
function deCasteljau(points, t) {
    var working = [];
    points.forEach(function (p) { return working.push(p); });
    var s = points.length;
    for (var i = 1; i < s; i++) {
        for (var j = 0; j < (s - i); j++) {
            working[j] = weightedAdd(1 - t, working[j], t, working[j + 1]);
        }
    }
    return working[0];
}
function weightedAdd(t1, p1, t2, p2) {
    var x1 = t1 * p1.x;
    var y1 = t1 * p1.y;
    var x2 = t2 * p2.x;
    var y2 = t2 * p2.y;
    return new Point((x1 + x2), (y1 + y2));
}
var BezierCurveTool = /** @class */ (function () {
    function BezierCurveTool() {
        var _this = this;
        this.redraw = function () {
            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            var points = _this.points;
            var context = _this.context;
            var s = points.length;
            for (var i = 0; i < s; i++) {
                context.beginPath();
                context.arc(points[i].x, points[i].y, 7, 0, 2 * Math.PI);
                context.fillStyle = (i == 0 || i == s - 1) ? "red" : "yellow";
                context.fill();
                context.stroke();
            }
            if (_this.points.length >= 2) {
                var curve = _this.getCurve();
                for (var i = 1; i < curve.length; i++) {
                    context.beginPath();
                    context.moveTo(curve[i - 1].x, curve[i - 1].y);
                    context.lineTo(curve[i].x, curve[i].y);
                    context.stroke();
                }
            }
        };
        //at time this is called we are within if-block where this.points >= 2 len
        this.getCurve = function () {
            var curve = [];
            for (var t = 0.0; t <= 1.001; t += 0.005) {
                curve.push(deCasteljau(_this.points, t));
            }
            return curve;
        };
        this.clearCanvasHandler = function () {
            _this.points = [];
            _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        };
        this.pressHandler = function (e) {
            var x = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var y = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            _this.points.push(new Point(x, y));
            _this.currentPoint = _this.points[_this.points.length - 1];
            _this.redraw();
        };
        this.dragHandler = function (e) {
            var x = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var y = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            _this.currentPoint.x = x;
            _this.currentPoint.y = y;
            _this.redraw();
        };
        this.upHandler = function () {
            _this.currentPoint = null;
        };
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.lineJoin = "round";
        this.canvas = canvas;
        this.context = context;
        this.points = [];
        this.currentPoint = null;
        this.redraw();
        this.createUserEvents();
    }
    BezierCurveTool.prototype.createUserEvents = function () {
        var canvas = this.canvas;
        canvas.addEventListener("mousedown", this.pressHandler);
        canvas.addEventListener("mousemove", this.dragHandler);
        canvas.addEventListener("mouseup", this.upHandler);
        canvas.addEventListener("mouseout", this.upHandler);
        canvas.addEventListener("touchstart", this.pressHandler);
        canvas.addEventListener("touchmove", this.dragHandler);
        document.getElementById("clear").addEventListener("click", this.clearCanvasHandler);
    };
    return BezierCurveTool;
}());
var x = new BezierCurveTool();
console.log(x);
//# sourceMappingURL=main.js.map