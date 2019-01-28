
/*
 * nav.js: contains advanced navigation functions and path finding including finding mines, castles, etc.
 */

import Util from './util.js';
import LinkedList from './linked-list.js';
import Point from './point.js';

const getCircle = Util.getCircle;

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
    const deltas = getCircle(movementSpeed);
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

function findNearest(location, movementSpeed, cartography, condition) {
    const deltas = getCircle(movementSpeed);
    const queue = new LinkedList();
    const visited = {};
    queue.pushBack(location);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (condition(cartography, currentLocation))
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



export default {
    findPossibleOpponentCastles,
    findPassablePathsFrom,
    findNearest
};
