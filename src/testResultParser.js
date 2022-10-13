class Result {
  constructor(scenarios, passed, skipped, undef, failed, time) {
    this.scenarios = scenarios;
    this.passed = passed;
    this.skipped = skipped;
    this.undef = undef;
    this.failed = failed;
    this.time = time;
  }
}

function parseTestResultNumber(number) {
  const result = parseInt(number);
  return isNaN(result) ? 0 : result;
}

function checkTestResultForErrors(result) {
  return result.failed !== 0 ? 1 : 0;
}

function parseTypeScript(durationLine, resultLine) {
  // Extract the duration of the testing from stdout.
  const durationMatch = durationLine.match(/^(\d+)m(\d+)\.\d+s/);

  let result;
  if (durationMatch) {
    // Format the duration
    let time = "";
    if (durationMatch[1] !== "0" && durationMatch[1] !== "")
      time = `${durationMatch[1]}m`;
    time = `${time}${durationMatch[2]}s`;

    // Extract the results of the testing from stdout. In stdout is a count of tests and their outcomes.
    const resultMatch = resultLine.match(
      /^(\d+)\sscenarios?\s\(((\d+)\sfailed)?(,\s)?((\d+)\sundefined)?(,\s)?((\d+)\spassed)?\)/
    );
    if (resultMatch) {
      result = new Result(
        parseTestResultNumber(resultMatch[1]),
        parseTestResultNumber(resultMatch[9]),
        0,
        parseTestResultNumber(resultMatch[6]),
        parseTestResultNumber(resultMatch[3]),
        time
      );
    } else {
      throw new Error(`Could not parse the results of the TypeScript testing.`);
    }
  } else {
    throw new Error(`Could not parse the duration of the TypeScript testing.`);
  }
  return result;
}

function parseCSharp(resultLine) {
  // Extract the results of the testing from stdout. In stdout is a count of tests and their outcomes. Also included is the test duration.
  const resultMatch = resultLine.match(
    /Failed:\s+(\d+),\sPassed:\s+(\d+),\sSkipped:\s+(\d+),\sTotal:\s+(\d+),\sDuration:\s+(.*)\s-\sFeaturesTests.dll\s\(net6\.0\)/
  );

  let result;
  if (resultMatch) {
    result = new Result(
      parseInt(resultMatch[4]),
      parseInt(resultMatch[2]),
      parseInt(resultMatch[3]),
      0,
      parseInt(resultMatch[1]),
      resultMatch[5].replace(" ", "")
    );
  } else {
    throw new Error(`Could not parse the results of the CSharp testing.`);
  }
  return result;
}

module.exports = {
  parseTypeScript,
  parseCSharp,
  checkTestResultForErrors,
};
