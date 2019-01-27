import Role from './role.js';
import { SPECS } from 'battlecode';
import Point from './point.js';
import Util from './util.js';
import Config from './config.js';

const norm = Util.norm;

class Castle extends Role {
    constructor(context, signal) {
        super(context, signal);

        this.unitInformation = {};
        this.unitCounts = {};
    }
    decide() {
        this.updateUnitInformation();
        //consoleLog(this.unitCounts);
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        if (Math.random() < .5)
            return this.buildUnitAuto(-1, SPECS.PILGRIM);
        return this.buildUnitAuto(-1, SPECS.CRUSADER);
    }
    updateUnitInformation() {
        const robots = this.getVisibleRobots();
        robots.forEach(robot => {
            if (!robot.castle_talk) return;
            const messageType = robot.castle_talk % 4;
            const message = robot.castle_talk >> 2;
            switch (messageType) {
                case Config.CASTLE_TALK.MESSAGES.UNIT_UPDATE:
                    const unitType = message % 8;
                    const signal = message >> 3;
                    if (!this.unitCounts[unitType])
                        this.unitCounts[unitType] = 0;
                    this.unitCounts[unitType]++;
                    break;
                case Config.CASTLE_TALK.MESSAGES.LOCATION:
                    this.unitInformation[robot.id] = robot;
                    this.unitInformation[robot.id].lastPinged = this.me.turn;
                    break;
            }
        });
        Object.keys(this.unitInformation).forEach(id => {
            if (this.unitInformation[id].lastPinged != this.me.turn) {
                this.unitCounts[this.unitInformation[id].unit]--;
                delete this.unitInformation[id];
            }
        })
    }
}

export default Castle;
