const fs = require("fs");
const path = require("path");

const { Option, Command } = require("commander");

const generatorResolver = require("../common/generatorResolver");

const generatorOptionsPrefix = "generator.";

async function generatorOptions(generatorPathOrUrl) {
  let optionsHelp = "";
  const generatorPath = generatorResolver.getGenerator(generatorPathOrUrl);
  const configFile = path.join(generatorPath, "config.json");

  if (!fs.existsSync(configFile)) {
    optionsHelp += "The generator has no additional options";
  } else {
    const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
    const options = configToCommanderOptions(config);

    // we use commander to create the formatted help for these options
    const command = new Command();
    options.forEach((option) => command.addOption(option));
    const commanderHelp = command.helpInformation();

    // extract the parts we are interested in
    const lines = commanderHelp.split("\n");
    lines.splice(0, 2);
    lines.splice(lines.length - 2, 2);

    optionsHelp +=
      "This generator has a number of additional options which can be supplied when executing the 'forge' command.\n\n";
    optionsHelp += lines.join("\n");
  }

  generatorResolver.cleanup();

  return optionsHelp;
}

// we use the commander library to parse the command line arguments and provide
// help text. This function converts the config.json file into a set of options
function configToCommanderOptions(config) {
  return Object.keys(config).map((optionName) => {
    const option = config[optionName];
    const commanderOption = new Option(
      `--${generatorOptionsPrefix}${optionName} <value>`
    );
    if (option.description) {
      commanderOption.description = option.description;
    }
    if (option.choices) {
      commanderOption.choices(option.choices);
      commanderOption.default(option.choices[0]);
    }
    return commanderOption;
  });
}

module.exports = {
  generatorOptions,
  configToCommanderOptions,
  generatorOptionsPrefix,
};
