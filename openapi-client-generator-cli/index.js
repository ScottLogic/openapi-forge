const { Command } = require("commander");
const generate = require("./generate");
const program = new Command();

program.name("openapi-generator");

program
  .command("generate")
  .description("Generate the client API from an OpenAPI specification")
  .argument("<schema>", "OpenAPI schema")
  .argument("<template>", "Path to the template project")
  .option(
    "-o, --output <path>",
    "The path where the generated client API is located",
    "."
  )
  .action((schema, template, options) => {
    generate(schema, template, options.output);
  });

program.parse();
