///////////////////////////// Flags //////////////////////////////
let rayCastDebug = 0;
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
    return Math.sqrt(this.dot(this));
  }
  unitVec(){
    let norm = this.norm();
    return new Vector(this.x / norm, this.y / norm, this.z / norm);
  }
  dot(v){
    return (this.x * v.x + this.y * v.y + this.z * v.z);
    //equivalent to |this||v|cosTheta
  }
  cross(v) {
    return new Vector(
      this.y * v.z - this.z - v.y,
      this.x * v.z - this.z * v.x,
      this.x * v.y - this.y * v.x
    );
  }
  projectionOnto(v) {
    return (this.dot(v) / v.norm());
    //this.dot(v) is |this||v|cosTheta
    //this projected onto v has magnitude |this|cosTheta and direction v * sign(cosTheta)
  }
}

class Intersection {
  constructor(ray, magnitude, object, pointOnObject) {
    this.ray = ray;
    this.magnitude = magnitude;
    this.object = object;
    this.pointOnObject = pointOnObject;
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
  intersects(object) {

  }
}

class Sphere {
  constructor(center, radius, color, material) {
    this.center = center;
    this.radius = radius; 
    this.color = color;
    this.material = material;
  }
  surfaceNormal(pointOnSurface) {
    return (pointOnSurface.subtract(this.center)).unitVec();
  }
}

class pointLight {
  constructor(position, diffuseIntensity, specularIntensity) {
    this.position = position;
    this.diffuseIntensity = diffuseIntensity;
    this.specularIntensity = specularIntensity;
  }
}

class Material {
  constructor(ambientConstant, diffuseConstant, specularConstant, reflectivityConstant, shininess) {
    this.ambientConstant = ambientConstant; // this is the percentage of ambient light the material reflects
    this.diffuseConstant = diffuseConstant; // this is the percentage of diffuse light the material reflects
    this.specularConstant = specularConstant; // % spec light the material reflects
    this.reflectivityConstant = reflectivityConstant; // % light reflected onto other objects 
    this.shininess = shininess; // alpha shininess factor
  }
}

class Color { //values between 0 and 1
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  getFullScale(scale) { //normally 255
    return new Color(this.r*scale, this.g*scale, this.b*scale);
  }
  multiply(color) {
    let newColor = new Color(this.r*color.r, this.g*color.g, this.b*color.b);
    return newColor.clamp();
  }
  scale(scale) {
    let newColor = new Color(this.r*scale, this.g*scale, this.b*scale);
    return newColor.clamp();
  }
  add(color) {
    let newColor = new Color(this.r+color.r , this.g+color.g , this.b+color.b);
    return newColor.clamp();
  }
  subtract(color) {
    let newColor = new Color(this.r-color.r , this.g-color.g , this.b-color.b);
    return newColor.clamp();
  }
  clamp () {
    return new Color(clamp(0,1,this.r),clamp(0,1,this.g),clamp(0,1,this.b));
  }
}

class Scene {
  constructor(canvas, camera, imagePlane, objects, lights, ambientLightIntensity, recursionDepth, backgroundColor) {
    this.camera = camera;
    this.canvas = canvas;
    this.imagePlane = imagePlane;
    this.objects = objects;
    this.lights = lights;
    this.ambientLightIntensity = ambientLightIntensity;
    this.recursionDepth = recursionDepth;
    this.backgroundColor = backgroundColor;
  }
  getColorThroughRay(incomingRay, pointOnObj, obj, recursionDepth) {
    //calculate normal color at pointOnObj
    let ambientComponent = this.ambientTerm(obj);
    let specularComponent = new Color(0, 0, 0);
    let diffuseComponent = new Color(0, 0, 0);
    let reflectedComponent = new Color(0, 0, 0);
  
    for (let light of this.lights) {
      let fullLightVector = (light.position.subtract(pointOnObj));
      let lightRay = new Ray(pointOnObj, fullLightVector);
      let t = 1;
      for (let shadowObj of this.objects) {
        if (shadowObj != obj) {
          t = raySphereCollisionMagnitude(lightRay, shadowObj);
          if (t > 0 && t < 1) {
            break;
          }
        }
      }
      if (!(t > 0 && t < 1)) {
        let specTerm = this.specularTerm(obj, light, this.camera, pointOnObj);
        if (specTerm != -1) {
          specularComponent = specularComponent.add(specTerm);
        }
        let diffTerm = this.diffuseTerm(obj, light, pointOnObj);
        if (diffTerm != -1) {
          diffuseComponent = diffuseComponent.add(diffTerm);
        }
      } 
    }
    let rayColorWithoutReflection = ambientComponent.add(specularComponent).add(diffuseComponent);
    //if recursion continues, cast another ray from pointOnObj, find out whether it intersects another obj
    //calculate reflectance vector
    if (recursionDepth > 0) {
      let V = incomingRay.direction.scale(-1)
        .unitVec();
      let N = obj.surfaceNormal(pointOnObj);
      let R = ((N.scale((2 * (N.dot(V)))))
        .subtract(V))
        .unitVec();
      
      let newRay = new Ray(pointOnObj, R);
      //if it does, call this function recursively on that, return color at pointOnObj + kr-adjusted recursive color    
      //check for intersection
      let intersection = this.getClosestIntersection(newRay);
      if (intersection != -1) {
        //get reflected color recursively
        let targetObjectReflectivity = intersection.object.material.reflectivityConstant;
        reflectedComponent = this.getColorThroughRay(newRay, intersection.pointOnObject, intersection.object, recursionDepth - 1);
        reflectedComponent = reflectedComponent.multiply(targetObjectReflectivity);
      }
    }
    //if it does not, or if the recursion does not continue, return color at pointOnObj
    return rayColorWithoutReflection.add(reflectedComponent);
  }
  getClosestIntersection(ray) {
    let minColMagn = Number.POSITIVE_INFINITY;
    let pointOnObj, rayCastResult, closestObj;
    for (let obj of this.objects) {
      rayCastResult = raySphereCollisionMagnitude(ray, obj);
      if (rayCastResult > 1 && rayCastResult < minColMagn) {
          minColMagn = rayCastResult;
          closestObj = obj;
      }
    }
    if (Number.isFinite(minColMagn)) {
      pointOnObj = ray.origin.add(ray.direction.scale(minColMagn));
      ray = new Intersection(ray, minColMagn, closestObj, pointOnObj);
      return ray;
    } else {
      return -1;
    }
  }
  getColorAtPixel(i, j, alpha, beta, antiAliasingSampleSize, aaIntW, aaIntH){ 
    let pixelColor = this.backgroundColor;
    let baseR = 0;
    let baseG = 0;
    let baseB = 0;
    let p;

    for (let aaI = 0; aaI < antiAliasingSampleSize; aaI++) {
      for (let aaJ = 0; aaJ < antiAliasingSampleSize; aaJ++) {
        p = bilinearInterpolate(alpha + aaIntW * aaI, beta + aaIntH * aaJ);
        let direction = p.subtract(this.camera.position);
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
        let intersection = this.getClosestIntersection(ray);
        if (intersection != -1) {
          pixelColor = this.getColorThroughRay(intersection.ray, intersection.pointOnObject, intersection.object, this.recursionDepth);
          baseR += pixelColor.r;
          baseG += pixelColor.g;
          baseB += pixelColor.b;
        }
      } 
    }

    baseR = baseR / (antiAliasingSampleSize*antiAliasingSampleSize);
    baseG = baseG / (antiAliasingSampleSize*antiAliasingSampleSize);
    baseB = baseB / (antiAliasingSampleSize*antiAliasingSampleSize);

    return new Color(baseR, baseG, baseB);      
  }
  ambientTerm(object) {
    let amTerm = this.ambientLightIntensity.multiply(object.material.ambientConstant);
    return amTerm;
  }
  diffuseTerm(object, light, pointOnObject) {
    let lightVector = (light.position.subtract(pointOnObject)).unitVec();
    let objectNormal = object.surfaceNormal(pointOnObject).unitVec();
    
    let ln = lightVector.dot(objectNormal);
    if (ln < 0) {
      return -1;
    } 

    let diffuseTerm = light.diffuseIntensity.multiply(object.material.diffuseConstant).scale(ln);
    return diffuseTerm;
  }
  specularTerm(object, light, camera, pointOnObject) {
    let lightVector = (light.position.subtract(pointOnObject)).unitVec();
    let objectNormal = object.surfaceNormal(pointOnObject).unitVec();

    let ln = lightVector.dot(objectNormal);
    if (ln < 0) {
      return -1;
    }

    let reflectanceVector = ((((objectNormal).scale(2 * (ln)))).subtract(lightVector)).unitVec();
    let viewVector = (camera.position.subtract(pointOnObject)).unitVec();
    let vr = viewVector.dot(reflectanceVector);
    if (vr < 0) {
      return -1;
    }
    
    let specularComponent = (light.specularIntensity.multiply(object.material.specularConstant)).scale(Math.pow(vr, object.material.shininess));
    return specularComponent;
  }
  /* Render function for arbitrary objects (spheres only currently) */
  render(antiAliasingSampleSize) {
    let screenH = this.canvas.height;
    let screenW = this.canvas.width;
    let aaSizeH, aaSizeW;

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
          aaSizeW = 1 / (screenH * antiAliasingSampleSize);
          aaSizeH = 1 / (screenW * antiAliasingSampleSize);
          alpha = (i + 1) / screenW;
          beta = (j + 1) / screenH;
          
          let pixelColor = this.getColorAtPixel(i, j, alpha, beta, antiAliasingSampleSize, aaSizeW, aaSizeH);
          pixelColor = pixelColor.getFullScale(255);

          ctx.fillStyle = "rgb("+pixelColor.r+","+pixelColor.g+","+pixelColor.b+")";
          ctx.fillRect(i,j, 1,1);
        }
      }
    }
}

