import { SPECS } from 'battlecode';
import Role from './role.js';
import Point from './point.js';
import Nav from './nav.js';
import Util from './util.js';

const findPossibleOpponentCastles = Nav.findPossibleOpponentCastles;
const norm = Util.norm;

class Crusader extends Role {
    decide() {
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        
        // TODO: better and more general castle detection
        const castleLocations = [];
        Object.keys(this.knownUnits).forEach(id => {
            const unit = this.knownUnits[id];
            if (unit.unit === SPECS.CASTLE && this.me.team === unit.team)
                castleLocations.push(unit.pos);
        });
        
        // Doesn't this allow the crusader to change destinations randomly?
        const opponentCastles = findPossibleOpponentCastles(castleLocations, this.cartography);
        const castleToAttack = opponentCastles[Math.floor(Math.random() * opponentCastles.length)];
        return this.moveTowards(castleToAttack);
    }
}

export default Crusader;
