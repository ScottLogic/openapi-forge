const fs = require("fs");
const path = require("path");
const os = require("os");
const shell = require("shelljs");

const log = require("./log");
const testResultParser = require("./testResultParser");
const generatorResolver = require("./generatorResolver");

function checkLocalGenerator(language, languageLetter, languageString) {
    if(process.argv.includes(languageLetter) || process.argv.includes(languageString)) {
        throw new Error(
            `No local ${language} generator found at ${generatorPath}.`
        );
    }
}

function setupAndStartTests() {
    log.verbose("Installing generator dependencies");
    shell.exec(`npm install`, shellOptions);

    log.standard("Starting tests");
    const test = shell.exec(`npm run test`, shellOptions);
    return test.stdout.split("\n");
}

async function testGenerators(options) {
    let temporaryFolder;
    let generatorPath;
    let featurePath;
    let basePath;
    let resultArray = {};

    let shellOptions = {};
    log.setLogLevel(options.logLevel);
    if(!log.isVerbose()) shellOptions.silent = true;

    const typescript = options.generators.includes("t");
    const csharp = options.generators.includes("c");
    if(!typescript && !csharp) {
        throw new Error(
            `No language to test. Please provide a language that you would like to test.`
        );
    }

    shell.cd(__dirname, shellOptions);
    if(typescript) {
        // Test TypeScript generator
        try {
            log.standard(`\n${log.bold}${log.underline}TypeScript${log.resetStyling}`);
            featurePath = "../openapi-forge/features/*.feature";
            basePath = "../../../openapi-forge/src/generate";
            generatorPath = options.typescript;

            log.standard(`Loading TypeScript generator from '${generatorPath}'`);

            // Check for local Typescript generator.
            if (!fs.existsSync(generatorPath)) {
                log.verbose("Cannot find TypeScript generator");

                checkLocalGenerator("TypeScript", "-t", "--typescript");

                // Local generator does not exist, clone from GitHub to temporary location
                generatorPath = generatorResolver.cloneGenerator("https://github.com/ScottLogic/openapi-forge-typescript.git");

                // Get original paths
                featurePath = path.relative(generatorPath, path.join(__dirname, "../features/*.feature")).replaceAll("\\", "/");
                basePath = path.relative(path.join(generatorPath, "features/support"), path.join(__dirname, "../src/generate")).replaceAll("\\", "/");
            }

            log.standard("Replacing paths in TypeScript generator");

            log.verbose("Replacing path to .feature files");
            shell.cd(generatorPath, shellOptions);
            const orgFeaturePath = shell.grep(/^const\sfeaturePath\s=\s".*";/, "cucumber.js").toString().replace("\r\n", "");
            shell.sed("-i", /^const\sfeaturePath\s=\s".*";/, `const featurePath = "${featurePath}";`, "cucumber.js");

            log.verbose("Replacing path to generate.js");
            shell.cd("features/support", shellOptions);
            const orgBasePath = shell.grep(/^const\sgenerate\s=\srequire\(".*"\);/, "base.ts").toString().replace("\r\n", "");
            shell.sed("-i", /^const\sgenerate\s=\srequire\(".*"\);/, `const generate = require\("${basePath}"\);`, "base.ts");

            const stdout = setupAndStartTests();

            resultArray.TypeScript = testResultParser.parseTypeScript(stdout[stdout.length-2], stdout[stdout.length-4]);

            if(!temporaryFolder) {
                log.standard("Setting paths to back to original values");
                shell.sed("-i", /^const\sgenerate\s=\srequire\(".*"\);/, orgBasePath, "base.ts");
                shell.cd("../../", shellOptions);
                shell.sed("-i", /^const\sfeaturePath\s=\s".*";/, orgFeaturePath, "cucumber.js");
            }

            shell.cd(__dirname, shellOptions);
            log.standard("TypeScript testing complete");

        } catch(exception) {
            log.logFailedTesting("TypeScript", exception);
        } finally {
            generatorResolver.cleanup();
        }
    }
    if(csharp) {
        // Test CSharp generator
        try {
            log.standard(`\n${log.bold}${log.underline}CSharp${log.resetStyling}`);
            featurePath = "$(ProjectDir)..\\..\\..\\openapi-forge\\features\\*.feature";
            generatorPath = options.csharp;

            log.standard(`Loading CSharp generator from '${generatorPath}'`);

            // Check for local CSharp generator.
            if (!fs.existsSync(generatorPath)) {
                log.verbose("Cannot find CSharp generator");

                checkLocalGenerator("CSharp", "-c", "--csharp");

                // Local generator does not exist, clone from GitHub to temporary location
                generatorPath = generatorResolver.cloneGenerator("https://github.com/ScottLogic/openapi-forge-csharp.git");

                // get original paths
                featurePath = "$(ProjectDir)" + path.relative(path.join(generatorPath, "tests/FeaturesTests"), path.join(__dirname, "..\\features\\*.feature"));
            } else {
                if (fs.existsSync(path.join(generatorPath, "tests/FeaturesTests/bin"))) {
                    fs.rmSync(path.join(generatorPath, "tests/FeaturesTests/bin"), { recursive: true, force: true });
                }
            }

            log.standard("Replacing paths in CSharp generator");
            
            log.verbose("Replacing path to .feature files");
            shell.cd(path.join(generatorPath, "tests/FeaturesTests"), shellOptions);
            const orgFeaturePath = shell.grep(/^        <FeatureFiles Include=".*" \/>/, "FeaturesTests.csproj").toString().replace("\r\n", "");
            shell.sed("-i", /^        <FeatureFiles Include=".*" \/>/, `        <FeatureFiles Include="${featurePath}" />`, "FeaturesTests.csproj");
           
            const stdout = setupAndStartTests();

            resultArray.CSharp = testResultParser.parseCSharp(stdout[stdout.length-2]);

            if(!temporaryFolder) {
                log.standard("Setting paths to back to original values");
                shell.sed("-i", /^        <FeatureFiles Include=".*" \/>/, orgFeaturePath, "FeaturesTests.csproj");
            }

            shell.cd(__dirname, shellOptions);
            log.standard("CSharp testing complete");

        } catch(exception) {
            log.logFailedTesting("CSharp", exception);
        } finally {
            generatorResolver.cleanup();
        }
    }
    //Present the results of the testing
    if(Object.keys(resultArray).length) {
        if(!log.isQuiet()) console.table(resultArray);
    }
}

module.exports = testGenerators;
