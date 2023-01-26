# OpenAPI Forge

⚒️🔥 Effortlessly create OpenAPI clients from the fiery furnace of our forge - supporting OpenAPI spec v2 and v3

- [OpenAPI Forge](#openapi-forge)
  - [Design principles](#design-principles)
  - [Overview](#overview)
- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Client generation](#client-generation)
  - [Usage example](#usage-example)
  - [Language generators](#language-generators)
- [Generator development](#generator-development)
  - [A very simple generator](#a-very-simple-generator)
  - [Schema transformation](#schema-transformation)
  - [Tags and API structure](#tags-and-api-structure)
  - [Testing](#testing)
  - [Formatting](#formatting)

## Design principles

- **Simplicity** - the generated output is as simple as possible, just code that relates to the task of communicating with an API endpoint
- **Favour runtime configuration** - to keep the generation process as simple as possible, we favour runtime configuration, e.g. pluggable networking adaptors, logging etc
- **Opinionated** - we'll support just one 'official' generator per language
- **Extensively tested** - this repo contains a BDD test suite that is executed against each generator to ensure that it faithfully implements the OpenAPI specification

## Overview

The [Open API specification](https://www.openapis.org/) has become an industry standard for describing RESTful web APIs. The machine-readable specification makes it easy to generate API documentation and forms a common language for describing web services. However, most people who consume APIs still hand-craft the code that interacts with them, creating their own HTTP requests, serializing and deserializing model objects and more.

The goal of Open API Forge is to generate high-quality, simple and effective client libraries directly from the Open API specification, in a range of languages. These simplifying the process of consuming REST APIs, providing strongly-typed interfaces, error handling and more.

# Getting started

## Installation

Install openapi-forge as a global package:

```
$ npm install openapi-forge --global
```

This gives you access to the openapi-forge CLI tool, which performs a number of functions, including the generation of client APIs. The tool provides high-level usage instructions via the command line. For example, here is the documentation for the `forge` command:

```
% openapi-forge help forge
Usage: openapi-forge forge [options] <schema> <generator>

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

Individual generators may have their own options. Try it out:

```
% openapi-forge generator-options https://github.com/ScottLogic/openapi-forge-javascript.git
Usage: openapi-forge generator-options <generator>

This generator has a number of additional options which can be supplied when executing the 'forge' command.

Options:
  --generator.moduleFormat <value>  The module format to use for the generated
                                    code. (choices: "commonjs", "esmodule",
                                    default: "commonjs")
```

and then

```
% openapi-forge forge https://petstore3.swagger.io/api/v3/openapi.json https://github.com/ScottLogic/openapi-forge-javascript.git --generator.moduleFormat "esmodule"
```

## Client generation

In order to generate a client you need a suitable API specification, this can be supplied as a URL or a local file and can be in JSON or YML format. For this tutorial, we’ll use the Swagger Petstore API:

https://petstore3.swagger.io/api/v3/openapi.json

To create the client API, run the forge command, providing the schema URL, together with a language-specific generator and an output folder:

```
% openapi-forge forge \
                https://petstore3.swagger.io/api/v3/openapi.json \
                openapi-forge-typescript \
                -o api
```

The above example uses [openapi-forge-typescript](https://github.com/ScottLogic/openapi-forge-typescript) which generates a TypeScript client API.

Let’s take a look at the files this has generated:

```
% ls api
README.md		configuration.ts	parameterBuilder.ts
apiPet.ts		info.ts			request.ts
apiStore.ts		model.ts		serializer.ts
apiUser.ts		nodeFetch.ts
```

The generators all create a `README.md` file which provides language specific usage instructions. Some of the more notable generated files are:

- `apiPet.ts` / `apiStore.ts` / `apiUser.ts` - these are the API endpoints, grouped by tags, each file contains a class with methods that relate to the API schema
- `model.ts` - this file contains the models used by the API, for example Pet or Order
- `configuration.ts` - configures the API, for example, allows you to specify the base path or bearer token.

## Usage example

Let’s take a look at a quick example that uses the generated client:

```typescript
import ApiPet from "./api/apiPet";
import Configuration from "./api/configuration";
import { transport } from "./api/nodeFetch";

// create API client
const config = new Configuration(transport);
config.basePath = "https://petstore3.swagger.io";
const api = new ApiPet(config);

// use it!
(async () => {
  await api.addPet({
    id: 1,
    name: "Fido",
    photoUrls: [],
  });

  const pet = await api.getPetById(1);
  console.log(pet.name);
})();
```

You can run the above code with either [ts-node](https://www.npmjs.com/package/ts-node), or a runtime with native TypeScript support such as deno.

The first step is to configure and create a client API instance. In the above example we supply a ‘transport’ implementation, which in this case uses [node-fetch](https://github.com/node-fetch/node-fetch). If you want to use a different mechanism, for example Axios or XHR, it is very easy to provide a different implementation. You also need to supply a base path, which indicates where this API is hosted. This example uses the API methods grouped by the ‘pet’ tag, so an instance of ApiPet is required.

To test the API, this example adds a Pet named “Fido” to the Pet Store, then retrieves it via its id, logging the name.

And that’s it, you’ve successfully generated and used your first client library.

## Language generators

OpenAPI Forge currently has the following language generators:

- TypeScript - https://github.com/ScottLogic/openapi-forge-typescript
- C# - https://github.com/ScottLogic/openapi-forge-csharp
- JavaScript - https://github.com/Scottlogic/openapi-forge-javascript

# Generator development

This section provides a brief guide for anyone wanting to create a new language generator, as a step-by-step guide.

## A very simple generator

Generators are JavaScript projects, which are typically distributed via npm, although you can use them locally. The first step is to create a new project:

```
% mkdir openapi-forge-generator
% cd openapi-forge-generator
% npm init -y --silent
```

Generators are a collection of templates, using the [Handlebars](https://handlebarsjs.com/) syntax, with the templates, and any handlebars 'helpers' located within standard folders. We'll get started by adding a single tenmplate.

Create a folder named `templates` and add the following to a file named `api.js.handlebars` within that folder:

```javascript
/**
 * {{info.title}}
 * {{info.version}}
 */
```

Any file with the `handlebars` suffix is processed via the handlebars templating engine. The context supplied to these templates is the OpenAPI specification that is being generated. You can also include files within the `handlebars` suffix, these are just copied into the output folder.

Let's generate an API using this template.

From the root of the `openapi-forge-generator` folder run the following command:

```
% openapi-forge forge \
                https://petstore3.swagger.io/api/v3/openapi.json \
                . \
                -o api
```

This runs the `forge` command, using the schema downloaded from the petstore swagger repository. For the generator parameter, we are using the period symbol `.`, which indicates a filepath (rather than an npm package), which in this case is the current working directory.

Executing the above command results in the following output:

```
Loading generator from '.'
Validating generator
Loading schema from 'https://petstore3.swagger.io/api/v3/openapi.json'
Validating schema
Iterating over 1 files
No formatter found in /Users/foo/Projects/openapi-forge-testgen

---------------------------------------------------

            API generation  SUCCESSFUL

---------------------------------------------------

 Your API has been forged from the fiery furnace:
 8 models have been molded
 13 endpoints have been cast

---------------------------------------------------
```

If you look in the `api` folder, you'll find a single file with the following contents:

```
/**
 * Swagger Petstore - OpenAPI 3.0
 * 1.0.17
 */
```

You can also add any partial templates withing a `partials` folder, and helper functions in a `helpers` folder. These will be loaded automatically alongside your templates.

## Schema transformation

The OpenAPI schema is supplied as the context for each generator template, allowing you to access the various schema properties, e.g. iterate over arrays, and generate suitable client code. However, there are some instances where the structure of the OpenAPI specification is not ideal for template generation.

In order to keep the templates simple, the schema undergoes a number of transformations, which you can find in the [`transformers.js`](blob/master/src/transformers.js) file. In each case, the original schema structure is left untouched, with the transformed content being added via new properties prefixed with an underscore.

For example, the OpenAPI schema describes the model objects used by the API (e.g. names, properties and their types). The logic required to determine whether a model object property is optional is relatively complex and would result in a complicated template. One of the transformation steps adds a `_required` property to each property, resulting in clean and simple templates:

```
{{#each components.schemas}}
export class {{@key}} {
 {{#each properties}}
 {{#unless _required}}// this is an optional property{{/unless}}
 {{@key}};
 {{/each}}
}
{{/each}}
```

## Tags and API structure

The OpenAPI specification allows you to add tags to API methods as a way to provide additional structure. The generation processes groups methods based on tag, these can be written to separate files by specifying template files that are enumerated by tag.

You can specify such files by adding the following to `package.json`

```
"apiTemplates": [
  // include the name of any file that should be generated on a per-tag basis
],
```

## Testing

A primary goal of OpenAPI Forge is to provide robust and extensively tested client libraries. This project uses a BDD-style testing approach, with the various test scenarios found in the [`features`](features) folder of this repository. These tests use the standard Gherkin format, which is supported by most programming languages.

In order to test your generator you'll need to choose a suitable test runner (e.g. [Cucumber](https://www.npmjs.com/package/@cucumber/cucumber) for JavaScript). The standard pattern for each test is that it generates a client API using a schema snippet, then validates the generated output.

## Formatting

Ideally the generated output should be 'neatly' formatted in an idiomatic way for the target language. There are a couple of ways to achieve this:

1.  Write the handlebars templates in such a way that they produce nicely formatted code. This can result in templates which are a little convoluted, however, [whitespace control](https://handlebarsjs.com/guide/expressions.html#whitespace-control) is your friend.
2.  You can format the files as a post-processing step. To achieve this, add a `formatting.js` file to the root of your generator project. This will be executed as the final step of the generation process. How this is implemented is of course language-dependent.
