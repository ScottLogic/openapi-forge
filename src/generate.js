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
const log = require("./log");
const transformers = require("./transformers");
const SwaggerParser = require("@apidevtools/swagger-parser");
const converter = require("swagger2openapi");

// Command line output styling
const blackForeground = "\x1b[30m";
const brightYellowForeground = "\x1b[93m";
const brightCyanForeground = "\x1b[96m";
const redBackground = "\x1b[41m";
const brightGreenBackground = "\x1b[102m";
const resetStyling = "\x1b[0m";

const divider = "\n---------------------------------------------------\n";

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
    const errorArray = Array.isArray(errors) ? errors : [errors];
      errorArray.forEach((error) => {
        errorMessage = error.message;
        if(error.instancePath !== undefined) errorMessage +=  `at ${error.instancePath}`
        console.error(errorMessage);
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

async function generate(schemaPathOrUrl, generatorPathOrUrl, options) {
  log.setLogLevel(options.logLevel);
  log.verbose("");
  log.verbose("     )                             (    (      (                           ");
  log.verbose("  ( /(                      (      )\\ ) )\\ )   )\\ )                        ");
  log.verbose("  )\\())           (         )\\    (()/((()/(  (()/(      (    (  (     (   ");
  log.verbose(" ((_)\\   `  )    ))\\  (  ((((_)(   /(_))/(_))  /(_)) (   )(   )\\))(   ))\\  ");
  log.verbose("   ((_)  /(/(   /((_) )\\ ))\\ _ )\\ (_)) (_))   (_))_| )\\ (()\\ ((_))\\  /((_) ");
  log.verbose("  / _ \\ ((_)_\\ (_))  _(_/((_)_\\(_)| _ \\|_ _|  | |_  ((_) ((_) (()(_)(_))   ");
  log.verbose(" | (_) || '_ \\)/ -_)| ' \\))/ _ \\  |  _/ | |   | __|/ _ \\| '_|/ _` | / -_)  ");
  log.verbose("  \\___/ | .__/ \\___||_||_|/_/ \\_\\ |_|  |___|  |_|  \\___/|_|  \\__, | \\___|  ");
  log.verbose("        |_|                                                  |___/         ");
  log.verbose("");
  let temporaryFolder;
  let npmPackage = false;
  let exception = null;
  let numberOfDiscoveredModels = 0;
  let numberOfDiscoveredEndpoints = 0;
  try {
    log.standard(`Loading generator from '${generatorPathOrUrl}'`);
    let generatorPath;
    if (isUrl(generatorPathOrUrl)) {
      // if the generator is specified as a git URL, clone it into a temporary directory
      if (generatorPathOrUrl.endsWith(".git")) {
        generatorPath = temporaryFolder = fs.mkdtempSync(
          path.join(os.tmpdir(), "generator")
        );
        log.verbose(`Cloning generator from ${generatorPathOrUrl} to ${generatorPath}`);
        shell.exec(`git clone ${generatorPathOrUrl} ${generatorPath}`, {silent:true});
      } else {
        throw new Error(
          `Generator URL ${generatorPathOrUrl} does not end with ".git", check that the URL points to a valid generator`
        );
      }
    } else {
      //first check if there is a local generator
      generatorPath = path.resolve(generatorPathOrUrl);
      if (!fs.existsSync(generatorPath)) {
        //if no local generator, assume it is npm package name.
        log.verbose(`Checking if npm package ${generatorPathOrUrl} is installed`);
        const currentPath = process.cwd();
        shell.cd(__dirname, {silent:true});
        if (!shell.exec(`npm list --depth=0`, {silent:true}).stdout.match(new RegExp(`^\\+--.${generatorPathOrUrl}@\\d+\.\\d+\.\\d+$`, 'm'))) {
          npmPackage = true;
          log.verbose(`npm package ${generatorPathOrUrl} doesn't exist, installing package`);
          if (shell.exec(`npm install ${generatorPathOrUrl}`, {silent:true}).code !== 0) {
            throw new Error(
              `No local generator or npm package found using '${generatorPathOrUrl}', check that it points to a local generator or npm package`
            );
          }
        }
        generatorPath = path.resolve(`..\\node_modules\\${generatorPathOrUrl}`);
        shell.cd(currentPath, {silent:true});
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

    numberOfDiscoveredModels = Object.keys(schema.components.schemas).length;
    log.verbose(`Discovered ${brightCyanForeground}${numberOfDiscoveredModels}${resetStyling} models`);

    numberOfDiscoveredEndpoints = Object.keys(schema.paths).length;
    log.verbose(`Discovered ${brightCyanForeground}${numberOfDiscoveredEndpoints}${resetStyling} endpoints`);

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
    log.standard(`Iterating over ${brightCyanForeground}${templates.length}${resetStyling} files`);
    templates.forEach((file) => {
      if (options.exclude && minimatch(file, options.exclude)) {
        return;
      }
      log.verbose(`\n${brightYellowForeground}${file}${resetStyling}`);
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
    if (temporaryFolder) {
      log.verbose(`Removing temporary folder ${temporaryFolder}`);
      fs.rmSync(temporaryFolder, { recursive: true });
    }
    if(npmPackage) {
      const currentPath = process.cwd();
      shell.cd(__dirname, {silent:true});
      log.verbose(`Removing npm package ${generatorPathOrUrl}`);
      shell.exec(`npm uninstall ${generatorPathOrUrl}`, {silent:true});
      shell.cd(currentPath, {silent:true});
    }
  }
  if (exception === null) {
    log.standard(`${divider}`);
    log.standard(`            API generation ${brightGreenBackground}${blackForeground} SUCCESSFUL ${resetStyling}`);
    log.standard(`${divider}`);
    log.standard(" Your API has been forged from the fiery furnace:");
    log.standard(` ${brightCyanForeground}${numberOfDiscoveredModels}${resetStyling} models have been molded`);
    log.standard(` ${brightCyanForeground}${numberOfDiscoveredEndpoints}${resetStyling} endpoints have been cast`);
    log.standard(`${divider}`);
  } else {
    log.standard(`${divider}`);
    log.standard(`              API generation ${redBackground}${blackForeground} FAILED ${resetStyling}`);
    log.standard(`${divider}`);
    if(log.getLogLevel() === log.logLevels.standard) {
      log.standard(`${exception.message}`);
    } else {
      log.verbose(`${exception.stack}`);
    }
    log.standard(`${divider}`);
  }
}

module.exports = generate;
