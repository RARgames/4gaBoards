const validator = require('validator');

const isValidColor = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return validator.isHexColor(value) || validator.isRgbColor(value, { allowSpaces: true });
};

module.exports = {
  isValidColor,
};
