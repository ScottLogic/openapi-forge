const fs = require("fs");
const path = require("path");
const os = require("os");
const shell = require("shelljs");

const log = require("./log");

//TODO: MJH do we need a loading bar or spinner? These tests take up to 60secs on my machine

//TODO: SJH if give custom location, go from directory that the command was made not the file location.

function Result(scenarios, passed, skipped, undefined, failed, time) {
    this.scenarios = isNaN(scenarios) ? 0 : scenarios;
    this.passed = isNaN(passed) ? 0 : passed;
    this.skipped = isNaN(skipped) ? 0 : skipped;
    this.undefined = isNaN(undefined) ? 0 : undefined;
    this.failed = isNaN(failed) ? 0 : failed;
    this.time = time;
}

async function testGenerators(options) {
    log.setLogLevel(options.logLevel);
    const typescript = options.generators.includes("t");
    const csharp = options.generators.includes("c");
    if(!typescript && !csharp) {
        throw new Error(
            `No language to test. Please provide a language that you would like to test.`
        );
    }
    let shellOptions = {};
    if(!log.isVerbose()) shellOptions.silent = true;
    let temporaryFolder;
    let generatorPath;
    let featurePath;
    let basePath;
    let resultArray = {};
    // const currentPath = process.cwd();
    shell.cd(__dirname, shellOptions);
    if(typescript) {
        try {
            featurePath = "../openapi-forge/features/*.feature";
            basePath = "../../../openapi-forge/src/generate";
            // Test TypeScript generator
            generatorPath = options.typescript;
            if (!fs.existsSync(generatorPath)) {
                log.verbose("Cannot find TypeScript generator");
                if(process.argv.includes("-t") || process.argv.includes("--typescript")) {
                    throw new Error(
                        `No local language generator found at ${generatorPath}.`
                    );
                }
                // Local generator does not exist, clone from GitHub
                generatorPath = temporaryFolder = fs.mkdtempSync(
                    path.join(os.tmpdir(), "generator")
                );
                //TODO: Change URL back to ScottLogic
                log.verbose(`Cloning generator from https://github.com/jhowlett-scottlogic/openapi-forge-typescript.git to ${generatorPath}`);
                shell.exec(`git clone https://github.com/jhowlett-scottlogic/openapi-forge-typescript.git ${generatorPath}`, shellOptions);
                // Get original paths
                featurePath = path.relative(generatorPath, path.join(__dirname, "../features/*.feature")).replaceAll("\\", "/");
                basePath = path.relative(path.join(generatorPath, "features/support"), path.join(__dirname, "../src/generate")).replaceAll("\\", "/");
            }
            shell.cd(generatorPath, shellOptions);
            log.verbose("Replacing path to .feature files");
            const orgFeaturePath = shell.grep(/^const\sfeaturePath\s=\s".*";/, "cucumber.js").toString().replace("\r\n", "");
            shell.sed("-i", /^const\sfeaturePath\s=\s".*";/, `const featurePath = "${featurePath}";`, "cucumber.js");

            shell.cd("features/support", shellOptions);

            log.verbose("Replacing path to generate.js");
            const orgBasePath = shell.grep(/^const\sgeneratePath\s=\s".*";/, "base.ts").toString().replace("\r\n", "");
            shell.sed("-i", /^const\sgeneratePath\s=\s".*";/, `const generatePath = "${basePath}";`, "base.ts");
            
            log.verbose("Installing generator dependencies");
            shell.exec(`npm install`, shellOptions);

            // Run tests
            log.verbose("Starting tests");
            const test = shell.exec(`npm run test`, shellOptions);
            const stdout = test.stdout.split("\n");
            const stdoutLength = stdout.length;

            let result = stdout[stdoutLength-2].match(/^(\d+)m(\d+)\.\d+s/);

            let time = "";
            if((result[1] !== "0") && (result[1] !== "")) { time = `${result[1]}m`}
            time = `${time}${result[2]}s` 

            result = stdout[stdoutLength-4].match(/^(\d+)\sscenarios?\s\(((\d+)\sfailed)?(,\s)?((\d+)\sundefined)?(,\s)?((\d+)\spassed)?\)/);
            
            resultArray.TypeScript = new Result(parseInt(result[1]), parseInt(result[9]), 0, parseInt(result[6]), parseInt(result[3]), time);

            //duration line
            //format of line: "0m11.371s"
            //  console.log(stdout[stdoutLength-2]);
            if(!temporaryFolder) {
                // Using local version, set paths back to original values
                shell.sed("-i", /^const\sgeneratePath\s=\s".*";/, orgBasePath, "base.ts");
                shell.cd("../../", shellOptions);
                shell.sed("-i", /^const\sfeaturePath\s=\s".*";/, orgFeaturePath, "cucumber.js");
            }
            shell.cd(__dirname, shellOptions);
        } catch(e) {
            console.log("ERROR:" + e.message);
        } finally {
            if (temporaryFolder) {
                fs.rmSync(temporaryFolder, { recursive: true });
                temporaryFolder = null;
            }
        }
    }
    if(csharp) {
        try {
            featurePath = "$(ProjectDir)..\\..\\..\\openapi-forge\\features\\*.feature";
            generatorPath = options.csharp;
            if (!fs.existsSync(generatorPath)) {
                log.verbose("Cannot find CSharp generator");
                if(process.argv.includes("-c") || process.argv.includes("--csharp")) {
                    throw new Error(
                        `No local language generator found at ${generatorPath}.`
                    );
                }
                generatorPath = temporaryFolder = fs.mkdtempSync(
                    path.join(os.tmpdir(), "generator")
                );
                shell.exec(`git clone https://github.com/ScottLogic/openapi-forge-csharp.git ${generatorPath}`, shellOptions);
                featurePath = "$(ProjectDir)" + path.relative(path.join(generatorPath, "tests/FeaturesTests"), path.join(__dirname, "..\\features\\*.feature"));
            } else {
                if (fs.existsSync(path.join(generatorPath, "tests/FeaturesTests/bin"))) {
                    fs.rmSync(path.join(generatorPath, "tests/FeaturesTests/bin"), { recursive: true, force: true });
                }
            }
            shell.cd(path.join(generatorPath, "tests/FeaturesTests"), shellOptions);

            // Change path to feature files. 
            const orgFeaturePath = shell.grep(/^        <FeatureFiles Include=".*" \/>/, "FeaturesTests.csproj").toString().replace("\r\n", "");
            shell.sed("-i", /^        <FeatureFiles Include=".*" \/>/, `        <FeatureFiles Include="${featurePath}" />`, "FeaturesTests.csproj");
            shell.exec(`npm install`, shellOptions);

            const test = shell.exec(`npm run test`, shellOptions);

            const stdout = test.stdout.split("\n");

            let match = stdout[stdout.length-2].match(/Failed:\s+(\d+),\sPassed:\s+(\d+),\sSkipped:\s+(\d+),\sTotal:\s+(\d+),\sDuration:\s+(.*)\s-\sFeaturesTests.dll\s\(net6\.0\)/);
            
            resultArray.CSharp = new Result(parseInt(match[4]), parseInt(match[2]), parseInt(match[3]), 0, parseInt(match[1]), match[5].replace(" ", ""));
            
            if(!temporaryFolder) {
                shell.sed("-i", /^        <FeatureFiles Include=".*" \/>/, orgFeaturePath, "FeaturesTests.csproj");
            }
            shell.cd(__dirname, shellOptions);
        } catch(e) {
            console.log("ERROR: " + e.message);
        } finally {
            if (temporaryFolder) {
                fs.rmSync(temporaryFolder, { recursive: true });
                temporaryFolder = null;
            }
        }
    }
    if(!log.isQuiet()) console.table(resultArray);
}

module.exports = testGenerators;
