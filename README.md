## OpenAPI Forge

⚒️ Effortlessly create OpenAPI clients from the fiery furnace of our forge 

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
$ openapi-forge forge https://petstore3.swagger.io/api/v3/openapi.json ./openapi-forge-typescript -o api
~~~


## TODO
 - better error reporting from CLI tool
 - allow templates to be supplied via GitHub URL, npm package or file
 - turn this into a proper CLI tool
 - add a verbose / debug mode
 - output generation progress
 - determine the node version requirements for the forge