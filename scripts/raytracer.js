import {Vector, ImagePlane, Camera} from "./raytracer.js";

// Image Plane and Camera creation //
let imPVec1 = new Vector(1, 0.75, 0);
let imPVec2 = new Vector(-1, 0.75, 0);
let imPVec3 = new Vector(1, -0.75, 0);
let imPVec4 = new Vector(-1, -0.75, 0);
let imagePlane = new ImagePlane(camVec1, camVec2, camVec3, camVec4);

let camPosition = new Vector(0, 0, -1);
let camera = new Camera(camPosition);
/////////////////////
console.log(camera.x);