import { SPECS } from 'battlecode';
import Util from './util.js';
import Cartography from './cartography.js';
import Point from './point.js';
import Nav from './nav.js';

const getCircle = Util.getCircle;
const findPathTowardsWithoutRobots = Nav.findPathTowardsWithoutRobots;
const findPathTowardsWithRobots = Nav.findPathTowardsWithRobots;

class Role {
    constructor(context) {
        // custom properties of all roles
        this.knownUnits = {};
        this.currentPath = undefined;
        this.currentPathIndex = 0;

        // reference to MyRobot class (not meant to be accessed)
        this.context = context;
        this.cartography = new Cartography(this.context.map, this.context.karbonite_map, this.context.fuel_map, this.context.getVisibleRobotMap);

        // constants from specs
        this.CONSTRUCTION_KARBONITE = SPECS.UNITS[this.context.me.unit].CONSTRUCTION_KARBONITE;
        this.CONSTRUCTION_FUEL = SPECS.UNITS[this.context.me.unit].CONSTRUCTION_FUEL;
        this.KARBONITE_CAPACITY = SPECS.UNITS[this.context.me.unit].KARBONITE_CAPACITY;
        this.FUEL_CAPACITY = SPECS.UNITS[this.context.me.unit].FUEL_CAPACITY;
        this.SPEED = SPECS.UNITS[this.context.me.unit].SPEED;
        this.FUEL_PER_MOVE = SPECS.UNITS[this.context.me.unit].FUEL_PER_MOVE;
        this.STARTING_HP = SPECS.UNITS[this.context.me.unit].STARTING_HP;
        this.VISION_RADIUS = SPECS.UNITS[this.context.me.unit].VISION_RADIUS;
        this.ATTACK_DAMAGE = SPECS.UNITS[this.context.me.unit].ATTACK_DAMAGE;
        this.ATTACK_RADIUS = SPECS.UNITS[this.context.me.unit].ATTACK_RADIUS;
        this.ATTACK_FUEL_COST = SPECS.UNITS[this.context.me.unit].ATTACK_FUEL_COST;
        this.DAMAGE_SPREAD = SPECS.UNITS[this.context.me.unit].DAMAGE_SPREAD;
    }
    // =================== override battlecode docs
    move(pos) {
        return this.context.move(pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    mine() {
        return this.context.mine();
    }
    give(pos, karbonite, fuel) {
        return this.context.give(pos.x - this.me.pos.x, pos.y - this.me.pos.y, karbonite, fuel);
    }
    giveAuto() {
        var result = undefined;
        getCircle(2).foreach(delta => {
            // if (pos.add(delta) is a castle)
            //     result = this.context.give(delta.x, delta.y, karbonite, fuel);
        });
        
        return result;
    }
    attack(pos) {
        return this.context.attack(pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    buildUnit(type, pos) {
        return this.context.buildUnit(type, pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    // buildUnitAuto(signal, type) {
        // return undefined;
        // const deltas = getCircle(2);
        // for (let i = 0; i < deltas.length; i++) {
        //     if (isPassableAndUnoccupied([context.me.y + deltas[i][0], context.me.x + deltas[i][1]], context.map, context.getVisibleRobotMap()))
        //         return context.buildUnit(signal, type, deltas[i][1], deltas[i][0]);
        // }
        // return undefined;
        // if ((this.me.unit === SPECS.CASTLE || this.me.unit === SPECS.CHURCH)
        //     && this.me.x + dx >= 0 && this.me.x + dx < this.map.length
        //     && this.me.y + dy >= 0 && this.me.y + dy < this.map.length
        //     && Math.abs(dx) <= 1 && Math.abs(dy) <= 1
        //     && this.map[this.me.y + dy][this.me.x + dx]
        //     && this.getVisibleRobotMap()[this.me.y + dy][this.me.x + dx] === 0
        //     && this.karbonite >= SPECS.UNITS[type].CONSTRUCTION_KARBONITE
        //     && this.fuel >= SPECS.UNITS[type].CONSTRUCTION_FUEL) {
        //     if (signal !== 0)
        //         this.signal(signal, dx * dx + dy * dy);
        // }
        // return super.buildUnit(type, dx, dy);
    // }
    proposeTrade(karbonite, fuel) {
        return this.context.proposeTrade(karbonite, fuel);
    }
    signal(value, distance) {
        return this.context.signal(value, distance);
    }
    castleTalk(value) {
        return this.context.castleTalk(value);
    }
    getVisibleRobots() {
        const robots = this.context.getVisibleRobots();
        robots.forEach((robot) => {
            robot.pos = new Point(robot.x, robot.y);
        });
        return robots;
    }
    getRobot(id) {
        const robot = this.context.getRobot(id);
        robot.pos = new Point(robot.x, robot.y);
        return robot;
    }
    isVisible(robot) {
        return this.context.isVisible(robot);
    }
    isRadioing(robot) {
        return this.context.isRadioing(robot);
    }
    // =================== end override battlecode docs
    turn() {
        // local references to battlecode variables
        this.me = this.context.me;
        this.me.pos = new Point(this.me.x, this.me.y);
        this.fuel = this.context.fuel;
        this.karbonite = this.context.karbonite;
        this.lastOffer = this.context.last_offer;

        // update known variables
        const robots = this.getVisibleRobots();
        robots.forEach((robot) => {
            this.knownUnits[robot.id] = robot;
        });

        return this.decide();
    }
    moveTowards(destination) {
        console.log("Is path found?: " + (this.currentPath === undefined));
        // return undefined;
        if (this.currentPath === undefined) {
            this.currentPath = findPathTowardsWithoutRobots(this.me.pos, destination, this.SPEED, this.cartography);
            this.currentPathIndex = 0;
        }
        if (this.currentPath === undefined) {
            return undefined;
        }
        if (this.currentPathIndex === this.currentPath.length - 1) {
            return undefined;
        }
        if (cartography.isOpen(this.currentPath[this.currentPathIndex + 1])) {
            this.currentPathIndex++;
            return this.move(this.currentPath[this.currentPathIndex]);
        }
        else {
            let nextOpenLocationIndex = this.currentPath.length - 1;
            let nextOpenLocation = this.currentPath[nextOpenLocationIndex];
            for (let i = this.currentPathIndex + 1; i < this.currentPath.length; i++) {
                if (cartography.isOpen(this.currentPath[i])) {
                    nextOpenLocation = this.currentPath[i];
                    nextOpenLocationIndex = i;
                    break;
                }
            }
            if (nextOpenLocation === undefined)
                return undefined;
            const miniPath = findPathTowardsWithRobots(this.me.pos, nextOpenLocation, this.SPEED, cartography);
            if (miniPath === undefined)
                return undefined;
            if (miniPath.length === 2 && miniPath[1] === nextOpenLocation)
                this.currentPathIndex = nextOpenLocationIndex;
            return this.move(miniPath[1]);
        }
    }
}

export default Role;
