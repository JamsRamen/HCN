import Role from './role.js';
import Nav from './nav.js';
import { SPECS } from 'battlecode';

const findNearest = Nav.findNearest;

class DefenseRole extends Role {
    constructor (context, spawnSignal) {
        super(context, spawnSignal);
        
        // TODO: spawn signal interpretation maybe
        
        // TODO: better and more general castle detection
        this.castleLocations = [];
        (this.getVisibleRobots()).forEach(robot => {
            if (robot.unit === SPECS.CASTLE && this.me.team === robot.team)
                this.castleLocations.push(robot.pos);
        });
        const castleLoc = this.castleLocations[0];
        
        this.isDefensePos = (cart, loc) =>
            cart.isOpen(loc) && (castleLoc.x - loc.x) % 2 === 0 && (castleLoc.y - loc.y) % 2 === 0;
        
        this.dest = findNearest(this.me.pos, this.SPEED, this.cartography, this.isDefensePos);
    }
    decide() {
        const attack = this.attackAuto();
        if (attack === undefined) {
            if (this.me.pos.equals(this.dest)) {
                return undefined;
            }
            if (!this.cartography.isOpen(this.dest)) {
                this.dest = findNearest(this.me.pos, this.SPEED, this.cartography, this.isDefensePos);
            }
            return this.moveTowards(this.dest);
        }
        return attack;
    }
}

export default DefenseRole;
