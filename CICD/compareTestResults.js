const fs = require("fs");

const log = require("../src/log.js")

log.setLogLevel(log.logLevels.standard);

// Extract cl arguments
const clArgs = process.argv.slice(2);

if(clArgs.length != 2) {
    log.error("Incorrect number of arguments")
    process.exit(1);
}

let oldResults;
let newResults;

try {
    oldResults = fs.readFileSync(clArgs[0], "utf-8");
    oldResults = JSON.parse(oldResults);
} catch (ee) {
    log.error(clArgs[0] + " : " + ee.message);
}

try {
    newResults = fs.readFileSync(clArgs[1], "utf-8");
    newResults = JSON.parse(newResults);
} catch (ee) {
    log.error(clArgs[1] + " : " + ee.message);
}

Object.entries(oldResults).forEach(([language, oldResult]) => {
    if(newResults[language] != undefined) {
        if(newResults[language].failed > oldResult.failed) process.exit(1);
    }
  });

process.exit(0);
