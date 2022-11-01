const fs = require("fs");

const log = require("../src/log.js");

// This regex extracts the generator table from README.md.
const tableRegex =
  /\[MARKER\]:\s<>\s\(START\sOF\sGENERATOR\sTESTING\sTABLE\)([\s\S]+)\[MARKER\]:\s<>\s\(END\sOF\sGENERATOR\sTESTING\sTABLE\)/m;

// This regex extracts the generator failures from README.md.
const failuresRegex =
  /\[MARKER\]:\s<>\s\(START\sOF\sGENERATOR\sTESTING\sFAILURES\)([\s\S]+)\[MARKER\]:\s<>\s\(END\sOF\sGENERATOR\sTESTING\sFAILURES\)/m;

function getNewFailures(results) {
  let newFailures = "[MARKER]: <> (START OF GENERATOR TESTING FAILURES)\n\n";

  const languages = Object.keys(results);

  for (let xx = 0; xx < languages.length; xx++) {
    const result = results[languages[xx]];
    newFailures += `\n\n## ${languages[xx]}\n\n`;
    if (result.failures) {
      for (let yy = 0; yy < result.failures.length; yy++) {
        newFailures += `- ${result.failures[yy]}\\\n`;
      }
      newFailures = newFailures.slice(0, -2);
    } else  {
      newFailures += "- No failed scenarios";
    }
  }
  newFailures += `\n\n[MARKER]: <> (END OF GENERATOR TESTING FAILURES)`;

  return newFailures;
}

function getNewTable(results) {
  let newTable =
    "[MARKER]: <> (START OF GENERATOR TESTING TABLE)\n\n| Generator | Scenarios | Passed | Skipped | Undefined | Failed | Time |\n| --- | --- | --- | --- | --- | --- | --- |\n";

  const languages = Object.keys(results);

  for (let xx = 0; xx < languages.length; xx++) {
    const result = results[languages[xx]];
    newTable += `| **${languages[xx]}** | ${result.scenarios} | ${result.passed} | ${result.skipped} | ${result.undef} | ${result.failed} | ${result.time} |\n`;
  }

  newTable += `\n[MARKER]: <> (END OF GENERATOR TESTING TABLE)`;

  return newTable;
}

function populateWebpage(results) {
  let fileContents = fs.readFileSync("docs/index.md", "utf-8");

  fileContents = fileContents.replace(tableRegex, getNewTable(results));

  fileContents = fileContents.replace(failuresRegex, getNewFailures(results));

  fs.writeFileSync("docs/index.md", fileContents);
}

function updateWebpage() {
  log.setLogLevel(log.logLevels.verbose);

  // Extract cl arguments
  const clArgs = process.argv.slice(2);

  if (clArgs.length !== 1) {
    log.error("Incorrect number of arguments");
    process.exit(1);
  }
  let results;
  try {
    results = JSON.parse(fs.readFileSync(clArgs[0], "utf-8"));
    log.verbose(`${log.underline}Test results${log.resetStyling}`);
    log.verbose(results);
  } catch (ee) {
    log.error(clArgs[0] + " : " + ee.message);
    process.exit(1);
  }
  populateWebpage(results);
}

updateWebpage();

process.exit(0);
