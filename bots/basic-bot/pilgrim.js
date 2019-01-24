import Role from './role.js';

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

export default Pilgrim;
