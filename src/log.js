let logLevel = 1;

const logLevels = {
    quiet: 0,
    standard: 1,
    verbose: 2
}

function getLogLevel() {
    return logLevel;
}

function setLogLevel(level) {
    if((level === '0') || (level === 'q') || (level === 'quiet')) logLevel = logLevels.quiet;
    if((level === '1') || (level === 's') || (level === 'standard')) logLevel = logLevels.standard;
    if((level === '2') || (level === 'v') || (level === 'verbose')) logLevel = logLevels.verbose;
    return;
}

function isQuiet() {
    return (logLevel === logLevels.quiet) ? true : false;
}

function isStandard() {
    return (logLevel === logLevels.standard) ? true : false;
}

function isVerbose() {
    return (logLevel === logLevels.verbose) ? true : false;
}

function standard(msg) {
    if (logLevel >= logLevels.standard) console.log(msg);
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
    isQuiet,
    isStandard,
    isVerbose,
    standard,
    verbose
};