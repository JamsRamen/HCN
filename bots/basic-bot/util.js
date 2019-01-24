/*
 * util.js: generic utilities including distance and logging
 */
 
import Point from './point.js';

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Squared Euclidean distance
 */
function norm(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2);
}

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Manhattan distance (sum of x difference and y difference)
 */
function mdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * @param {Point} pos1
 * @param {Point} [pos2=(0, 0)]
 * @return {number} Chebyshev distance (maximum of x difference and y difference)
 */
function cdist(pos1, pos2) {
    if (pos2 === undefined) {
        pos2 = new Point();
    }
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
}

/**
 * Return an array of all lattice points within a given distance of the origin, excluding (0, 0)
 * @param {number} distance
 * @param [metric=norm] the distance metric used
 * @return {Point[]} an array of all points described above
 */
function getCircle(distance, metric) {
    if (metric === undefined) {
        metric = norm;
    }

    let result = [];
    for (let i = 0; metric(new Point(i, 0)) <= distance; i++) {
        for (let j = 0; metric(new Point(i, j)) <= distance; j++) {
            if (i === 0 && j === 0) continue;
            
            result.push(new Point(i, j));
            result.push(new Point(-i, j));
            result.push(new Point(i, -j));
            result.push(new Point(-i, -j));
        }
    }
    return result;
}

/**
 * Reverse a given array in place
 * @param {*[]} arr - the array to reverse
 */
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
    getCircle
};
