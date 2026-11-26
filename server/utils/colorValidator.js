const validator = require('validator');

const isValidColor = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  return validator.isHexColor(value) || validator.isRgbColor(value, { allowSpaces: true });
};

// Colour names used by 4ga Boards before May 2026 (same table as the
// 20260512203740 migration) and by Trello exports
const LABEL_COLOR_NAMES = {
  'berry-red': '#e04556',
  'pumpkin-orange': '#f0982d',
  'lagoon-blue': '#109dc0',
  'pink-tulip': '#f97394',
  'light-mud': '#c7a57b',
  'orange-peel': '#fab623',
  'bright-moss': '#a5c261',
  'antique-blue': '#6c99bb',
  'dark-granite': '#8b8680',
  'lagune-blue': '#00b4b1',
  'sunny-grass': '#bfca02',
  'morning-sky': '#52bad5',
  'light-orange': '#ffc66d',
  'midnight-blue': '#004d73',
  'tank-green': '#8aa177',
  'gun-metal': '#355263',
  'wet-moss': '#4a8753',
  'red-burgundy': '#ad5f7d',
  'light-concrete': '#afb0a4',
  'apricot-red': '#fc736d',
  'desert-sand': '#edcb76',
  'navy-blue': '#166a8f',
  'egg-yellow': '#f7d036',
  'coral-green': '#2b6a6c',
  'light-cocoa': '#87564a',
  green: '#00c853',
  lime: '#a5c261',
  yellow: '#f7d036',
  orange: '#f0982d',
  red: '#e04556',
  purple: '#7c4dff',
  blue: '#109dc0',
  sky: '#52bad5',
  pink: '#ff2e93',
  black: '#355263',
};

// Color for an imported label: kept if valid, mapped if it is a known colour
// name (Trello's `_dark`/`_light` variants use the base colour), else the default
const toLabelColor = (value) => {
  if (isValidColor(value)) {
    return value;
  }
  const name = typeof value === 'string' ? value.replace(/_(dark|light)$/, '') : '';
  return Object.hasOwn(LABEL_COLOR_NAMES, name) ? LABEL_COLOR_NAMES[name] : '#e04556';
};

module.exports = {
  isValidColor,
  toLabelColor,
};
