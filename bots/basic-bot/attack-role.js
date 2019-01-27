import { SPECS } from 'battlecode';
import Role from './role.js';
import Nav from './nav.js';

const findPossibleOpponentCastles = Nav.findPossibleOpponentCastles;

class AttackRole extends Role {
    decide() {
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        
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

export default AttackRole;
