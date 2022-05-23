const fs = require("fs");
const Handlebars = require("handlebars");
const helpers = require("./helpers");
const prettier = require("prettier");
const path = require('path');

Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

function generate(schema, templateProject, outPath) {
  const templatePath = templateProject + "/template";
  const helpersPath = templateProject + "/helpers";

  // load the OpenAPI schema
  const api = JSON.parse(fs.readFileSync(schema, "utf-8"));

  // load any template helpers
  const helpers = fs.readdirSync(helpersPath);
  helpers.forEach((helper) => {
    const helperPath = path.join(path.resolve("."), templateProject, "/helpers", helper);
    Handlebars.registerHelper(helper.slice(0, -3), require(helperPath));
  });

  // iterate over all the files in the folder template
  const templates = fs.readdirSync(templatePath);
  templates.forEach((file) => {
    const source = fs.readFileSync(`${templatePath}/${file}`, "utf-8");
    const template = Handlebars.compile(source);
    let result = template(api);

    // try to prettify the result
    try {
      result = prettier.format(result, { parser: "typescript" });
    } catch {}
    fs.writeFileSync(`${outPath}/${file.replace("handlebars", "ts")}`, result);
  });
}

module.exports = generate;
