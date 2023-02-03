const { generatorOptionsHelp } = require("./generatorOptions");

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
    .action(async (generator) => {
      console.log(await generatorOptionsHelp(generator));
    });
};

module.exports = generatorOptionsCommand;
