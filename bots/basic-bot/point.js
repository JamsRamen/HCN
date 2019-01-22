/*
 * point.js: represent a position on an xy plane
 * 
 * class Point:
 * variables:
 *      this.x
 *      this.y
 *
 * functions:
 *      Point(x=0, y=0)
 *      add(other)
 *          return result of vector addition (this + other)
 *      sub(other)
 *          return result of vector subtraction (this - other)
 *      scale(scalar)
 *          returns result of scalar-vector multiplication (scalar * this)
 */

class Point {
    constructor(x, y) {
        this.x = (x === undefined ? 0 : x);
        this.y = (y === undefined ? 0 : y);
    }
    add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }
    scale(scalar) {
        return new Point(this.x * scalar, this.y * scalar); 
    }
    
    // move following functions to cartography
    
    // reflect over the line x=(size-1)/2
    reflectX(size) {
        return new Point(size - this.x - 1, this.y);
    }
    
    // reflect over the line y=(size-1)/2
    reflectY(size) {
        return new Point(this.x, size - this.y - 1);
    }
    
    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
}

export default Point;

