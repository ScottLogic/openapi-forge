function setVar(varName, varValue, options) {
  if (!options.data.root) {
    options.data.root = {};
  }
  options.data.root[varName] = varValue;
}

function ifEquals(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
}

function ifContains(collection, value, options) {
  return collection && collection.includes(value)
    ? options.fn(this)
    : options.inverse(this);
}

function ifNotContains(collection, value, options) {
  return collection && collection.includes(value)
    ? options.inverse(this)
    : options.fn(this);
}

function json(context) {
  return JSON.stringify(context);
}

function isObj(value) {
  return typeof value == "object";
}

function capitalizeFirst(value) {
  return value[0].toUpperCase() + value.slice(1);
}

module.exports = {
  setVar,
  ifEquals,
  ifContains,
  ifNotContains,
  json,
  isObj,
  capitalizeFirst,
};
