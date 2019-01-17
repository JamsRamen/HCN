/*
 * cartography.js: responsible for low-level map functions, including map access and bounds checking bounds
 */
 import Point from './point.js';

class Cartography {
    constructor(map, karboniteMap, fuelMap, getVisibleRobotMap) {
        this.size = map.length;

        const _this = this;
        this.isPassable = pos => {
            _this.boundsCheck(pos);
            return map[pos.y][pos.x];
        };
        this.isKarboniteMine = pos => {
            _this.boundsCheck(pos);
            return karboniteMap[pos.y][pos.x];
        };
        this.isFuelMine = pos => {
            _this.boundsCheck(pos);
            return fuelMap[pos.y][pos.x];
        };
        this.robotMap = pos => {
            _this.boundsCheck(pos);
            return getVisibleRobotMap()[pos.y][pos.x];
        };
    }
    
    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.size && 
               pos.y >= 0 && pos.y < this.size;
    }
    boundsCheck(pos) {
        if (!this.isInBounds(pos))
            throw "pos is out of bounds";
    }
    
    isOccupied(pos) {
        this.boundsCheck(pos);
        return this.robotMap(pos) > 0;
    }
    isOpen(pos) {
        this.boundsCheck(pos);
        return !this.isOccupied(pos) && this.map(pos);
    }
    isMine(pos) {
        this.boundsCheck(pos);
        return this.isKarbonite(pos) || this.isFuelMine(pos);
    }
    
    
    isSymmetricX() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                const pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassable(pos.reflectX(this.size)))
                    return false;
            }
        }
        return true;
    }

    isSymmetricY() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                const pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassable(pos.reflectY(this.size)))
                    return false;
            }
        }
        return true;
    }
    
    
}

export default Cartography;
