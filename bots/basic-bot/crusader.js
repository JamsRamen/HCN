import { SPECS } from 'battlecode';
import Role from './role.js';
import Point from './point.js';
import Nav from './nav.js';

const findPossibleOpponentCastles = Nav.findPossibleOpponentCastles;

class Crusader extends Role {
    decide() {
        // return this.move(this.me.pos.add(new Point(0, 1)));
        // const robots = this.getVisibleRobots();
        // for (let i = 0; i < robots.length; i++) {
        //     if (robots[i].team != this.me.team && this.isVisible(robots[i])) {
        //         const dist = norm(robots[i].pos, this.me.pos);
        //         if (dist >= (this.ATTACK_RADIUS)[0] && dist <= (this.ATTACK_RADIUS)[1]) {
        //             return this.attack(robots[i]);
        //         }
        //     }
        // }
        const castleLocations = [];
        Object.keys(this.knownUnits).forEach(id => {
            const unit = this.knownUnits[id];
            if (unit.unit === SPECS.CASTLE)
                castleLocations.push(unit.pos);
        });
        const opponentCastles = findPossibleOpponentCastles(castleLocations, this.cartography);
        consoleLog(opponentCastles);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        consoleLog("CRUSADER TURN: MOVING TOWARDS CASTLE " + castleToAttack);
        consoleLog(this.me.time);
        return this.moveTowards(castleToAttack);
    }
}

export default Crusader;
