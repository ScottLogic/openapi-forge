# OpenAPI Forge

⚒️🔥 Effortlessly create OpenAPI clients from the fiery furnace of our forge

- [OpenAPI Forge](#openapi-forge)
  - [Design principles](#design-principles)
  - [Overview](#overview)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Client generation](#client-generation)
  - [Usage example](#usage-example)
  - [Language Generators](#language-generators)

## Design principles

- **Simplicity** - the generated output is as simple as possible, just code that relates to the task of communicating with an API endpoint
- **Favour runtime configuration** - to keep the generation process as simple as possible, we favour runtime configuration, e.g. pluggable networking adaptors, logging etc
- **Opinionated** - we'll support just one 'official' generator per language
- **Extensively tested** - this repo contains a BDD test suite that is executed against each generator to ensure that it faithfully implements the OpenAPI specification

## Overview

The [Open API specification](https://www.openapis.org/) has become an industry standard for describing RESTful web APIs. The machine-readable specification makes it easy to generate API documentation and forms a common language for describing web services. However, most people who consume APIs still hand-craft the code that interacts with them, creating their own HTTP requests, serializing and deserializing model objects and more.

The goal of Open API Forge is to generate high-quality, simple and effective client libraries directly from the Open API specification, in a range of languages. These simplifying the process of consuming REST APIs, providing strongly-typed interfaces, error handling and more.

# Getting Started

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

## Client generation

In order to generate a client you need a suitable API specification, this can be supplied as a URL or a local file and can be in JSON or YML format. For this tutorial, we’ll use the Swagger Petstore API:

https://petstore3.swagger.io/api/v3/openapi.json

To create the client API, run the forge command, providing the schema URL, together with a language-specific generator and an output folder:

```
% openapi-forge forge  https://petstore3.swagger.io/api/v3/openapi.json openapi-forge-typescript -o api
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

## Language Generators

OpenAPI Forge currently has the following language generators:

- TypeScript - https://github.com/ScottLogic/openapi-forge-typescript
- C# - https://github.com/murcikan-scottlogic/openapi-forge-csharp
- JavaScript - https://github.com/murcikan-scottlogic/openapi-forge-javascript
