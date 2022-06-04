// moved required properties from the array at the object level to
// each individual property
const requiredSchemaObjectProperties = (schema) => {
  if (schema.components.schemas) {
    for (const model of Object.values(schema.components.schemas)) {
      if (model.required) {
        model.required.forEach((prop) => {
          model.properties[prop]._required = true;
        });
      }
    }
  }
};

const iterateVerbs = (schema, fn) => {
  if (schema.paths) {
    for (const path of Object.values(schema.paths)) {
      for (const verb of Object.values(path)) {
        fn(verb);
      }
    }
  }
};

// if a parameter is not required and does't have a default,
// and isn't a path parameter, it is considered optional
const optionalProperties = (schema) => {
  iterateVerbs(schema, (verb) => {
    if (verb.parameters) {
      verb.parameters.forEach((param) => {
        if (
          !param.required &&
          !param.schema.default &&
          param.in !== "path"
        ) {
          param._optional = true;
        }
      });
    }
  });
};

// sort parameters so that required ones are first, followed
// by the ones with defaults, and finally the rest
const sortPathParameters = (schema) => {
  const paramScore = (param) => {
    if (param.required) return 2;
    if (param.schema.default) return 1;
    return 0;
  };

  iterateVerbs(schema, (verb) => {
    if (verb.parameters) {
      verb._sortedParameters = [...verb.parameters].sort(
        (a, b) => paramScore(b) - paramScore(a)
      );
    }
  });
};

// if a request body is provided, add this to the array of sorted
// parameters
const addRequestBodyToParams = (schema) => {
  iterateVerbs(schema, (verb) => {
    if (verb.requestBody) {
      const param = verb.requestBody.content["application/json"];
      param.name = "body";
      param.in = "query";
      if (verb._sortedParameters) {
        verb._sortedParameters.push(param);
      } else {
        verb._sortedParameters = [param];
      }
    }
  });
};

// locate a 200 response, or a default
const resolveResponse = (schema) => {
  iterateVerbs(schema, (verb) => {
    if (verb.responses["200"]) {
      verb._response = verb.responses["200"].content["application/json"];
    } else if (verb.responses["default"] && verb.responses["default"].content) {
      verb._response = verb.responses["default"].content["application/json"];
    } else {
      verb._response = null;
    }
  });
};

module.exports = {
  requiredSchemaObjectProperties,
  optionalProperties,
  sortPathParameters,
  addRequestBodyToParams,
  resolveResponse,
};
