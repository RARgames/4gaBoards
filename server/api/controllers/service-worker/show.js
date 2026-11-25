const fs = require('fs/promises');
const path = require('path');

const { getRequestPublicUrl } = require('../../../utils/public-urls');

module.exports = {
  async fn(inputs, exits) {
    const baseUrl = getRequestPublicUrl(this.req, sails.config.custom.publicUrls, sails.config.custom.baseUrl);
    const serviceWorkerPath = path.join(sails.config.appPath, 'public', 'service-worker.js');
    const serviceWorker = await fs.readFile(serviceWorkerPath, 'utf8');

    this.res.type('application/javascript');
    return exits.success(serviceWorker.replaceAll('BASE_URL_PLACEHOLDER', `${baseUrl}/`));
  },
};
