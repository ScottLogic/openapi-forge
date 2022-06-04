const fs = require("fs");
const URL = require("url").URL;
const path = require("path");

const Handlebars = require("handlebars");
const prettier = require("prettier");
const minimatch = require("minimatch");
const fetch = require("node-fetch");

const helpers = require("./helpers");
const transformers = require("./transformers");

Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

async function loadSchema(schemaPathOrUrl) {
  try {
    // this throws if the URL is not valid
    new URL(schemaPathOrUrl);
    const response = await fetch(schemaPathOrUrl);
    return await response.json();
  } catch (err) {
    return JSON.parse(fs.readFileSync(schemaPathOrUrl, "utf-8"));
  }
}

async function generate(schemaPathOrUrl, templateProject, options) {
  const templatePath = templateProject + "/template";
  const helpersPath = templateProject + "/helpers";

  // load the OpenAPI schema
  const schema = await loadSchema(schemaPathOrUrl);

  // transform
  Object.values(transformers).forEach((transformer) => {
    transformer(schema);
  });

  // load any template helpers
  const helpers = fs.readdirSync(helpersPath);
  helpers.forEach((helper) => {
    const helperPath = path.join(
      path.resolve("."),
      templateProject,
      "/helpers",
      helper
    );
    Handlebars.registerHelper(helper.slice(0, -3), require(helperPath));
  });

  // iterate over all the files in the folder template
  const templates = fs.readdirSync(templatePath);
  templates.forEach((file) => {
    if (minimatch(file, options.exclude)) {
      return;
    }

    const source = fs.readFileSync(`${templatePath}/${file}`, "utf-8");

    // TODO: we should only pass files with the extension "handlebars" through the Handlebars engine
    const template = Handlebars.compile(source);
    let result = template(schema);

    // try to prettify the result
    try {
      result = prettier.format(result, { parser: "typescript" });
    } catch {}

    fs.mkdirSync(options.output, { recursive: true });
    fs.writeFileSync(
      `${options.output}/${file.replace(".handlebars", "")}`,
      result
    );
  });
}

module.exports = generate;
