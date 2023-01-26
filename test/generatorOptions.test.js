const fs = require("fs");

const { generatorOptions } = require("../src/commands/generatorOptions");
const generatorResolver = require("../src/commands/generatorResolver");

jest.mock("fs");
jest.mock("../src/commands/generatorResolver");

describe("generate", () => {
  beforeAll(() => {
    generatorResolver.getGenerator.mockImplementation((path) => path);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
  });

  it("should indicate if the generator doesn't have any additional options", async () => {
    fs.existsSync.mockReturnValue(false);
    const optionsHelp = await generatorOptions("some/path");
    expect(optionsHelp).toEqual("The generator has no additional options");
  });

  it("should include the description in the help output", async () => {
    const config = {
      moduleFormat: {
        description: "The module format to use for the generated code.",
      },
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptions("some/path");
    expect(optionsHelp).toEqual(
      expect.stringMatching(
        /moduleFormat.*The module format to use for the generated code./
      )
    );
  });

  it("should treat the description as optional", async () => {
    const config = {
      moduleFormat: {},
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptions("some/path");
    expect(optionsHelp).toEqual(expect.stringMatching(/moduleFormat/));
  });

  it("should handle multiple options", async () => {
    const config = {
      optionOne: {
        description: "description One.",
      },
      optionTwo: {
        description: "description Two.",
      },
    };

    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptions("some/path");

    expect(optionsHelp).toEqual(
      expect.stringMatching(/optionOne.*description One./)
    );
    expect(optionsHelp).toEqual(
      expect.stringMatching(/optionTwo.*description Two./)
    );
  });

  it("should output choices", async () => {
    const config = {
      moduleFormat: {
        choices: ["cjs", "esm"],
      },
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptions("some/path");
    expect(optionsHelp).toEqual(
      expect.stringMatching(
        /moduleFormat.*(choices: "cjs", "esm", default: "cjs")/
      )
    );
  });
});
