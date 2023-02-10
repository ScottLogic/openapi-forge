const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const generate = require("../src/generate");
const generatorResolver = require("../src/common/generatorResolver");

const log = require("../src/common/log");
const { convertObj } = require("swagger2openapi");
const SwaggerParser = require("@apidevtools/swagger-parser");

jest.mock("fs");
jest.mock("path");
jest.mock("handlebars");
jest.mock("swagger2openapi");
jest.mock("@apidevtools/swagger-parser");
jest.mock("../src/common/log");
jest.mock("../src/common/generatorResolver");

describe("generate", () => {
  const generatorPath = "generatorPath";
  const schemaPathOrUrl = "openapi.json";
  const fakeSchema = JSON.stringify({
    swagger: "3.0",
  });
  const outDir = "out";
  const outCode = "transformed content";
  beforeAll(() => {
    // For these tests, we don't really care about the responses for these:
    path.resolve.mockImplementation((path) => path);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(fakeSchema);
    generatorResolver.isUrl.mockReturnValue(false);
    generatorResolver.getGenerator.mockImplementation((path) => path);
    Handlebars.compile.mockReturnValue(() => outCode);

    const generatorPackage = {
      apiTemplates: [],
    };
    // Mock the dynamic "require" imports:
    require(generatorPath);
    jest.mock(generatorPath, () => generatorPackage, { virtual: true });
  });
  beforeEach(() => {
    // Clear mock calls
    jest.clearAllMocks();
  });
  it("should copy non-Handlebars files", async () => {
    const fileName = "exampleFile";
    const fileExtension = "js";
    mockReaddirSync({
      helpers: [],
      partials: [],
      templates: [`${fileName}.${fileExtension}`],
    });
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
    });
    console.error(fs.copyFileSync.mock.calls);
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      `${generatorPath}/template/${fileName}.${fileExtension}`,
      `${outDir}/${fileName}.${fileExtension}`
    );
  });

  it("should change the filename of Handlebars files", async () => {
    const fileName = "exampleFile";
    const fileExtension = "js.handlebars";
    mockReaddirSync({
      helpers: [],
      partials: [],
      templates: [`${fileName}.${fileExtension}`],
    });
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${outDir}/${fileName}.js`, // .handlebars stripped out
      outCode
    );
  });

  it("should copy non-handlebars files in directories", async () => {
    const fileShortName = "ExampleFile";
    const extension = "java";
    const basePath = `somewhere/else`;

    mockReaddirSync({
      helpers: [],
      partials: [],
      templates: [`somewhere/else/${fileShortName}.${extension}`],
    });
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
    });
    expect(fs.copyFileSync).toHaveBeenCalledWith(
      `${generatorPath}/template/${basePath}/${fileShortName}.${extension}`,
      `${outDir}/${basePath}/${fileShortName}.${extension}`
    );
  });
  it("should change the filename of Handlebars files in directories", async () => {
    const fileShortName = "ExampleFile";
    const extension = "java.handlebars";
    const basePath = `somewhere/else`;

    mockReaddirSync({
      helpers: [],
      partials: [],
      templates: [`somewhere/else/${fileShortName}.${extension}`],
    });
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${outDir}/${basePath}/${fileShortName}.java`, // handlebars extension stripped out
      outCode
    );
  });
  it("should call logFailedForge if validation of the generator fails", () => {
    // Simulate generator path pointing to the wrong place:
    fs.existsSync.mockReturnValueOnce(false);
    generate("schemaPathOrUrl", "generatorPathOrUrl", {
      setLogLevel: () => {},
    });

    expect(log.logFailedForge).toHaveBeenCalled();
  });
  it("should convert 2.0 schemas to 3.0 schemas", async () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      swagger: "2.0",
    };
    fs.readFileSync = jest.fn(() => JSON.stringify(schema));
    convertObj.mockReturnValue({
      /* v3.0 schema */
    });
    await generate("path/to/schema", "path/to/generator", {
      setLogLevel: () => {},
    });
    expect(convertObj).toHaveBeenCalled();
  });
  it("should call logInvalidSchema if the schema is invalid", async () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      swagger: "2.0",
    };
    fs.readFileSync = jest.fn(() => JSON.stringify(schema));
    SwaggerParser.validate.mockImplementation(() => {
      throw new Error("Invalid schema");
    });

    await generate("path/to/schema", "path/to/generator", {
      setLogLevel: () => {},
    });

    expect(log.logInvalidSchema).toHaveBeenCalled();
  });
});

function mockReaddirSync({ helpers, partials, templates }) {
  fs.readdirSync.mockImplementation((filePath) => {
    if (filePath.includes("helpers")) {
      return helpers;
    }
    if (filePath.includes("partials")) {
      return partials;
    }
    // If we have a file somewhere/else/ExampleFile.java we will call readdirSync with
    // 1) "template" and return "somewhere"
    // 2) "somewhere" and return "else"
    // 3) "else" and return "ExampleFile.java"
    return templates.map((template) => {
      const fileParts = template.split("/");
      const nextFileOrDirName = fileParts.find(
        (pathPart) => !filePath.includes(pathPart)
      );
      return {
        name: nextFileOrDirName,
        // If it's a file we assume it will have a ".":
        isDirectory: () => !nextFileOrDirName.includes("."),
      };
    });
  });
}
