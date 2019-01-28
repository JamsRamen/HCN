import { BCAbstractRobot, SPECS } from 'battlecode';
import Util from './util.js';
import Point from './point.js';
import Role from './role.js';
import Castle from './castle.js';
import Church from './church.js';
import Pilgrim from './pilgrim.js';
import DefenseCrusader from './defense-crusader.js';
import AttackCrusader from './attack-crusader.js';
import DefenseProphet from './defense-prophet.js';
import AttackProphet from './attack-prophet.js';
import DefensePreacher from './defense-preacher.js';
import AttackPreacher from './attack-preacher.js';

const norm = Util.norm;

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.unit = null;
        global.consoleLog = v => this.log(v);
    }
    turn() {
        if (this.me.turn === 1) {
            let signal = 0;
            const visibleRobots = this.getVisibleRobots();
            //visibleRobots.forEach(robot => {
            //    if ((robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH) && norm(new Point(robot.x, robot.y), new Point(this.me.x, this.me.y)) < 4) {
            //        signal = robot.signal;
            //    }
            //});
            const subType = signal % 4;
            const remainingSignal = signal >> 2;
            consoleLog(subType);

            switch (this.me.unit) {
                case SPECS.CRUSADER:
                    if (subType === 0)
                        this.unit = new AttackCrusader(this, remainingSignal, subType);
                    else
                        this.unit = new DefenseCrusader(this, remainingSignal, subType);
                    break;
                case SPECS.PILGRIM:
                    this.unit = new Pilgrim(this, remainingSignal, subType);
                    break;
                case SPECS.PROPHET:
                    if (subType === 0)
                        this.unit = new AttackProphet(this, remainingSignal, subType);
                    else
                        this.unit = new DefenseProphet(this, remainingSignal, subType);
                    break;
                case SPECS.PREACHER:
                    if (subType === 0)
                        this.unit = new AttackPreacher(this, remainingSignal, subType);
                    else
                        this.unit = new DefensePreacher(this, remainingSignal, subType);
                    break;
                case SPECS.CHURCH:
                    this.unit = new Church(this, remainingSignal, subType);
                    break;
                case SPECS.CASTLE:
                    this.unit = new Castle(this, remainingSignal, subType);
                    break;
            }
        }
        return this.unit.turn();
    }
}
