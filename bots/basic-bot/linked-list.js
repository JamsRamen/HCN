
class LinkedList {
    constructor(v) {
        this.left = this.right = undefined;
        this.val = v;
    }
}

class LinkedList {
    constructor() {
        this.sz = 0;
        this.front = undefined;
        this.back = undefined;
    }
    pushFront(v) {
        if (this.front === undefined) {
            this.front = new QueueNode(v);
            this.back = this.front;
        }
        else {
            let newNode = new QueueNode(v);
            newNode.right = this.front;
            this.front.left = newNode;
            this.front = newNode;
        }
        this.sz++;
    }
    pushBack(v) {
        if (this.back === undefined) {
            this.back = new QueueNode(v);
            this.front = this.back;
        }
        else {
            let newNode = new QueueNode(v);
            newNode.left = this.back;
            this.back.right = newNode;
            this.back = newNode;
        }
        this.sz++;
    }
    popFront() {
        if (this.front === undefined)
            return undefined;
        let res = this.front.val;
        this.front = this.front.right;
        if (this.front === undefined)
            this.back = undefined;
        else
            this.front.left = undefined;
        this.sz--;
        return res;
    }
    popBack() {
        if (this.back === undefined)
            return undefined;
        let res = this.back.val;
        this.back = this.back.left;
        if (this.back === undefined)
            this.front = undefined;
        else
            this.back.right = undefined;
        this.sz--;
        return res;
    }
    peekFront() {
        if (this.front === undefined)
            return undefined;
        return this.front.val;
    }
    peekBack() {
        if (this.back === undefined)
            return undefined;
        return this.back.val;
    }
    size() {
        return this.sz;
    }
}

export default LinkedList;
