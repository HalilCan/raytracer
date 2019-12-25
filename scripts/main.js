let canvas, ctx;

function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 350, 100);
}

window.onload = initCanvas;