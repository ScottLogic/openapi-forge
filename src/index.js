#! /usr/bin/env node

const { Command } = require("commander");
const generate = require("./generate");
const program = new Command();

program.name("openapi-generator");

program
  .command("forge")
  .description("Forge the API client from an OpenAPI specification. This command takes an OpenAPI scheme, and uses the given generator to create a client library.")
  .argument("<schema>", "An OpenAPI schema, either a URL or a file path")
  .argument("<generator>", "Path to the language-specific generator")
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
  .option(
    "-s, --skipValidation",
    "Skip schema validation"
  )
  .action(async (schema, template, options) => {
    generate(schema, template, options);
  });

program.parse();
