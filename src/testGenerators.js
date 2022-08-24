const fs = require("fs");
const URL = require("url").URL;
const path = require("path");
const os = require("os");

const shell = require("shelljs");
const log = require("./log");

async function testGenerators(options) {
    log.setLogLevel(options.logLevel);
    let shellOptions = {};
    if(log.getLogLevel() != (log.logLevels.verbose)) shellOptions.silent = true;
    let temporaryFolder;
    let generatorPath;
    // const currentPath = process.cwd();
    try {
        //TODO: SJH look into 'async' for shell.js maybe async test all generators?
        shell.cd(__dirname, shellOptions);
        if(options.generators.includes("t")) {
            generatorPath = options.typescript;
            if (!fs.existsSync(generatorPath)) {
                generatorPath = temporaryFolder = fs.mkdtempSync(
                    path.join(os.tmpdir(), "generator")
                );
                shell.exec(`git clone https://github.com/ScottLogic/openapi-forge-typescript.git ${generatorPath}`, shellOptions);
            }
            shell.cd(generatorPath, shellOptions);
            const out = shell.exec(`npm run test`, shellOptions).stdout.split("\n");
            //scenarios line
            console.log(out[out.length-4]);
            //steps line
            console.log(out[out.length-3]);
            //duration line
            console.log(out[out.length-2]);
            shell.cd(__dirname, shellOptions);
        }
    } catch(e) {
        console.log(e.message);
    } finally {
        if (temporaryFolder) {
            fs.rmSync(temporaryFolder, { recursive: true });
        }
    }
}

module.exports = testGenerators;
