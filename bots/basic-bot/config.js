
export default {
    CASTLE_TALK: {
        TYPE_BITS: 2,
        MESSAGES: {
            LOCATION: 0, // used to report general location of a unit (not really in use)
            LOG: 1, // used to log critical events
            UNIT_UPDATE: 2, // sent by castles / churches when a unit is built
            UNIT_SPAWN: 3 // sent by units on first turn
        }
    },
    SPAWN: {
        CASTLE: {
            3: {
                0: .3, // attack crusader
                1: .1 // defense crusader
            },
            2: {
                0: .2 // pilgrim
            },
            5: {
                0: .05, // attack preacher
                1: .05 // defense preacher
            },
            4: {
                0: .15, // prophet
                1: .15 // defense prophet
            }
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
