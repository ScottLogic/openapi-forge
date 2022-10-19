// TODO: add type definitions to the generator

// Retrieve the path to generate.js from cl arguments of cucumber-js
const generatePath = process.argv.slice(2)[3];

if (!generatePath) {
  throw new Error(`You must provide a path to generate.js.`);
}

const generate = require(generatePath);

import { rmSync, existsSync } from "fs";

export class BaseModelStep {
  cleanup() {
    // cache-bust the api that was loaded via CommonJS
    Object.keys(require.cache).forEach(function (key) {
      delete require.cache[key];
    });
    if (existsSync("./features/api")) {
      rmSync("./features/api", { recursive: true });
    }
  }

  async generateApi(schema: string) {
    await generate(JSON.parse(schema), ".", {
      output: "./features/api",
      testRun: true,
      skipValidation: true,
      logLevel: "quiet"
    });
  }
}