class Polygon{
  constructor(v1, v2, v3) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }

  getRayIntersection(ray) {
    //returns [result[0:1], absolute intersection vector, ray direction magnitude]
    let u1 = this.v3.subtract(this.v1);
    let u2 = this.v2.subtract(this.v1);
    let normal = u1.cross(u2);

    let rayDirection = ray.direction;
    let rayOrigin = ray.origin;
    let polyToOrigin = rayOrigin.subtract(this.v1);
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
let scene;
/////////////////////////////////////
/////////////////////////////////

function init() {
    canvas = document.getElementById('mainCanvas');
    canvas.width = screenW;
    canvas.height = screenH;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, screenW, screenH);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, screenW, screenH);

    //let ambientLightIntensity = new Color(0, 0, 0);
    let ambientLightIntensity = new Color(0.1, 0.1, 0.1);

    let recursionDepth = 2;

    let backgroundColor = new Color(0, 0, 0);
    
    scene = new Scene(canvas, camera, imagePlane, [], [], ambientLightIntensity, recursionDepth, backgroundColor);
    raySphCollisionTest();
    return 0;
}
window.onload = init;

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

  let a = Vsq;
  let b = 2*dv;
  let c = Dsq - rsq; 

  let discriminant = b*b - 4*a*c;

  if (discriminant < 0) {
    return -1;
  }
       
  let t1 = (-b + Math.sqrt(discriminant)) / (2*a);
  let t2 = (-b - Math.sqrt(discriminant)) / (2*a);
  
  if (t1 < 0) {
    if (t2 < 0) {
      return -2;
    } else {
      return t2;
    }
  } else {
    if (t2 < 0) {
      return t1;
    } else {
      return Math.min(t1, t2)
    }
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

function createRandomMaterial(reflectivityAdjustment) {
  let r = Math.random();
  let g = Math.random();
  let b = Math.random();
  let ambientConstant = new Color (r, g, b);
  let specularConstant = new Color (r, g, b);
  
  let diffuseConstant = new Color (clamp(0,1,r/reflectivityAdjustment), clamp(0,1,g/reflectivityAdjustment), clamp(0,1,b/reflectivityAdjustment));
  let reflectivityConstant = new Color (clamp(0,1,r*reflectivityAdjustment), clamp(0,1,g*reflectivityAdjustment), clamp(0,1,b*reflectivityAdjustment));

  let shininess = Math.floor(Math.random()*100) + 1;
  return new Material(ambientConstant, diffuseConstant, specularConstant, reflectivityConstant, shininess);
}

function getRandomVector(minX, maxX, minY, maxY, minZ, maxZ) {
  let randX, randY, randZ;
  randX = getRandomIntInRange(minX, maxX);
  randY = getRandomIntInRange(minY, maxY);
  randZ = getRandomIntInRange(minZ, maxZ);
  return new Vector(randX, randY, randZ);
}

function createRandomSpheres(minX, maxX, minY, maxY, minZ, maxZ, radiusMaximus, count, colorArray) {
  let sphereArray = [];
  let randX, randY, randZ, randRadius, center, color, material;
  let reflectivityAdjustment = 0.5;

  for (let i = 0; i < count; i++) {
    randX = getRandomIntInRange(minX, maxX);
    randY = getRandomIntInRange(minY, maxY);
    randZ = getRandomIntInRange(minZ, maxZ);
    center = new Vector(randX, randY, randZ);
    randRadius = getRandomIntInRange(1, radiusMaximus);
    //color = colorArray[getRandomIntInRange(0, colorArray.length)];
    color = new Color(Math.random(), Math.random(), Math.random());
    material = createRandomMaterial(reflectivityAdjustment);

    let sphere = new Sphere(center, randRadius, color, material);
    sphereArray.push(sphere);
  }
  return sphereArray;
}


function createRandomPointLights(xMin, xMax, yMin, yMax, zMin, zMax, count) {
  let lightArray = [];
  let light;
  
  for (let i = 0; i < count; i++) {
    let diffuseIntensity = new Color(Math.random(),Math.random(),Math.random());
    let specularIntensity = new Color(Math.random(),Math.random(),Math.random());
    let position = getRandomVector(xMin, xMax, yMin, yMax, zMin, zMax);
    light = new pointLight(position, diffuseIntensity, specularIntensity);
    lightArray.push(light);;
  }
  return lightArray;
}

function clamp (min, max, val) {
  if (val < min) {
    val = min;
  }
  if (val > max) {
    val = max;
  }
  return val;
}

function raySphCollisionTest() {
  let objCount = 10;
  let maxRadius = 20;
  let sphereArray = createRandomSpheres(-30, 30, -30, 30, 40, 80, maxRadius, objCount, ["white", "green", "red", "orange", "blue", "yellow", "cyan", "violet"]);
  console.log(sphereArray);
  scene.objects = sphereArray;

  let oneLightTest = 0;
  let multiLightCount = 3;
  let lightArray = [];

  if (oneLightTest) {
    let lightPosition = new Vector(400, 0, -10);
    let oneLight = new pointLight(lightPosition, new Color(0.7, 0.2, 0.2), new Color(0.8, 0.2, 0.2));
    lightArray.push(oneLight);
    lightPosition = new Vector(-400, 0, -10);
    oneLight = new pointLight(lightPosition, new Color(0.2, 0.7, 0.2), new Color(0.2, 0.8, 0.2));
    lightArray.push(oneLight);
    lightPosition = new Vector(0, 40, -10);
    oneLight = new pointLight(lightPosition, new Color(0.2, 0.2, 0.7), new Color(0.2, 0.2, 0.8));
    lightArray.push(oneLight);
  } else {
    lightArray = createRandomPointLights(-40, 40, -40, 40, 0, 20, multiLightCount);
  }
  scene.lights = lightArray;
  console.log(lightArray);
  scene.render(2);
}
/////////////////////////////////////////
// Button functions
function refreshPage() {
  let canvas = document.getElementById('mainCanvas')
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, screenW, screenH);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, screenW, screenH);
  setTimeout(init, 2);
}
let downloadCount = 1
function saveImg(self) {
  let canvas = document.getElementById('mainCanvas')
  let downloadStr = downloadCount == 1 ? downloadCount.toString() + "_" + "bonbon.png" : downloadCount.toString() + "_" + "bonbons.png"
  downloadCount++

  let link = document.getElementById('likeATrackingPixelButNot');
  link.setAttribute('download', downloadStr);
  link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}
////////////////////////////////////////////////////////////////////////////