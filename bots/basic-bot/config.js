
export default {
    CASTLE_TALK: {
        TYPE_BITS: 2,
        MESSAGES: {
            LOCATION: 0,
            LOG: 1,
            UNIT_UPDATE: 2
        }
    },
    CASTLE: {
        SPAWN: {
            CRUSADER: .5,
            PILGRIM: .5,
            PREACHER: 0,
            PROPHET: 0
        }
    },
    CRUSADER: {},
    PILGRIM: {},
    PREACHER: {},
    PROPHET: {},
    ATTACK: {
        PRIORITY: {
            CHURCH: 0, 1: 0,
            CASTLE: 1, 0: 1,
            CRUSADER: 2, 3: 2,
            PREACHER: 3, 5: 3,
            PROPHET: 4, 4: 3,
            PILGRIM: 5, 2: 5
        }
    }
};
