// Command line output styling
const blackForeground = "\x1b[30m";
const brightYellowForeground = "\x1b[93m";
const brightCyanForeground = "\x1b[96m";
const redBackground = "\x1b[41m";
const brightGreenBackground = "\x1b[102m";
const bold = "\x1b[1m"
const underline = "\x1b[4m"
const resetStyling = "\x1b[0m";

const divider = "\n---------------------------------------------------\n";

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
    else if((level === '1') || (level === 's') || (level === 'standard')) logLevel = logLevels.standard;
    else if((level === '2') || (level === 'v') || (level === 'verbose')) logLevel = logLevels.verbose;
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

function logFailedTesting(language, exception) {
    log.standard(`${log.divider}`);
    log.standard(`              ${language} testing ${log.redBackground}${log.blackForeground} FAILED ${log.resetStyling}`);
    log.standard(`${log.divider}`);
    if(log.isStandard()) {
      log.standard(`${exception.message}`);
    } else {
      log.verbose(`${exception.stack}`);
    }
    log.standard(`${log.divider}`);
}

module.exports = {
    blackForeground,
    brightYellowForeground,
    brightCyanForeground,
    redBackground,
    brightGreenBackground,
    bold,
    underline,
    resetStyling,
    divider,
    logLevel,
    logLevels,
    getLogLevel,
    setLogLevel,
    isQuiet,
    isStandard,
    isVerbose,
    standard,
    verbose,
    logFailedTesting
};