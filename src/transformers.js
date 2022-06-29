// moved required properties from the array at the object level to
// each individual property
const requiredSchemaObjectProperties = (schema) => {
  if (schema.components && schema.components.schemas) {
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
          !(param.schema && param.schema.default) &&
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
    if (param.schema && param.schema.default !== undefined) return 0;
    return 1;
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
      if (param) {
        param.name = "body";
        param.in = "body";
        if (verb._sortedParameters) {
          verb._sortedParameters.push(param);
        } else {
          verb._sortedParameters = [param];
        }
      }
    }
  });
};

// locate a 2XX response, or a default
const resolveResponse = (schema) => {
  iterateVerbs(schema, (verb) => {

    const successOrDefaultResponses = Object.entries(verb.responses)
      .filter(responseKvp => responseKvp[0].match(/^(2\d{2}|default)$/))
      .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);

    if (successOrDefaultResponses.length > 0 && successOrDefaultResponses[0][1].content) {
      verb._response = successOrDefaultResponses[0][1].content["application/json"];
    } else {
      verb._response = null;
    }
  });
};

// if a parameter is expressed as a reference, replace it with the actual
const resolveReferencedParameters = (schema) => {
  iterateVerbs(schema, (verb) => {
    if (verb.parameters) {
      verb.parameters.forEach((param) => {
        if (param.$ref) {
          const ref = param.$ref.split("/").pop();
          Object.assign(param, schema.components.parameters[ref]);
        }
      });
    }
  });
};

module.exports = {
  requiredSchemaObjectProperties,
  resolveReferencedParameters,
  optionalProperties,
  sortPathParameters,
  addRequestBodyToParams,
  resolveResponse,
};
