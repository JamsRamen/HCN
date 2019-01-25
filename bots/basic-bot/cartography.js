/*
 * cartography.js: responsible for low-level map functions, including map access and bounds checking bounds
 */

import Point from './point.js';

/**
 * Provides basic map functionality
 * @class
 */
class Cartography {
    /**
     * @constructor
     * @param map - from BCAbstractRobot
     * @param karboniteMap - from BCAbstractRobot
     * @param fuelMap - from BCAbstractRobot
     * @param getVisibleRobotMap - from BCAbstractRobot
     */
    constructor(map, karboniteMap, fuelMap, getVisibleRobotMap) {
        /** @instance */
        this.size = map.length;

        const _this = this;
        
        /**
         * @param {Point} pos - the position of inquiry
         * @return {boolean} true if the square at pos is passable, false otherwise
         */
        this.isPassable = pos => {
            _this.boundsCheck(pos);
            return map[pos.y][pos.x];
        };
        
        /**
         * @param {Point} pos - the position of inquiry
         * @return {boolean} true if the square at pos is a karbonite mine, false otherwise
         */
        this.isKarboniteMine = pos => {
            _this.boundsCheck(pos);
            return karboniteMap[pos.y][pos.x];
        };
        
        /**
         * @param {Point} pos - the position of inquiry
         * @return {boolean} true if the square at pos is a fuel mine, false otherwise
         */
        this.isFuelMine = pos => {
            _this.boundsCheck(pos);
            return fuelMap[pos.y][pos.x];
        };
        
        /**
         * @param {Point} pos - the position of inquiry
         * @return {number} -1 if pos is not visible, 0 if pos contains no robots, the id of the robot at pos otherwise
         */
        this.robotMap = pos => {
            _this.boundsCheck(pos);
            return getVisibleRobotMap()[pos.y][pos.x];
        };
    }
    
    /**
     * @param {Point} pos - the position of inquiry
     * @return {boolean} true if pos is within the bounds of the map, false otherwise
     */
    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.size && 
               pos.y >= 0 && pos.y < this.size;
    }
    boundsCheck(pos) {
        if (!this.isInBounds(pos))
            throw "pos is out of bounds";
    }
    
    /**
     * @param {Point} pos - the position of inquiry
     * @return {boolean} true if the square at pos is known to be occupied by a robot, false otherwise
     */
    isOccupied(pos) {
        this.boundsCheck(pos);
        return this.robotMap(pos) > 0;
    }
    
    /**
     * @param {Point} pos - the position of inquiry
     * @return {boolean} true if the square at pos is unoccupied and passable, false otherwise
     */
    isOpen(pos) {
        this.boundsCheck(pos);
        return !this.isOccupied(pos) && this.isPassable(pos);
    }
    
    /**
     * @param {Point} pos - the position of inquiry
     * @return {boolean} true if the square at pos is a mine, false otherwise
     */
    isMine(pos) {
        this.boundsCheck(pos);
        return this.isKarbonite(pos) || this.isFuelMine(pos);
    }
    
    /**
     * @param {Point} pos - the position to be reflected
     * @return {Point} pos reflected over X
     */
    reflectX(pos) {
        return new Point(this.size - pos.x - 1, pos.y);
    }
    
    /**
     * @param {Point} pos - the position to be reflected
     * @return {Point} pos reflect over Y
     */
    reflectY(pos) {
        return new Point(pos.x, this.size - pos.y - 1);
    }
    
    /**
     * @return {boolean} true if the map is symmetric over the central x-axis, false otherwise
     */
    isSymmetricX() {
        if (this.symmetricXResult != undefined)
            return this.symmetricXResult;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                const pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassable(this.reflectX(pos))) {
                    this.symmetricXResult = false;
                    return false;
                }
            }
        }
        this.symmetricXResult = true;
        return true;
    }
    
    /**
     * @return {boolean} true if the map is symmetric over the central y-axis, false otherwise
     */
    isSymmetricY() {
        if (this.symmetricYResult != undefined)
            return this.symmetricYResult;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y * 2 < this.size; y++) {
                const pos = new Point(x, y);
                if (this.isPassable(pos) != this.isPassable(this.reflectY(pos))) {
                    this.symmetricYResult = false;
                    return false;
                }
            }
        }
        this.symmetricYResult = true;
        return true;
    }
    
    
}

export default Cartography;
