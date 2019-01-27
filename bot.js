'use strict';

var SPECS = {"COMMUNICATION_BITS":16,"CASTLE_TALK_BITS":8,"MAX_ROUNDS":1000,"TRICKLE_FUEL":25,"INITIAL_KARBONITE":100,"INITIAL_FUEL":500,"MINE_FUEL_COST":1,"KARBONITE_YIELD":2,"FUEL_YIELD":10,"MAX_TRADE":1024,"MAX_BOARD_SIZE":64,"MAX_ID":4096,"CASTLE":0,"CHURCH":1,"PILGRIM":2,"CRUSADER":3,"PROPHET":4,"PREACHER":5,"RED":0,"BLUE":1,"CHESS_INITIAL":100,"CHESS_EXTRA":20,"TURN_MAX_TIME":200,"MAX_MEMORY":50000000,"UNITS":[{"CONSTRUCTION_KARBONITE":null,"CONSTRUCTION_FUEL":null,"KARBONITE_CAPACITY":null,"FUEL_CAPACITY":null,"SPEED":0,"FUEL_PER_MOVE":null,"STARTING_HP":200,"VISION_RADIUS":100,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[1,64],"ATTACK_FUEL_COST":10,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":50,"CONSTRUCTION_FUEL":200,"KARBONITE_CAPACITY":null,"FUEL_CAPACITY":null,"SPEED":0,"FUEL_PER_MOVE":null,"STARTING_HP":100,"VISION_RADIUS":100,"ATTACK_DAMAGE":0,"ATTACK_RADIUS":0,"ATTACK_FUEL_COST":0,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":10,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":1,"STARTING_HP":10,"VISION_RADIUS":100,"ATTACK_DAMAGE":null,"ATTACK_RADIUS":null,"ATTACK_FUEL_COST":null,"DAMAGE_SPREAD":null},{"CONSTRUCTION_KARBONITE":15,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":9,"FUEL_PER_MOVE":1,"STARTING_HP":40,"VISION_RADIUS":49,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[1,16],"ATTACK_FUEL_COST":10,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":25,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":2,"STARTING_HP":20,"VISION_RADIUS":64,"ATTACK_DAMAGE":10,"ATTACK_RADIUS":[16,64],"ATTACK_FUEL_COST":25,"DAMAGE_SPREAD":0},{"CONSTRUCTION_KARBONITE":30,"CONSTRUCTION_FUEL":50,"KARBONITE_CAPACITY":20,"FUEL_CAPACITY":100,"SPEED":4,"FUEL_PER_MOVE":3,"STARTING_HP":60,"VISION_RADIUS":16,"ATTACK_DAMAGE":20,"ATTACK_RADIUS":[1,16],"ATTACK_FUEL_COST":15,"DAMAGE_SPREAD":3}]};

function insulate(content) {
    return JSON.parse(JSON.stringify(content));
}

class BCAbstractRobot {
    constructor() {
        this._bc_reset_state();
    }

    // Hook called by runtime, sets state and calls turn.
    _do_turn(game_state) {
        this._bc_game_state = game_state;
        this.id = game_state.id;
        this.karbonite = game_state.karbonite;
        this.fuel = game_state.fuel;
        this.last_offer = game_state.last_offer;

        this.me = this.getRobot(this.id);

        if (this.me.turn === 1) {
            this.map = game_state.map;
            this.karbonite_map = game_state.karbonite_map;
            this.fuel_map = game_state.fuel_map;
        }

        try {
            var t = this.turn();
        } catch (e) {
            t = this._bc_error_action(e);
        }

        if (!t) t = this._bc_null_action();

        t.signal = this._bc_signal;
        t.signal_radius = this._bc_signal_radius;
        t.logs = this._bc_logs;
        t.castle_talk = this._bc_castle_talk;

        this._bc_reset_state();

        return t;
    }

