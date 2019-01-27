import Role from './role.js';
import { SPECS } from 'battlecode';
import Point from './point.js';

class Castle extends Role {
    decide() {
        return this.buildUnitAuto(1, SPECS.CRUSADER);
        // return context.buildUnit(SPECS.CRUSADER, 0, 1);
        // if (Math.random() < .5)
            // return this.buildUnit(0, SPECS.PILGRIM);
        // return context.buildUnit(0, SPECS.CRUSADER, 0, 1);
    }
}

export default Castle;
