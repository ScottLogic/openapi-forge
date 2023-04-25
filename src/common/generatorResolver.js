const fs = require("fs");
const path = require("path");
const os = require("os");
const URL = require("url").URL;
const log = require("./log");
const {
  gitClone,
  listInstalledPackages,
  installPackage,
  installDependencies,
  uninstallPackage,
} = require("./shell").shellWithOptions(log.shellOptions);

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
  return {
    path: generatorPath,
    dispose: () => {
      cleanup();
    },
  };
}

function cleanup() {
  if (temporaryFolder) {
    log.verbose(`Removing temporary folder ${temporaryFolder}`);
    fs.rmSync(temporaryFolder, { recursive: true });
    temporaryFolder = null;
  }
  if (npmPackage) {
    uninstallPackage(npmPackage, __dirname);
    npmPackage = null;
  }
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
  gitClone(generatorPathOrUrl, temporaryFolder);

  log.verbose("Installing generator dependencies");
  installDependencies(temporaryFolder);
  return temporaryFolder;
}

function installGeneratorFromNPM(generatorPathOrUrl) {
  log.verbose(`Checking if npm package ${generatorPathOrUrl} is installed`);
  if (
    !listInstalledPackages(__dirname).stdout.match(
      new RegExp(`^.*${generatorPathOrUrl}@\\d+\\.\\d+\\.\\d+$`, "m")
    )
  ) {
    npmPackage = generatorPathOrUrl;
    log.verbose(
      `npm package ${generatorPathOrUrl} doesn't exist, installing package`
    );
    if (installPackage(__dirname, generatorPathOrUrl).code !== 0) {
      throw new Error(
        `No local generator or npm package found using '${generatorPathOrUrl}', check that it points to a local generator or npm package`
      );
    }
  }
  const generatorPath = path.resolve(
    __dirname,
    path.join("..", "node_modules", generatorPathOrUrl)
  );
  log.verbose("Installing generator dependencies");
  installDependencies(generatorPath);
  return generatorPath;
}

module.exports = {
  isUrl,
  getGenerator,
};
