const { generatorOptionsHelp } = require("./generatorOptions");
const log = require("../common/log");

const generatorOptionsCommand = function (program) {
  program
    .command("generator-options")
    .description(
      "List the options available for a generator. Some generators take additional options that configure their output, this command lists and describes the options available."
    )
    .argument(
      "<generator>",
      "Git URL, file path or npm package of a language-specific generator"
    )
    .option(
      "-l, --logLevel <level>",
      "Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose ('verbose', 'v' or '2')",
      "1"
    )
    .action(async (generator, options) => {
      log.setLogLevel(options.logLevel);
      console.log(await generatorOptionsHelp(generator));
    });
};

module.exports = generatorOptionsCommand;
