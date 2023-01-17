const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
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

// loads the schema, either from a local file or from a remote URL
async function loadSchema(schemaPathOrUrl) {
  const isYml =
    schemaPathOrUrl.endsWith(".yml") || schemaPathOrUrl.endsWith(".yaml");
  const schema = generatorResolver.isUrl(schemaPathOrUrl)
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

function getFileName(fileName, tagName = "") {
  log.verbose(fileName);
  let newFileName = fileName.slice(0, fileName.indexOf("."));
  if (tagName !== "") newFileName += helpers.capitalizeFirst(tagName);
  newFileName += fileName.slice(fileName.indexOf("."));
  return newFileName.replace(".handlebars", "");
}

function templateAndWriteToFile(schema, template, file, outputFolder) {
  let result = template(schema);
  log.verbose("Writing to output location");
  log.verbose(result);
  log.verbose(`${outputFolder}/${getFileName(file, schema._tag?.name)}`);
  try {
    const pathParts = getFileName(file, schema._tag?.name).split("/");
    pathParts.pop();
    const path = pathParts.join("/");
    fs.mkdirSync(`${outputFolder}/${path}`, { recursive: true });
  } catch (err) {
    log.verbose(err);
  }
  fs.writeFileSync(
    `${outputFolder}/${getFileName(file, schema._tag?.name)}`,
    result
  );
}

function processTemplateFactory(
  options,
  generatorTemplatesPath,
  generatorPackage,
  schema,
  outputFolder
) {
  return async function (file) {
    if (options.exclude && minimatch(file, options.exclude)) {
      return;
    }
    log.verbose(`\n${log.brightYellowForeground}${file}${log.resetStyling}`);
    log.verbose("Reading");
    // log.verbose(`${generatorTemplatesPath}/${file}`);
    log.verbose(`${generatorTemplatesPath}/${file}`);
    const source = fs.readFileSync(
      `${generatorTemplatesPath}/${file}`,
      "utf-8"
    );

    if (file.endsWith("handlebars")) {
      // run the handlebars template
      const template = Handlebars.compile(source);
      log.verbose("Populating template");
      if (
        generatorPackage.apiTemplates &&
        generatorPackage.apiTemplates.includes(file)
      ) {
        // Iterating tags to generate grouped paths
        schema._tags.forEach((tag) => {
          schema._tag = tag;
          templateAndWriteToFile(schema, template, file, outputFolder);
        });
      } else {
        schema._tag = null;
        templateAndWriteToFile(schema, template, file, outputFolder);
      }
    } else {
      log.verbose("Copying to output location");
      // for other files, simply copy them to the output folder
      log.verbose(`${outputFolder}/${file}`);
      log.verbose(source);
      try {
        const pathParts = file.split("/");
        pathParts.pop();
        const path = pathParts.join("/");
        fs.mkdirSync(`${outputFolder}/${path}`, { recursive: true });
      } catch (err) {
        log.verbose(err);
      }
      fs.writeFileSync(`${outputFolder}/${file}`, source);
      // log.verbose(fs.writeFileSync.mock.calls);
    }
  };
}

function getFilesInFolders(basePath, partialPath = "") {
  log.verbose("getFilesInFolders");
  log.verbose(`${basePath}/${partialPath}`);
  const topLevelTemplates = fs.readdirSync(`${basePath}/${partialPath}`, {
    withFileTypes: true,
  });
  const templates = topLevelTemplates.flatMap((template) => {
    log.verbose(template);
    if (!template.isDirectory()) {
      return [`${partialPath}/${template.name}`];
    }
    return getFilesInFolders(basePath, `${partialPath}/${template.name}`);
  });
  return templates;
}

async function generate(schemaPathOrUrl, generatorPathOrUrl, options) {
  log.setLogLevel(options.logLevel);
  log.logTitle();
  let exception = null;
  let numberOfDiscoveredModels = 0;
  let numberOfDiscoveredEndpoints = 0;
  try {
    log.standard(`Loading generator from '${generatorPathOrUrl}'`);

    let generatorPath = generatorResolver.getGenerator(generatorPathOrUrl);

    log.standard("Validating generator");
    validateGenerator(generatorPath);

    // load the OpenAPI schema
    log.standard(`Loading schema from '${schemaPathOrUrl}'`);
    let schema =
      typeof schemaPathOrUrl === "object"
        ? schemaPathOrUrl
        : await loadSchema(schemaPathOrUrl);

    //Check if schema is v2, if so convert it to v3
    if (schema.swagger === "2.0") {
      log.verbose("Converting schema");
      schema = await converter.convertObj(schema, { direct: true });
    }

    // validate OpenAPI schema
    if (!options.skipValidation) {
      log.standard("Validating schema");
      if (!(await isValidSchema(schema))) {
        return;
      }
    }

    if (schema?.components?.schemas) {
      numberOfDiscoveredModels = Object.keys(schema.components.schemas).length;
      log.verbose(
        `Discovered ${log.brightCyanForeground}${numberOfDiscoveredModels}${log.resetStyling} models`
      );
    }

    if (schema?.paths) {
      numberOfDiscoveredEndpoints = Object.keys(schema.paths).length;
      log.verbose(
        `Discovered ${log.brightCyanForeground}${numberOfDiscoveredEndpoints}${log.resetStyling} endpoints`
      );
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
        log.verbose(items);
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
    if (!fs.existsSync(outputFolder)) {
      const pathString = fs.mkdirSync(outputFolder, { recursive: true });
      log.verbose(`Creating output folder '${pathString}'`);
    } else {
      log.verbose(`Output folder already exists '${outputFolder}'`);
    }

    // iterate over all the files in the template folder
    const generatorTemplatesPath = generatorPath + "/template";
    // const topLevelTemplates = fs.readdirSync(generatorTemplatesPath, { withFileTypes: true });
    // const templates = files(generatorTemplatesPath, { sync: true });
    const templates = await getFilesInFolders(generatorTemplatesPath);
    log.verbose("");
    log.standard(
      `Iterating over ${log.brightCyanForeground}${templates.length}${log.resetStyling} files`
    );

    log.verbose(path.resolve(generatorPath, "./package.json"));
    let generatorPackage = require(path.resolve(
      generatorPath,
      "./package.json"
    ));

    log.verbose(templates);
    const processTemplate = processTemplateFactory(
      options,
      generatorTemplatesPath,
      generatorPackage,
      schema,
      outputFolder
    );
    templates.forEach(processTemplate);
    log.verbose("\nIteration complete\n");

    try {
      const formatter = require(path.resolve(generatorPath, "./formatter.js"));
      await formatter(outputFolder, log.getLogLevel());
    } catch {
      log.error(`No formatter found in ${generatorPath}`);
    }
  } catch (e) {
    exception = e;
  } finally {
    generatorResolver.cleanup();
  }

  if (exception === null) {
    log.logSuccessfulForge(
      numberOfDiscoveredModels,
      numberOfDiscoveredEndpoints
    );
  } else {
    log.logFailedForge(exception);
  }
}

module.exports = generate;
