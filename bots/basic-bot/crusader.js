import { SPECS } from 'battlecode';
import Role from './role.js';
import Point from './point.js';
import Nav from './nav.js';
import Util from './util.js';

const findPossibleOpponentCastles = Nav.findPossibleOpponentCastles;
const norm = Util.norm;

class Crusader extends Role {
    decide() {
        const robots = this.getVisibleRobots();
        for (let i = 0; i < robots.length; i++) {
            if (robots[i].team != this.me.team && this.isVisible(robots[i])) {
                const dist = norm(robots[i].pos, this.me.pos);
                if (dist >= (this.ATTACK_RADIUS)[0] && dist <= (this.ATTACK_RADIUS)[1]) {
                    return this.attack(robots[i]);
                }
            }
        }
        const castleLocations = [];
        Object.keys(this.knownUnits).forEach(id => {
            const unit = this.knownUnits[id];
            if (unit.unit === SPECS.CASTLE && this.me.team === unit.team)
                castleLocations.push(unit.pos);
        });
        const opponentCastles = findPossibleOpponentCastles(castleLocations, this.cartography);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        return this.moveTowards(castleToAttack);
    }
}

export default Crusader;
