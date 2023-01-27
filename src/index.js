#! /usr/bin/env node

const { Command } = require("commander");

const packageJson = require("../package.json");
const forgeCommand = require("./forge");
const generatorOptionsCommand = require("./generatorOptions");
const testGeneratorsCommand = require("./testGenerators");
const program = new Command();

program.name("openapi-forge");

program.version(packageJson.version);

forgeCommand(program);
generatorOptionsCommand(program);
testGeneratorsCommand(program);

program.parse();
