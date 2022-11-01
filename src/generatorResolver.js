const fs = require("fs");
const path = require("path");
const os = require("os");
const shell = require("shelljs");

const log = require("./log");

let npmPackage;
let temporaryFolder;

function cloneGenerator(generatorPathOrUrl, installDependencies) {
  // if the generator is specified as a git URL, clone it into a temporary directory
  if (!generatorPathOrUrl.endsWith(".git")) {
    throw new Error(
      `Generator URL ${generatorPathOrUrl} does not end with ".git", check that the URL points to a valid generator`
    );
  }
  temporaryFolder = fs.mkdtempSync(path.join(os.tmpdir(), "generator"));
  log.verbose(
    `Cloning generator from ${generatorPathOrUrl} to ${temporaryFolder}`
  );
  shell.exec(
    `git clone ${generatorPathOrUrl} ${temporaryFolder}`,
    log.shellOptions
  );
  if (installDependencies) {
    const currentPath = process.cwd();
    shell.cd(temporaryFolder, log.shellOptions);
    log.verbose("Installing generator dependencies");
    shell.exec(`npm pkg delete scripts.prepare`, log.shellOptions); // This line removes husky script that causes testing TypeScript failure
    shell.exec(`npm install`, log.shellOptions);
    shell.cd(currentPath, log.shellOptions);
  }
  return temporaryFolder;
}

function installGeneratorFromNPM(generatorPathOrUrl) {
  log.verbose(`Checking if npm package ${generatorPathOrUrl} is installed`);
  const currentPath = process.cwd();
  shell.cd(__dirname, log.shellOptions);
  if (
    !shell
      .exec(`npm list --depth=0`, log.shellOptions)
      .stdout.match(
        new RegExp(`^.*${generatorPathOrUrl}@\\d+\\.\\d+\\.\\d+$`, "m")
      )
  ) {
    npmPackage = generatorPathOrUrl;
    log.verbose(
      `npm package ${generatorPathOrUrl} doesn't exist, installing package`
    );
    if (
      shell.exec(`npm install ${generatorPathOrUrl}`, log.shellOptions).code !==
      0
    ) {
      throw new Error(
        `No local generator or npm package found using '${generatorPathOrUrl}', check that it points to a local generator or npm package`
      );
    }
  }
  shell.cd(currentPath, log.shellOptions);
  return path.resolve(__dirname, `..\\node_modules\\${generatorPathOrUrl}`);
}

function cleanup() {
  if (temporaryFolder) {
    log.verbose(`Removing temporary folder ${temporaryFolder}`);
    fs.rmSync(temporaryFolder, { recursive: true });
    temporaryFolder = null;
  }
  if (npmPackage) {
    const currentPath = process.cwd();
    shell.cd(__dirname, log.shellOptions);
    log.verbose(`Removing npm package ${npmPackage}`);
    shell.exec(`npm uninstall ${npmPackage}`, log.shellOptions);
    shell.cd(currentPath, log.shellOptions);
    npmPackage = null;
  }
}

module.exports = {
  cloneGenerator,
  installGeneratorFromNPM,
  cleanup,
};
