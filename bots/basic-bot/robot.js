import { BCAbstractRobot, SPECS } from 'battlecode';

let consoleLog = undefined;

function isPassableAndUnoccupied(location, map, robotMap) {
    return map[location[0]][location[1]] && robotMap[location[0]][location[1]] <= 0;
}

function isMine(location, fuelMap, karboniteMap) {
    return fuelMap[location[0]][location[1]] || karboniteMap[location[0]][location[1]];
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

function findNearestMine(fuelMap, karboniteMap, location, movementSpeed) {
    const deltas = getDeltas(movementSpeed);
    const queue = new Queue();
    const visited = {};
    queue.pushBack(location);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (isMine(location, fuelMap, karboniteMap))
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
 
class Castle extends Role {
    turn() {
        // return context.buildUnit(SPECS.CRUSADER, 0, 1);
        // if (Math.random() < .5)
            return this.buildUnit(0, SPECS.PILGRIM);
        // return context.buildUnit(0, SPECS.CRUSADER, 0, 1);
    }
}
 
class Crusader extends Role {
    turn() {
        const context = this.context;
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
        return this.moveTowards(castleToAttack);
    }
}

class Church extends Role {
    turn() {
    }
}

class Pilgrim extends Role {
    turn() {
        const context = this.context;
        consoleLog(context.me.karbonite + " " + context.me.fuel);
        if (context.me.karbonite * 2 > SPECS.UNITS[context.me.unit].KARBONITE_CAPACITY || context.me.fuel * 2 > SPECS.UNITS[context.me.unit].FUEL_CAPACITY) {
            consoleLog("HAVE ENOUGH FUEL TO DEPOSIT");
            const castleLocation = undefined;
            for (let i = 0; i < this.knownUnits.length; i++) {
                if (this.knownUnits[i].unit === SPECS.CASTLE) {
                    let unitLocation = [this.knownUnits[i].y, this.knownUnits[i].x];
                    if (castleLocation === undefined || dist(unitLocation, [context.me.y, context.me.x]) < dist(castleLocation, [context.me.y, context.me.x]))
                        castleLocation = unitLocation;
                }
            }
            if (rdist(castleLocation, [context.me.y, context.me.x]) <= 1)
                return context.give(castleLocation[1] - context.me.x, castleLocation[0] - context.me.y, context.me.karbonite, context.me.fuel);
            return this.moveTowards(castleLocation);
        }
        if (isMine([context.me.y, context.me.x], context.fuel_map, context.karbonite_map)) {
            consoleLog("I AM MINING");
            context.mine();
        }
        consoleLog("GOT TO FIND A MINE");
        const mineLocation = findNearestMine(context.fuel_map, context.karbonite_map, [context.me.y, context.me.x], SPECS.UNITS[context.me.unit].MOVEMENT_SPEED);
        consoleLog(mineLocation);
        return this.moveTowards(mineLocation);
    }
}

class Prophet extends Role {
    turn() {
    }
}

class Preacher extends Role {
    turn() {
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
                if (visibleRobots[i].unit === SPECS.CASTLE && dist([visibleRobots[i].x, visibleRobots[i].y], [this.me.x, this.me.y]) < 4) {
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
        return this.unit.turnSetup(this);
    }
    buildUnit(signal, type, dx, dy) {
        
    }
}

// var robot = new MyRobot();