    _bc_reset_state() {
        // Internal robot state representation
        this._bc_logs = [];
        this._bc_signal = 0;
        this._bc_signal_radius = 0;
        this._bc_game_state = null;
        this._bc_castle_talk = 0;
        this.me = null;
        this.id = null;
        this.fuel = null;
        this.karbonite = null;
        this.last_offer = null;
    }

    // Action template
    _bc_null_action() {
        return {
            'signal': this._bc_signal,
            'signal_radius': this._bc_signal_radius,
            'logs': this._bc_logs,
            'castle_talk': this._bc_castle_talk
        };
    }

    _bc_error_action(e) {
        var a = this._bc_null_action();
        
        if (e.stack) a.error = e.stack;
        else a.error = e.toString();

        return a;
    }

    _bc_action(action, properties) {
        var a = this._bc_null_action();
        if (properties) for (var key in properties) { a[key] = properties[key]; }
        a['action'] = action;
        return a;
    }

    _bc_check_on_map(x, y) {
        return x >= 0 && x < this._bc_game_state.shadow[0].length && y >= 0 && y < this._bc_game_state.shadow.length;
    }
    
    log(message) {
        this._bc_logs.push(JSON.stringify(message));
    }

    // Set signal value.
    signal(value, radius) {
        // Check if enough fuel to signal, and that valid value.
        
        var fuelNeeded = Math.ceil(Math.sqrt(radius));
        if (this.fuel < fuelNeeded) throw "Not enough fuel to signal given radius.";
        if (!Number.isInteger(value) || value < 0 || value >= Math.pow(2,SPECS.COMMUNICATION_BITS)) throw "Invalid signal, must be int within bit range.";
        if (radius > 2*Math.pow(SPECS.MAX_BOARD_SIZE-1,2)) throw "Signal radius is too big.";

        this._bc_signal = value;
        this._bc_signal_radius = radius;

        this.fuel -= fuelNeeded;
    }

    // Set castle talk value.
    castleTalk(value) {
        // Check if enough fuel to signal, and that valid value.

        if (!Number.isInteger(value) || value < 0 || value >= Math.pow(2,SPECS.CASTLE_TALK_BITS)) throw "Invalid castle talk, must be between 0 and 2^8.";

        this._bc_castle_talk = value;
    }

    proposeTrade(karbonite, fuel) {
        if (this.me.unit !== SPECS.CASTLE) throw "Only castles can trade.";
        if (!Number.isInteger(karbonite) || !Number.isInteger(fuel)) throw "Must propose integer valued trade."
        if (Math.abs(karbonite) >= SPECS.MAX_TRADE || Math.abs(fuel) >= SPECS.MAX_TRADE) throw "Cannot trade over " + SPECS.MAX_TRADE + " in a given turn.";

        return this._bc_action('trade', {
            trade_fuel: fuel,
            trade_karbonite: karbonite
        });
    }

    buildUnit(unit, dx, dy) {
        if (this.me.unit !== SPECS.PILGRIM && this.me.unit !== SPECS.CASTLE && this.me.unit !== SPECS.CHURCH) throw "This unit type cannot build.";
        if (this.me.unit === SPECS.PILGRIM && unit !== SPECS.CHURCH) throw "Pilgrims can only build churches.";
        if (this.me.unit !== SPECS.PILGRIM && unit === SPECS.CHURCH) throw "Only pilgrims can build churches.";
        
        if (!Number.isInteger(dx) || !Number.isInteger(dx) || dx < -1 || dy < -1 || dx > 1 || dy > 1) throw "Can only build in adjacent squares.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't build units off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] > 0) throw "Cannot build on occupied tile.";
        if (!this.map[this.me.y+dy][this.me.x+dx]) throw "Cannot build onto impassable terrain.";
        if (this.karbonite < SPECS.UNITS[unit].CONSTRUCTION_KARBONITE || this.fuel < SPECS.UNITS[unit].CONSTRUCTION_FUEL) throw "Cannot afford to build specified unit.";

        return this._bc_action('build', {
            dx: dx, dy: dy,
            build_unit: unit
        });
    }

