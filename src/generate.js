const fs = require("fs");
const URL = require("url").URL;
const path = require("path");
const os = require("os");

const Handlebars = require("handlebars");
const prettier = require("prettier");
const minimatch = require("minimatch");
const fetch = require("node-fetch");
const { parse } = require("yaml");

const generatorResolver = require("./generatorResolver");
const helpers = require("./helpers");
const log = require("./log");
const transformers = require("./transformers");
const SwaggerParser = require("@apidevtools/swagger-parser");
const converter = require("swagger2openapi");

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
    log.logInvalidSchema(errors);
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

async function generate(schemaPathOrUrl, generatorPathOrUrl, options) {
  log.setLogLevel(options.logLevel);
  log.logTitle();
  let exception = null;
  let numberOfDiscoveredModels = 0;
  let numberOfDiscoveredEndpoints = 0;
  try {
    log.standard(`Loading generator from '${generatorPathOrUrl}'`);
    let generatorPath;
    if (isUrl(generatorPathOrUrl)) {
      generatorPath = generatorResolver.cloneGenerator(generatorPathOrUrl, true);
    } else {
      //first check if there is a local generator
      generatorPath = path.resolve(generatorPathOrUrl);
      if (!fs.existsSync(generatorPath)) {
        //if no local generator, assume it is an npm package name.
        generatorPath = generatorResolver.installGeneratorFromNPM(generatorPathOrUrl);
      }
    }

    log.standard("Validating generator");
    validateGenerator(generatorPath);

    // load the OpenAPI schema
    log.standard(`Loading schema from '${schemaPathOrUrl}'`);
    let schema =
      typeof schemaPathOrUrl === "object"
        ? schemaPathOrUrl
        : await loadSchema(schemaPathOrUrl);

    //Check if schema is v2, if so convert it to v3
    if(schema.swagger === "2.0") {
      log.verbose("Converting schema");
      schema = await converter.convertObj(schema, {direct: true});
    }

    // validate OpenAPI schema
    if(!options.skipValidation) {
      log.standard("Validating schema");
      if(!(await isValidSchema(schema))) {
        return;
      }
    }

    if (schema?.components?.schemas) {
      numberOfDiscoveredModels = Object.keys(schema.components.schemas).length;
      log.verbose(`Discovered ${log.brightCyanForeground}${numberOfDiscoveredModels}${log.resetStyling} models`);
    }

    if (schema?.paths) {
      numberOfDiscoveredEndpoints = Object.keys(schema.paths).length;
      log.verbose(`Discovered ${log.brightCyanForeground}${numberOfDiscoveredEndpoints}${log.resetStyling} endpoints`);
    }

    // transform
    log.verbose("Transforming schema");
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

    log.verbose("Loading templates");
    handlebarsLoader(generatorPath + "/helpers", "registerHelper");
    handlebarsLoader(generatorPath + "/partials", "registerPartial");

    // create the output folder
    const outputFolder = path.resolve(options.output);
    if (!fs.existsSync(outputFolder)){
      const pathString = fs.mkdirSync(outputFolder, { recursive: true });
      log.verbose(`Creating output folder '${pathString}'`);
    } else {
      log.verbose(`Output folder already exists '${outputFolder}'`);
    }

    // iterate over all the files in the template folder
    const generatorTemplatesPath = generatorPath + "/template";
    const templates = fs.readdirSync(generatorTemplatesPath);
    log.verbose("");
    log.standard(`Iterating over ${log.brightCyanForeground}${templates.length}${log.resetStyling} files`);

    templates.forEach((file) => {
      if (options.exclude && minimatch(file, options.exclude)) {
        return;
      }
      log.verbose(`\n${log.brightYellowForeground}${file}${log.resetStyling}`);
      log.verbose("Reading");
      const source = fs.readFileSync(
        `${generatorTemplatesPath}/${file}`,
        "utf-8"
      );

      if (file.endsWith("handlebars")) {
        // run the handlebars template
        const template = Handlebars.compile(source);
        log.verbose("Populating template");
        let result = template(schema);
        try {
          log.verbose("Formatting");
          result = prettier.format(result, { parser: "typescript" });
        } catch {}

        log.verbose("Writing to output location");
        fs.writeFileSync(
          `${outputFolder}/${file.replace(".handlebars", "")}`,
          result
        );
      } else {
        log.verbose("Copying to output location");
        // for other files, simply copy them to the output folder
        fs.writeFileSync(`${outputFolder}/${file}`, source);
      }
    });
    log.verbose("\nIteration complete\n");

  } catch(e) {
    exception = e;
  } finally {
    generatorResolver.cleanup();
  }
  if (exception === null) {
    log.logSuccessfulForge(numberOfDiscoveredModels, numberOfDiscoveredEndpoints);
  } else {
    log.logFailedForge(exception)
  }
}

module.exports = generate;
