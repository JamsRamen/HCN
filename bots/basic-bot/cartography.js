
class Cartography {
    constructor(map, karboniteMap, fuelMap, getVisibleRobotMap) {
        this.size = map.length;
        this.isPassable = pos => map[pos.y][pos.x];
        this.isKarboniteMine = pos => karboniteMap[pos.y][pos.x];
        this.isFuelMine = pos => fuelMap[pos.y][pos.x];
        this.robotMap = pos => getVisibleRobotMap()[pos.y][pos.x];
    }
    isOccupied(pos) {
        return this.robotMap(pos) > 0;
    }
    isOpen(pos) {
        return !this.isOccupied(pos) && this.map(pos);
    }
    isMine(pos) {
        return this.isKarbonite(pos) || this.isFuelMine(pos);
    }
    
    isSymmetricX () {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassible(pos.reflectX(this.size)))
                    return false;
            }
        }
        return true;
    }

    isSymmetricY () {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassible(pos.reflectY(this.size)))
                    return false;
            }
        }
        return true;
    }
}

export default Cartography;
