import { BCAbstractRobot, SPECS } from 'battlecode';

// put queue into its own file

class QueueNode {
    constructor(v) {
        this.left = this.right = undefined;
        this.val = v;
    }
}

class Queue {
    constructor() {
        this.sz = 0;
        this.front = undefined;
        this.back = undefined;
    }
    pushFront(v) {
        if (this.front === undefined) {
            this.front = new QueueNode(v);
            this.back = this.front;
        }
        else {
            let newNode = new QueueNode(v);
            newNode.right = this.front;
            this.front.left = newNode;
            this.front = newNode;
        }
        this.sz++;
    }
    pushBack(v) {
        if (this.back === undefined) {
            this.back = new QueueNode(v);
            this.front = this.back;
        }
        else {
            let newNode = new QueueNode(v);
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

let consoleLog = undefined;

// put in utility file

// function should be called norm
function dist(pos1, pos2) {
    return (pos1[0] - pos2[0]) * (pos1[0] - pos2[0]) + (pos1[1] - pos2[1]) * (pos1[1] - pos2[1]);
}

// function should be called manhattan or taxidist

function mdist(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

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

function isVerticallySymmetric(map, fuelMap, karboniteMap) {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j * 2 < map.length; j++) {
            if (map[i][j] != map[i][map.length - 1 - j])
                return false;
        }
    }
    return true;
}

function isHorizontallySymmetric(map, fuelMap, karboniteMap) {
    for (let j = 0; j < map.length; j++) {
        for (let i = 0; i * 2 < map.length; i++) {
            if (map[i][j] != map[map.length - 1 - i][j])
                return false;
        }
    }
    return true;
}

function findPossibleOpponentCastles(map, fuelMap, karboniteMap, knownCastleLocations) {
    let locations = [];
    if (isHorizontallySymmetric(map, fuelMap, karboniteMap)) {
        for (let i = 0; i < knownCastleLocations.length; i++) {
            locations.push([map.length - 1 - knownCastleLocations[i][0], knownCastleLocations[i][1]]);
        }
    }
    if (isVerticallySymmetric(map, fuelMap, karboniteMap)) {
        for (let i = 0; i < knownCastleLocations.length; i++) {
            locations.push([knownCastleLocations[i][0], map.length - 1 - knownCastleLocations[i][1]]);
        }
    }
    return locations;
}

function findNearestMine(fuelMap, karboniteMap, location) {
    const deltas = getDeltas(1);
    const queue = new Queue();
    const visited = {};
    queue.pushBack(location);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (fuelMap[currentLocation[0]][currentLocation[1]] || karboniteMap[currentLocation[0]][currentLocation[1]])
            return currentLocation;
        for (let i = 0; i < deltas.length; i++) {
            const nextLocation = [currentLocation[0] + deltas[i][0], currentLocation[1] + deltas[i][1]];
            if (nextLocation[0] >= 0 && nextLocation[0] < fuelMap.length && nextLocation[1] >= 0 && nextLocation[1] < fuelMap.length && visited[nextLocation] === undefined) {
                queue.pushBack(nextLocation);
                visited[nextLocation] = true;
            }
        }
    }
    return undefined;
}

// split into two functions
function isPassableAndUnoccupied(location, map, robotMap) {
    return map[location[0]][location[1]] && robotMap[location[0]][location[1]] <= 0;
}

// add documentation and comments

function getDeltas(movementSpeed) {
    let deltas = [];
    for (let i = 0; i * i <= movementSpeed; i++) {
        for (let j = 0; j * j <= movementSpeed; j++) {
            if (i === 0 && j === 0) continue;
            if (i * i + j * j <= movementSpeed) {
                deltas.push([i, j]);
                deltas.push([-i, j]);
                deltas.push([i, -j]);
                deltas.push([-i, -j]);
            }
        }
    }
    return deltas;
}

// generalize function ...
function getPathTowardsWithoutRobots(map, source, destination, movementSpeed) {
    const deltas = getDeltas(movementSpeed);
    const queue = new Queue();
    const parent = {};
    queue.pushBack(source);
    while (queue.size() != 0) {
        let currentLocation = queue.popFront();
        if (currentLocation === destination)
            break;
        for (let i = 0; i < deltas.length; i++) {
            let nextLocation = [currentLocation[0] + deltas[i][0], currentLocation[1] + deltas[i][1]];
            if (nextLocation[0] >= 0 && nextLocation[0] < map.length && nextLocation[1] >= 0 && nextLocation[1] < map.length) {
                if (nextLocation != source && parent[nextLocation] === undefined && map[nextLocation[0]][nextLocation[1]]) {
                    parent[nextLocation] = currentLocation;
                    queue.pushBack(nextLocation);
                }
            }
        }
    }
    const path = [];
    if (parent[destination] === undefined)
        return undefined;
    let location = destination;
    while (location != source) {
        path.push(location);
        location = parent[location];
    }
    path.push(location);
    reverse(path);
    return path;
}
// ... with this one
function getPathTowardsWithRobots(map, robotMap, source, destination, movementSpeed) {
    const deltas = getDeltas(movementSpeed);
    const queue = new Queue();
    const parent = {};
    queue.pushBack(source);
    while (queue.size() != 0) {
        let currentLocation = queue.popFront();
        if (currentLocation === destination)
            break;
        for (let i = 0; i < deltas.length; i++) {
            let nextLocation = [currentLocation[0] + deltas[i][0], currentLocation[1] + deltas[i][1]];
            if (nextLocation[0] >= 0 && nextLocation[0] < map.length && nextLocation[1] >= 0 && nextLocation[1] < map.length) {
                if (nextLocation != source && parent[nextLocation] === undefined && map[nextLocation[0]][nextLocation[1]] && robotMap[nextLocation[0]][nextLocation[1]] <= 0) {
                    parent[nextLocation] = currentLocation;
                    queue.pushBack(nextLocation);
                }
            }
        }
    }
    const path = [];
    let location = destination;
    if (parent[destination] === undefined) {
        if (dist(source, destination) <= 2)
            return undefined;
        let tempDestination = undefined;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let newLocation = [destination[0] + i, destination[1] + j];
                if (parent[newLocation] != undefined) {
                    if (tempDestination === undefined || dist(tempDestination, source) > dist(newLocation, source))
                        tempDestination = newLocation;
                }
            }
        }
        location = tempDestination;
    }
    while (location != source) {
        path.push(location);
        location = parent[location];
    }
    path.push(location);
    reverse(path);
    return path;
}
 
