const { isBrowserRequest, setAccessTokenCookie } = require('../../../utils/browser-session');

module.exports = {
  async fn() {
    if (this.req.accessToken && !this.req.isSocket && isBrowserRequest(this.req, sails.config.custom.publicUrls)) {
      setAccessTokenCookie(this.res, this.req.accessToken, sails.config.custom.baseUrl);
      return { item: true };
    }

    return this.res.forbidden();
  },
};
