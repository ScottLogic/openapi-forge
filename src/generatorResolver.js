const fs = require("fs");
const path = require("path");
const os = require("os");
const shell = require("shelljs");

const log = require("./log");

let npmPackage;
let temporaryFolder;

function cloneGenerator(generatorPathOrUrl) {  // if the generator is specified as a git URL, clone it into a temporary directory
    if (generatorPathOrUrl.endsWith(".git")) {
        temporaryFolder = fs.mkdtempSync(
            path.join(os.tmpdir(), "generator")
        );
        log.verbose(`Cloning generator from ${generatorPathOrUrl} to ${temporaryFolder}`);
        shell.exec(`git clone ${generatorPathOrUrl} ${temporaryFolder}`, {silent:true});
    } else {
        throw new Error(
            `Generator URL ${generatorPathOrUrl} does not end with ".git", check that the URL points to a valid generator`
        );
    }
    return temporaryFolder;
}

function installGeneratorFromNPM(generatorPathOrUrl) {
    log.verbose(`Checking if npm package ${generatorPathOrUrl} is installed`);
    const currentPath = process.cwd();
    shell.cd(__dirname, {silent:true});
    if (!shell.exec(`npm list --depth=0`, {silent:true}).stdout.match(new RegExp(`^\\+--.${generatorPathOrUrl}@\\d+\.\\d+\.\\d+$`, 'm'))) {
        npmPackage = generatorPathOrUrl;
        log.verbose(`npm package ${generatorPathOrUrl} doesn't exist, installing package`);
        if (shell.exec(`npm install ${generatorPathOrUrl}`, {silent:true}).code !== 0) {
        throw new Error(
            `No local generator or npm package found using '${generatorPathOrUrl}', check that it points to a local generator or npm package`
        );
        }
    }
    shell.cd(currentPath, {silent:true});   
    return path.resolve(__dirname, `..\\node_modules\\${generatorPathOrUrl}`);
}

function cleanup() {
    if (temporaryFolder) {
        log.verbose(`Removing temporary folder ${temporaryFolder}`);
        fs.rmSync(temporaryFolder, { recursive: true });
        temporaryFolder = null;
      }
      if(npmPackage) {
        const currentPath = process.cwd();
        shell.cd(__dirname, {silent:true});
        log.verbose(`Removing npm package ${npmPackage}`);
        shell.exec(`npm uninstall ${npmPackage}`, {silent:true});
        shell.cd(currentPath, {silent:true});
        npmPackage = null;
      }
}

module.exports = {
    cloneGenerator,
    installGeneratorFromNPM,
    cleanup
};