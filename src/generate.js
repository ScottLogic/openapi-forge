const fs = require("fs");
const URL = require("url").URL;
const path = require("path");
const os = require("os");

const Handlebars = require("handlebars");
const prettier = require("prettier");
const minimatch = require("minimatch");
const fetch = require("node-fetch");
const shell = require("shelljs");
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
    await SwaggerParser.validate(cloneSchema(schema));
  } catch (errors) {
    console.error("Schema validation errors:");
    errors.forEach((error) => {
      console.error(`${error.message} at ${error.instancePath}`);
    });
    return false;
  }

  return true;
}

function cloneSchema(schema) {
  return JSON.parse(JSON.stringify(schema));
}

function validateGenerator(generatorPath) {
  if (!fs.existsSync(generatorPath)) {
    throw new Error(
      `Generator path ${generatorPath} does not exist, check that the path points to a valid generator`
    );
  }

  if (!fs.existsSync(`${generatorPath}/template`)) {
    throw new Error(
      `Generator path ${generatorPath} does not contain a template folder, check that the path points to a valid generator`
    );
  }
}

async function generate(schemaPathOrUrl, generatorUrlOrPath, options) {
  let temporaryFolder;
  try {
    let generatorPath = generatorUrlOrPath;

    
    if (isUrl(generatorUrlOrPath)) {
      // if the generator is specified as a git URL, clone it into a temporary directory
      const generatorUrl = generatorUrlOrPath;
      if (generatorUrl.endsWith(".git")) {
        generatorPath = temporaryFolder = fs.mkdtempSync(
          path.join(os.tmpdir(), "generator")
        );
        console.log(`Cloning generator from ${generatorUrl}`);
        shell.exec(`git clone ${generatorUrl} ${generatorPath}`);
      } else {
        throw new Error(
          `Generator URL ${generatorUrl} does not end with ".git", check that the URL points to a valid generator`
        );
      }
    } else {
      generatorPath = path.resolve(generatorUrlOrPath);
    }

    validateGenerator(generatorPath);

    // load the OpenAPI schema
    const schema =
      typeof schemaPathOrUrl === "object"
        ? schemaPathOrUrl
        : await loadSchema(schemaPathOrUrl);

    // validate OpenAPI schema
    if (!options.skipValidation && !(await isValidSchema(schema))) {
      return;
    }

    // transform
    Object.values(transformers).forEach((transformer) => {
      transformer(schema);
    });

    // add options to the schema, making them available to templates
    schema._options = options;

    const handlebarsLoader = (pathToLoad, registrationMethod) => {
      if (fs.existsSync(pathToLoad)) {
        const items = fs.readdirSync(pathToLoad);
        items.forEach((item) => {
          const itemPath = path.join(pathToLoad, item);
          Handlebars[registrationMethod](item.split(".")[0], require(itemPath));
        });
      }
    };
    handlebarsLoader(generatorPath + "/helpers", "registerHelper");
    handlebarsLoader(generatorPath + "/partials", "registerPartial");

    // create the output folder
    fs.mkdirSync(options.output, { recursive: true });

    // iterate over all the files in the template folder
    const generatorTemplatesPath = generatorPath + "/template";
    const templates = fs.readdirSync(generatorTemplatesPath);
    templates.forEach((file) => {
      if (options.exclude && minimatch(file, options.exclude)) {
        return;
      }

      const source = fs.readFileSync(
        `${generatorTemplatesPath}/${file}`,
        "utf-8"
      );

      if (file.endsWith("handlebars")) {
        // run the handlebars template
        const template = Handlebars.compile(source);
        let result = template(schema);
        try {
          result = prettier.format(result, { parser: "typescript" });
        } catch {}

        fs.writeFileSync(
          `${options.output}/${file.replace(".handlebars", "")}`,
          result
        );
      } else {
        // for other files, simply copy them to the output folder
        fs.writeFileSync(`${options.output}/${file}`, source);
      }
    });
  } finally {
    if (temporaryFolder) {
      console.log(`Removing temporary folder ${temporaryFolder}`);
      fs.rmSync(temporaryFolder, { recursive: true });
    }
  }
}

module.exports = generate;