    move(dx, dy) {
        if (this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH) throw "Churches and Castles cannot move.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't move off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] === -1) throw "Cannot move outside of vision range.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] !== 0) throw "Cannot move onto occupied tile.";
        if (!this.map[this.me.y+dy][this.me.x+dx]) throw "Cannot move onto impassable terrain.";

        var r = Math.pow(dx,2) + Math.pow(dy,2);  // Squared radius
        if (r > SPECS.UNITS[this.me.unit]['SPEED']) throw "Slow down, cowboy.  Tried to move faster than unit can.";
        if (this.fuel < r*SPECS.UNITS[this.me.unit]['FUEL_PER_MOVE']) throw "Not enough fuel to move at given speed.";

        return this._bc_action('move', {
            dx: dx, dy: dy
        });
    }

    mine() {
        if (this.me.unit !== SPECS.PILGRIM) throw "Only Pilgrims can mine.";
        if (this.fuel < SPECS.MINE_FUEL_COST) throw "Not enough fuel to mine.";
        
        if (this.karbonite_map[this.me.y][this.me.x]) {
            if (this.me.karbonite >= SPECS.UNITS[SPECS.PILGRIM].KARBONITE_CAPACITY) throw "Cannot mine, as at karbonite capacity.";
        } else if (this.fuel_map[this.me.y][this.me.x]) {
            if (this.me.fuel >= SPECS.UNITS[SPECS.PILGRIM].FUEL_CAPACITY) throw "Cannot mine, as at fuel capacity.";
        } else throw "Cannot mine square without fuel or karbonite.";

        return this._bc_action('mine');
    }

    give(dx, dy, karbonite, fuel) {
        if (dx > 1 || dx < -1 || dy > 1 || dy < -1 || (dx === 0 && dy === 0)) throw "Can only give to adjacent squares.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't give off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] <= 0) throw "Cannot give to empty square.";
        if (karbonite < 0 || fuel < 0 || this.me.karbonite < karbonite || this.me.fuel < fuel) throw "Do not have specified amount to give.";

        return this._bc_action('give', {
            dx:dx, dy:dy,
            give_karbonite:karbonite,
            give_fuel:fuel
        });
    }

    attack(dx, dy) {
        if (this.me.unit === SPECS.CHURCH) throw "Churches cannot attack.";
        if (this.fuel < SPECS.UNITS[this.me.unit].ATTACK_FUEL_COST) throw "Not enough fuel to attack.";
        if (!this._bc_check_on_map(this.me.x+dx,this.me.y+dy)) throw "Can't attack off of map.";
        if (this._bc_game_state.shadow[this.me.y+dy][this.me.x+dx] === -1) throw "Cannot attack outside of vision range.";

        var r = Math.pow(dx,2) + Math.pow(dy,2);
        if (r > SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][1] || r < SPECS.UNITS[this.me.unit]['ATTACK_RADIUS'][0]) throw "Cannot attack outside of attack range.";

        return this._bc_action('attack', {
            dx:dx, dy:dy
        });
        
    }


    // Get robot of a given ID
    getRobot(id) {
        if (id <= 0) return null;
        for (var i=0; i<this._bc_game_state.visible.length; i++) {
            if (this._bc_game_state.visible[i].id === id) {
                return insulate(this._bc_game_state.visible[i]);
            }
        } return null;
    }

    // Check if a given robot is visible.
    isVisible(robot) {
        return ('unit' in robot);
    }

    // Check if a given robot is sending you radio.
    isRadioing(robot) {
        return robot.signal >= 0;
    }

    // Get map of visible robot IDs.
    getVisibleRobotMap() {
        return this._bc_game_state.shadow;
    }

    // Get boolean map of passable terrain.
    getPassableMap() {
        return this.map;
    }

    // Get boolean map of karbonite points.
    getKarboniteMap() {
        return this.karbonite_map;
    }

    // Get boolean map of impassable terrain.
    getFuelMap() {
        return this.fuel_map;
    }

    // Get a list of robots visible to you.
    getVisibleRobots() {
        return this._bc_game_state.visible;
    }

    turn() {
        return null;
    }
}

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

