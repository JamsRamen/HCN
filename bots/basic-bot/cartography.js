
class Cartography {
    constructor(map, karboniteMap, fuelMap, getVisibleRobotMap) {
        this.map = pos => return map[pos.y][pos.x];
        this.karboniteMap = pos => return karboniteMap[pos.y][pos.x];
        this.fuelMap = pos => return fuelMap[pos.y][pos.x];
        this.robotMap = pos => return getVisibleRobotMap()[pos.y][pos.x];
    }
    
}

export default Cartography;
