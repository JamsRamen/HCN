
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

export default {
    findPossibleOpponentCastles
};
