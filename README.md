## OpenAPI Forge

⚒️ Effortlessly create OpenAPI clients from the fiery furnace of our forge 

## Design principles

 - **Simplicity** - the generated output is as simple as possible, just code that relates to the task of communicating with an API endpoint
 - **Favour runtime configuration** - to keep the generation process as simple as possible, we favour runtime configuration, e.g. pluggable networking adaptors, logging etc
 - **Generation configuration** - if you do need to configure the generation process, the goal is to make this as simple as possible
 - **Opinionated** - we'll support just one 'official' generator per language
 - **Multi-repo** - each generator has its own repository, reducing overall traffic
 - **Extensively tested** - using the OpenAPI specification as a guide, it is our goal to test the generators extensively

## Quick start

This project is still inactive development, these steps will be simplified and streamlined soon.

Install this project globally:

~~~
$ npm install --global
~~~

This will allow you to use it via the `openapi-forge` command.

Next, download a client template:

~~~
$ git clone https://github.com/ColinEberhardt/openapi-forge-typescript.git
~~~

Forge your client api ...

~~~
$ openapi-forge forge
 \ https://petstore3.swagger.io/api/v3/openapi.json
 \ ./openapi-forge-typescript
 \ -o api
~~~

## High-level generation process

The following is a very high-level overview of the generation process:

 - load - the Forge generator loads the given OpenAPI schema
 - transform - the schema undergoes a number of transformations for the purposes of simplifying the generation process. By convention, any modified or new properties are prefixed with an undercore.
 - generate - the generation templates are implemented using the [Handlebars templating engine](https://handlebarsjs.com/). 


## TODO
 - better error reporting from CLI tool
 - allow templates to be supplied via GitHub URL, npm package or file
 - allow templates with nested folder structures
 - add a verbose / debug mode
 - output generation progress
 - determine the node version requirements for the forge
 - support XML generation
 - support YML open api docs