import { SPECS } from 'battlecode';
import Util from './util.js';
import Cartography from './cartography.js';
import Point from './point.js';
import Nav from './nav.js';
import Config from './config.js';

const getCircle = Util.getCircle;
const inRange = Util.inRange;
const norm = Util.norm;
const findPassablePathsFrom = Nav.findPassablePathsFrom;

class Role {
    constructor(context, spawnSignal) {
        // custom properties of all roles
        this.knownUnits = {};
        this.currentPath = undefined;
        this.currentPathIndex = 0;
        this.spawnSignal = spawnSignal;
        this.unitType = spawnSignal % 4;

        // reference to MyRobot class (not meant to be accessed)
        this.context = context;
        this.cartography = new Cartography(this.context.map,
                                           this.context.karbonite_map,
                                           this.context.fuel_map,
                                           _ => this.context.getVisibleRobotMap());

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
        let result = undefined;
        const robots = this.getVisibleRobots();
        robots.forEach(robot => {
            if (norm(robot.pos, this.me.pos) <= 2 && (robot.unit === SPECS.CASTLE || robot.unit === SPECS.CHURCH)) {
                result = this.give(robot.pos, this.me.karbonite, this.me.fuel);
                return;
            }
        });
        return result;
    }
    
    attack(pos) {
        return this.context.attack(pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    attackAuto() {
        let result = undefined;
        let target = { canAttack: false, unit: -1, id: -1 };
        let underAttack = false;
        const robots = this.getVisibleRobots();
        
        robots.forEach(robot => {
            if (robot.team != this.me.team && this.isVisible(robot)) {
                const dist = norm(robot.pos, this.me.pos);
                let cand = { canAttack: inRange(dist, SPECS.UNITS[robot.unit].ATTACK_RADIUS), 
                             unit: robot.unit, 
                             id: robot.id };
                if (cand.canAttack) {
                    underAttack = true;
                }
                
                if (inRange(dist, this.ATTACK_RADIUS)) {
                    if (result === undefined) {
                        result = this.attack(robot);
                        target = cand;
                    }
                    // attack priorities:
                    // 1. never attack a benign unit if you are under attack
                    // 2. attack units which are not benign
                    // 3. break first ties by unit type (found in config.js)
                    // 4. break second ties by id
                    
                    if (cand.canAttack && !target.canAttack) { // 2.
                        result = this.attack(robot);
                        target = cand;
                    }
                    else if (cand.canAttack == target.canAttack) {
                        if (Config.ATTACK.PRIORITY[cand.unit] > Config.ATTACK.PRIORITY[target.unit]) { // 3.
                            result = this.attack(robot);
                            target = cand;
                        } else if (Config.ATTACK.PRIORITY[cand.unit] == Config.ATTACK.PRIORITY[target.unit]) { // 4.
                            if (cand.id < target.id) {
                                result = this.attack(robot);
                                target = cand;
                            }
                        }
                    }
                }
                
                
            }
        });
        
        if (underAttack && !target.canAttack) { // 1.
            return undefined;
        }
        
        return result;
    }
    
    canBuild(type) {
        return this.karbonite >= SPECS.UNITS[type].CONSTRUCTION_KARBONITE &&
               this.fuel >= SPECS.UNITS[type].CONSTRUCTION_FUEL;
    }
    buildUnit(type, pos) {
        return this.context.buildUnit(type, pos.x - this.me.pos.x, pos.y - this.me.pos.y);
    }
    buildUnitAuto(signal, type) {
        if (!this.canBuild(type)) {
            return undefined;
        }
        
        let result = undefined;
        let dist = 3;
        const deltas = getCircle(2);
        
        deltas.forEach(delta => {
            const buildPos = this.me.pos.add(delta);
            const candDist = norm(delta);
            const good = this.cartography.isInBounds(buildPos) && // do not build out of bounds
                         this.cartography.isOpen(buildPos) &&  // do not build on occupied squares
                         !(type === SPECS.CHURCH && this.cartography.isMine(buildPos)); // do not build churches on mines
            
            if (good && candDist < dist) { // minimize spawn distance
                result = this.buildUnit(type, buildPos);
                dist = candDist;
            }
        });
        if (result === undefined) return undefined;
        this.context.log(dist);
        if (signal != -1) {
            this.signal(signal, dist);
        }
        this.pingCastle(Config.CASTLE_TALK.MESSAGES.UNIT_UPDATE, (signal == -1 ? 7 : signal % 8) * 8 + type);
        
        return result;
    }
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


        const result = this.decide();
        this.pingCastle(Config.CASTLE_TALK.MESSAGES.LOCATION, 0); // always ping location (if nothing better)
        return result;
    }
    moveTowards(destination) {
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
        if (bestPosition === undefined)
            return undefined;
        return this.move(bestPosition);
    }
    pingCastle(type, value) {
        if (this.pingedCastle)
            return undefined;
        this.pingedCastle = true;
        return this.castleTalk(value * (1 << (Config.CASTLE_TALK.TYPE_BITS)) + type);
    }
    
    
}

export default Role;
