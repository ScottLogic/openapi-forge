const fs = require("fs");
const path = require("path");
const os = require("os");
const log = require("./log");
const { isUrl } = require("./util");
const { gitClone, installPackage, installDependencies } =
  require("./shell").shellWithOptions(log.shellOptions);

function validateGenerator(generatorPath) {
  if (!fs.existsSync(generatorPath)) {
    throw new Error(
      `Generator path ${generatorPath} does not exist, check that the path points to a valid generator`
    );
  }
  if (!fs.existsSync(`${generatorPath}/template`)) {
    throw new Error(
      `Generator path ${generatorPath} does not contain a template folder, check that the path points to a valid generator`
    );
  }
}

function getGenerator(generatorPathOrUrl) {
  // if this is a folder, and contains a template sub-folder, assume that the generator
  // has been supplied as a path
  if (fs.existsSync(generatorPathOrUrl)) {
    validateGenerator(generatorPathOrUrl);
    return {
      path: generatorPathOrUrl,
      dispose: () => {},
    };
  }

  // if the generator is specified as a git URL, clone it into a temporary directory
  if (isUrl(generatorPathOrUrl)) {
    const temporaryFolder = fs.mkdtempSync(path.join(os.tmpdir(), "generator"));
    log.verbose(
      `Cloning generator from ${generatorPathOrUrl} to ${temporaryFolder}`
    );
    gitClone(generatorPathOrUrl, temporaryFolder);

    log.verbose("Installing generator dependencies");
    installDependencies(temporaryFolder);
    return {
      path: temporaryFolder,
      dispose: () => {
        log.verbose(`Removing temporary folder ${temporaryFolder}`);
        fs.rmSync(temporaryFolder, { recursive: true });
      },
    };
  }

  // assume that this must be an npm package, installing into a temporary directory
  const temporaryFolder = fs.mkdtempSync(path.join(os.tmpdir(), "generator"));
  log.verbose(`Installing generator from npm into ${temporaryFolder}`);
  installPackage(generatorPathOrUrl, temporaryFolder);

  // NOTE, there is no need to install dependencies, these will automatically be installed
  return {
    path: path.join(temporaryFolder, "node_modules", generatorPathOrUrl),
    dispose: () => {
      log.verbose(`Removing temporary folder ${temporaryFolder}`);
      fs.rmSync(temporaryFolder, { recursive: true });
    },
  };
}

module.exports = { getGenerator };
