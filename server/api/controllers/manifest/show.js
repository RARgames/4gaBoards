const fs = require('fs/promises');
const path = require('path');

const { getRequestPublicUrl } = require('../../../utils/public-urls');

module.exports = {
  async fn(inputs, exits) {
    const baseUrl = getRequestPublicUrl(this.req, sails.config.custom.publicUrls, sails.config.custom.baseUrl);
    const basePath = new URL(baseUrl).pathname.replace(/\/$/, '');
    const scope = `${basePath}/`;
    const manifestPath = path.join(sails.config.appPath, 'public', 'manifest.json');
    const manifest = await fs.readFile(manifestPath, 'utf8');

    return exits.success({ ...JSON.parse(manifest), id: scope, scope });
  },
};
