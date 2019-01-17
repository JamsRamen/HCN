import { BCAbstractRobot } from 'battlecode';
import Test from './test.js';

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.log("asdf");
        Test.setConsoleLog(this.log);
    }
    turn() {
        Test.testFunction("hello");
        return this.move(0, 1);
    }
}
