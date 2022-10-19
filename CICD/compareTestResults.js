const fs = require("fs");

const log = require("../src/log.js")

log.setLogLevel(log.logLevels.verbose);

// Extract cl arguments
const clArgs = process.argv.slice(2);

if(clArgs.length !== 2) {
    log.error("Incorrect number of arguments")
    process.exit(1);
}

const resultType = ["New", "Previous"];
let results = [];

for(let ii = 0; ii < 2; ii++) {
    try {
        results[ii] = fs.readFileSync(clArgs[ii], "utf-8");
        results[ii] = JSON.parse(results[ii]);
        log.verbose(`${log.underline}${resultType[ii]} test results${log.resetStyling}`);
        log.verbose(results[ii]);    
    } catch (ee) {
        log.error(clArgs[ii] + " : " + ee.message);
        process.exit(1);
    }
}

Object.entries(results[1]).forEach(([language, oldResult]) => {
    let newResult;
    if((newResult = results[0][language]) != undefined) {
        let limit = newResult.scenarios > oldResult.scenarios;
        if(limit < 0) limit = 0;
        if((newResult.failed - oldResult.failed) > limit) {
            log.error(`${language} ${log.redBackground}${log.blackForeground} FAILED ${log.resetStyling}`);
            log.verbose("There are more newly failing tests than added test.");
            log.verbose("This is an indication that an existing test is now failing.");
            process.exit(1);
        }
    }
  });

process.exit(0);
