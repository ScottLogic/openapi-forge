const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const util = require("../src/common/util");
const generate = require("../src/generate");
const generatorResolver = require("../src/common/generatorResolver");
const minimatch = require("minimatch");

jest.mock("fs");
jest.mock("path");
jest.mock("handlebars");
jest.mock("minimatch");
jest.mock("../src/common/util");
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
    util.isUrl.mockReturnValue(false);
    generatorResolver.getGenerator.mockImplementation((path) => ({
      path,
      dispose: () => {},
    }));
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
  it("should not copy excluded files", async () => {
    const file = "exampleFile.js";
    mockReaddirSync({
      helpers: [],
      partials: [],
      templates: [file],
    });
    minimatch.mockImplementation(
      (fileToMatch, excludedFiles) =>
        fileToMatch === file && excludedFiles.includes(file)
    );
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
      exclude: [file],
    });
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalledWith(
      expect.stringContaining(file)
    );
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
