#! /usr/bin/env node

const { Command } = require("commander");
const generate = require("./generate");
const program = new Command();

program.name("openapi-generator");

program
  .command("forge")
  .description("Forge the API client from an OpenAPI specification")
  .argument("<schema>", "An OpenAPI schema, either a URL or a file path")
  .argument("<template>", "Path to the template")
  .option(
    "-e, --exclude <glob>",
    "A glob pattern that excludes files from the output",
    ""
  )
  .option(
    "-o, --output <path>",
    "The path where the generated client API is located",
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
