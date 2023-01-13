const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const generate = require("../src/generate");
const generatorResolver = require("../src/generatorResolver");

jest.mock("fs");
jest.mock("path");
jest.mock("handlebars");
jest.mock("../src/generatorResolver");

describe("generate", () => {
  const generatorPath = "generatorPath";
  const schemaPathOrUrl = "openapi.json";
  const fakeSchema = JSON.stringify({
    swagger: "3.0",
  });
  const outDir = "out";
  const outCode = "transformed content";
  beforeEach(() => {
    // For these tests, we don't really care about the responses for these:
    path.resolve.mockImplementation((path) => path);
    generatorResolver.getGenerator.mockImplementation((path) => path);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(fakeSchema);
    generatorResolver.isUrl.mockReturnValue(false);
    Handlebars.compile.mockReturnValue(() => outCode);

    const generatorPackage = {
      apiTemplates: [],
    };
    // Mock the dynamic "require" imports:
    require(generatorPath);
    jest.mock(generatorPath, () => generatorPackage, { virtual: true });

    // Clear mock calls
    jest.clearAllMocks();
  });
  it("should copy non-Handlebars files", async () => {
    const fileName = "exampleFile";
    const fileExtension = "js";
    // There are no helper or partial files, but there is a template:
    fs.readdirSync.mockImplementation((filePath) => {
      if (filePath.includes("helpers") || filePath.includes("partials")) {
        return [];
      } else {
        return [`${fileName}.${fileExtension}`];
      }
    });
    await generate(schemaPathOrUrl, generatorPath, {
      skipValidation: true,
      output: outDir,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${outDir}/${fileName}.${fileExtension}`,
      fakeSchema
    );
  });

  it("should change the filename of Handlebars files", async () => {
    const fileName = "exampleFile";
    const fileExtension = "js.handlebars";
    // There are no helper or partial files, but there is a template:
    fs.readdirSync.mockImplementation((filePath) => {
      if (filePath.includes("helpers") || filePath.includes("partials")) {
        return [];
      } else {
        return [`${fileName}.${fileExtension}`];
      }
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

  it("should copy files in directories", () => {});
  it("should change the filename of Handlebars files in directories", () => {});
});
