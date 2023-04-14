const shell = require("shelljs");
const fs = require("fs");

const jsGeneratorLocation = "smoke-js";
const tsGeneratorLocation = "smoke-ts";

const cloneRepoToPath = (repoPath, destPath, returnPath) => {
  const cloneStdout = shell.exec(`git clone ${repoPath} ${destPath}`, {
    silent: true,
  }).stdout;
  shell.cd(destPath);
  const installStdout = shell.exec("npm install", { silent: true }).stdout;
  const latestVersion = getLatestGitVersionTag(repoPath);
  shell.cd(returnPath);
  return cloneStdout + "\r\n" + latestVersion + "\r\n" + installStdout;
};

const getLatestGitVersionTag = (repoPath) =>
  "Version of " +
  repoPath +
  " installed: " +
  shell.exec(`git tag --sort=committerdate | tail -1`, {
    silent: true,
  }).stdout;

const gitCheckout = (branch) =>
  shell.exec(`git fetch && git checkout ${branch}`, { silent: true }).stdout;

const runTestGenerators = () =>
  JSON.parse(
    shell.exec(
      `node ./src/index.js test-generators --generators ${tsGeneratorLocation} --format json --logLevel quiet`,
      { silent: true }
    ).stdout
  );

// NOTE: The JS and TS generators are installed in different relative paths because generator-options and test-generators require different relative paths.
const jsInstallStdout = cloneRepoToPath(
  "https://github.com/ScottLogic/openapi-forge-javascript",
  jsGeneratorLocation,
  ".."
);
const tsInstallStdout = cloneRepoToPath(
  "https://github.com/ScottLogic/openapi-forge-typescript",
  `../${tsGeneratorLocation}`,
  "../openapi-forge"
);

// Smoke test generator-options command
const generatorOptionsStdout = shell.exec(
  `node ./src/index.js generator-options ${jsGeneratorLocation}`,
  { silent: true }
).stdout;

if (generatorOptionsStdout.includes("moduleFormat")) {
  console.log("generator-options command succeeded");
} else {
  console.error(
    "generator-options command failed. Expected moduleFormat to be an option in the JavaScript generator."
  );
  process.exitCode = 1;
}

// Smoke test test-generators command by comparing the current number of passing tests in the TS generator to the number passing on this PR
const currentCommitName = shell.exec("git rev-parse HEAD", { silent: true });
const checkoutLogs1 = gitCheckout("master");
const previousRun = runTestGenerators();

const { passed: expectedPassed } = previousRun[tsGeneratorLocation];

const checkoutLogs2 = gitCheckout(currentCommitName);
const testGeneratorsStdout = runTestGenerators();

const { scenarios, passed } = testGeneratorsStdout[tsGeneratorLocation];

if (scenarios > 0 && passed >= expectedPassed) {
  console.log("test-generators command succeeded");
} else {
  console.error(
    "test-generators command failed. Expected " +
      expectedPassed +
      " passes but there were only " +
      passed +
      " passes."
  );
  process.exitCode = 1;
}

// Smoke test forge command
const tempFolder = "temp-csharp";
const forgeStdout = shell.exec(
  `node ./src/index.js forge https://petstore3.swagger.io/api/v3/openapi.json https://github.com/ScottLogic/openapi-forge-csharp.git -o ${tempFolder}`,
  { silent: true }
).stdout;
if (forgeStdout.includes("SUCCESSFUL")) {
  console.log("forge command succeeded");
} else {
  console.error("forge command failed.");
  process.exitCode = 1;
}

// Clean up
shell.rm("-rf", jsGeneratorLocation, `../${tsGeneratorLocation}`, tempFolder);

fs.writeFileSync(
  `log.txt`,
  [
    jsInstallStdout,
    tsInstallStdout,
    generatorOptionsStdout,
    "run on master:",
    checkoutLogs1,
    JSON.stringify(previousRun),
    "run on current branch:",
    checkoutLogs2,
    JSON.stringify(testGeneratorsStdout),
    forgeStdout,
  ].join("\r\n")
);
