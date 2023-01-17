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
  let newFileName = fileName.slice(0, fileName.indexOf("."));
  if (tagName !== "") newFileName += helpers.capitalizeFirst(tagName);
  newFileName += fileName.slice(fileName.indexOf("."));
  return newFileName.replace(".handlebars", "");
}

function createNestedDirectories(schema, file, outputFolder) {
  try {
    // Strip out the file name and create the directory structure of
    // the input folder in the output folder.
    const pathParts = getFileName(file, schema._tag?.name).split("/");
    pathParts.pop();
    const path = pathParts.join("/");
    fs.mkdirSync(`${outputFolder}/${path}`, { recursive: true });
  } catch (ignored) {
    // If the directory already exists, we're all good.
  }
}

function templateAndWriteToFile(schema, template, file, outputFolder) {
  let result = template(schema);
  log.verbose("Writing to output location");
  createNestedDirectories(schema, file, outputFolder);
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
      createNestedDirectories(schema, file, outputFolder);
      fs.writeFileSync(`${outputFolder}/${file}`, source);
    }
  };
}

// Synchronously get all files in a directory (recursively searching down into directories).
// It maintains the paths of the inner files so that the file structure can be re-created.
function getFilesInFolders(basePath, partialPath = "") {
  const filesAndDirs = fs.readdirSync(`${basePath}/${partialPath}`, {
    withFileTypes: true,
  });
  return filesAndDirs.flatMap((template) => {
    const fileOrDirName = partialPath
      ? `${partialPath}/${template.name}`
      : template.name;
    if (!template.isDirectory()) {
      return [fileOrDirName];
    }
    return getFilesInFolders(basePath, fileOrDirName);
  });
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
    const templates = getFilesInFolders(generatorTemplatesPath);
    log.verbose("");
    log.standard(
      `Iterating over ${log.brightCyanForeground}${templates.length}${log.resetStyling} files`
    );

    let generatorPackage = require(path.resolve(
      generatorPath,
      "./package.json"
    ));

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
