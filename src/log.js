let logLevel = 0;

const logLevels = {
    standard: 0,
    verbose: 1
}

function getLogLevel() {
    return logLevel;
}

function setLogLevel(level) {
    if((level === '1') || (level === 'v') || (level === 'verbose')) logLevel = logLevels.verbose;
    return;
}

function standard(msg) {
    console.log(msg);
    return;
}

function verbose(msg) {
    if (logLevel >= logLevels.verbose) console.log(msg);
    return;
}

module.exports = {
    logLevel,
    logLevels,
    getLogLevel,
    setLogLevel,
    standard,
    verbose
};