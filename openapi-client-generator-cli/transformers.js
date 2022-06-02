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

// if a path parameter is not required and does't have a default,
// it is considered optional
const optionalPathProperties = (schema) => {
  iterateVerbs(schema, (verb) => {
    if (verb.parameters) {
      verb.parameters.forEach((param) => {
        if (!param.required && !param.schema.default) {
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
    if (param.default) return 1;
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

module.exports = {
  requiredSchemaObjectProperties,
  optionalPathProperties,
  sortPathParameters,
};
