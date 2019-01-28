import Role from './role.js';

class DefenseRole extends Role {
    decide() {
        const attack = this.attackAuto();
        if (attack != undefined)
            return attack;
        return undefined;
    }
}

export default DefenseRole;
