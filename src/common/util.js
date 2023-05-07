const URL = require("url").URL;

function isUrl(maybeUrl) {
  try {
    new URL(maybeUrl);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  isUrl,
};
