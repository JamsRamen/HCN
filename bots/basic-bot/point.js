/*
 * point.js: represent a position on the xy plane
 */

/**
 * Represents a position on the xy plane
 */
class Point {
    /**
     * @param {number} [x=0] - x-coordinate
     * @param {number} [y=0] - y-coordinate
     */
    constructor(x, y) {
        /** @instance */
        this.x = (x === undefined ? 0 : x);
        /** @instance */
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
    
    /**
     * @return {String} String representation of this Point, formatted "(x, y)"
     */
    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    /**
     * @param {Point} other point to compare to
     * @return {boolean} return true if the points have the same coordinates
     */
    equals(other) {
        if (!other)
            return false;
        return other.x === this.x && other.y === this.y;
    }
}

export default Point;

