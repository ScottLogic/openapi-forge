const path = require("path");
const shell = require("shelljs");

const log = require("../log");

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function parseMessages(messages) {
  // each test case starts with a testCaseStarted message, followed by a number of testStepFinished messages
  const stepsForTestCase = [];
  messages.forEach((message) => {
    if (message.testCaseStarted) {
      stepsForTestCase.push([]);
    }
    if (message.testStepFinished) {
      stepsForTestCase[stepsForTestCase.length - 1].push(
        message.testStepFinished
      );
    }
  });

  // determine the duration
  const start = messages.filter((m) => m.testRunStarted)[0].testRunStarted
    .timestamp.seconds;
  const end = messages.filter((m) => m.testRunFinished)[0].testRunFinished
    .timestamp.seconds;

  return {
    scenarios: stepsForTestCase.length,
    failed: stepsForTestCase.filter((steps) =>
      steps.some((s) => s.testStepResult.status === "FAILED")
    ).length,
    passed: stepsForTestCase.filter((steps) =>
      steps.every((s) => s.testStepResult.status === "PASSED")
    ).length,
    time: end - start,
  };
}

function testGenerators(options) {
  const aggregatedResults = {};

  log.setLogLevel(options.logLevel);

  options.generators.forEach((generator) => {
    try {
      const generatorPath = path.resolve(
        path.join(__dirname, "..", "..", generator)
      );

      log.standard(`Starting tests for generator ${generator}`);
      shell.cd(generatorPath, log.shellOptions);
      const result = shell
        .exec(`npm run test:generators`, log.shellOptions)
        .stdout.split("\n")
        .filter(isJson)
        .map(JSON.parse);
      shell.cd(__dirname, log.shellOptions);

      aggregatedResults[generator] = parseMessages(result);
    } catch (e) {
      log.error(`Error testing generator ${generator}: ${e}`);
    }
  });

  if (options.format === "table") {
    console.table(aggregatedResults);
  } else {
    console.log(JSON.stringify(aggregatedResults, null, 2));
  }
}

module.exports = {
  testGenerators,
};
