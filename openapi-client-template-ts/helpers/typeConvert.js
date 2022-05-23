function typeConvert(prop) {
  if (prop == undefined) return "";
  if (prop.$ref) {
    return prop.$ref.split("/").pop();
  }
  switch (prop.type) {
    case "integer":
      return "number";
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    case "array":
      return `${typeConvert(prop.items)}[]`;
  }
  return "";
}

module.exports = typeConvert;