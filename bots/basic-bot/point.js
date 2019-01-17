/*
 * point.js: represent a position on an xy plane
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

