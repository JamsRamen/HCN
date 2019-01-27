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
        const attack = this.attackNearby();
        if (attack != undefined)
            return attack;
        if (Math.random() < .5)
            return this.buildUnitAuto(0, SPECS.PILGRIM);
        return this.buildUnitAuto(0, SPECS.CRUSADER);
    }
    updateUnitInformation() {

    }
    attackNearby() {
        let result = undefined;
        const robots = this.getVisibleRobots();
        robots.forEach(robot => {
            if (this.isVisible(robot) && robot.pos && norm(robot.pos, this.me.pos) >= (this.ATTACK_RADIUS)[0] && norm(robot.pos, this.me.pos) <= (this.ATTACK_RADIUS)[1]) {
                result = this.attack(robot.pos);
                return;
            }
        })
        return result;
    }
}

export default Castle;
