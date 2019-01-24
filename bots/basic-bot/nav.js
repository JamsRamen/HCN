
/*
 * nav.js: contains advanced navigation functions and path finding including finding mines, castles, etc.
 */

import Util from './util.js';
import LinkedList from './linked-list.js';
import Point from './point.js';

const getCircle = Util.getCircle;

function findPossibleOpponentCastles(knownCastleLocations, cartography) {
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
    return locations;
}

function findPathTowardsWithoutRobots(source, destination, movementSpeed, cartography) {
    const deltas = getCircle(movementSpeed);
    const queue = new LinkedList();
    const parent = {};
    queue.pushBack(source);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (currentLocation === destination)
            break;
        for (let i = 0; i < deltas.length; i++) {
            const nextLocation = new Point(currentLocation.x + deltas[i].x, currentLocation.y + deltas[i].y);
            if (cartography.isInBounds(nextLocation)) {
                if (nextLocation != source && !parent[nextLocation] && cartography.isPassable(nextLocation)) {
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

function findPathTowardsWithRobots(source, destination, movementSpeed, cartography) {
    const deltas = getCircle(movementSpeed);
    const queue = new LinkedList();
    const parent = {};
    queue.pushBack(source);
    while (queue.size() != 0) {
        const currentLocation = queue.popFront();
        if (currentLocation === destination)
            break;
        for (let i = 0; i < deltas.length; i++) {
            const nextLocation = new Point(currentLocation.x + deltas[i].x, currentLocation.y + deltas[i].y);
            if (cartography.isInBounds(nextLocation)) {
                if (nextLocation != source && parent[nextLocation] === undefined && cartography.isOpen(nextLocation)) {
                    parent[nextLocation] = currentLocation;
                    queue.pushBack(nextLocation);
                }
            }
        }
    }
    const path = [];
    let location = destination;
    if (parent[destination] === undefined) {
        if (norm(source, destination) <= 2)
            return undefined;
        let tempDestination = undefined;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newLocation = new Point(destination.x + i, destination.y + j);
                if (parent[newLocation] != undefined) {
                    if (tempDestination === undefined || norm(tempDestination, source) > norm(newLocation, source))
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

function findNearestMine(location, movementSpeed, cartography) {
    const deltas = getCircle(movementSpeed);
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

export default {
    findPossibleOpponentCastles,
    findPathTowardsWithoutRobots,
    findPathTowardsWithRobots,
    findNearestMine
};
