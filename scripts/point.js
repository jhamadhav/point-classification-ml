const { sin, cos, tan, floor, random, PI, asin, abs, sqrt, exp } = Math;

//class point
class Point {
    constructor(x, y, r = '4', bg = 'white', col = '#262626', l = '0') {
        this.x = x, this.y = y, this.r = r;
        this.bg = bg, this.col = col, this.l = l;
    }

    draw() {
        draw_circle(this.x, this.y, this.r, this.bg, this.col, this.l);
    }
}

// circle function
function draw_circle(x, y, r, bg = 'white', col = '#262626', l = '2') {
    ctx.beginPath();
    ctx.lineWidth = l;
    ctx.strokeStyle = col;
    ctx.fillStyle = bg;
    ctx.arc(x, y, r, 0, 2 * PI);
    if (l != 0) {
        ctx.stroke();
    }
    ctx.fill();
    ctx.closePath();
}

// draw line
function draw_line(l) {
    let a = l.angle;
    let c = l.intercept;
    let b = asin(c * cos(a) / r);
    let x1 = r * cos(a + b);
    let x2 = r * cos(PI + a - b);
    let y1 = r * sin(a + b);
    let y2 = r * sin(PI + a - b);
    ctx.beginPath();
    ctx.lineWidth = l.w;
    ctx.strokeStyle = l.col;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}


//random function
const rand = (min = 0, max = 1) => {
    return random() * (max - min) + min;
}

