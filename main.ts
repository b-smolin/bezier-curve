class Point{
    x: number;
    y: number;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    public toString(): string{
        return "x " + this.x + " y " + this.y
    }
}

function deCasteljau(points: Point[], t: number): Point{
    let working: Point[] = [];
    points.forEach(p => working.push(p));
    let s = points.length;
    for (let i = 1; i < s ; i++){
        for (let j = 0 ; j < (s-i) ; j++){
            working[j] = weightedAdd(1-t, working[j], t, working[j+1]);
        }
    }
    return working[0];
}

function weightedAdd(t1: number, p1: Point, t2: number, p2: Point){
    let x1 = t1*p1.x;
    let y1 = t1*p1.y;
    let x2 = t2*p2.x;
    let y2 = t2*p2.y;
    return new Point((x1+x2),(y1+y2));
}


class BezierCurveTool{
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private points: Point[];

    constructor() {
        let canvas = document.getElementById('canvas') as
                     HTMLCanvasElement;
        let context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.lineJoin = "round";
    
        this.canvas = canvas;
        this.context = context;
        this.points = [];

        this.redraw();
        this.createUserEvents();
    }

    private createUserEvents(): void{
        let canvas = this.canvas
        canvas.addEventListener("mousedown", this.newPointHandler);
        canvas.addEventListener("touchstart", this.newPointHandler);
        document.getElementById("clear").addEventListener("click", this.clearCanvasHandler);
    }

    private redraw = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let points = this.points;
        let context = this.context;
        let s = points.length;
        for (let i = 0 ; i < s ; i++){
            context.beginPath();
            context.arc(points[i].x, points[i].y, 7, 0, 2*Math.PI);
            context.fillStyle = (i == 0 || i == s-1) ? "red" : "yellow";
            context.fill();
            context.stroke();
        }
        if(this.points.length >= 2){
           let curve = this.getCurve();
           for (let i = 1 ; i < curve.length ; i++){
                context.beginPath();
                context.moveTo(curve[i-1].x, curve[i-1].y);
                context.lineTo(curve[i].x, curve[i].y);
                context.stroke();
           }
        }
    }

    //at time this is called we are within if-block where this.points >= 2 len
    private getCurve = () =>{
        let curve: Point[] = [];
        for (let t = 0.0 ; t <= 1.001 ; t += 0.005){
            curve.push(deCasteljau(this.points, t))
        }
        return curve;
    }

    private clearCanvasHandler = () => {
        this.points = [];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private newPointHandler = (e: MouseEvent) => {
        this.points.push(new Point(e.pageX, e.pageY))
        this.redraw();
    }

}

let x = new BezierCurveTool();
console.log(x)