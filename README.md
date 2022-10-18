## OpenAPI Forge

⚒️🔥 Effortlessly create OpenAPI clients from the fiery furnace of our forge

## Design principles

- **Simplicity** - the generated output is as simple as possible, just code that relates to the task of communicating with an API endpoint
- **Favour runtime configuration** - to keep the generation process as simple as possible, we favour runtime configuration, e.g. pluggable networking adaptors, logging etc
- **Generation configuration** - if you do need to configure the generation process, the goal is to make this as simple as possible
- **Opinionated** - we'll support just one 'official' generator per language
- **Multi-repo** - each generator has its own repository, reducing overall traffic
- **Extensively tested** - this repo contains a BDD test suite that is executed against each generator to ensure that it faithfully implements the OpenAPI specification

## Quick start

This project is still in active development, these steps will be simplified and streamlined soon.

Clone this repository, and install locally then globally:

```
$ npm install
$ npm install --global
```

This will give you access to the `openapi-forge` command.

Now you can forge your client API ...

```
$ openapi-forge forge
 \ https://petstore3.swagger.io/api/v3/openapi.json
 \ https://github.com/ScottLogic/openapi-forge-typescript.git
 \ -o api
```

The above command forges a client API for the 'petstore' API, downloaded via the given URL. It uses the `openapi-forge-typescript` generator, which creates the TypeScript API, with the results saves in a folder called `api`.

If you take a look within the `api` folder you'll find that a number of files have been generated. The exact structure depends on the generator you use, with the detail available in the respective README file.

```
% cd api
% ls
 README.md
 api.ts
 configuration.ts
 model.ts
 nodeFetch.ts
 request.ts
 serializer.ts
 util.ts
```

The two most interesting files in the above are `model.ts` which has a number of TypeScript classes generated from the various data types in the schema, and `api.ts` which provides a method for each path within the API.

The following is a very simple example of how you might use this generated API:

```
import Api from "./api/api";
import Configuration from "./api/configuration";
import { Pet } from "./api/model";
import { transport } from "./api/nodeFetch"

// configure the API, in this instance we are using the node-fetch library for HTTP requests
const config = new Configuration(transport);
config.basePath = "https://petstore3.swagger.io";

// create an API instance from this configuration
const api = new Api(config);

// make a request
api.findPetsByStatus("available").then((data: Pet[]) => {
  // note the typed response
  console.log("Pet names...");
  console.log(data.map(pet => pet.name));
});
```

## Generators

The Forge currently provides the following generators. Each provide documentation regarding the API they generate and its usage:

- TypeScript - https://github.com/ScottLogic/openapi-forge-typescript
- C# - https://github.com/murcikan-scottlogic/openapi-forge-csharp (in development)

[comment]: <> (Do not modify the text between the two MARKERs, it is auto-generated in the test.yml workflow)
[MARKER]: <> (START OF GENERATOR TESTING TABLE)

| Generator      | Scenarios | Passed | Skipped | Undefined | Failed | Time |
| -------------- | --------- | ------ | ------- | --------- | ------ | ---- |
| **TypeScript** | x         | x      | x       | x         | x      | x    |
| **CSharp**     | x         | x      | x       | x         | x      | x    |

[MARKER]: <> (END OF GENERATOR TESTING TABLE)

## User Guide

The CLI tool provided by this repository is the primary interface for the Forge:

```
% openapi-forge help forge
Usage: openapi-generator forge [options] <schema> <generator>

Forge the API client from an OpenAPI specification. This command takes an
OpenAPI schema, and uses the given generator to create a client library.

Arguments:
  schema                An OpenAPI schema, either a URL or a file path
  generator             Git URL, file path or npm package of a language-specific generator

Options:
  -e, --exclude <glob>    A glob pattern that excludes files from the generator in the output (default: "")
  -o, --output <path>     The path where the generated client API will be written (default: ".")
  -s, --skipValidation    Skip schema validation
  -l, --logLevel <level>  Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose ('verbose', 'v' or '2')
  -h, --help              Display help for command
```

**Generator Hierarchy**

If a URL is given than it assumes that you are giving it a git repository. Otherwise it searches for a local generator folder and finally if no local generator is found it looks for an npm package and installs it if it does not exist.

TODO: Elaborate

## Developer guide

The following is a very high-level overview of the generation process:

- load - the Forge generator loads the given OpenAPI schema
- transform - the schema undergoes a number of transformations for the purposes of simplifying the generation process. By convention, any modified or new properties are prefixed with an underscore.
- generate - the generators are implemented using the [Handlebars templating engine](https://handlebarsjs.com/).

TODO: Elaborate etc ...

## Testing

You can test openapi-forge on all of the language generators from one command:

```
% openapi-forge help test-generators
Usage: openapi-forge test-generators [options]

Test language specific generators.

Options:
  -g, --generators <gens>            Narrow down the generators to test. Each letter is a generator, combine letters to test multiple generators, options are:
                                     c (CSharp), t (TypeScript) (default: "ct")
  -c, --csharp <csharpPath>          Sets the location of the CSharp generator. Default is a directory called 'openapi-forge-csharp' in the same location as
                                     openapi-forge (default: "../../openapi-forge-csharp")
  -t, --typescript <typescriptPath>  Sets the location of the TypeScript generator. Default is a directory called 'openapi-forge-typescript' in the same
                                     location as openapi-forge (default: "../../openapi-forge-typescript")
  -l, --logLevel <level>             Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose
                                     ('verbose', 'v' or '2') (default: "1")
  -h, --help                         display help for command
```
