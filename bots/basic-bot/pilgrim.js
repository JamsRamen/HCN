import Role from './role.js';
import Nav from './nav.js';
import { SPECS } from 'battlecode';

const findNearest = Nav.findNearest;

class Pilgrim extends Role {
    constructor (context, spawnSignal, subType) {
        super(context, spawnSignal, subType);
        
        // TODO: spawn signal interpretation maybe
        
        // TODO: better and more general castle detection
        this.castleLocations = [];
        (this.getVisibleRobots()).forEach(robot => {
            if (robot.unit === SPECS.CASTLE && this.me.team === robot.team)
                this.castleLocations.push(robot.pos);
        });
        this.isOpenMine = (cart, loc) => cart.isMine(loc) && cart.isOpen(loc);
        this.dest = findNearest(this.me.pos, this.SPEED, this.cartography, this.isOpenMine);
        
        // TODO: select mines based on karbonite
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
        // TODO: church building
        
        if (this.dest !== undefined && this.cartography.isMine(this.dest) && this.me.pos.equals(this.dest)) {
            return this.mine();
        }
        if (this.dest === undefined || !this.cartography.isMine(this.dest) || !this.cartography.isOpen(this.dest)) {
            this.dest = findNearest(this.me.pos, this.SPEED, this.cartography, this.isOpenMine);
        }
        if (this.dest === undefined) {
            return undefined;
        }
        return this.moveTowards(this.dest);
    }
}

export default Pilgrim;
