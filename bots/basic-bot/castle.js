import Role from './role.js';
import { SPECS } from 'battlecode';
import Point from './point.js';
import Util from './util.js';
import Config from './config.js';

const norm = Util.norm;

class Castle extends Role {
    constructor(context, spawnSignal, subType) {
        super(context, spawnSignal, subType);

        this.unitInformation = {};
        this.unitCounts = {};
        for (let i = 0; i < 8; i++) {
            this.unitCounts[i] = {};
            for (let j = 0; j < 4; j++)
                this.unitCounts[i][j] = 0;
        }
    }
    decide() {
        this.updateUnitInformation();
        // consoleLog(this.unitCounts);
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        return this.buildUnitAuto(0, ...this.chooseUnitToBuild());
    }
    chooseUnitToBuild() {
        let total = 1;
        Object.keys(Config.SPAWN.CASTLE).forEach(unitType => {
            Object.keys(Config.SPAWN.CASTLE[unitType]).forEach(subType => {
                total += this.unitCounts[unitType][subType];
            });
        });
        let unitToConstruct = undefined, expectedBelow = undefined, subTypeToConstruct = undefined;
        Object.keys(Config.SPAWN.CASTLE).forEach(unitType => {
            unitType = new Number(unitType);
            Object.keys(Config.SPAWN.CASTLE[unitType]).forEach(subType => {
                subType = new Number(subType);
                const expected = Config.SPAWN.CASTLE[unitType][subType] * total;
                if (unitToConstruct === undefined) {
                    unitToConstruct = unitType;
                    expectedBelow = expected - this.unitCounts[unitType][subType];
                    subTypeToConstruct = subType;
                } else if (expected - this.unitCounts[unitType][subType] > expectedBelow) {
                    unitToConstruct = unitType;
                    expectedBelow = expected - this.unitCounts[unitType][subType];
                    subTypeToConstruct = subType;
                }
            });
        });
        // consoleLog(unitToConstruct + " " + subTypeToConstruct);
        return [unitToConstruct, subTypeToConstruct];
    }
    updateUnitInformation() {
        const robots = this.getVisibleRobots();
        robots.forEach(robot => {
            if (robot.castle_talk === undefined) return;
            const messageType = robot.castle_talk % 4;
            const message = robot.castle_talk >> 2;
            let unitType, subType;
            switch (messageType) {
                case Config.CASTLE_TALK.MESSAGES.UNIT_UPDATE:
                    unitType = message % 8;
                    subType = message >> 3;
                    this.unitCounts[unitType][subType]++;
                    break;
                case Config.CASTLE_TALK.MESSAGES.UNIT_SPAWN:
                    unitType = message % 8;
                    subType = message >> 3;
                    this.unitInformation[robot.id] = robot;
                    this.unitInformation[robot.id].unit = unitType;
                    this.unitInformation[robot.id].subType = subType;
                    break;
                case Config.CASTLE_TALK.MESSAGES.LOCATION:
                    if (this.unitInformation[robot.id] === undefined)
                        this.unitInformation[robot.id] = robot;
                    Object.keys(robot).forEach(key => {
                        this.unitInformation[robot.id][key] = robot[key];
                    });
                    break;
            }
            this.unitInformation[robot.id].lastPinged = this.me.turn;
        });
        Object.keys(this.unitInformation).forEach(id => {
            if (this.unitInformation[id].lastPinged != this.me.turn) {
                this.unitCounts[this.unitInformation[id].unit][this.unitInformation[id].subType]--;
                delete this.unitInformation[id];
            }
        })
    }
}

export default Castle;
