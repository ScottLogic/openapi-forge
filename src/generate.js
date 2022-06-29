const fs = require("fs");
const URL = require("url").URL;
const path = require("path");

const Handlebars = require("handlebars");
const prettier = require("prettier");
const minimatch = require("minimatch");
const fetch = require("node-fetch");
const { parse } = require("yaml");

const helpers = require("./helpers");
const transformers = require("./transformers");


Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

// loads the schema, either from a local file or from a remote URL
async function loadSchema(schemaPathOrUrl) {
  const isYml =
    schemaPathOrUrl.endsWith(".yml") || schemaPathOrUrl.endsWith(".yaml");
  try {
    // this throws if the URL is not valid
    new URL(schemaPathOrUrl);
    const response = await fetch(schemaPathOrUrl);
    if (isYml) {
      const responseText = await response.text();
      return parse(responseText);
    } else {
      return await response.json();
    }
  } catch (err) {
    const file = fs.readFileSync(schemaPathOrUrl, "utf-8");
    if (isYml) {
      return parse(file);
    } else {
      return JSON.parse(file);
    }
  }
}

const schemaValidationUrl = 'https://validator.swagger.io/validator/debug';
async function isValidSchema(schema) {
  const response = await fetch(schemaValidationUrl, {
    method: 'post',
    body: JSON.stringify(schema),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const data = await response.json();
  if (data.schemaValidationMessages && data.schemaValidationMessages.length > 0) {
    for (const error of data.schemaValidationMessages) {
      console.log(error);
    }
    return false;
  }

  return true;
}

async function generate(schemaLocation, templateProject, options) {
  const templatePath = templateProject + "/template";
  const helpersPath = templateProject + "/helpers";

  // load the OpenAPI schema
  const schema =
    typeof schemaLocation === "object"
      ? schemaLocation
      : await loadSchema(schemaLocation);

  // validate OpenAPI schema
  if (!options.skipValidation && !(await isValidSchema(schema))) {
    console.error(`Schema failed validation (${schemaValidationUrl}). See errors above.`);
    return;
  }

  // transform
  Object.values(transformers).forEach((transformer) => {
    transformer(schema);
  });

  // add options to the schema, making them available to templates
  schema._options = options;

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
    if (options.exclude && minimatch(file, options.exclude)) {
      return;
    }

    const source = fs.readFileSync(`${templatePath}/${file}`, "utf-8");

    // TODO: we should only pass files with the extension "handlebars" through the Handlebars engine
    const template = Handlebars.compile(source);
    let result = template(schema);

    // try to prettify the result
    try {
      result = prettier.format(result, { parser: "typescript" });
    } catch { }

    fs.mkdirSync(options.output, { recursive: true });
    fs.writeFileSync(
      `${options.output}/${file.replace(".handlebars", "")}`,
      result
    );
  });
}

module.exports = generate;
