
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
}

export default Point;

