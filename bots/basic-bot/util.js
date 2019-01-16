
let consoleLog = undefined;

function setConsoleLog(c) {
    consoleLog = c;
}

// Euclidean distance squared
function norm(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2);
}

// Manhattan distance
function mdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

// Chebyshev distance
function cdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
}

// return all positions within distance from origin by metric given (norm by default)
// excluding (0, 0)
function getCircle(distance, metric) {
    if (metric === undefined) {
        metric = norm;
    }

    let result = [];
    for (let i = 0; metric([i, 0]) <= distance; i++) {
        for (let j = 0; metric([i, j]) <= distance; j++) {
            if (i === 0 && j === 0) continue;
            
            result.push([i, j]);
            result.push([-i, j]);
            result.push([i, -j]);
            result.push([-i, -j]);
        }
    }
    return result;
}

// reverse arr in place
function reverse(arr) {
    let start = 0;
    let end = arr.length - 1;
    while (start < end) {
        let temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
}

export default {
    norm, mdist, cdist,
    reverse,
    getCircle,
    setConsoleLog,
    consoleLog
};
