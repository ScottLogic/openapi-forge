#! /usr/bin/env node

const { Command } = require("commander");
const generate = require("./generate");
var packageJson = require("../package.json");
const testGenerators = require("./testGenerators");
const program = new Command();

program.name("openapi-forge");

program.version(packageJson.version);

program
  .command("forge")
  .description(
    "Forge the API client from an OpenAPI specification. This command takes an OpenAPI schema, and uses the given generator to create a client library."
  )
  .argument("<schema>", "An OpenAPI schema, either a URL or a file path")
  .argument(
    "<generator>",
    "Git URL, file path or npm package of a language-specific generator"
  )
  .option(
    "-e, --exclude <glob>",
    "A glob pattern that excludes files from the generator in the output",
    ""
  )
  .option(
    "-o, --output <path>",
    "The path where the generated client API will be written",
    "."
  )
  .option("-s, --skipValidation", "Skip schema validation")
  .option(
    "-l, --logLevel <level>",
    "Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose ('verbose', 'v' or '2')",
    "1"
  )
  .action(async (schema, template, options) => {
    generate(schema, template, options);
  });

program
  .command("test-generators")
  .description("Test language specific generators.")
  .option(
    "-g, --generators <gens>",
    "Narrow down the generators to test. Each letter is a generator, combine letters to test multiple generators, options are: c (CSharp), t (TypeScript)", //h (PHP), p (Python), j (Java), s (JavaScript)
    "ct"
  )
  .option(
    "-c, --csharp <csharpPath>",
    "Sets the location of the CSharp generator. Default is a directory named 'openapi-forge-csharp' in the same location as openapi-forge",
    "./openapi-forge-csharp"
  )
  .option(
    "-t, --typescript <typescriptPath>",
    "Sets the location of the TypeScript generator. Default is a directory named 'openapi-forge-typescript' in the same location as openapi-forge",
    "./openapi-forge-typescript"
  )
  .option(
    "-l, --logLevel <level>",
    "Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose ('verbose', 'v' or '2')",
    "1"
  )
  .option(
    "-o, --outputFile [file]",
    `Writes the testing results to a JSON file, defaults to "${testGenerators.defaultResultFile}"`
  )
  .action(async (options) => {
    testGenerators.testGenerators(options);
  });

program.parse();
