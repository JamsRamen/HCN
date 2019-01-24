
var consoleLog = undefined;

function setConsoleLog(c) {
    consoleLog = c;
}

function testFunction(s) {
    // console.log(s);
    consoleLog(s);
}

export default { testFunction, consoleLog, setConsoleLog };