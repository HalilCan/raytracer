export{Vector, ImagePlane, Camera};

class Vector {
    constructor(x, y, y) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    add(v) {
      this.x = this.x + v.x;
      this.y = this.y + v.y;
      this.z = this.z + v.z;
    }
    subtract(v){
      this.x = this.x - v.x;
      this.y = this.y - v.y;
      this.z = this.z - v.z;
    }
    scale(scalar) {
      this.x = this.x * scalar;
      this.y = this.y * scalar;
      this.z = this.z * scalar;
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