class Role {
    constructor() {
        this.knownUnits = [];
        this.currentPath = undefined;
        this.currentPathIndex = 0;
    }
    turn(context) {
        const robots = context.getVisibleRobots();
        for (let i = 0; i < robots.length; i++) {
            this.knownUnits.push(Object.assign({}, robots[i]));
        }
        return undefined;
    }
    moveTowards(context, destination) {
        if (this.currentPath === undefined) {
            this.currentPath = getPathTowardsWithoutRobots(context.map, [context.me.y, context.me.x], destination, SPECS.UNITS[context.me.unit].SPEED);
            this.currentPathIndex = 0;
        }
        if (this.currentPath === undefined) {
            return undefined;
        }
        if (this.currentPathIndex === this.currentPath.length - 1) {
            return undefined;
        }
        if (isPassableAndUnoccupied(this.currentPath[this.currentPathIndex + 1], context.map, context.getVisibleRobotMap())) {
            this.currentPathIndex++;
            return context.move(this.currentPath[this.currentPathIndex][1] - this.currentPath[this.currentPathIndex - 1][1], this.currentPath[this.currentPathIndex][0] - this.currentPath[this.currentPathIndex - 1][0]);
        }
        else {
            let nextOpenLocationIndex = this.currentPath.length - 1;
            let nextOpenLocation = this.currentPath[nextOpenLocationIndex];
            for (let i = this.currentPathIndex + 1; i < this.currentPath.length; i++) {
                if (isPassableAndUnoccupied(this.currentPath[i], context.map, context.getVisibleRobotMap())) {
                    nextOpenLocation = this.currentPath[i];
                    nextOpenLocationIndex = i;
                    break;
                }
            }
            if (nextOpenLocation === undefined)
                return undefined;
            const miniPath = getPathTowardsWithRobots(context.map, context.getVisibleRobotMap(), [context.me.y, context.me.x], nextOpenLocation, SPECS.UNITS[context.me.unit].SPEED);
            if (miniPath === undefined)
                return undefined;
            if (miniPath.length === 2 && miniPath[1] === nextOpenLocation)
                this.currentPathIndex = nextOpenLocationIndex;
            return context.move(miniPath[1][1] - context.me.x, miniPath[1][0] - context.me.y);
        }
    }
}
 