/*
 * util.js: generic utilities including distance and logging
 */

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Squared Euclidean distance
 */
function norm(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2);
}

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Manhattan distance (sum of x difference and y difference)
 */
function mdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Chebyshev distance (maximum of x difference and y difference)
 */
function cdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
}

/**
 * Return an array of all lattice points within a given distance of the origin, excluding (0, 0)
 * @param {number} distance
 * @param [metric=norm] the distance metric used
 * @return {Point[]} an array of all points described above
 */
function getCircle(distance, metric) {
    if (metric === undefined) {
        metric = norm;
    }

    let result = [];
    for (let i = 0; metric(new Point(i, 0)) <= distance; i++) {
        for (let j = 0; metric(new Point(i, j)) <= distance; j++) {
            if (i === 0 && j === 0) continue;
            
            result.push(new Point(i, j));
            result.push(new Point(-i, j));
            result.push(new Point(i, -j));
            result.push(new Point(-i, -j));
        }
    }
    return result;
}

/**
 * Reverse a given array in place
 * @param {*[]} arr - the array to reverse
 */
function reverse(arr) {
    let start = 0;
    let end = arr.length - 1;
    while (start < end) {
        let temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
}

var Util = {
    norm, mdist, cdist,
    reverse,
    getCircle
};

/*
 * cartography.js: responsible for low-level map functions, including map access and bounds checking bounds
 */

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

/*
 * linked-list.js: doubly linked linear list data structure
 */

class LinkedListNode {
    constructor(v) {
        this.left = this.right = undefined;
        this.val = v;
    }
}

class LinkedList {
    constructor() {
        this.sz = 0;
        this.front = undefined;
        this.back = undefined;
    }
    pushFront(v) {
        if (this.front === undefined) {
            this.front = new LinkedListNode(v);
            this.back = this.front;
        }
        else {
            let newNode = new LinkedListNode(v);
            newNode.right = this.front;
            this.front.left = newNode;
            this.front = newNode;
        }
        this.sz++;
    }
    pushBack(v) {
        if (this.back === undefined) {
            this.back = new LinkedListNode(v);
            this.front = this.back;
        }
        else {
            let newNode = new LinkedListNode(v);
            newNode.left = this.back;
            this.back.right = newNode;
            this.back = newNode;
        }
        this.sz++;
    }
    popFront() {
        if (this.front === undefined)
            return undefined;
        let res = this.front.val;
        this.front = this.front.right;
        if (this.front === undefined)
            this.back = undefined;
        else
            this.front.left = undefined;
        this.sz--;
        return res;
    }
    popBack() {
        if (this.back === undefined)
            return undefined;
        let res = this.back.val;
        this.back = this.back.left;
        if (this.back === undefined)
            this.front = undefined;
        else
            this.back.right = undefined;
        this.sz--;
        return res;
    }
    peekFront() {
        if (this.front === undefined)
            return undefined;
        return this.front.val;
    }
    peekBack() {
        if (this.back === undefined)
            return undefined;
        return this.back.val;
    }
    size() {
        return this.sz;
    }
}

const getCircle$1 = Util.getCircle;

let currentKnownCastleLocations = undefined;
let possibleOpponentCastles = undefined;

function findPossibleOpponentCastles(knownCastleLocations, cartography) {
    if (possibleOpponentCastles != undefined && currentKnownCastleLocations === knownCastleLocations)
        return possibleOpponentCastles;
    let locations = [];
    if (cartography.isSymmetricX()) {
        for (let i = 0; i < knownCastleLocations.length; i++) {
            locations.push(cartography.reflectX(knownCastleLocations[i]));
        }
    }
    if (cartography.isSymmetricY()) {
        for (let i = 0; i < knownCastleLocations.length; i++) {
            locations.push(cartography.reflectY(knownCastleLocations[i]));
        }
    }
    possibleOpponentCastles = locations;
    currentKnownCastleLocations = knownCastleLocations;
    return locations;
}

var currentDestination = undefined;
var currentResultMap = undefined;

function findPassablePathsFrom(location, movementSpeed, cartography) {
    if (location.equals(currentDestination)) {
        return currentResultMap;
    }
    const deltas = getCircle$1(movementSpeed);
    const queue = new LinkedList();
    const result = {};
    queue.pushBack({location, dist: 0});
    result[location] = {next: undefined, dist: 0};
    while (queue.size() != 0) {
        const currentNode = queue.popFront();
        const currentLocation = currentNode.location;
        const currentDist = currentNode.dist;
        deltas.forEach(delta => {
            const nextLocation = currentLocation.add(delta);
            if (cartography.isInBounds(nextLocation) && cartography.isPassable(nextLocation) && !result[nextLocation]) {
                queue.pushBack({location: nextLocation, dist: currentDist + 1});
                result[nextLocation] = {next: currentLocation, dist: currentDist + 1};
            }
        });
    }
    currentDestination = location;
    currentResultMap = result;
    return result;
}

function findNearestMine(location, movementSpeed, cartography) {
    const deltas = getCircle$1(movementSpeed);
    const queue = new LinkedList();
    const visited = {};
    queue.pushBack(location);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (cartography.isMine(currentLocation))
            return currentLocation;
        deltas.forEach(delta => {
            const nextLocation = currentLocation.add(delta);
            if (cartography.isInBounds(nextLocation) && visited[nextLocation] === undefined) {
                queue.pushBack(nextLocation);
                visited[nextLocation] = true;
            }
        });
    }
    return undefined;
}

