import { BCAbstractRobot, SPECS } from 'battlecode';
import Util from './util.js';
import Point from './point.js';
import Role from './role.js';
import Castle from './castle.js';
import Church from './church.js';
import Pilgrim from './pilgrim.js';
import Crusader from './crusader.js';
import Prophet from './prophet.js';
import Preacher from './preacher.js';

const setConsoleLog = Util.setConsoleLog;
const norm = Util.norm;

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

// function getPathTowardsWithRobots(map, robotMap, source, destination, movementSpeed) {
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
//                 if (nextLocation != source && parent[nextLocation] === undefined && map[nextLocation[0]][nextLocation[1]] && robotMap[nextLocation[0]][nextLocation[1]] <= 0) {
//                     parent[nextLocation] = currentLocation;
//                     queue.pushBack(nextLocation);
//                 }
//             }
//         }
//     }
//     const path = [];
//     let location = destination;
//     if (parent[destination] === undefined) {
//         if (dist(source, destination) <= 2)
//             return undefined;
//         let tempDestination = undefined;
//         for (let i = -1; i <= 1; i++) {
//             for (let j = -1; j <= 1; j++) {
//                 let newLocation = [destination[0] + i, destination[1] + j];
//                 if (parent[newLocation] != undefined) {
//                     if (tempDestination === undefined || dist(tempDestination, source) > dist(newLocation, source))
//                         tempDestination = newLocation;
//                 }
//             }
//         }
//         location = tempDestination;
//     }
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
        setConsoleLog(val => this.log(val));
    }
    turn() {
        if (this.me.turn === 1) {
            let signal = 0;
            const visibleRobots = this.getVisibleRobotMap();
            for (let i = 0; i < visibleRobots.length; i++) {
                if (visibleRobots[i].unit === SPECS.CASTLE && norm([visibleRobots[i].x, visibleRobots[i].y], [this.me.x, this.me.y]) < 4) {
                    signal = visibleRobots[i].signal;
                }
            }
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

// var robot = new MyRobot();
