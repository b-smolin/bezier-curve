const POINTRADIUS = 7;

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

function pointDistance(p1: Point, p2: Point): Number{
    let xDelta = p1.x - p2.x;
    let yDelta = p1.y - p2.y;
    return Math.sqrt((xDelta**2 + yDelta**2));
}


class BezierCurveTool{
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private points: Point[];
    private currentPoint: Point;
    private toggleDetail: HTMLInputElement;

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
        this.toggleDetail = document.getElementById("toggle") as HTMLInputElement;

        this.redraw();
        this.createUserEvents();
    }

    private createUserEvents(): void{
        let canvas = this.canvas

        canvas.addEventListener("mousedown", this.pressHandler);
        canvas.addEventListener("mousemove", this.dragHandler);
        canvas.addEventListener("mouseup", this.upHandler);
        canvas.addEventListener("mouseout", this.upHandler);

        canvas.addEventListener("touchstart", this.pressHandler);
        canvas.addEventListener("touchmove", this.dragHandler);
        canvas.addEventListener("touchcancel", this.upHandler);
        canvas.addEventListener("touchend", this.upHandler);

        document.getElementById("clear").addEventListener("click", this.clearCanvasHandler);
    }

    private redraw = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let points = this.points;
        let context = this.context;
        let s = points.length;
        
        for (let i = 0 ; i < s ; i++){
            context.beginPath();
            context.arc(points[i].x, points[i].y, POINTRADIUS, 0, 2*Math.PI);
            context.fillStyle = (i == 0 || i == s-1) ? "red" : "yellow";
            context.fill();
            context.stroke();
        }
        if (this.points.length < 2)
            return;

        if (this.toggleDetail.checked)
            this.detailedDraw();
        
        let curve = this.getCurve(this.points);
        s = curve.length;
        for (let i = 1 ; i < s ; i++){
             context.beginPath();
             context.moveTo(curve[i-1].x, curve[i-1].y);
             context.lineTo(curve[i].x, curve[i].y);
             context.stroke();
        }
        
    }

    private detailedDraw = () => {
        let context = this.context;
        let groupSize = 1;
        let s = this.points.length;
        while (groupSize < s){
            for (let i = 0 ; i+groupSize < s ; i++){
                // groupsize * quantum for alpha?
                let curve = this.getCurve(this.points.slice(i,i+groupSize+1))
                let len = curve.length
                for (let i = 1 ; i < len ; i++){
                    context.beginPath();
                    context.moveTo(curve[i-1].x, curve[i-1].y);
                    context.lineTo(curve[i].x, curve[i].y);
                    context.stroke();
               }
            }
            groupSize += 1;
        }
    }

    //at time this is called we are within if-block where this.points >= 2 len
    private getCurve = (points: Point[]) => {
        let curve: Point[] = [];
        for (let t = 0.0 ; t <= 1.001 ; t += 0.005){
            curve.push(deCasteljau(points, t))
        }
        return curve;
    }

    private clearCanvasHandler = () => {
        this.points = [];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private pressHandler = (e: MouseEvent | TouchEvent) => {
        let x = (e as TouchEvent).changedTouches ? 
            (e as TouchEvent).changedTouches[0].pageX : 
            (e as MouseEvent).pageX;
        let y = (e as TouchEvent).changedTouches ? 
            (e as TouchEvent).changedTouches[0].pageY : 
            (e as MouseEvent).pageY;
        x -= this.canvas.offsetLeft;
        y -= this.canvas.offsetTop;
        let i = this.points.findIndex((point) => {
            console.log(point);
            console.log(pointDistance(point, new Point(x, y)));
            return pointDistance(point, new Point(x, y)) < POINTRADIUS;
        })
        if(i < 0){
            this.points.push(new Point(x, y))
            this.currentPoint = this.points[this.points.length-1];
            this.redraw();
        }else{
            this.currentPoint = this.points[i];
            this.currentPoint.x = x;
            this.currentPoint.y = y;
        }
    }

    private dragHandler = (e: MouseEvent | TouchEvent) => {
        if (this.currentPoint){
            let x = (e as TouchEvent).changedTouches ? 
                (e as TouchEvent).changedTouches[0].pageX : 
                (e as MouseEvent).pageX;
            let y = (e as TouchEvent).changedTouches ? 
                (e as TouchEvent).changedTouches[0].pageY : 
                (e as MouseEvent).pageY;
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
            this.currentPoint.x = x;
            this.currentPoint.y = y;
            this.redraw();
        }
    }

    //set center of current point to edge +- 1 in case of mouseout 
    private upHandler = () => {
        this.currentPoint = null;
    }

}

let x = new BezierCurveTool();