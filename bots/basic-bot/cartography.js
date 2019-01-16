/*
 *  Cartography: responsible for low-level map functions, including map access and bounds checking bounds
 */

class Cartography {
    constructor(map, karboniteMap, fuelMap, getVisibleRobotMap) {
        this.size = map.length;
        
        const boundsCheck = this.boundsCheck;
        this.isPassable = pos => {
            boundsCheck();
            return map[pos.y][pos.x];
        };
        this.isKarboniteMine = pos => {
            boundsCheck();
            return karboniteMap[pos.y][pos.x];
        };
        this.isFuelMine = pos => {
            boundsCheck();
            return fuelMap[pos.y][pos.x];
        };
        this.robotMap = pos => {
            boundsCheck();
            return getVisibleRobotMap()[pos.y][pos.x];
        };
    }
    
    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.size && 
               pos.y >= 0 && pos.y < this.size;
    }
    boundsCheck() {
        if (!boundsCheck(pos))
            throw "pos is out of bounds";
    }
    
    isOccupied(pos) {
        boundsCheck();
        return this.robotMap(pos) > 0;
    }
    isOpen(pos) {
        boundsCheck();
        return !this.isOccupied(pos) && this.map(pos);
    }
    isMine(pos) {
        boundsCheck();
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
