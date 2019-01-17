
/*
 * nav.js: contains advanced navigation functions and path finding including finding mines, castles, etc.
 */

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
    findPossibleOpponentCastles
};
