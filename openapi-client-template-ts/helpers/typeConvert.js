function typeConvert(prop) {
  if (prop == undefined) return "";

  // resolve references
  if (prop.$ref) {
    return prop.$ref.split("/").pop();
  }

  switch (prop.type) {
    case "integer":
    case "long":
    case "float":
    case "double":
      return "number";
    case "string":
    case "byte":
    case "binary":
    case "password":
      return "string";
    case "boolean":
      return "boolean";
    case "date":
    case "dateTime":
      return "object";
    case "array":
      return `${typeConvert(prop.items)}[]`;
  }
  return "";
}

module.exports = typeConvert;
