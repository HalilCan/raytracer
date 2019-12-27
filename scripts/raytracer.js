///////////////////////////// Flags //////////////////////////////
let rayCastDebug = 1;
//unfortunately everything is placed in this one mega-file, 
//for some reason local development with js modules is prohibitive
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
  norm(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  unitVec(v){
    let norm = this.norm();
    return new Vector(thix.x / norm, thix.y / norm, thix.z / norm);
  }
  dot(v){
    return (this.x * v.x + this.y * v.y + this.z * v.z);
    //equivalent to |this||v|cosTheta
  }
  projectionOnto(v) {
    return (this.dot(v) / v.norm());
    //this.dot(v) is |this||v|cosTheta
    //this projected onto v has magnitude |this|cosTheta and direction v * sign(cosTheta)
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

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}

class Sphere {
  constructor(center, radius, color) {
    this.center = center;
    this.radius = radius; 
    this.color = color;
  }
}

class pointLight {
  constructor(location, intensity, color) {
    this.location = location;
    this.intensity = intensity;
    this.color = color;
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

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, screenW, screenH);

    //raySphCollisionTest();
    raySphCollisionTestOcclusion();
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
                blue = 80;
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
// sphere geometry collision detection //
/*
Simple quadratic equation problem.
  Let the ray be O+Vt (vectors capitalized) where O is the 
origin and V is the direction vector.
  Given a sphere descibed by C,r where C is the center and
r is the radius, if the ray collides with the sphere at all,
it must intersect its surface at least once. Therefore we have
the equations where for some t
  SQRT((|O+Vt|)^2 +- r^2) = |C|, 
  or |C-(O+Vt)| = r.
  Thus Cx^2-(Ox^2+(Vx*t)^2)+Cx^2-(Ox^2+(Vx*t)^2)+Cx^2-(Ox^2+(Vx*t)^2) = r^2 
  or C^2-O^2-V^2*t^2 = r^2
  thus t = SQRT((C^2-O^2-r^2)/V^2)

  2: Let's use this: 
  |(O+Vt)-C| = r 
  <O+Vt-C, O+Vt-C> = r^2
  let D = O-C;
  <D+Vt, D+Vt> = r^2
  <D+Vt, D> + <D+Vt, Vt> = r^2
  <D,D> + 2<D,Vt> + <Vt, Vt> = r^2
  V^2(t^2) + 2t<D,Vt> + D^2 = r^2
  quadratic form:  V^2(t^2) + 2t<D,V> + (D^2-r^2) = 0
  quadratic solution for t = (-2<D,V> +- sqrt((2<D,V>)^2 - 4*V^2*(D^2-r^2)))/4<D,V> 
  two solutions: the smaller is the first collision
  one solution: graze
  no solutions: no collisions (check for sqrt of a negative value or b is 0)

  ////////////////// ignore below
  quadratic: V^2t^2+ 0(zero)*t + (O^2-C^2-r^2) = 0
  thus t = +-SQRT(4*V^2*(O^2-C^2-r^2))/2*V^2
  or, relevant to us: t= +- SQRT(O.norm()-C.norm()-r*r)/V.norm()
  let t = C.norm())+k
  Thus k = t - C.norm(). If t is positive, there is a collision beyond O,
  if t is negative, there is a collision before O.   
*/
function getQuadraticIntersectionsObj(quadValue, equationFunction) {
  let obj = {
    count: 0,
    intersections: []
  };
  if (equationFunction(quadValue)) {
    obj.count ++;
    obj.intersections.push(quadValue);
  }
  if (equationFunction(-quadValue)) {
    obj.count ++;
    obj.intersections.push(quadValue);
  }
  return obj;
}

function raySphereCollisionMagnitude(Ray, Sphere) {
  let C = Sphere.center;
  let r = Sphere.radius;
  let O = Ray.origin;
  let V = Ray.direction;

  let D = O.subtract(C);
  let dv = D.dot(V);
  let Vsq = V.dot(V);
  let Dsq = D.dot(D);
  let rsq = r*r;

  let k = Math.pow((2*dv),2) - 4*Vsq*(Dsq-rsq);

  if (k < 0) {
    return [0, 0, 0];
  }
  if (dv == 0) {
    return [0, 0, 0];
  }

  //quadratic solution for t = (-2<D,V> +- sqrt((2<D,V>)^2 - 4*V^2*(D^2-r^2)))/4<D,V>   
  let t1 = (-2*dv + k) / 4*dv;
  let t2 = (-2*dv - k) / 4*dv;

  if (t1 == t2) {
    return [1, t1, t2];
  } else {
    return [2, t1, t2];    
  }
}

function getRandomIntInRange(min, max) {
  return min + Math.floor(Math.random()*(max-min));
}

function getRandomRGB() {
  let r = getRandomIntInRange(0,255);
  let g = getRandomIntInRange(0,255);
  let b = getRandomIntInRange(0,255);
  return "rgb("+r+","+g+","+b+")";
}

function createRandomSpheres(minX, maxX, minY, maxY, minZ, maxZ, radiusMaximus, count, colorArray) {
  let sphereArray = [];
  let randX, randY, randRadius, center, color;

  for (let i = 0; i < count; i++) {
    randX = getRandomIntInRange(minX, maxX);
    randY = getRandomIntInRange(minY, maxY);
    randZ = getRandomIntInRange(minZ, maxZ);
    center = new Vector(randX, randY, randZ);
    randRadius = getRandomIntInRange(1, radiusMaximus);
    color = colorArray[getRandomIntInRange(0, colorArray.length)];
    //color = getRandomRGB();

    let sphere = new Sphere(center, randRadius, color);
    sphereArray.push(sphere);
  }
  return sphereArray;
}

function raySphCollisionTest() {
  let sphereArray = createRandomSpheres(1, 2, 1, 2, 10, 20, 7, 3, ["white", "green", "red", "orange", "blue", "yellow", "cyan", "violet"]);
  console.log(sphereArray);
  render(sphereArray);
}

function raySphCollisionTestMinRadius() {
  let sphereArray = [];

  let c1 = new Vector(-50,1,50);
  let c2 = new Vector(-40,1,50);
  let c3 = new Vector(-30,1,50);
  let c4 = new Vector(-20,1,50);
  let c5 = new Vector(-10,1,50);
  let c6 = new Vector(0,1,50);
  let c7 = new Vector(10,1,50);
  let c8 = new Vector(20,1,50);
  let c9 = new Vector(35,1,50);
  let c10 = new Vector(55,1,50);

  let s1 = new Sphere(c1, -10, "red");
  let s2 = new Sphere(c2, -5, "white");
  let s3 = new Sphere(c3, -1, "green");
  let s4 = new Sphere(c4, 0, "red");
  let s5 = new Sphere(c5, 1, "red");
  let s6 = new Sphere(c6, 2, "red");
  let s7 = new Sphere(c7, 3, "red");
  let s8 = new Sphere(c8, 4, "red");
  let s9 = new Sphere(c9, 5, "red");
  let s10 = new Sphere(c10, 6, "red");

  sphereArray.push(s1, s2, s3, s4, s5, s6, s7, s8, s9, s10);  
  /*
  //Same center, different radius, should only see the larger one  
  let c1 = new Vector(1,1,1);
  let c2 = new Vector(1,1,1);
  let s1 = new Sphere(c1)
  */

  console.log(sphereArray);
  render(sphereArray);
}

function raySphCollisionTestMinRadiusNegZ() {
  let sphereArray = [];

  let c1 = new Vector(-50,1,-50);
  let c2 = new Vector(-40,1,-50);
  let c3 = new Vector(-30,1,-50);
  let c4 = new Vector(-20,1,-50);
  let c5 = new Vector(-10,1,-50);
  let c6 = new Vector(0,1,-50);
  let c7 = new Vector(10,1,-50);
  let c8 = new Vector(20,1,-50);
  let c9 = new Vector(35,1,-50);
  let c10 = new Vector(55,1,-50);

  let s1 = new Sphere(c1, -10, "red");
  let s2 = new Sphere(c2, -5, "white");
  let s3 = new Sphere(c3, -1, "green");
  let s4 = new Sphere(c4, 0, "red");
  let s5 = new Sphere(c5, 1, "red");
  let s6 = new Sphere(c6, 2, "red");
  let s7 = new Sphere(c7, 3, "red");
  let s8 = new Sphere(c8, 4, "red");
  let s9 = new Sphere(c9, 5, "red");
  let s10 = new Sphere(c10, 6, "red");

  sphereArray.push(s1, s2, s3, s4, s5, s6, s7, s8, s9, s10);  
  /*
  //Same center, different radius, should only see the larger one  
  let c1 = new Vector(1,1,1);
  let c2 = new Vector(1,1,1);
  let s1 = new Sphere(c1)
  */

  console.log(sphereArray);
  render(sphereArray);
}

function raySphCollisionTestOcclusion() {
  let sphereArray = [];

  let c1 = new Vector(1,1,-50);
  let c2 = new Vector(1,1,-40);
  let c3 = new Vector(1,1,-30);
  let c4 = new Vector(1,1,-20);
  let c5 = new Vector(1,1,-10);
  //let c6 = new Vector(1,1,0);
  let c7 = new Vector(1,1,10);
  let c8 = new Vector(1,1,20);
  let c9 = new Vector(1,1,30);
  let c10 = new Vector(1,1,40);

  let s1 = new Sphere(c1, 5, "red");
  let s2 = new Sphere(c2, 5, "white");
  let s3 = new Sphere(c3, 5, "green");
  let s4 = new Sphere(c4, 5, "yellow");
  let s5 = new Sphere(c5, 5, "orange");
  //let s6 = new Sphere(c6, 5, "black");
  let s7 = new Sphere(c7, 5, "blue");
  let s8 = new Sphere(c8, 5, "cyan");
  let s9 = new Sphere(c9, 5, "brown");
  let s10 = new Sphere(c10, 5, "violet");

  sphereArray.push(s1, s2, s3, s4, s5, s7, s8, s9, s10);  
  /*
  //Same center, different radius, should only see the larger one  
  let c1 = new Vector(1,1,1);
  let c2 = new Vector(1,1,1);
  let s1 = new Sphere(c1)
  */

  console.log(sphereArray);
  render(sphereArray);
}

/////////////////////////////////////////
/* Render function for arbitrary objects (spheres only currently) */
function render(objects) {
  let alpha = 0, beta = 0;
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
        //in our implementation, since p is between 0 and 1, whereas camPosition is at norm 1, we only consider negative t values later on.
      
        if (rayCastDebug) {
            let xScale = Math.floor(((direction.x - xMin) / (xMax - xMin)) * 255 + 1) / 255;
            let yScale = Math.floor(((direction.y - yMin) / (yMax - yMin)) * 255 + 1) / 255;
            red = xScale * 255;
            green = yScale * 255;
            blue = 80;
            ctx.fillStyle = "rgb("+red+","+green+","+blue+")";
            ctx.fillRect(i, j, 1, 1);
        }

        let ray = new Ray(p, direction);
        let minColMagn = -9999;
        let closestObj, rayCastResult;
        let isEdge = 0;
        for (let obj of objects) {
          rayCastResult = raySphereCollisionMagnitude(ray, obj);
          if (rayCastResult[0] > 0) {
            if (rayCastResult[1] > minColMagn && rayCastResult[1] < 0) {
              if (i%50 == 0) {
                console.log(obj, ray, rayCastResult);
              }
              minColMagn = rayCastResult[1];
              closestObj = obj;
              if(rayCastResult[1] == rayCastResult) {
                isEdge = 1;
              } else {
                isEdge = 0; //interesting, i'm not sure why I can't observe this behavior.
              }
            }
            if (rayCastResult[2] > minColMagn && rayCastResult[2] < 0) {
              minColMagn = rayCastResult[2];
              closestObj = obj;
            }
          }
        }
        if (minColMagn != 9999) {
          if (isEdge) {
            ctx.fillStyle = "black";
          } else {
            ctx.fillStyle = closestObj.color;
          }            
          ctx.fillRect(i,j, 1,1);
          //console.log(closestObj, ray);
        }
    }
  }
}
////////////////////////////////////////////////////////////////////////////