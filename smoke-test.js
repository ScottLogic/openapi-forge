const shell = require("shelljs");

const checkoutRepoToPath = (repoPath, destPath, returnPath) => {
  shell.exec(`git clone ${repoPath} ${destPath}`);
  shell.cd(destPath);
  shell.exec("npm install");
  shell.cd(returnPath);
};

// The different commands require the generators to be installed in different locations
const jsGeneratorLocation = "smoke-js";
const tsGeneratorLocation = "smoke-ts";

checkoutRepoToPath(
  "https://github.com/ScottLogic/openapi-forge-javascript",
  jsGeneratorLocation,
  ".."
);
checkoutRepoToPath(
  "https://github.com/ScottLogic/openapi-forge-typescript",
  `../${tsGeneratorLocation}`,
  "../openapi-forge"
);

// Smoke test generator-options command
const generatorOptionsStdout = shell.exec(
  `node ./src/index.js generator-options ${jsGeneratorLocation}`
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
  `node ./src/index.js test-generators --generators ${tsGeneratorLocation} --format json --logLevel quiet`
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
  `node ./src/index.js forge https://petstore3.swagger.io/api/v3/openapi.json https://github.com/ScottLogic/openapi-forge-csharp.git -o ${tempFolder}`
).stdout;
if (forgeStdout.includes("SUCCESSFUL")) {
  console.log("forge command succeeded");
} else {
  console.error("forge command failed.");
  process.exitCode = 1;
}

shell.rm("-rf", jsGeneratorLocation, `../${tsGeneratorLocation}`, tempFolder);
