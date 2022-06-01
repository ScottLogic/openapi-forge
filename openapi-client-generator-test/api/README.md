# Swagger Petstore - OpenAPI 3.0 TypeScript Client Library

This is an auto-generated client library for the Swagger Petstore - OpenAPI 3.0 API, via the `openapi-client-template-ts` template.

## Usage example 



```
import Api from "./api";
import Configuration from "./configuration";
import { Pet } from "./api/model";

const config = new Configuration();
// set any environment specific configuration here
const api = new Api(config);

api.findPetsByStatus(...).then((data) => {
   console.log(data.map(s => s.name));
});
```
