var canvas, ctx, w, h;
var r, points = [], num = 250;
var pseudo_line = ml_line = temp_line = {
    angle: null,
    intercept: null,
    col: 'lime',
    w: '3'
};
var ml_error, animFrame, gen = 1;
var is_training = false;

//event listeners for onload & resize
window.addEventListener('resize', init);
window.addEventListener('load', init);

//initial function,
function init() {
    //setting things up
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    w = window.innerWidth;
    h = window.innerHeight;
    points = [];

    r = (h < w) ? (h - 10) / 2 : (w - 10) / 2;
    r = (2 * r > 500) ? 250 : r - 20;

    canvas.width = canvas.height = 2 * r;
    ctx.translate(r, r);
    new_set();
}

// fn used to draw the base and points
function draw() {
    //clearing canvas
    ctx.fillStyle = '#2d3e50';
    ctx.fillRect(-r, -r, 2 * r, 2 * r);

    //circle region
    draw_circle(0, 0, r);
    for (let i = 0; i < num; i++) {
        // points[i].bg = 'black';
        points[i].draw();
    }
    // draw_line(pseudo_line);

}


// functions to train the machine
function train() {
    // will run only if it isn't already running
    if (!is_training) {
        gen = 1;
        // our very own line i.e. for now random
        ml_line = {
            angle: rand(0, 2 * PI),
            intercept: rand(0, r),
            col: 'lime',
            w: '3'
        };
        draw();
        draw_line(ml_line);

        // initial error
        ml_error = eval_error(points, ml_line);
        // console.log('error : ' + error_ml);

        trainer();
    } else {
        window.cancelAnimationFrame(animFrame);
        is_training = false;
    }

}

// the function with does all the calculation
function trainer() {

    is_training = true;
    let d1 = exp(-1.5 / ml_error);
    let d2 = d1 / 400;
    // console.log('error : ' + ml_error);

    /* All possible cases that can be used to move */
    const cases = [];

    // case 1 : line intercept +ve and angle moves +ve
    temp_line = ml_line;
    change_line(temp_line, d1, d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: d1,
        d2: d2
    });

    // case 2 : line intercept moves -ve and angle moves +ve
    temp_line = ml_line;
    change_line(temp_line, -d1, d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: -d1,
        d2: d2
    });

    // case 3 : line intercept moves +ve and angle moves -ve
    temp_line = ml_line;
    change_line(temp_line, d1, -d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: d1,
        d2: -d2
    });

    // case 4 : line intercept moves -ve and angle moves -ve
    temp_line = ml_line;
    change_line(temp_line, -d1, -d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: -d1,
        d2: -d2
    });

    // case 5 : only angle moves -ve
    temp_line = ml_line;
    change_line(temp_line, 0, -d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: 0,
        d2: -d2
    });

    // case 6 : only angle moves +ve
    temp_line = ml_line;
    change_line(temp_line, 0, d2);
    cases.push({
        err: eval_error(points, temp_line),
        d1: 0,
        d2: d2
    });

    // case 7 : only line intercept moves -ve
    temp_line = ml_line;
    change_line(temp_line, -d1, 0);
    cases.push({
        err: eval_error(points, temp_line),
        d1: -d1,
        d2: 0
    });

    // case 8 : only line intercept moves +ve
    temp_line = ml_line;
    change_line(temp_line, d1, 0);
    cases.push({
        err: eval_error(points, temp_line),
        d1: d1,
        d2: 0
    });


    // sort error by least
    cases.sort((a, b) => a.err - b.err)
    // console.log(cases);

    // display error and current generation of training
    ml_error = cases[0].err;
    document.getElementById('err').innerText = ml_error.toPrecision(4);
    document.getElementById('gen').innerText = gen;

    //get the best move to reduce error and implement it
    change_line(ml_line, cases[0].d1, cases[0].d2);
    draw();
    draw_line(ml_line);

    //stop if generation exceeds 5002(an arbitrary) or error is less than 0.1
    if (gen < 5002) {
        if (ml_error.toPrecision(4) > 0.1) {
            gen += 1;
            animFrame = window.requestAnimationFrame(trainer);
        } else {
            window.cancelAnimationFrame(animFrame);
            is_training = false;
        }
    } else {
        window.cancelAnimationFrame(animFrame);
        is_training = false;
    }
}

// change line 
function change_line(l, d1, d2) {
    l.intercept += d1;
    l.angle += d2;
    // console.log('c = ' + l.intercept + ' a = ' + l.angle);
}

// to calculate the error for the current line

// method 2 (works, good enough)
function eval_error(p, l) {
    let res = 0;
    for (let i = 0; i < p.length; i++) {
        let temp = get_pos(p[i], l);

        if ((temp == 'left' && p[i].bg == 'red') || (temp == 'right' && p[i].bg == '#2d3e50')) {
            res += 0;
        } else {
            res += dist(p[i], l);
        }
    }
    return res;
}

// method 1 (works but uses original line so not actually machine learning so discarded)
// function eval_error(p, l) {
//     let res = 0;
//     for (let i = 0; i < p.length; i++) {
//         let temp1 = get_pos(p[i], l);
//         let temp2 = get_pos(p[i], pseudo_line);

//         if (temp1 !== temp2) {
//             res += dist(p[i], l);
//         }
//     }
//     return res;
// }

// to get distance between point and a line
function dist(p, l) {
    let m = tan(l.angle);
    let num = abs(p.y - m * p.x - l.intercept);
    let den = sqrt(1 + m * m);
    return num / den;
}

// function to initialize all the process
function new_set() {
    points = [];
    gen = 0;
    ml_error = 0;
    document.getElementById('err').innerText = ml_error.toPrecision(4);
    document.getElementById('gen').innerText = gen;
    get_points(1000);
    pseudo_line.angle = rand(0, 2 * PI);
    pseudo_line.intercept = rand(0, r);
    pseudo_line.col = 'black';
    color_points();
    draw();
    window.cancelAnimationFrame(animFrame);
    is_training = false;
    // train();
}

//generate points
function get_points(num) {
    for (let i = 0; i < num; i++) {
        let a = rand(0, r - 10);
        let theta = rand(0, 2 * PI);
        let p = new Point(a * cos(theta), a * sin(theta));
        points.push(p);
    }
}

// to choose color of the point as per the pseudo line
function color_points() {
    for (let i = 0; i < points.length; i++) {
        let temp = get_pos(points[i], pseudo_line);
        if (temp == 'left') {
            points[i].bg = 'red';
        } else if (temp == 'right') {
            points[i].bg = '#2d3e50';
        } else {
            points[i].bg = 'white';
        }
    }
}

// to get position of a point respective to the given line
function get_pos(p, l) {
    //  since for a line y = mx + c
    let m = tan(l.angle);
    let c = l.intercept;

    // for the point's position
    let temp = p.y - m * p.x - c;
    if (temp < 0) {
        return 'left';
    } else if (temp > 0) {
        return 'right';
    } else {
        return 'on';
    }

}
