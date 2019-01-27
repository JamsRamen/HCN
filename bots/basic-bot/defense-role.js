import Role from './role.js';

class DefenseRole extends Role {
    decide() {
        const attack = this.attackAuto();
        return attack;
    }
}

export default DefenseRole;
