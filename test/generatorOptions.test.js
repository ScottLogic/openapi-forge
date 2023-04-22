const fs = require("fs");

const {
  generatorOptionsHelp,
  configToCommanderOptions,
} = require("../src/generatorOptions/generatorOptions");
const generatorResolver = require("../src/common/generatorResolver");

jest.mock("fs");
jest.mock("../src/common/generatorResolver");

describe("generate", () => {
  beforeAll(() => {
    generatorResolver.getGenerator.mockImplementation((path) => ({
      path,
      dispose: () => {},
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
  });

  it("should indicate if the generator doesn't have any additional options", async () => {
    fs.existsSync.mockReturnValue(false);
    const optionsHelp = await generatorOptionsHelp("some/path");
    expect(optionsHelp).toEqual("The generator has no additional options");
  });

  it("should include the description in the help output", async () => {
    const config = {
      moduleFormat: {
        description: "The module format to use for the generated code.",
      },
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptionsHelp("some/path");
    expect(optionsHelp).toEqual(
      // Not checking the full string because extra whitespace is created:
      expect.stringMatching(
        /moduleFormat.*The module format to use for the generated/
      )
    );
  });

  it("should treat the description as optional", async () => {
    const config = {
      moduleFormat: {},
    };
    fs.readFileSync.mockReturnValue(JSON.stringify(config));
    const optionsHelp = await generatorOptionsHelp("some/path");
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
    const optionsHelp = await generatorOptionsHelp("some/path");

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
    const optionsHelp = await generatorOptionsHelp("some/path");
    expect(optionsHelp).toEqual(
      expect.stringMatching(
        /moduleFormat.*(choices: "cjs", "esm", default: "cjs")/
      )
    );
  });

  it("should support default values", async () => {
    const config = {
      packageName: {
        default: "my-package",
      },
    };
    const options = configToCommanderOptions(config);
    expect(options[0].defaultValue).toEqual("my-package");
  });
});
