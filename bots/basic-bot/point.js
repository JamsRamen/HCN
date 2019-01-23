/*
 * point.js: represent a position on the xy plane
 */

/**
 * Represents a position on the xy plane
 * @class
 */
class Point {
    /**
     * @constructor
     * @param {number} [x=0] - x-coordinate
     * @param {number} [y=0] - y-coordinate
     */
    constructor(x, y) {
        this.x = (x === undefined ? 0 : x);
        this.y = (y === undefined ? 0 : y);
    }
    
    /**
     * @param {Point} other - the other addend
     * @return {Point} result of vector addition (this + other)
     */
    add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }
    /**
     * @param {Point} other - the subtrahend
     * @return {Point} result of vector subtraction (this - other)
     */
    sub(other) {
        return new Point(this.x - other.x, this.y - other.y);
    }
    
    /**
     * @param {number} scalar - the scale factor
     * @return {Point} result of scalar-vector multiplication (scalar * this)
     */
    scale(scalar) {
        return new Point(this.x * scalar, this.y * scalar); 
    }
    
    
    /** @todo move following functions to cartography */
    
    // reflect over the line x=(size-1)/2
    reflectX(size) {
        return new Point(size - this.x - 1, this.y);
    }
    
    // reflect over the line y=(size-1)/2
    reflectY(size) {
        return new Point(this.x, size - this.y - 1);
    }
    
    /**
     * @return {String} String representation of this Point, formatted "(x, y)"
     */
    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
}

export default Point;