class Castle extends Role {
    turn(context) {
        super.turn(context);
        // return context.buildUnit(SPECS.CRUSADER, 0, 1);
        if (Math.random() < .5)
            return context.buildUnit(0, SPECS.PILGRIM, 0, 1);
        return context.buildUnit(0, SPECS.CRUSADER, 0, 1);
    }
}
 
class Crusader extends Role {
    turn(context) {
        super.turn(context);
        const robots = context.getVisibleRobots();
        for (let i = 0; i < robots.length; i++) {
            if (robots[i].team != context.me.team && robots[i].y != null) {
                let d = dist([robots[i].y, robots[i].x], [context.me.y, context.me.x]);
                if (d >= (SPECS.UNITS[context.me.unit].ATTACK_RADIUS)[0] && d <= (SPECS.UNITS[context.me.unit].ATTACK_RADIUS)[1]) {
                    return context.attack(robots[i].x - context.me.x, robots[i].y - context.me.y);
                }
            }
        }
        const castleLocations = [];
        for (let i = 0; i < this.knownUnits.length; i++) {
            if (this.knownUnits[i].unit === SPECS.CASTLE)
                castleLocations.push([this.knownUnits[i].y, this.knownUnits[i].x]);
        }
        const opponentCastles = findPossibleOpponentCastles(context.map, context.fuel_map, context.karbonite_map, castleLocations);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        return this.moveTowards(context, castleToAttack);
    }
}

class Church extends Role {
    turn(context) {
        super.turn(context);
    }
}

class Pilgrim extends Role {
    turn(context) {
        super.turn(context);
        const mineLocation = findNearestMine(context.fuel_map, context.karbonite_map, [context.me.y, context.me.x]);
        return this.moveTowards(context, mineLocation);
    }
}

class Prophet extends Role {
    turn(context) {
        super.turn(context);
    }
}

class Preacher extends Role {
    turn(context) {
        super.turn(context);
    }
}

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.unit = null;
        consoleLog = val => this.log(val);
    }
    turn() {
        // make init function
        if (this.me.turn === 1) {
            let signal = 0;
            const visibleRobots = this.getVisibleRobotMap();
            for (let i = 0; i < visibleRobots.length; i++) {
                if (visibleRobots[i].unit === SPECS.CASTLE && dist([visibleRobots[i].x, visibleRobots[i].y], [this.me.x, this.me.y]) < 4) {
                    signal = visibleRobots[i].signal;
                }
            }
            
            // is there a cleaner way to do this?
            switch (this.me.unit) {
                case SPECS.CRUSADER:
                    this.unit = new Crusader();
                    break;
                case SPECS.PILGRIM:
                    this.unit = new Pilgrim();
                    break;
                case SPECS.PROPHET:
                    this.unit = new Prophet();
                    break;
                case SPECS.PREACHER:
                    this.unit = new Preacher();
                    break;
                case SPECS.CHURCH:
                    this.unit = new Church();
                    break;
                case SPECS.CASTLE:
                    this.unit = new Castle();
                    break;
            }
        }
        return this.unit.turn(this);
    }
    buildUnit(signal, type, dx, dy) {
        // what a horrendous if statement
        // shouldn't these checks be done before buildUnit is called?
        if ((this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH)
            && this.me.x + dx >= 0 && this.me.x + dx < this.map.length // make isInBounds function 
            && this.me.y + dy >= 0 && this.me.y + dy < this.map.length
            && Math.abs(dx) <= 1 && Math.abs(dy) <= 1 // use norm(dx, dy) <= 2
            && this.map[this.me.y + dy][this.me.x + dx]
            && this.getVisibleRobotMap()[this.me.y + dy][this.me.x + dx] === 0 // make isOccupied function
            && this.karbonite >= SPECS.UNITS[type].CONSTRUCTION_KARBONITE // make isBuildable function
            && this.fuel >= SPECS.UNITS[type].CONSTRUCTION_FUEL) {
            if (signal !== 0)
                // use pow instead for readability
                this.signal(signal, dx * dx + dy * dy);
        }
        // even if the checks fail, the robot still commits to building
        return super.buildUnit(type, dx, dy);
    }
}

// you can rename MyRobot
var robot = new MyRobot();
