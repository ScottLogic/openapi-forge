#! /usr/bin/env node

const path = require("path");
const fs = require("fs");
const { Command, Option } = require("commander");
const log = require("./log");
const generate = require("./generate");
const generatorResolver = require("./generatorResolver");
const {
  configToCommanderOptions,
  generatorOptions,
  generatorOptionsPrefix,
} = require("./generatorOptions");
const packageJson = require("../package.json");
const testGenerators = require("./testGenerators");
const program = new Command();

program.name("openapi-forge");

program.version(packageJson.version);

const forgeCommand = program
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
  .allowUnknownOption()
  .action(async (schema, generatorPathOrUrl) => {
    const generatorPath = generatorResolver.getGenerator(generatorPathOrUrl);
    const configFile = path.join(generatorPath, "config.json");

    // re-configure the command to generate the API
    forgeCommand.allowUnknownOption(false).action(async (_, __, options) => {
      // set the additional options as environment variables
      const generatorOptions = Object.keys(options).filter((key) =>
        key.startsWith(generatorOptionsPrefix)
      );
      generatorOptions.forEach((option) => {
        const optionName = option.substring(generatorOptionsPrefix.length);
        process.env[optionName] = options[option];
      });

      await generate(schema, generatorPath, options);
      generatorResolver.cleanup();
    });

    // add the additional options from the generator's config.json file
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
      configToCommanderOptions(config).forEach((option) => {
        forgeCommand.addOption(option);
      });
    }

    // parse the command line arguments, and perform generation (on success)
    forgeCommand.parse(process.argv);
  });

program
  .command("generator-options")
  .description(
    "List the options available for a generator. Some generators take additional options that configure their output, this command lists and describes the options available."
  )
  .argument(
    "<generator>",
    "Git URL, file path or npm package of a language-specific generator"
  )
  .action(async (generator) => {
    log.standard(await generatorOptions(generator));
  });

program
  .command("test-generators")
  .description("Test language specific generators.")
  .option(
    "-g, --generators <gens...>",
    "Generators to test, e.g. openapi-forge-typescript"
  )
  .option(
    "-l, --logLevel <level>",
    "Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose ('verbose', 'v' or '2')",
    "1"
  )
  .addOption(
    new Option("-f, --format <format>", "Output format")
      .choices(["table", "json"])
      .default("table")
  )
  .action(async (options) => {
    testGenerators.testGenerators(options);
  });

program.parse();
