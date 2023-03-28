const shell = require("shelljs");
const fs = require("fs");

const checkoutRepoToPath = (repoPath, destPath, returnPath) => {
  const cloneStdout = shell.exec(`git clone ${repoPath} ${destPath}`, {
    silent: true,
  }).stdout;
  shell.cd(destPath);
  const installStdout = shell.exec("npm install", { silent: true }).stdout;
  shell.cd(returnPath);
  return cloneStdout + "\r\n" + installStdout;
};

const jsGeneratorLocation = "smoke-js";
const tsGeneratorLocation = "smoke-ts";

// NOTE: The JS and TS generators are installed in different relative paths because generator-options and test-generators require different relative paths.
const jsInstallStdout = checkoutRepoToPath(
  "https://github.com/ScottLogic/openapi-forge-javascript",
  jsGeneratorLocation,
  ".."
);
const tsInstallStdout = checkoutRepoToPath(
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

// Smoke test test-generators command
const testGeneratorsStdout = shell.exec(
  `node ./src/index.js test-generators --generators ${tsGeneratorLocation} --format json --logLevel quiet`,
  { silent: true }
).stdout;

const { scenarios, passed } =
  JSON.parse(testGeneratorsStdout)[tsGeneratorLocation];

if (scenarios > 0 && scenarios === passed) {
  console.log("test-generators command succeeded");
} else {
  console.error(
    "test-generators command failed. Expected a non-zero number of scenarios that all passed."
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
    testGeneratorsStdout,
    forgeStdout,
  ].join("\r\n")
);
