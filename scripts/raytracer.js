///////////////////////////// Flags //////////////////////////////
let rayCastDebug = 1;
//////////////////////////////////////////////////////////////////

//////////////////////////// Structs /////////////////////////////
//export{Vector, ImagePlane, Camera, Ray};

class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  subtract(v){
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }
}

class ImagePlane {
  constructor(v1, v2, v3, v4) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.v4 = v4;
  }
}

class Camera {
  constructor(position) {
    this.position = position;
  }
}

class Ray{
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}

///////////////////////////////////////////////////////////////

///////////////////////// Main Actions ////////////////////////
//import {Vector, ImagePlane, Camera, Ray} from "./raytracerStructs";

///////////// Setup /////////////
let canvas, ctx;
let screenW = 800;
let screenH = 600;
// Image Plane and Camera creation //
let imPVec1 = new Vector(-1, -0.75, 0);
let imPVec2 = new Vector(1, -0.75, 0);
let imPVec3 = new Vector(-1, 0.75, 0);
let imPVec4 = new Vector(1, 0.75, 0);
let imagePlane = new ImagePlane(imPVec1, imPVec2, imPVec3, imPVec4);

let camPosition = new Vector(0, 0, -1);
let camera = new Camera(camPosition);
/////////////////////////////////////
/////////////////////////////////

function initCanvas() {
    canvas = document.getElementById('mainCanvas');
    canvas.width = screenW;
    canvas.height = screenH;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, screenW, screenH);

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, screenW, screenH);

    castAllRays();
}
window.onload = initCanvas;

// Full ray casting //
function castAllRays() {
    let alpha = 0, beta = 0, red = 0, green = 0, blue = 0;
    let xMin = 9999, yMin = 9999;
    let xMax = -9999, yMax = -9999;
    if (rayCastDebug) {
        for (let i = 0; i < screenW; i++) {
            for (let j = 0; j < screenH; j++) {
                alpha = (i + 1) / screenW;
                beta = (j + 1) / screenH;
                let p = bilinearInterpolate(alpha, beta);
                let direction = p.subtract(camPosition);
                if (direction.x < xMin) {
                    xMin = direction.x;
                }    
                if (direction.x > xMax) {
                    xMax = direction.x;
                }    
                if (direction.y < yMin) {
                    yMin = direction.y;
                }    
                if (direction.y > yMax) {
                    yMax = direction.y;
                }    
            }
        }
        console.log(xMax, xMin, yMax, yMin);
    }

    for (let i = 0; i < screenW; i++) {
        for (let j = 0; j < screenH; j++) {
            alpha = (i + 1) / screenW;
            beta = (j + 1) / screenH;
            let p = bilinearInterpolate(alpha, beta);
            let direction = p.subtract(camPosition);
            let ray = new Ray(p, direction);

            if (rayCastDebug) {
                let xScale = Math.floor(((direction.x - xMin) / (xMax - xMin)) * 255 + 1) / 255;
                let yScale = Math.floor(((direction.y - yMin) / (yMax - yMin)) * 255 + 1) / 255;
                red = xScale * 255;
                green = yScale * 255;
                blue = 50;
                ctx.fillStyle = "rgb("+red+","+green+","+blue+")";
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }
}
////////////////////

// bilinear interpolation for ray vector determination //
function bilinearInterpolate(alpha, beta) {
    let x1 = imPVec1, x2 = imPVec2, x3 = imPVec3, x4 = imPVec4;

    let t = (x1.scale(1-alpha)).add(x2.scale(alpha));
    let b = (x3.scale(1-alpha)).add(x4.scale(alpha));
    let p = t.scale(1-beta).add(b.scale(beta));
    return p;
}
//////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////