var Nav = {
    findPossibleOpponentCastles,
    findPassablePathsFrom,
    findNearestMine
};

const getCircle$2 = Util.getCircle;
const norm$1 = Util.norm;
const findPassablePathsFrom$1 = Nav.findPassablePathsFrom;

class Role {
    constructor(context) {
        // custom properties of all roles
        this.knownUnits = {};
        this.currentPath = undefined;
        this.currentPathIndex = 0;

        // reference to MyRobot class (not meant to be accessed)
        this.context = context;
        this.cartography = new Cartography(this.context.map, this.context.karbonite_map, this.context.fuel_map, _ => this.context.getVisibleRobotMap());

        // constants from specs
        this.CONSTRUCTION_KARBONITE = SPECS.UNITS[this.context.me.unit].CONSTRUCTION_KARBONITE;
        this.CONSTRUCTION_FUEL = SPECS.UNITS[this.context.me.unit].CONSTRUCTION_FUEL;
        this.KARBONITE_CAPACITY = SPECS.UNITS[this.context.me.unit].KARBONITE_CAPACITY;
        this.FUEL_CAPACITY = SPECS.UNITS[this.context.me.unit].FUEL_CAPACITY;
        this.SPEED = SPECS.UNITS[this.context.me.unit].SPEED;
        this.FUEL_PER_MOVE = SPECS.UNITS[this.context.me.unit].FUEL_PER_MOVE;
        this.STARTING_HP = SPECS.UNITS[this.context.me.unit].STARTING_HP;
        this.VISION_RADIUS = SPECS.UNITS[this.context.me.unit].VISION_RADIUS;
        this.ATTACK_DAMAGE = SPECS.UNITS[this.context.me.unit].ATTACK_DAMAGE;
        this.ATTACK_RADIUS = SPECS.UNITS[this.context.me.unit].ATTACK_RADIUS;
        this.ATTACK_FUEL_COST = SPECS.UNITS[this.context.me.unit].ATTACK_FUEL_COST;
        this.DAMAGE_SPREAD = SPECS.UNITS[this.context.me.unit].DAMAGE_SPREAD;
    }
    // =================== override battlecode docs
    move(pos) {
        return this.context.move(pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    mine() {
        return this.context.mine();
    }
    give(pos, karbonite, fuel) {
        return this.context.give(pos.x - this.me.pos.x, pos.y - this.me.pos.y, karbonite, fuel);
    }
    giveAuto() {
        var result = undefined;
        getCircle$2(2).foreach(delta => {
            // if (pos.add(delta) is a castle)
            //     result = this.context.give(delta.x, delta.y, karbonite, fuel);
        });
        
        return result;
    }
    attack(pos) {
        return this.context.attack(pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    buildUnit(type, pos) {
        return this.context.buildUnit(type, pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    // buildUnitAuto(signal, type) {
        // return undefined;
        // const deltas = getCircle(2);
        // for (let i = 0; i < deltas.length; i++) {
        //     if (isPassableAndUnoccupied([context.me.y + deltas[i][0], context.me.x + deltas[i][1]], context.map, context.getVisibleRobotMap()))
        //         return context.buildUnit(signal, type, deltas[i][1], deltas[i][0]);
        // }
        // return undefined;
        // if ((this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH)
        //     && this.me.x + dx >= 0 && this.me.x + dx < this.map.length
        //     && this.me.y + dy >= 0 && this.me.y + dy < this.map.length
        //     && Math.abs(dx) <= 1 && Math.abs(dy) <= 1
        //     && this.map[this.me.y + dy][this.me.x + dx]
        //     && this.getVisibleRobotMap()[this.me.y + dy][this.me.x + dx] === 0
        //     && this.karbonite >= SPECS.UNITS[type].CONSTRUCTION_KARBONITE
        //     && this.fuel >= SPECS.UNITS[type].CONSTRUCTION_FUEL) {
        //     if (signal !== 0)
        //         this.signal(signal, dx * dx + dy * dy);
        // }
        // return super.buildUnit(type, dx, dy);
    // }
    proposeTrade(karbonite, fuel) {
        return this.context.proposeTrade(karbonite, fuel);
    }
    signal(value, distance) {
        return this.context.signal(value, distance);
    }
    castleTalk(value) {
        return this.context.castleTalk(value);
    }
    getVisibleRobots() {
        const robots = this.context.getVisibleRobots();
        robots.forEach((robot) => {
            robot.pos = new Point(robot.x, robot.y);
        });
        return robots;
    }
    getRobot(id) {
        const robot = this.context.getRobot(id);
        robot.pos = new Point(robot.x, robot.y);
        return robot;
    }
    isVisible(robot) {
        return this.context.isVisible(robot);
    }
    isRadioing(robot) {
        return this.context.isRadioing(robot);
    }
    // =================== end override battlecode docs
    turn() {
        // local references to battlecode variables
        this.me = this.context.me;
        this.me.pos = new Point(this.me.x, this.me.y);
        this.fuel = this.context.fuel;
        this.karbonite = this.context.karbonite;
        this.lastOffer = this.context.last_offer;

        // update known variables
        const robots = this.getVisibleRobots();
        robots.forEach((robot) => {
            this.knownUnits[robot.id] = robot;
        });

        return this.decide();
    }
    moveTowards(destination) {
        consoleLog("DESTINATION: " + destination);
        const startTime = new Date().getTime();
        const resultMap = findPassablePathsFrom$1(destination, this.SPEED, this.cartography);
        const nextPosition = resultMap[this.me.pos].next;
        if (nextPosition === undefined)
            return undefined;
        if (this.cartography.isOpen(nextPosition))
            return this.move(nextPosition);
        const deltas = getCircle$2(this.SPEED);
        let bestPosition = undefined;
        for (let i = 0; i < deltas.length; i++) {
            const position = this.me.pos.add(deltas[i]);
            if (this.cartography.isInBounds(position) && this.cartography.isOpen(position)) {
                if (norm$1(position, destination) >= norm$1(this.me.pos, destination))
                    continue;
                if (bestPosition === undefined) {
                    bestPosition = position;
                } else if (resultMap[position].dist < resultMap[bestPosition].dist) {
                    bestPosition = position;
                } else if (resultMap[position].dist == resultMap[bestPosition].dist && norm$1(position, destination) < norm$1(bestPosition, destination)) {
                    bestPosition = position;
                }
            }
        }
        const timeSpent = (new Date().getTime() - startTime);
        if (bestPosition === undefined)
            return undefined;
        return this.move(bestPosition);
    }
}

class Castle extends Role {
    decide() {
        return this.buildUnit(SPECS.CRUSADER, this.me.pos.add(new Point(0, 1)));
        // return context.buildUnit(SPECS.CRUSADER, 0, 1);
        // if (Math.random() < .5)
            // return this.buildUnit(0, SPECS.PILGRIM);
        // return context.buildUnit(0, SPECS.CRUSADER, 0, 1);
    }
}

class Church extends Role {
    decide() {
    }
}

class Pilgrim extends Role {
    decide() {
        // const context = this.context;
        // consoleLog(context.me.karbonite + " " + context.me.fuel);
        // if (context.me.karbonite * 2 > SPECS.UNITS[context.me.unit].KARBONITE_CAPACITY || context.me.fuel * 2 > SPECS.UNITS[context.me.unit].FUEL_CAPACITY) {
        //     consoleLog("HAVE ENOUGH FUEL TO DEPOSIT");
        //     const castleLocation = undefined;
        //     for (let i = 0; i < this.knownUnits.length; i++) {
        //         if (this.knownUnits[i].unit === SPECS.CASTLE) {
        //             let unitLocation = [this.knownUnits[i].y, this.knownUnits[i].x];
        //             if (castleLocation === undefined || dist(unitLocation, [context.me.y, context.me.x]) < dist(castleLocation, [context.me.y, context.me.x]))
        //                 castleLocation = unitLocation;
        //         }
        //     }
        //     if (rdist(castleLocation, [context.me.y, context.me.x]) <= 1)
        //         return context.give(castleLocation[1] - context.me.x, castleLocation[0] - context.me.y, context.me.karbonite, context.me.fuel);
        //     return this.moveTowards(castleLocation);
        // }
        // if (isMine([context.me.y, context.me.x], context.fuel_map, context.karbonite_map)) {
        //     consoleLog("I AM MINING");
        //     context.mine();
        // }
        // consoleLog("GOT TO FIND A MINE");
        // const mineLocation = findNearestMine(context.fuel_map, context.karbonite_map, [context.me.y, context.me.x], SPECS.UNITS[context.me.unit].MOVEMENT_SPEED);
        // consoleLog(mineLocation);
        // return this.moveTowards(mineLocation);
    }
}

const findPossibleOpponentCastles$1 = Nav.findPossibleOpponentCastles;
const norm$2 = Util.norm;

class Crusader extends Role {
    decide() {
        const robots = this.getVisibleRobots();
        for (let i = 0; i < robots.length; i++) {
            if (robots[i].team != this.me.team && this.isVisible(robots[i])) {
                const dist = norm$2(robots[i].pos, this.me.pos);
                if (dist >= (this.ATTACK_RADIUS)[0] && dist <= (this.ATTACK_RADIUS)[1]) {
                    return this.attack(robots[i]);
                }
            }
        }
        const castleLocations = [];
        Object.keys(this.knownUnits).forEach(id => {
            const unit = this.knownUnits[id];
            if (unit.unit === SPECS.CASTLE && this.me.team === unit.team)
                castleLocations.push(unit.pos);
        });
        const opponentCastles = findPossibleOpponentCastles$1(castleLocations, this.cartography);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        return this.moveTowards(castleToAttack);
    }
}

class Prophet extends Role {
    decide() {
    }
}

class Preacher extends Role {
    decide() {
    }
}

const norm$3 = Util.norm;

// function isPassableAndUnoccupied(location, map, robotMap) {
//     return map[location[0]][location[1]] && robotMap[location[0]][location[1]] <= 0;
// }

// function isMine(location, fuelMap, karboniteMap) {
//     return fuelMap[location[0]][location[1]] || karboniteMap[location[0]][location[1]];
// }

// function isVerticallySymmetric(map, fuelMap, karboniteMap) {
//     for (let i = 0; i < map.length; i++) {
//         for (let j = 0; j * 2 < map.length; j++) {
//             if (map[i][j] != map[i][map.length - 1 - j])
//                 return false;
//         }
//     }
//     return true;
// }

// function isHorizontallySymmetric(map, fuelMap, karboniteMap) {
//     for (let j = 0; j < map.length; j++) {
//         for (let i = 0; i * 2 < map.length; i++) {
//             if (map[i][j] != map[map.length - 1 - i][j])
//                 return false;
//         }
//     }
//     return true;
// }

// function findNearestMine(fuelMap, karboniteMap, location, movementSpeed) {
//     const deltas = getDeltas(movementSpeed);
//     const queue = new Queue();
//     const visited = {};
//     queue.pushBack(location);
//     while (queue.size() != 0) {
//         const currentLocation = queue.popFront();
//         if (isMine(location, fuelMap, karboniteMap))
//             return currentLocation;
//         for (let i = 0; i < deltas.length; i++) {
//             const nextLocation = [currentLocation[0] + deltas[i][0], currentLocation[1] + deltas[i][1]];
//             if (nextLocation[0] >= 0 && nextLocation[0] < fuelMap.length && nextLocation[1] >= 0 && nextLocation[1] < fuelMap.length && visited[nextLocation] === undefined) {
//                 queue.pushBack(nextLocation);
//                 visited[nextLocation] = true;
//             }
//         }
//     }
//     return undefined;
// }



// function getPathTowardsWithoutRobots(map, source, destination, movementSpeed) {
//     const deltas = getDeltas(movementSpeed);
//     const queue = new Queue();
//     const parent = {};
//     queue.pushBack(source);
//     while (queue.size() != 0) {
//         let currentLocation = queue.popFront();
//         if (currentLocation === destination)
//             break;
//         for (let i = 0; i < deltas.length; i++) {
//             let nextLocation = [currentLocation[0] + deltas[i][0], currentLocation[1] + deltas[i][1]];
//             if (nextLocation[0] >= 0 && nextLocation[0] < map.length && nextLocation[1] >= 0 && nextLocation[1] < map.length) {
//                 if (nextLocation != source && parent[nextLocation] === undefined && map[nextLocation[0]][nextLocation[1]]) {
//                     parent[nextLocation] = currentLocation;
//                     queue.pushBack(nextLocation);
//                 }
//             }
//         }
//     }
//     const path = [];
//     if (parent[destination] === undefined)
//         return undefined;
//     let location = destination;
//     while (location != source) {
//         path.push(location);
//         location = parent[location];
//     }
//     path.push(location);
//     reverse(path);
//     return path;
// }

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.unit = null;
        global.consoleLog = v => this.log(v);
    }
    turn() {
        // make init function
        if (this.me.turn === 1) {
            let signal = 0;
            const visibleRobots = this.getVisibleRobotMap();
            for (let i = 0; i < visibleRobots.length; i++) {
                if (visibleRobots[i].unit === SPECS.CASTLE && norm$3([visibleRobots[i].x, visibleRobots[i].y], [this.me.x, this.me.y]) < 4) {
                    signal = visibleRobots[i].signal;
                }
            }
            
            // is there a cleaner way to do this?
            switch (this.me.unit) {
                case SPECS.CRUSADER:
                    this.unit = new Crusader(this);
                    break;
                case SPECS.PILGRIM:
                    this.unit = new Pilgrim(this);
                    break;
                case SPECS.PROPHET:
                    this.unit = new Prophet(this);
                    break;
                case SPECS.PREACHER:
                    this.unit = new Preacher(this);
                    break;
                case SPECS.CHURCH:
                    this.unit = new Church(this);
                    break;
                case SPECS.CASTLE:
                    this.unit = new Castle(this);
                    break;
            }
        }
        return this.unit.turn();
    }
}

var robot = new MyRobot();
