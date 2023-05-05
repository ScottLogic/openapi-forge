const path = require("path");
const fs = require("fs");
const { getGenerator } = require("../../src/common/generatorResolver");
const log = require("../../src/common/log");
log.setLogLevel("quiet");

describe("generatorResolver", () => {
  describe("generator specified as a filepath", () => {
    it("should return the filepath given", async () => {
      const generatorPath = path.join(__dirname, "validGenerator");
      const generator = await getGenerator(generatorPath);
      expect(generator.path).toEqual(generatorPath);
    });

    it("should throw an error if the filepath doesn't point to a valid generator", async () => {
      // we'll just point to some random directory
      const generatorPath = path.join(__dirname);
      expect(() => {
        getGenerator(generatorPath);
      }).toThrow();
    });
  });

  describe("generator specified as a git repo", () => {
    it("should clone the repo into a temporary directory", async () => {
      const generator = await getGenerator(
        "https://github.com/ScottLogic/openapi-forge-csharp.git"
      );
      // validate via the presence of a package.json file
      const packageJsonPath = path.join(generator.path, "package.json");
      expect(fs.existsSync(packageJsonPath)).toEqual(true);
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      expect(packageJson.name).toEqual("openapi-forge-csharp");

      // clean up
      generator.dispose();
    });

    it("should cleanup on disposal", async () => {
      const generator = await getGenerator(
        "https://github.com/ScottLogic/openapi-forge-csharp.git"
      );
      generator.dispose();
      expect(fs.existsSync(generator.path)).toEqual(false);
    });
  });

  describe("generator specified as an npm package", () => {
    it("should install the package in a temporary folder", async () => {
      const generator = await getGenerator("openapi-forge-typescript");
      // validate via the presence of a package.json file
      const packageJsonPath = path.join(generator.path, "package.json");
      expect(fs.existsSync(packageJsonPath)).toEqual(true);
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      expect(packageJson.name).toEqual("openapi-forge-typescript");

      // clean up
      generator.dispose();
    });

    it("should cleanup on disposal", async () => {
      const generator = await getGenerator("openapi-forge-typescript");
      generator.dispose();
      expect(fs.existsSync(generator.path)).toEqual(false);
    });
  });
});
