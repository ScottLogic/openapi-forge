const fs = require("fs");
const path = require("path");
const os = require("os");
const shell = require("shelljs");
const URL = require("url").URL;

const log = require("./log");

let npmPackage;
let temporaryFolder;

function isUrl(maybeUrl) {
  try {
    new URL(maybeUrl);
    return true;
  } catch (err) {
    return false;
  }
}

function getGenerator(generatorPathOrUrl) {
  let generatorPath = path.resolve(generatorPathOrUrl);
  if (!fs.existsSync(generatorPath)) {
    if (isUrl(generatorPathOrUrl)) {
      generatorPath = cloneGenerator(generatorPathOrUrl);
    } else {
      generatorPath = installGeneratorFromNPM(generatorPathOrUrl);
    }
  }
  return generatorPath;
}

function cloneGenerator(generatorPathOrUrl) {
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
  const currentPath = process.cwd();
  shell.cd(temporaryFolder, log.shellOptions);
  installGeneratorDependencies();
  shell.cd(currentPath, log.shellOptions);
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
  const generatorPath = path.resolve(
    __dirname,
    path.join("..", "node_modules", generatorPathOrUrl)
  );
  shell.cd(generatorPath, log.shellOptions);
  installGeneratorDependencies();
  shell.cd(currentPath, log.shellOptions);
  return generatorPath;
}

function installGeneratorDependencies() {
  log.verbose("Installing generator dependencies");
  shell.exec(`npm pkg delete scripts.prepare`, log.shellOptions); // Do not run husky preparation script as it will cause unnecessary errors
  shell.exec(`npm install`, log.shellOptions);
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
  isUrl,
  getGenerator,
  cleanup,
};
