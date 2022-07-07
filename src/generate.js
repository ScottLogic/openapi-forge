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
const SwaggerParser = require("@apidevtools/swagger-parser");

Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

function isUrl(maybeUrl) {
  try {
    new URL(maybeUrl);
    return true;
  } catch (err) {
    return false;
  }
}

// loads the schema, either from a local file or from a remote URL
async function loadSchema(schemaPathOrUrl) {
  const isYml =
    schemaPathOrUrl.endsWith(".yml") || schemaPathOrUrl.endsWith(".yaml");
  const schema = isUrl(schemaPathOrUrl)
    ? await fetch(schemaPathOrUrl).then((d) => {
        if (d.status === 200) {
          return d.text();
        } else {
          throw new Error(`Failed to load schema from ${schemaPathOrUrl}`);
        }
      })
    : fs.readFileSync(schemaPathOrUrl, "utf-8");
  return isYml ? parse(schema) : JSON.parse(schema);
}

async function isValidSchema(schema) {
  try {
    await SwaggerParser.validate(schema);
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
}

async function generate(schemaLocation, templateProject, options) {
  const templatePath = templateProject + "/template";

  // load the OpenAPI schema
  const schema =
    typeof schemaLocation === "object"
      ? schemaLocation
      : await loadSchema(schemaLocation);

  // validate OpenAPI schema
  if (
    !options.skipValidation &&
    !(await isValidSchema(JSON.parse(JSON.stringify(schema))))
  ) {
    console.error(`Schema failed validation. See errors above.`);
    return;
  }

  // transform
  Object.values(transformers).forEach((transformer) => {
    transformer(schema);
  });

  // add options to the schema, making them available to templates
  schema._options = options;

  const handlebarsLoader = (pathToLoad, registrationMethod) => {
    const items = fs.readdirSync(pathToLoad);
    items.forEach((item) => {
      const itemPath = path.join(path.resolve("."), pathToLoad, item);
      Handlebars[registrationMethod](item.split(".")[0], require(itemPath));
    });
  };
  handlebarsLoader(templateProject + "/helpers", "registerHelper");
  handlebarsLoader(templateProject + "/partials", "registerPartial");

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
    } catch {}

    fs.mkdirSync(options.output, { recursive: true });
    fs.writeFileSync(
      `${options.output}/${file.replace(".handlebars", "")}`,
      result
    );
  });
}

module.exports = generate;
