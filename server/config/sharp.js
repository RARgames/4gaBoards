const sharp = require('sharp');

async function setupSharp() {
  const { sharpLimits } = sails.config.custom;
  sharp.concurrency(sharpLimits.concurrency);
  sharp.cache({
    memory: sharpLimits.cacheMemoryMb,
    items: sharpLimits.cacheItems,
    files: sharpLimits.cacheFiles,
  });
}

module.exports = {
  setupSharp,
};
