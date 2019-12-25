let canvas, ctx;
let screenW = 1200;
let screenH = 900;

function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, screenW, screenH);
}

window.onload = initCanvas;