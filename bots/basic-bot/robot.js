import { BCAbstractRobot, SPECS } from 'battlecode';

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

function dist(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

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
        end++;
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

function isPassableAndUnoccupied(location, map, robotMap) {
    return map[location[0]][location[1]] && robotMap[location[0]][location[1]] <= 0;
}

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
    while (parent[location] != undefined) {
        path.push(location);
    }
    path.push(location);
    reverse(path);
    consoleLog(path);
    return path;
}

function getPathTowardsWithRobots(map, robotMap, source, destination, movementSpeed) {
    return undefined;
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
        consoleLog(this.currentPath === undefined);
        if (this.currentPath === undefined) {
            return undefined;
        }
        return context.move(0, 1);
        if (this.currentPathIndex === this.currentPath.length - 1) {
            return undefined;
        }
        if (isPassableAndUnoccupied(this.currentPath[this.currentPathIndex + 1], context.map, context.getVisibleRobotMap())) {
            return context.move(this.currentPath[this.currentPathIndex + 1][1] - this.currentPath[this.currentPathIndex][1], this.currentPath[this.currentPathIndex + 1][0] - this.currentPath[this.currentPathIndex][0]);
        }
        else {
            let nextOpenLocation = undefined;
            for (let i = this.currentPathIndex + 1; i < this.currentPath.length; i++) {
                if (isPassableAndUnoccupied(this.currentPath[i])) {
                    nextOpenLocation = this.currentPath[i];
                    break;
                }
            }
            if (nextOpenLocation === undefined)
                return undefined;
            const miniPath = getPathTowardsWithRobots(contex.map, context.getVisibleRobotMap(), [context.me.y, context.me.x], nextOpenLocation, SPECS.UNITS[context.me.unit].SPEED);
            if (miniPath === undefined)
                return undefined;
            return context.move(miniPath[1][1] - context.me.x, miniPath[1][0] - context.me.y);
        }
    }
}
 
class Castle extends Role {
    turn(context) {
        super.turn(context);
        // return context.buildUnit(SPECS.CRUSADER, 0, 1);
        return context.buildUnit(0, SPECS.CRUSADER, 0, 1);
    }
}
 
class Crusader extends Role {
    turn(context) {
        super.turn(context);
        const castleLocations = [];
        for (let i = 0; i < this.knownUnits.length; i++) {
            if (this.knownUnits[i].unit === SPECS.CASTLE)
                castleLocations.push([this.knownUnits[i].y, this.knownUnits[i].x]);
        }
        const opponentCastles = findPossibleOpponentCastles(context.map, context.fuel_map, context.karbonite_map, castleLocations);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        return this.moveTowards(context, castleToAttack);
        // return context.move(...getDirectionTowardsWithoutRobots(context.map, [context.me.y, context.me.x], castleToAttack));
        // const choices = [[0, 1], [1, 0], [-1, 0], [0, -1]]
        // const choice = choices[Math.floor(Math.random() * choices.length)]
        // return context.move(...choice);
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
        if (this.me.turn === 1) {
            let signal = 0;
            const visibleRobots = this.getVisibleRobotMap();
            for (let i = 0; i < visibleRobots.length; i++) {
                if (visibleRobots[i].unit === SPECS.CASTLE && dist(visibleRobots[i].x, visibleRobots[i].y, this.me.x, this.me.y) < 4) {
                    signal = visibleRobots[i].signal;
                }
            }
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
        if ((this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH)
            && this.me.x + dx >= 0 && this.me.x + dx < this.map.length
            && this.me.y + dy >= 0 && this.me.y + dy < this.map.length
            && Math.abs(dx) <= 1 && Math.abs(dy) <= 1
            && this.map[this.me.y + dy][this.me.x + dx]
            && this.getVisibleRobotMap()[this.me.y + dy][this.me.x + dx] === 0
            && this.karbonite >= SPECS.UNITS[type].CONSTRUCTION_KARBONITE
            && this.fuel >= SPECS.UNITS[type].CONSTRUCTION_FUEL) {
            if (signal !== 0)
                this.signal(signal, dx * dx + dy * dy);
        }
        return super.buildUnit(type, dx, dy);
    }
}

// var robot = new MyRobot();
