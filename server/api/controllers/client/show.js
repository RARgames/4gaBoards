const { getRequestPublicUrl } = require('../../../utils/public-urls');

module.exports = {
  async fn() {
    const baseUrl = getRequestPublicUrl(this.req, sails.config.custom.publicUrls, sails.config.custom.baseUrl);
    return this.res.view('index', { BASE_URL: baseUrl });
  },
};
