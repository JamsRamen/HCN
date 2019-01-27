import { SPECS } from 'battlecode';
import Role from './role.js';
import Point from './point.js';
import Nav from './nav.js';
import Util from './util.js';
import AttackRole from './attack-role.js';

const findPossibleOpponentCastles = Nav.findPossibleOpponentCastles;
const norm = Util.norm;

class Prophet extends AttackRole {
    decide() {
        return super.decide();
    }
}

export default Prophet;
