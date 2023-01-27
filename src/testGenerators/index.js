const { Option } = require("commander");
const testGenerators = require("./testGenerators");

const testGeneratorsCommand = function (program) {
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
};

module.exports = testGeneratorsCommand;
