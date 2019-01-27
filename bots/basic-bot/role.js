import { SPECS } from 'battlecode';
import Util from './util.js';
import Cartography from './cartography.js';
import Point from './point.js';
import Nav from './nav.js';

const getCircle = Util.getCircle;
const norm = Util.norm;
const findPassablePathsFrom = Nav.findPassablePathsFrom;

class Role {
    constructor(context) {
        // custom properties of all roles
        this.knownUnits = {};
        this.currentPath = undefined;
        this.currentPathIndex = 0;

        // reference to MyRobot class (not meant to be accessed)
        this.context = context;
        this.cartography = new Cartography(this.context.map, this.context.karbonite_map, this.context.fuel_map, _ => this.context.getVisibleRobotMap());

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
            const dpos = this.me.pos.add(delta);
            //if (dpos is a castle or church)
                result = this.context.give(delta.x, delta.y, this.me.karbonite, this.me.fuel);
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
        consoleLog("DESTINATION: " + destination);
        const startTime = new Date().getTime();
        const resultMap = findPassablePathsFrom(destination, this.SPEED, this.cartography);
        const nextPosition = resultMap[this.me.pos].next;
        if (nextPosition === undefined)
            return undefined;
        if (this.cartography.isOpen(nextPosition))
            return this.move(nextPosition);
        const deltas = getCircle(this.SPEED);
        let bestPosition = undefined;
        for (let i = 0; i < deltas.length; i++) {
            const position = this.me.pos.add(deltas[i]);
            if (this.cartography.isInBounds(position) && this.cartography.isOpen(position)) {
                if (norm(position, destination) >= norm(this.me.pos, destination))
                    continue;
                if (bestPosition === undefined) {
                    bestPosition = position;
                } else if (resultMap[position].dist < resultMap[bestPosition].dist) {
                    bestPosition = position;
                } else if (resultMap[position].dist == resultMap[bestPosition].dist && norm(position, destination) < norm(bestPosition, destination)) {
                    bestPosition = position;
                }
            }
        }
        const timeSpent = (new Date().getTime() - startTime);
        if (bestPosition === undefined)
            return undefined;
        return this.move(bestPosition);
    }
}

export default Role;
