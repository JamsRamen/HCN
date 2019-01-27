import Role from './role.js';
import { SPECS } from 'battlecode';
import Point from './point.js';
import Util from './util.js';

const norm = Util.norm;

class Castle extends Role {
    constructor(context, signal) {
        super(context, signal);

        this.unitInformation = {};
        this.unitCounts = {};
    }
    decide() {
        this.updateUnitInformation();
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        if (Math.random() < .5)
            return this.buildUnitAuto(0, SPECS.PILGRIM);
        return this.buildUnitAuto(0, SPECS.CRUSADER);
    }
    updateUnitInformation() {

    }
}

export default Castle;
