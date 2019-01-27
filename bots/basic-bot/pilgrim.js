import Role from './role.js';
import Nav from './nav.js';
import { SPECS } from 'battlecode';

const findNearestMine = Nav.findNearestMine;

class Pilgrim extends Role {
    constructor (context, spawnSignal) {
        super(context, spawnSignal);
        
        // TODO: spawn signal interpretation maybe
        
        // TODO: better and more general castle detection
        this.castleLocations = [];
        (this.getVisibleRobots()).forEach(robot => {
            if (robot.unit === SPECS.CASTLE && this.me.team === robot.team)
                this.castleLocations.push(robot.pos);
        });
        
        this.dest = findNearestMine(this.me.pos, this.SPEED, this.cartography);
    }
    decide() {
        if (this.isAtCapacity()) {
            this.dest = this.castleLocations[0];
            const result = this.giveAuto();
            if (result === undefined) {
                return this.moveTowards(this.dest);
            }
            return result;
        }
        // TODO: was it != or !== ?
        if (this.dest !== undefined && this.cartography.isMine(this.dest) && this.me.pos.equals(this.dest)) {
            return this.mine();
        }
        if (this.dest === undefined || !this.cartography.isMine(this.dest) || !this.cartography.isOpen(this.dest)) {
            this.dest = findNearestMine(this.me.pos, this.SPEED, this.cartography);
        }
        if (this.dest === undefined) {
            return undefined;
        }
        return this.moveTowards(this.dest);
        
        
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
