function setVar(varName, varValue, options) {
  if (!options.data.root) {
    options.data.root = {};
  }
  options.data.root[varName] = varValue;
}

function ifEquals(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
}

let isFunction = function (value) {
  return typeof value === "function";
};

function createFrame(object) {
  let frame = Object.assign({}, object);
  frame._parent = object;
  return frame;
}

function eachWhere(context, prop, value, options) {
  let fn = options.fn,
    inverse = options.inverse,
    i = 0,
    ret = "",
    data;

  if (isFunction(context)) {
    context = context.call(this);
  }

  if (options.data) {
    data = createFrame(options.data);
  }

  function execIteration(field, index, last) {
    if (data) {
      data.key = field;
      data.index = index;
      data.first = index === 0;
      data.last = !!last;
    }

    ret =
      ret +
      fn(context[field], {
        data: data,
        blockParams: [context[field], field],
      });
  }

  if (context && typeof context === "object") {
    if (Array.isArray(context)) {
      for (let j = context.length; i < j; i++) {
        if (i in context && context[i][prop] === value) {
          execIteration(i, i, i === context.length - 1);
        }
      }
    }
  }

  if (i === 0) {
    ret = inverse(this);
  }

  return ret;
}

module.exports = {
  setVar,
  eachWhere,
  ifEquals
}