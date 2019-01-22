/*
 * cartography.js: responsible for low-level map functions, including map access and bounds checking bounds
 *
 * class Cartography:
 * variables:
 *      none
 *  
 * functions:
 *      Cartography(map, karboniteMap, fuelMap, getVisibleRobotMap)
 *          arguments are from BCAbstractRobot
 *
 *      isPassable(pos)
 *          returns true if square at pos is passable, false otherwise
 *      isKarboniteMine(pos)
 *          returns true if square at pos is a karbonite mine, false otherwise
 *      isFuelMine(pos)
 *          returns true if square at pos is a fuel mine, false otherwise
 *      isOccupied(pos)
 *          returns true if there is known to be a robot at pos, false otherwise
 *      isOpen(pos)
 *          returns true if pos is passable and not occupied, false otherwise
 *      isMine(pos)
 *          returns true if square at pos is a mine, false otherwise
 *      
 *      robotMap(pos)
 *          returns -1 if pos is out of site, 0 if pos contains no robot, or the id of the robot at pos
 *
 *      isInBounds(pos)
 *          returns true if pos is in the bounds of the map
 *
 *      reflectX(pos)
 *          return the reflection of pos over the central x-axis of the map
 *      reflectY(pos)
 *          return the reflection of pos over the central y-axis of the map
 *      isSymmetricX()
 *          returns true if the map is symmetric over the central x-axis
 *      isSymmetricX()
 *          returns true if the map is symmetric over the central y-axis
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
    
    // add the following functions here
    // reflectX(pos)
    // reflectY(pos)
    
    // store results of these two functions
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
