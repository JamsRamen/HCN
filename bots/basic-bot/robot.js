import { BCAbstractRobot, SPECS } from 'battlecode';
import Util from './util.js';
import Point from './point.js';
import Role from './role.js';
import Castle from './castle.js';
import Church from './church.js';
import Pilgrim from './pilgrim.js';
import Crusader from './crusader.js';
import Prophet from './prophet.js';
import Preacher from './preacher.js';

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
            const visibleRobots = this.getVisibleRobotMap();
            for (let i = 0; i < visibleRobots.length; i++) {
                if (visibleRobots[i].unit === SPECS.CASTLE && norm([visibleRobots[i].x, visibleRobots[i].y], [this.me.x, this.me.y]) < 4) {
                    signal = visibleRobots[i].signal;
                }
            }
            
            switch (this.me.unit) {
                case SPECS.CRUSADER:
                    this.unit = new Crusader(this, signal);
                    break;
                case SPECS.PILGRIM:
                    this.unit = new Pilgrim(this, signal);
                    break;
                case SPECS.PROPHET:
                    this.unit = new Prophet(this, signal);
                    break;
                case SPECS.PREACHER:
                    this.unit = new Preacher(this, signal);
                    break;
                case SPECS.CHURCH:
                    this.unit = new Church(this, signal);
                    break;
                case SPECS.CASTLE:
                    this.unit = new Castle(this, signal);
                    break;
            }
        }
        return this.unit.turn();
    }
}
