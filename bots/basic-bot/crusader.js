import Role from './role.js';
import Point from './point.js';

class Crusader extends Role {
    decide() {
        return this.move(this.me.pos.add(new Point(0, 1)));
        // const context = this.context;
        // const robots = context.getVisibleRobots();
        // for (let i = 0; i < robots.length; i++) {
        //     if (robots[i].team != context.me.team && robots[i].y != null) {
        //         let d = dist([robots[i].y, robots[i].x], [context.me.y, context.me.x]);
        //         if (d >= (SPECS.UNITS[context.me.unit].ATTACK_RADIUS)[0] && d <= (SPECS.UNITS[context.me.unit].ATTACK_RADIUS)[1]) {
        //             return context.attack(robots[i].x - context.me.x, robots[i].y - context.me.y);
        //         }
        //     }
        // }
        // const castleLocations = [];
        // for (let i = 0; i < this.knownUnits.length; i++) {
        //     if (this.knownUnits[i].unit === SPECS.CASTLE)
        //         castleLocations.push([this.knownUnits[i].y, this.knownUnits[i].x]);
        // }
        // const opponentCastles = findPossibleOpponentCastles(context.map, context.fuel_map, context.karbonite_map, castleLocations);
        // const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        // return this.moveTowards(castleToAttack);
    }
}

export default Crusader;
